import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const query = `
      SELECT 
        m.id, 
        m.user_nickname, 
        m.profile, 
        bu.created_at
      FROM blocked_users bu
      JOIN members m ON bu."blockedId" = m.id
      WHERE bu."blockerId" = $1
      ORDER BY bu.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("차단 목록 조회 실패:", err);
    return NextResponse.json({ error: "차단 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { blockerId, blockedId } = await req.json();

    // 차단 기록 추가
    await pool.query(
      `
        INSERT INTO blocked_users ("blockerId", "blockedId")
        VALUES ($1, $2)
      `,
      [blockerId, blockedId],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("차단 실패:", error);
    return NextResponse.json({ success: false, message: "차단에 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { blockerId, blockedId } = await req.json();

    await pool.query(`DELETE FROM blocked_users WHERE "blockerId" = $1 AND "blockedId" = $2`, [blockerId, blockedId]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("차단 해제 실패:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
