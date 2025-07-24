import { NextResponse } from "next/server";
import pool from "@/db/db";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

export async function POST(request) {
  try {
    const user = await serverTokenCheck();
    if (!user) {
      return NextResponse.json({ success: false, message: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    // 권한 확인: 정지회원(authority: 3)은 신고 불가
    if (user.userAuthority === 3) {
      return NextResponse.json({ success: false, message: "정지회원은 신고할 수 없습니다." }, { status: 403 });
    }

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
