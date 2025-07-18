import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function POST(request) {
  try {
    const { isUserId, reportedUserId, reason, type } = await request.json();

    // 신고 기록 추가 쿼리 실행
    await pool.query(
      `
      INSERT INTO user_reports ("reporterId", "reportedId", reason, type)
      VALUES ($1, $2, $3, $4)
      `,
      [isUserId, reportedUserId, reason, type],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("신고 실패:", error);
    return NextResponse.json({ success: false, message: "신고에 실패했습니다." }, { status: 500 });
  }
}
