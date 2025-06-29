import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function POST(req) {
  const client = await pool.connect();

  try {
    const body = await req.json();
    const { to, message, from } = body;

    if (!to || !message || !from) {
      return NextResponse.json({ error: "보내는 사람, 받는 사람, 메시지를 모두 입력하세요." }, { status: 400 });
    }

    const insertQuery = `
      INSERT INTO user_messages (sender_id, receiver_id, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const result = await client.query(insertQuery, [from, parseInt(to, 10), message]);

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (err) {
    console.error("쪽지 전송 오류:", err);
    return NextResponse.json({ error: "쪽지 전송 중 오류가 발생했습니다." }, { status: 500 });
  } finally {
    client.release();
  }
}
