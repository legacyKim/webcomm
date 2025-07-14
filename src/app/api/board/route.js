import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET() {
  const client = await pool.connect();
  try {
    const query = `
      SELECT
        b.id,
        b.board_name,
        b.url_slug,
        b.seq,
        COUNT(p.id) AS post_count,
        COALESCE(SUM(p.views), 0) AS total_views
      FROM boards b
      LEFT JOIN posts p ON p.url_slug = b.url_slug
      GROUP BY b.id, b.board_name, b.url_slug, b.seq
      ORDER BY b.seq ASC;
    `;

    const result = await client.query(query);
    return NextResponse.json({ boards: result.rows });
  } finally {
    client.release();
  }
}

export async function POST(req) {
  const client = await pool.connect();
  try {
    const { boardName, urlSlug } = await req.json();

    const result = await client.query("INSERT INTO boards (board_name, url_slug) VALUES ($1, $2) RETURNING *", [
      boardName,
      urlSlug,
    ]);

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(req) {
  const client = await pool.connect();

  try {
    const { id, boardName, seq, urlSlug } = await req.json();

    // 게시판 업데이트
    const result = await client.query(
      "UPDATE boards SET board_name = $1, seq = $2, url_slug = $3 WHERE id = $4 RETURNING *",
      [boardName, seq, urlSlug, id],
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: "해당 ID의 게시판이 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
