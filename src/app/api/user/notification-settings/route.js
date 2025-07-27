import { NextResponse } from "next/server";
import pool from "@/db/db";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

export async function GET(req) {
  const client = await pool.connect();

  try {
    const authResult = await serverTokenCheck(req);

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: "인증이 필요합니다." }, { status: 401 });
    }

    const userResult = await client.query("SELECT notification_enabled, marketing_enabled FROM members WHERE id = $1", [
      authResult.userId,
    ]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      notificationEnabled: userResult.rows[0].notification_enabled,
      marketingEnabled: userResult.rows[0].marketing_enabled,
    });
  } catch (error) {
    console.error("알림 설정 조회 오류:", error);
    return NextResponse.json({ success: false, message: "서버 오류가 발생했습니다." }, { status: 500 });
  } finally {
    client.release();
  }
}
