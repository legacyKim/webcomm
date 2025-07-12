import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(req, context) {
  const { id } = await context.params;
  const client = await pool.connect();

  try {
    // 트랜잭션 시작
    await client.query("BEGIN");

    // 게시물 조회
    const query = `
      SELECT 
        p.*, 
        m.profile AS user_profile
      FROM posts p
      LEFT JOIN members m ON p.user_id = m.id
      WHERE p.deleted = FALSE AND p.id = $1;
    `;
    const posts = await client.query(query, [id]);

    if (posts.rows.length === 0) {
      return NextResponse.json({ response: false, message: "Post not found" });
    }

    // 조회수 증가 (트랜잭션 내에서 한 번만 실행)
    const viewsQuery = `UPDATE posts SET views = views + 1 WHERE id = $1 RETURNING views;`;
    await client.query(viewsQuery, [id]);

    // 트랜잭션 커밋
    await client.query("COMMIT");

    return NextResponse.json({ response: true, posts: posts.rows[0] });
  } catch (error) {
    // 에러 발생 시 롤백
    await client.query("ROLLBACK");
    console.error(error);
    return NextResponse.json({ response: false, message: "Internal server error" });
  } finally {
    client.release();
  }
}

export async function POST(req, context) {
  const { id } = context.params;
  const client = await pool.connect();

  try {
    await client.query(`UPDATE posts SET deleted = TRUE WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("삭제 실패:", err);
    return NextResponse.json({ success: false, message: "삭제 실패" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(req, context) {
  const { id } = await context.params;
  const client = await pool.connect();

  try {
    const query = `UPDATE posts SET views = views + 1 WHERE id = $1 RETURNING *;`;
    const posts = await client.query(query, [id]);

    return NextResponse.json({ posts });
  } finally {
    client.release();
  }
}
