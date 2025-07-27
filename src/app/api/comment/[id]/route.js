import { NextResponse } from "next/server";
import pool from "@/db/db";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
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
      WHERE c.post_id = $1 AND c.parent_id IS NULL

      UNION ALL

      SELECT 
        c.id, c.post_id, c.user_id, c.user_nickname, c.parent_id, c.content, c.likes, c.dislikes, c.created_at, c.depth,
        m.profile,
        ARRAY_APPEND(ct.children, to_jsonb(c))
      FROM comments c
      INNER JOIN comment_tree ct ON c.parent_id = ct.id
      LEFT JOIN members m ON c.user_id = m.id
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
    const user = await serverTokenCheck(req);
    if (!user.success) {
      return NextResponse.json({ success: false, message: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    // 권한 확인: 경고회원(authority: 2)과 정지회원(authority: 3)은 댓글 작성 불가
    if (user.userAuthority === 2) {
      return NextResponse.json({ success: false, message: "경고회원은 댓글을 작성할 수 없습니다." }, { status: 403 });
    }

    if (user.userAuthority === 3) {
      return NextResponse.json({ success: false, message: "정지회원은 댓글을 쓸 수 없습니다!" }, { status: 403 });
    }

    // FormData 또는 JSON 처리
    let isUserId, isUserNick, parentId, comment, mentionedUserIds, commentDepth, imageFiles;

    const contentType = req.headers.get("content-type");

    if (contentType && contentType.includes("multipart/form-data")) {
      // FormData 방식 (이미지가 포함된 경우)
      const formData = await req.formData();
      isUserId = parseInt(formData.get("isUserId"));
      isUserNick = formData.get("isUserNick");
      parentId = formData.get("parentId") ? parseInt(formData.get("parentId")) : null;
      comment = formData.get("comment");
      mentionedUserIds = formData.get("mentionedUserIds") ? JSON.parse(formData.get("mentionedUserIds")) : [];
      commentDepth = parseInt(formData.get("commentDepth") || "0");

      // 이미지 파일 데이터 가져오기
      const imageFilesData = formData.get("imageFiles");
      imageFiles = imageFilesData ? JSON.parse(imageFilesData) : [];
    } else {
      // JSON 방식 (기존 방식, 이미지 없는 경우)
      const body = await req.json();
      ({ isUserId, isUserNick, parentId, comment, mentionedUserIds = [], commentDepth } = body);
      imageFiles = [];
    }

    await client.query("BEGIN");

    let depth = 0;

    if (commentDepth === 2) {
      depth = 3;
    } else if (commentDepth === 1) {
      depth = 2;
    } else if (commentDepth === 0) {
      depth = 1;
    }

    // 서버에서 파일 업로드 및 HTML 처리
    const processedComment = await replaceBlobsWithS3UrlsServer(comment, imageFiles);

    // 댓글 저장 후 commentId 받아오기
    const insertResult = await client.query(
      `INSERT INTO comments (post_id, user_id, user_nickname, parent_id, content, depth)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [id, isUserId, isUserNick, parentId, processedComment, depth],
    );

    const commentId = insertResult.rows[0].id;

    // 게시글 작성자 정보 가져오기
    const postAuthorResult = await client.query(`SELECT user_id, user_nickname FROM posts WHERE id = $1`, [id]);

    if (postAuthorResult.rows.length > 0) {
      const postAuthor = postAuthorResult.rows[0];

      // 자신의 글에 자신이 댓글을 단 경우가 아니라면 알림 동의 여부 확인 후 알림 생성
      if (postAuthor.user_id !== isUserId) {
        // 게시글 작성자의 알림 동의 여부 확인
        const authorNotificationResult = await client.query(`SELECT notification_enabled FROM members WHERE id = $1`, [
          postAuthor.user_id,
        ]);

        // 알림 동의한 사용자에게만 알림 저장
        if (authorNotificationResult.rows[0]?.notification_enabled) {
          await client.query(
            `INSERT INTO notifications (type, sender_id, receiver_id, post_id, comment_id, is_read)
             VALUES ('comment', $1, $2, $3, $4, false)`,
            [isUserId, postAuthor.user_id, id, commentId],
          );
        }
      }
    }

    // 멘션된 유저에게 알림 생성
    for (const mentionedUserId of mentionedUserIds) {
      // 자신을 멘션하거나 이미 게시글 작성자 알림이 있는 경우 제외
      if (mentionedUserId !== isUserId && mentionedUserId !== postAuthorResult.rows[0]?.user_id) {
        // 멘션된 사용자의 알림 동의 여부 확인
        const mentionedUserNotificationResult = await client.query(
          `SELECT notification_enabled FROM members WHERE id = $1`,
          [mentionedUserId],
        );

        // 알림 동의한 사용자에게만 알림 저장
        if (mentionedUserNotificationResult.rows[0]?.notification_enabled) {
          await client.query(
            `INSERT INTO notifications (type, sender_id, receiver_id, post_id, comment_id, is_read)
             VALUES ('mention', $1, $2, $3, $4, false)`,
            [isUserId, mentionedUserId, id, commentId],
          );
        }
      }
    }

    await client.query("COMMIT");

    // 푸시 알림 전송 (비동기로 실행, 실패해도 댓글 등록에 영향 없음)
    try {
      const { sendCommentNotification, sendMentionNotification } = await import("@/lib/pushNotifications");

      // 게시글 제목 가져오기
      const postTitleResult = await client.query(`SELECT title FROM posts WHERE id = $1`, [id]);
      const postTitle = postTitleResult.rows[0]?.title || "게시글";

      // 게시글 작성자에게 댓글 알림
      if (postAuthorResult.rows.length > 0 && postAuthorResult.rows[0].user_id !== isUserId) {
        await sendCommentNotification(
          parseInt(id),
          commentId,
          isUserId,
          postAuthorResult.rows[0].user_id,
          isUserNick,
          postTitle,
        );
      }

      // 멘션된 사용자들에게 멘션 알림
      for (const mentionedUserId of mentionedUserIds) {
        if (mentionedUserId !== isUserId && mentionedUserId !== postAuthorResult.rows[0]?.user_id) {
          await sendMentionNotification(parseInt(id), commentId, isUserId, mentionedUserId, isUserNick, postTitle);
        }
      }
    } catch (pushError) {
      console.error("푸시 알림 전송 실패:", pushError);
      // 푸시 알림 실패는 무시 (댓글 등록 자체는 성공)
    }

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

    return NextResponse.json({ success: true, message: "댓글이 추가되었습니다." }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("댓글 등록 오류:", error);
    return NextResponse.json({ success: false, message: "댓글 등록 중 오류 발생" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(req) {
  const client = await pool.connect();

  try {
    const { comment, id } = await req.json();

    await client.query("UPDATE comments SET content = $2 WHERE id = $1 RETURNING *;", [id, comment]);

    return NextResponse.json({ success: true, message: "댓글이 수정되었습니다." }, { status: 200 });
  } catch (error) {
    console.error("댓글 삭제 오류:", error);
    return NextResponse.json({ success: false, message: "댓글 삭제 중 오류 발생" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(req) {
  const client = await pool.connect();

  try {
    const { id } = await req.json();
    const result = await client.query("DELETE FROM comments WHERE id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, message: "댓글이 존재하지 않습니다." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "댓글이 삭제되었습니다." }, { status: 200 });
  } catch (error) {
    console.error("댓글 삭제 오류:", error);
    return NextResponse.json({ success: false, message: "댓글 삭제 중 오류 발생" }, { status: 500 });
  } finally {
    client.release();
  }
}
