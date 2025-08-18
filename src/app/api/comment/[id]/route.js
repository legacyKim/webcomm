import { NextResponse } from "next/server";
import pool from "@/db/db";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import { createNotificationService } from "@/lib/notification-service.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 서버에서 댓글의 blob URL을 S3 URL로 교체하는 함수
const replaceBlobsWithS3UrlsServer = async (html, imageFiles = []) => {
  let processedHtml = html;

  // 이미지 파일 처리
  for (const imageFile of imageFiles) {
    try {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = imageFile.name.split(".").pop();
      const fileName = `comment/${timestamp}_${randomString}.${extension}`;

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: Buffer.from(imageFile.data, "base64"),
        ContentType: imageFile.type,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3.send(command);

      const fileUrl = `${process.env.AWS_CLOUD_FRONT_URL}/${fileName}`;
      processedHtml = processedHtml.replace(imageFile.blobUrl, fileUrl);
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      throw new Error("이미지 업로드 중 문제가 발생했습니다.");
    }
  }

  return processedHtml;
};

export async function GET(req, context) {
  const { id } = await context.params;
  const client = await pool.connect();

  try {
    const commentQuery = `
      WITH RECURSIVE comment_tree AS (
      SELECT 
        c.id, c.post_id, c.user_id, c.user_nickname, c.parent_id, c.content, c.likes, c.dislikes, c.created_at, 0 AS depth,
        m.profile,
        ARRAY[]::JSONB[] AS children
      FROM comments c
      LEFT JOIN members m ON c.user_id = m.id
      WHERE c.post_id = $1 AND c.parent_id IS NULL AND (c.is_deleted = false OR c.is_deleted IS NULL)

      UNION ALL

      SELECT 
        c.id, c.post_id, c.user_id, c.user_nickname, c.parent_id, c.content, c.likes, c.dislikes, c.created_at, c.depth,
        m.profile,
        ARRAY_APPEND(ct.children, to_jsonb(c))
      FROM comments c
      INNER JOIN comment_tree ct ON c.parent_id = ct.id
      LEFT JOIN members m ON c.user_id = m.id
      WHERE (c.is_deleted = false OR c.is_deleted IS NULL)
    )
    SELECT *
    FROM comment_tree
    ORDER BY depth ASC, created_at ASC;`;

    const comments = await client.query(commentQuery, [id]);

    return NextResponse.json({ comments: comments.rows });
  } finally {
    client.release();
  }
}

export async function POST(req, context) {
  const client = await pool.connect();

  const { id } = await context.params;

  try {
    const user = await serverTokenCheck();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    // 권한 확인: 경고회원(authority: 2)과 정지회원(authority: 3)은 댓글 작성 불가
    if (user.userAuthority === 2) {
      return NextResponse.json(
        { success: false, message: "경고회원은 댓글을 작성할 수 없습니다." },
        { status: 403 }
      );
    }

    if (user.userAuthority === 3) {
      return NextResponse.json(
        { success: false, message: "정지회원은 댓글을 쓸 수 없습니다!" },
        { status: 403 }
      );
    }

    // FormData 또는 JSON 처리
    let isUserId,
      isUserNick,
      parentId,
      comment,
      mentionedUserIds,
      commentDepth,
      imageFiles;

    const contentType = req.headers.get("content-type");

    if (contentType && contentType.includes("multipart/form-data")) {
      // FormData 방식 (이미지가 포함된 경우)
      const formData = await req.formData();
      isUserId = parseInt(formData.get("isUserId"));
      isUserNick = formData.get("isUserNick");
      parentId = formData.get("parentId")
        ? parseInt(formData.get("parentId"))
        : null;
      comment = formData.get("comment");
      mentionedUserIds = formData.get("mentionedUserIds")
        ? JSON.parse(formData.get("mentionedUserIds"))
        : [];
      commentDepth = parseInt(formData.get("commentDepth") || "0");

      // 이미지 파일 데이터 가져오기
      const imageFilesData = formData.get("imageFiles");
      imageFiles = imageFilesData ? JSON.parse(imageFilesData) : [];
    } else {
      // JSON 방식 (기존 방식, 이미지 없는 경우)
      const body = await req.json();
      ({
        isUserId,
        isUserNick,
        parentId,
        comment,
        mentionedUserIds = [],
        commentDepth,
      } = body);
      imageFiles = [];
    }

    await client.query("BEGIN");

    // commentDepth를 그대로 depth로 사용 (이미 프론트엔드에서 올바른 값을 계산해서 전송)
    const depth = commentDepth;

    // 서버에서 파일 업로드 및 HTML 처리
    const processedComment = await replaceBlobsWithS3UrlsServer(
      comment,
      imageFiles
    );

    // 댓글 저장 후 commentId 받아오기
    const insertResult = await client.query(
      `INSERT INTO comments (post_id, user_id, user_nickname, parent_id, content, depth)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [id, isUserId, isUserNick, parentId, processedComment, depth]
    );

    const commentId = insertResult.rows[0].id;

    // 게시글의 url_slug 조회
    const postSlugResult = await client.query(
      "SELECT url_slug FROM posts WHERE id = $1",
      [id]
    );
    const urlSlug = postSlugResult.rows[0]?.url_slug;

    // NotificationService를 사용하여 모든 댓글 관련 알림 생성
    const notificationService = createNotificationService(client);
    await notificationService.createCommentNotifications({
      senderId: isUserId,
      postId: parseInt(id),
      commentId: commentId,
      parentId: parentId,
      mentionedUserIds: mentionedUserIds,
      urlSlug: urlSlug,
    });

    await client.query("COMMIT");

    try {
      await fetch(`${process.env.SSE_BASE_URL}/api/comment/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: commentId,
          event: "INSERT",
          post_id: id,
          user_id: isUserId,
          user_nickname: isUserNick,
          content: processedComment,
          parent_id: parentId,
          profile: user.profile,
          likes: 0,
          depth: depth,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });

      // SSE 알림 전송 성공/실패는 댓글 등록에 영향을 주지 않음
    } catch {
      // SSE 서버 오류는 무시 (댓글 등록 자체는 성공)
    }

    return NextResponse.json(
      { success: true, message: "댓글이 추가되었습니다." },
      { status: 201 }
    );
  } finally {
    client.release();
  }
}

