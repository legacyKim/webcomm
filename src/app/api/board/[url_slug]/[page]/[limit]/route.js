import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(req, context) {
  const { searchParams } = new URL(req.url);
  const blockerId = searchParams.get("userId");

  const { url_slug, page, limit } = (await context.params) || {};
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  const client = await pool.connect();

  try {
    // 전체 게시물 개수 조회
    const countQuery = `
      SELECT COUNT(*) FROM (
        SELECT p.id
        FROM posts p
        LEFT JOIN comments c ON p.id = c.post_id
        WHERE p.url_slug = $1
        AND p.deleted = FALSE
        AND p.user_id NOT IN (
          SELECT "blockedId"
          FROM blocked_users
          WHERE "blockerId" = $2
        )
        GROUP BY p.id
      ) AS counted
    `;
    const countResult = await client.query(countQuery, [url_slug, blockerId]);
    const totalPosts = parseInt(countResult.rows[0].count, 10);

    // 게시물 + 댓글 수 포함 조회
    const query = `
      SELECT 
        p.id,
        p.title,
        p.content,
        p.user_id,
        p.user_nickname,
        p.board_name,
        p.url_slug,
        p.views,
        p.likes,
        p.created_at,
        COUNT(c.id) AS comments,
        COUNT(*) OVER () - ROW_NUMBER() OVER (ORDER BY p.created_at DESC) + 1 AS post_number
      FROM posts p
      LEFT JOIN comments c ON p.id = c.post_id
      WHERE p.url_slug = $1
      AND p.deleted = FALSE
      AND p.user_id NOT IN (
        SELECT "blockedId"
        FROM blocked_users
        WHERE "blockerId" = $2
      )
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $3 OFFSET $4
    `;
    const result = await client.query(query, [url_slug, blockerId, limitNum, offset]);

    return NextResponse.json({
      posts: result.rows,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limitNum),
    });
  } finally {
    client.release();
  }
}
