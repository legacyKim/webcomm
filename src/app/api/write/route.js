import { NextResponse } from "next/server";
import pool from "@/db/db";

import { serverTokenCheck } from "@/lib/serverTokenCheck";

export async function POST(req) {
  const client = await pool.connect();
  const { boardname, url_slug, user_id, user_nickname, title, content } = await req.json();

  try {
    const user = await serverTokenCheck();
    if (!user) {
      return NextResponse.json({ success: false, message: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    const result = await client.query(
      "INSERT INTO posts (board_name, url_slug, user_id, user_nickname, title, content) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [boardname, url_slug, user_id, user_nickname, title, content],
    );

    const postId = result.rows[0].id;

    await client.query("UPDATE members SET all_posts = all_posts - 1 WHERE id = $1 AND all_posts > 0", [user_id]);
    return NextResponse.json({ success: true, postId: postId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
