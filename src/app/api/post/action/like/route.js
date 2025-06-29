import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function POST(req) {
  const client = await pool.connect();
  const { isUserId, id } = await req.json();

  try {
    const existingLike = await client.query(
      "SELECT * FROM post_actions WHERE user_id = $1 AND post_id = $2 AND action_type = 'like'",
      [isUserId, id],
    );

    if (existingLike.rowCount > 0) {
      // 기존 좋아요가 있으면 삭제 (좋아요 취소)
      await client.query(`DELETE FROM post_actions WHERE user_id = $1 AND post_id = $2 AND action_type = 'like'`, [
        isUserId,
        id,
      ]);

      await client.query(`UPDATE posts SET likes = likes - 1 WHERE id = $1 AND likes > 0`, [id]);

      await client.query("COMMIT");
      return NextResponse.json({ success: true, liked: false }, { status: 200 });
    } else {
      // 좋아요 추가
      await client.query(`INSERT INTO post_actions (user_id, post_id, action_type) VALUES($1, $2, 'like')`, [
        isUserId,
        id,
      ]);

      await client.query(`UPDATE posts SET likes = likes + 1 WHERE id = $1`, [id]);

      await client.query("COMMIT");
      return NextResponse.json({ success: true, liked: true }, { status: 201 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
