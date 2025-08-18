import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function PATCH(req, { params }) {
  const client = await pool.connect();
  const { id } = params;
  const body = await req.json();

  try {
    const { boardname, url_slug, title, content } = body;

    await client.query(
      `
      UPDATE posts
      SET board_name = $1,
          url_slug = $2,
          title = $3,
          content = $4,
          updated_at = NOW()
      WHERE id = $5 AND notice = true
    `,
      [boardname, url_slug, title, content, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("공지 수정 오류:", error);
    return NextResponse.json(
      { success: false, message: "공지 수정 실패" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
