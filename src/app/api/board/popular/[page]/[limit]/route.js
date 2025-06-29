import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(req, context) {
  const { searchParams } = new URL(req.url);
  const userId = parseInt(searchParams.get("userId") || "0");

  const { page, limit } = (await context.params) || {};

  const limitNum = parseInt(limit); // ✅ 누락된 부분
  const pageNum = parseInt(page); // ✅ 누락된 부분
  const offset = (pageNum - 1) * limitNum;

  const client = await pool.connect();

  try {
    // 1. 전체 개수
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM posts
      WHERE user_id NOT IN (
        SELECT "blockedId" FROM blocked_users WHERE "blockerId" = $1
      )
    `;
    const countResult = await client.query(countQuery, [userId]);
    const totalPosts = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalPosts / limitNum); // ✅ 이제 정상 작동

    // 2. 인기 점수 정렬 게시글 조회
    const postQuery = `
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
          COUNT(*) OVER () - ROW_NUMBER() OVER (ORDER BY p.created_at DESC) + 1 AS post_number,
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
      AND p.user_id NOT IN (
        SELECT "blockedId" FROM blocked_users WHERE "blockerId" = $1
      )
      ORDER BY score DESC
      LIMIT $2 OFFSET $3
    `;
    const postResult = await client.query(postQuery, [userId, limitNum, offset]);

    return NextResponse.json({
      posts: postResult.rows,
      totalPosts,
      totalPages,
    });
  } catch (err) {
    console.error("인기 게시글 조회 실패:", err);
    return NextResponse.json({ error: "DB 조회 실패" }, { status: 500 });
  } finally {
    client.release();
  }
}