export async function PUT(req, context) {
  const client = await pool.connect();
  const { id: postId } = await context.params;

  try {
    const { comment, id } = await req.json();

    const result = await client.query(
      "UPDATE comments SET content = $2 WHERE id = $1 RETURNING *;",
      [id, comment]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "댓글이 존재하지 않습니다." },
        { status: 404 }
      );
    }

    const updatedComment = result.rows[0];

    // SSE로 수정 이벤트 전송
    try {
      await fetch(`${process.env.SSE_BASE_URL}/api/comment/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          event: "UPDATE",
          post_id: postId,
          content: comment,
          likes: updatedComment.likes,
          updated_at: new Date().toISOString(),
        }),
      });
    } catch (sseError) {
      console.error(sseError);
    }

    return NextResponse.json(
      { success: true, message: "댓글이 수정되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("댓글 수정 오류:", error);
    return NextResponse.json(
      { success: false, message: "댓글 수정 중 오류 발생" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(req, context) {
  const client = await pool.connect();
  const { id: postId } = await context.params;

  try {
    await client.query("BEGIN");

    const { id } = await req.json();

    // 대댓글 존재 여부 확인
    const hasReplies = await client.query(
      "SELECT COUNT(*) as count FROM comments WHERE parent_id = $1 AND (is_deleted = false OR is_deleted IS NULL)",
      [id]
    );

    let result;
    if (parseInt(hasReplies.rows[0].count) > 0) {
      // 대댓글이 있으면 내용만 변경하고 삭제 표시
      result = await client.query(
        "UPDATE comments SET content = '삭제된 댓글입니다', is_deleted = true, deleted_at = NOW() WHERE id = $1 AND (is_deleted = false OR is_deleted IS NULL) RETURNING *",
        [id]
      );
    } else {
      // 대댓글이 없으면 일반 삭제
      result = await client.query(
        "UPDATE comments SET is_deleted = true, deleted_at = NOW() WHERE id = $1 AND (is_deleted = false OR is_deleted IS NULL) RETURNING *",
        [id]
      );
    }

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          success: false,
          message: "댓글이 존재하지 않거나 이미 삭제되었습니다.",
        },
        { status: 404 }
      );
    }

    await client.query("COMMIT");

    // SSE로 삭제 이벤트 전송
    try {
      await fetch(`${process.env.SSE_BASE_URL}/api/comment/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          event: "DELETE",
          post_id: postId,
        }),
      });
    } catch (sseError) {
      console.error("SSE 알림 전송 실패:", sseError);
      // SSE 실패는 무시하고 계속 진행
    }

    return NextResponse.json(
      { success: true, message: "댓글이 삭제되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("댓글 삭제 오류:", error);
    return NextResponse.json(
      { success: false, message: "댓글 삭제 중 오류 발생" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
