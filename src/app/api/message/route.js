import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(req) {
  const userId = req.nextUrl.searchParams.get("userId");
  const client = await pool.connect();

  if (!userId) {
    return NextResponse.json({ error: "userId가 필요합니다." }, { status: 400 });
  }

  try {
    const receivedQuery = `
      SELECT 
        m.id,
        m.content,
        m.created_at,
        m.is_read,
        'received' AS type,
        sender.id AS user_id,
        sender.user_nickname AS user_nickname
      FROM user_messages m
      JOIN members sender ON m.sender_id = sender.id
      WHERE m.receiver_id = $1 AND m.is_deleted_by_receiver = false
    `;

    const sentQuery = `
      SELECT 
        m.id,
        m.content,
        m.created_at,
        m.is_read,
        'sent' AS type,
        receiver.id AS user_id,
        receiver.user_nickname AS user_nickname,
        receiver.profile
      FROM user_messages m
      JOIN members receiver ON m.receiver_id = receiver.id
      WHERE m.sender_id = $1 AND m.is_deleted_by_sender = false
    `;

    const [receivedResult, sentResult] = await Promise.all([
      client.query(receivedQuery, [userId]),
      client.query(sentQuery, [userId]),
    ]);

    return NextResponse.json(
      {
        received: receivedResult.rows,
        sent: sentResult.rows,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("메시지 조회 오류:", err);
    return NextResponse.json({ error: "메시지를 불러오는 중 오류 발생" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(req) {
  const { userId, messageId, type } = await req.json();
  const client = await pool.connect();

  if (!userId || !messageId || !type) {
    return NextResponse.json({ error: "필수 값 누락" }, { status: 400 });
  }

  try {
    let updateQuery = "";
    if (type === "received") {
      updateQuery = `UPDATE user_messages SET is_deleted_by_receiver = true WHERE id = $1 AND receiver_id = $2`;
    } else if (type === "sent") {
      updateQuery = `UPDATE user_messages SET is_deleted_by_sender = true WHERE id = $1 AND sender_id = $2`;
    } else {
      return NextResponse.json({ error: "잘못된 type" }, { status: 400 });
    }

    await client.query(updateQuery, [messageId, userId]);

    return NextResponse.json({ message: "삭제되었습니다." }, { status: 200 });
  } catch (err) {
    console.error("삭제 오류:", err);
    return NextResponse.json({ error: "삭제 중 오류 발생" }, { status: 500 });
  } finally {
    client.release();
  }
}
