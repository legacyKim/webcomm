import { NextResponse } from "next/server";
import pool from "../../../../db/db";

export async function GET(req) {
  const client = await pool.connect();

  const { searchParams } = new URL(req.url);
  const isUserId = searchParams.get("user_id");

  try {
    const query = `SELECT * FROM comment_actions WHERE user_id = $1 AND action_type = '1'`;
    const comment_action = await client.query(query, [isUserId]);

    return NextResponse.json({ comment_action });
  } finally {
    client.release();
  }
}

export async function POST(req) {
  const client = await pool.connect();
  const { isUserId, id } = await req.json();

  try {
    await client.query("BEGIN");

    // 기존 좋아요 여부 확인
    const existingLike = await client.query(
      `SELECT * FROM comment_actions WHERE user_id = $1 AND comment_id = $2 AND action_type = '1'`,
      [isUserId, id],
    );

    if (existingLike.rowCount > 0) {
      // 기존 좋아요가 있으면 삭제 (좋아요 취소)
      await client.query(`DELETE FROM comment_actions WHERE user_id = $1 AND comment_id = $2 AND action_type = '1'`, [
        isUserId,
        id,
      ]);

      await client.query(`UPDATE comments SET likes = likes - 1 WHERE id = $1 AND likes > 0`, [id]);

      await client.query("COMMIT");
      return NextResponse.json({ success: true, liked: false }, { status: 200 });
    } else {
      // 좋아요 추가
      await client.query(`INSERT INTO comment_actions (user_id, comment_id, action_type) VALUES($1, $2, '1')`, [
        isUserId,
        id,
      ]);

      await client.query(`UPDATE comments SET likes = likes + 1 WHERE id = $1`, [id]);

      await client.query("COMMIT");
      return NextResponse.json({ success: true, liked: true }, { status: 201 });
    }
  } catch (error) {
    console.error("Error in liking comment:", error);
    return NextResponse.json({ success: false, message: "좋아요 처리 중 오류 발생" }, { status: 500 });
  } finally {
    client.release();
  }
}
