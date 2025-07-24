import { NextResponse } from "next/server";
import pool from "@/db/db";

import { serverTokenCheck } from "@/lib/serverTokenCheck";

export async function POST(req) {
  const client = await pool.connect();
  const { boardname, url_slug, user_id, user_nickname, title, content } = await req.json();

  try {
    const user = await serverTokenCheck();
    if (!user) {
      return NextResponse.json({ success: false, message: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    // 권한 확인: 경고회원(authority: 2)과 정지회원(authority: 3)은 게시글 작성 불가
    if (user.userAuthority === 2) {
      return NextResponse.json({ success: false, message: "경고회원은 게시글을 작성할 수 없습니다." }, { status: 403 });
    }

    if (user.userAuthority === 3) {
      return NextResponse.json(
        { success: false, message: "정지된 회원은 게시글을 작성할 수 없습니다." },
        { status: 403 },
      );
    }

    // 주의회원인 경우 제한 기간 확인 (DB에서 최신 정보 조회)
    if (user.userAuthority === 1) {
      // 일반회원이지만 제한이 있을 수 있음
      const memberResult = await client.query("SELECT restriction_until FROM members WHERE id = $1", [user_id]);

      if (memberResult.rows.length > 0) {
        const restrictionUntil = memberResult.rows[0].restriction_until;
        if (restrictionUntil && new Date(restrictionUntil) > new Date()) {
          return NextResponse.json(
            {
              success: false,
              message: `게시글 작성이 제한되어 있습니다. 해제 예정: ${new Date(restrictionUntil).toLocaleString()}`,
            },
            { status: 403 },
          );
        }
      }
    }

    const result = await client.query(
      "INSERT INTO posts (board_name, url_slug, user_id, user_nickname, title, content) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [boardname, url_slug, user_id, user_nickname, title, content],
    );

    const postId = result.rows[0].id;

    // 게시물 작성 시 all_posts 증가 (기존 코드는 감소였음)
    await client.query("UPDATE members SET all_posts = all_posts + 1 WHERE id = $1", [user_id]);
    return NextResponse.json({ success: true, postId: postId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
