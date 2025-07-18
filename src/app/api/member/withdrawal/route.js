import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/db/db";

export async function POST(req) {
  const token = req.cookies.get("authToken")?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: "인증 토큰 없음" }, { status: 401 });
  }

  try {
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const client = await pool.connect();

    try {
      // 실제 탈퇴 처리 (회원 삭제)
      await client.query("DELETE FROM members WHERE id = $1", [userId]);

      const res = NextResponse.json({ success: true, message: "탈퇴 완료" });
      res.cookies.set("authToken", "", { maxAge: 0, path: "/" });

      return res;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("회원 탈퇴 에러:", error);
    return NextResponse.json({ success: false, message: "토큰 오류 또는 만료" }, { status: 401 });
  }
}
