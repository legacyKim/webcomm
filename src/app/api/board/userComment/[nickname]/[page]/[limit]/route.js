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
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id;

    // 2. 댓글 단 게시글 ID 목록 가져오기 (중복 제거)
    const postIdQuery = `
      SELECT DISTINCT post_id 
      FROM comments 
      WHERE user_id = $1
    `;
    const postIdResult = await client.query(postIdQuery, [userId]);
    const postIds = postIdResult.rows.map((row) => row.post_id);

    if (postIds.length === 0) {
      return NextResponse.json({
        posts: [],
        totalPosts: 0,
        totalPages: 0,
      });
    }

    // 3. 전체 게시글 수
    const totalPosts = postIds.length;

    // 4. 페이지네이션 적용된 게시글 조회
    const postQuery = `
      SELECT 
        p.*, 
        m.profile AS user_profile,
        COUNT(*) OVER () - ROW_NUMBER() OVER (ORDER BY p.created_at DESC) + 1 AS post_number,
        COALESCE(c.comment_count, 0) AS comment_count
      FROM (
        SELECT * FROM posts WHERE id = ANY($1) ORDER BY created_at DESC LIMIT $2 OFFSET $3
      ) p
      LEFT JOIN members m ON p.user_id = m.id
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS comment_count 
        FROM comments 
        GROUP BY post_id
      ) c ON p.id = c.post_id
    `;
    const postResult = await client.query(postQuery, [postIds, limit, offset]);

    return NextResponse.json({
      posts: postResult.rows,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (err) {
    console.error("유저 댓글 포함 게시글 조회 실패:", err);
    return NextResponse.json({ error: "DB 조회 실패" }, { status: 500 });
  } finally {
    client.release();
  }
}
