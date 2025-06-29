import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(req, context) {
  const { id } = await context.params;
  const client = await pool.connect();

  try {
    const query = `
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
              c.id, c.post_id, c.user_id, c.user_nickname, c.parent_id, c.content, c.likes, c.dislikes, c.created_at, ct.depth + 1,
              m.profile,
              ARRAY_APPEND(ct.children, to_jsonb(c))
            FROM comments c
            INNER JOIN comment_tree ct ON c.parent_id = ct.id
            LEFT JOIN members m ON c.user_id = m.id
          )
          SELECT *
          FROM comment_tree
          ORDER BY depth ASC, created_at ASC;
        `;

    const comments = await client.query(query, [id]);

    return NextResponse.json({ comments });
  } finally {
    client.release();
  }
}

export async function POST(req, context) {
  const client = await pool.connect();

  const { id } = await context.params;
  const { isUserId, isUserNick, parentId, comment, mentionedUserIds = [] } = await req.json();

  try {
    await client.query("BEGIN");

    // 댓글 저장 후 commentId 받아오기
    const insertResult = await client.query(
      `INSERT INTO comments (post_id, user_id, user_nickname, parent_id, content)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [id, isUserId, isUserNick, parentId, comment],
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
