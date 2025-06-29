import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url_slug = searchParams.get("url_slug");

  try {
    const query = `
      SELECT 
        p.id,
        p.board_name,
        p.user_nickname,
        p.title,
        p.content,
        p.views,
        p.likes,
        p.dislikes,
        p.reports,
        p.created_at,
        COALESCE(c.comment_count, 0) AS comment_count
      FROM posts p
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS comment_count
        FROM comments
        GROUP BY post_id
      ) c ON p.id = c.post_id
      ${url_slug ? `WHERE p.board_name = $1` : ""}
      ORDER BY p.created_at DESC;
    `;

    const values = url_slug ? [url_slug] : [];
    const { rows } = await pool.query(query, values);

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
