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
      const { reason = "개인사유" } = await req.json();

      await client.query("BEGIN");

      // 회원 탈퇴 처리 (숨김 처리)
      const withdrawalDate = new Date();
      await client.query(
        `UPDATE members 
         SET 
           deleted = true,
           deleted_at = $1,
           withdrawal_reason = $2,
           authority = 4,
           email = CONCAT('withdrawn_', id, '@deleted.com'),
           userid = CONCAT('withdrawn_', id)
         WHERE id = $3`,
        [withdrawalDate, reason, userId],
      );

      // 게시물들도 숨김 처리
      await client.query("UPDATE posts SET deleted = true, deleted_at = $1 WHERE user_id = $2", [
        withdrawalDate,
        userId,
      ]);

      // 댓글들도 숨김 처리
      await client.query("UPDATE comments SET deleted = true, deleted_at = $1 WHERE user_id = $2", [
        withdrawalDate,
        userId,
      ]);

      await client.query("COMMIT");

      const res = NextResponse.json({
        success: true,
        message: "회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.",
      });
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
