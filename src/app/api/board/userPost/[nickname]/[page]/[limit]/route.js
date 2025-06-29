import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(req, context) {
  const { nickname, page, limit } = (await context.params) || {};

  const offset = (page - 1) * limit;
  const client = await pool.connect();

  try {
    // 1. 유저 ID 가져오기
    const userQuery = `SELECT id FROM members WHERE user_nickname = $1`;
    const userResult = await client.query(userQuery, [nickname]);

    if (userResult.rowCount === 0) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    const userId = userResult.rows[0].id;

    // 2. 전체 게시물 수 조회
    const countQuery = `SELECT COUNT(*) FROM posts WHERE user_id = $1`;
    const countResult = await client.query(countQuery, [userId]);
    const totalPosts = parseInt(countResult.rows[0].count, 10);

    // 3. 게시물 데이터 조회
    const postQuery = `
      SELECT 
        *, 
        COUNT(*) OVER () - ROW_NUMBER() OVER (ORDER BY created_at DESC) + 1 AS post_number
      FROM posts
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await client.query(postQuery, [userId, limit, offset]);

    return NextResponse.json({
      posts: result.rows,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (err) {
    console.error("유저 게시글 조회 실패:", err);
    return NextResponse.json({ error: "DB 조회 실패" }, { status: 500 });
  } finally {
    client.release();
  }
}
