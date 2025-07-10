import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(req, context) {
  const { searchParams } = new URL(req.url);
  const userId = parseInt(searchParams.get("userId") || "0");

  const { page, limit } = (await context.params) || {};

  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);
  const offset = (pageNum - 1) * limitNum;

  const client = await pool.connect();
  try {
    const query = `
      SELECT 
          p.id, 
          p.user_id,
          p.title, 
          p.user_nickname, 
          p.likes, 
          p.views, 
          p.created_at, 
          p.board_name,
          p.url_slug,
          m.profile AS user_profile,
          COALESCE(c.comments, 0) AS comments,
          (p.likes * 2 + p.views) / POWER(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 + 2, 1.5) AS score
      FROM posts p
      LEFT JOIN (
          SELECT post_id, COUNT(*) AS comments
          FROM comments
          GROUP BY post_id
      ) c ON p.id = c.post_id
      LEFT JOIN members m ON p.user_id = m.id
      WHERE p.deleted = FALSE
        AND p.notice = FALSE              
        AND p.user_id NOT IN (
          SELECT "blockedId" FROM blocked_users WHERE "blockerId" = $1
        )
      ORDER BY score DESC
      LIMIT $2 OFFSET $3;
    `;
    const result = await client.query(query, [userId, limitNum, offset]);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.error();
  } finally {
    client.release();
  }
}
