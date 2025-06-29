import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(req) {
  const client = await pool.connect();

  try {
    const query = `
      SELECT
        u.id AS user_id,
        COUNT(DISTINCT p.id) AS post_count,
        COUNT(DISTINCT c.id) AS comment_count,
        COUNT(DISTINCT b.id) AS blocked_count,
        COUNT(*) FILTER (WHERE ur.type = 'post') AS post_report_count,
        COUNT(*) FILTER (WHERE ur.type = 'comment') AS comment_report_count,
        COUNT(*) FILTER (WHERE ur.type = 'message') AS message_report_count
      FROM members u
      LEFT JOIN posts p ON p.user_id = u.id
      LEFT JOIN comments c ON c.user_id = u.id
      LEFT JOIN blocked_users b ON b."blockedId" = u.id
      LEFT JOIN user_reports ur ON ur."reportedId" = u.id
      GROUP BY u.id
      ORDER BY u.id;
    `;

    const result = await client.query(query);
    return NextResponse.json({ members: result.rows });
  } finally {
    client.release();
  }
}

export async function POST(req) {
  const client = await pool.connect();
  try {
    const { board_name } = await req.json();
    const result = await client.query("INSERT INTO boards (board_name) VALUES ($1) RETURNING *", [board_name]);
    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
