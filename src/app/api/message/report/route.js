import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function POST(req) {
  const { userId, reportedUserId, messageId } = await req.json();

  try {
    const client = await pool.connect();

    await client.query(
      `INSERT INTO reports ("reporterId", "reportedId", target_type, target_id)
       VALUES ($1, $2, 'message', $3)`,
      [userId, reportedUserId, messageId],
    );

    client.release();
    return NextResponse.json({ message: "신고가 접수되었습니다." });
  } catch (error) {
    console.error("Report Error:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}
