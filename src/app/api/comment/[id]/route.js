import { NextResponse } from "next/server";
import pool from "@/db/db";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

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
  const { isUserId, isUserNick, parentId, comment, mentionedUserIds = [], commentDepth } = await req.json();

  try {
    const user = await serverTokenCheck();
    if (!user) {
      return NextResponse.json({ success: false, message: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    // 권한 확인: 경고회원(authority: 2)과 정지회원(authority: 3)은 댓글 작성 불가
    if (user.userAuthority === 2) {
      return NextResponse.json({ success: false, message: "경고회원은 댓글을 작성할 수 없습니다." }, { status: 403 });
    }

    if (user.userAuthority === 3) {
      return NextResponse.json({ success: false, message: "정지회원은 댓글을 쓸 수 없습니다!" }, { status: 403 });
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

    // 댓글 저장 후 commentId 받아오기
    const insertResult = await client.query(
      `INSERT INTO comments (post_id, user_id, user_nickname, parent_id, content, depth)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [id, isUserId, isUserNick, parentId, comment, depth],
    );

    const commentId = insertResult.rows[0].id;

    // 멘션된 유저에게 알림 생성
    for (const mentionedUserId of mentionedUserIds) {
      await client.query(
        `INSERT INTO notifications (type, sender_id, receiver_id, post_id, comment_id, is_read)
         VALUES ('mention', $1, $2, $3, $4, false)`,
        [isUserId, mentionedUserId, id, commentId],
      );
    }

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
          content: comment,
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
