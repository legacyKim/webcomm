import { NextResponse } from "next/server";
import pool from "@/db/db";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

export async function POST(req) {
  const client = await pool.connect();

  try {
    const user = await serverTokenCheck();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const { id: postId, reason } = await req.json();

    // 권한 확인: 정지회원(authority: 3)은 신고 불가
    if (user.userAuthority === 3) {
      return NextResponse.json(
        { success: false, message: "정지회원은 신고할 수 없습니다." },
        { status: 403 }
      );
    }

    await client.query("BEGIN");

    // 이미 신고한 내역이 있는지 확인
    const existing = await client.query(
      `SELECT 1 FROM post_actions WHERE user_id = $1 AND post_id = $2 AND action_type = 'report'`,
      [user.id, postId]
    );

    if (existing.rowCount > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { success: false, message: "이미 신고한 게시글입니다." },
        { status: 200 }
      );
    }

    // post_actions 테이블에 신고 기록
    await client.query(
      `INSERT INTO post_actions (user_id, post_id, action_type) VALUES ($1, $2, 'report')`,
      [user.id, postId]
    );

    // 만약 reports 테이블이 있다면 reason과 함께 저장
    try {
      await client.query(
        `INSERT INTO reports (user_id, post_id, reason, created_at) VALUES ($1, $2, $3, NOW())`,
        [user.id, postId, reason]
      );
    } catch (reportError) {
      // reports 테이블이 없으면 무시하고 계속 진행
      console.log("Reports 테이블이 없거나 오류 발생:", reportError.message);
    }

    // posts 테이블의 reports 수 증가
    await client.query(`UPDATE posts SET reports = reports + 1 WHERE id = $1`, [
      postId,
    ]);

    await client.query("COMMIT");

    return NextResponse.json({ message: "신고되었습니다!", success: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("신고 처리 중 오류:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
