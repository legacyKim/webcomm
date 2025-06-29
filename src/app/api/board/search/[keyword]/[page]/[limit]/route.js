import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(req, context) {
  const { searchParams } = new URL(req.url);
  const blockerId = searchParams.get("userId");

  const { keyword, page, limit } = (await context.params) || {};

  const offset = (page - 1) * limit;
  const client = await pool.connect();

  try {
    // 전체 게시물 개수 조회
    const countQuery = `
      SELECT COUNT(*) FROM posts
      WHERE title ILIKE '%' || $1 || '%'
      AND user_id NOT IN (
        SELECT "blockedId" FROM blocked_users WHERE "blockerId" = $2
      )
    `;
    const countResult = await client.query(countQuery, [keyword, blockerId]);
    const totalPosts = parseInt(countResult.rows[0].count, 10);

    // 게시물 조회 (페이지네이션 적용)
    const query = `
        SELECT
        *,
        COUNT(*) OVER () - ROW_NUMBER() OVER (ORDER BY created_at DESC) + 1 AS post_number
      FROM posts
      WHERE title ILIKE '%' || $1 || '%'
      AND user_id NOT IN (
        SELECT "blockedId" FROM blocked_users WHERE "blockerId" = $2
      )
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4
    `;
    const result = await client.query(query, [keyword, blockerId, limit, offset]);

    return NextResponse.json({
      posts: result.rows,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (err) {
    console.error("검색 오류:", err);
    return NextResponse.json({ error: "검색 중 오류 발생" }, { status: 500 });
  } finally {
    client.release();
  }
}
