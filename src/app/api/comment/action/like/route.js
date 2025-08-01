import { NextResponse } from "next/server";
import pool from "@/db/db";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

export async function GET(req) {
  const client = await pool.connect();

  const { searchParams } = new URL(req.url);
  const isUserId = searchParams.get("user_id");

  try {
    const query = `SELECT * FROM comment_actions WHERE user_id = $1 AND action_type = '1'`;
    const comment_action = await client.query(query, [isUserId]);

    return NextResponse.json({ comment_action });
  } finally {
    client.release();
  }
}

export async function POST(req) {
  const client = await pool.connect();
  const { isUserId, id } = await req.json();

  try {
    const user = await serverTokenCheck();
    if (!user) {
      return NextResponse.json({ success: false, message: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    await client.query("BEGIN");

    // 댓글 작성자 정보 조회
    const commentQuery = await client.query("SELECT user_id FROM comments WHERE id = $1", [id]);
    const commentAuthorId = commentQuery.rows[0]?.user_id;

    // 기존 좋아요 여부 확인
    const existingLike = await client.query(
      `SELECT * FROM comment_actions WHERE user_id = $1 AND comment_id = $2 AND action_type = '1'`,
      [isUserId, id],
    );

    if (existingLike.rowCount > 0) {
      // 기존 좋아요가 있으면 삭제 (좋아요 취소)
      await client.query(`DELETE FROM comment_actions WHERE user_id = $1 AND comment_id = $2 AND action_type = '1'`, [
        isUserId,
        id,
      ]);

      await client.query(`UPDATE comments SET likes = likes - 1 WHERE id = $1 AND likes > 0`, [id]);

      // 댓글 작성자의 받은 좋아요 수 감소
      if (commentAuthorId) {
        await client.query(
          `UPDATE members SET total_likes_received = total_likes_received - 1 WHERE id = $1 AND total_likes_received > 0`,
          [commentAuthorId],
        );

        // 프로필 캐시 무효화 (실제 구현 시)
        // import { invalidateUserProfileCacheById } from "@/src/lib/cache-utils";
        // invalidateUserProfileCacheById(commentAuthorId);
      }

      await client.query("COMMIT");
      return NextResponse.json({ success: true, liked: false }, { status: 200 });
    } else {
      // 좋아요 추가
      await client.query(`INSERT INTO comment_actions (user_id, comment_id, action_type) VALUES($1, $2, '1')`, [
        isUserId,
        id,
      ]);

      await client.query(`UPDATE comments SET likes = likes + 1 WHERE id = $1`, [id]);

      // 댓글 작성자의 받은 좋아요 수 증가
      if (commentAuthorId) {
        await client.query(`UPDATE members SET total_likes_received = total_likes_received + 1 WHERE id = $1`, [
          commentAuthorId,
        ]);

        // 프로필 캐시 무효화 (실제 구현 시)
        // import { invalidateUserProfileCacheById } from "@/src/lib/cache-utils";
        // invalidateUserProfileCacheById(commentAuthorId);
      }

      await client.query("COMMIT");
      return NextResponse.json({ success: true, liked: true }, { status: 201 });
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
