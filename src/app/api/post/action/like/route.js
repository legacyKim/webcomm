import { NextResponse } from "next/server";
import pool from "@/db/db";
// import { invalidateUserProfileCacheById } from "@/src/lib/cache-utils";

export async function POST(req) {
  const client = await pool.connect();
  const { isUserId, id } = await req.json();

  try {
    await client.query("BEGIN");

    // 게시글 작성자 정보 조회
    const postQuery = await client.query("SELECT user_id FROM posts WHERE id = $1", [id]);
    const postAuthorId = postQuery.rows[0]?.user_id;

    const existingLike = await client.query(
      "SELECT * FROM post_actions WHERE user_id = $1 AND post_id = $2 AND action_type = 'like'",
      [isUserId, id],
    );

    if (existingLike.rowCount > 0) {
      // 기존 좋아요가 있으면 삭제 (좋아요 취소)
      await client.query(`DELETE FROM post_actions WHERE user_id = $1 AND post_id = $2 AND action_type = 'like'`, [
        isUserId,
        id,
      ]);

      await client.query(`UPDATE posts SET likes = likes - 1 WHERE id = $1 AND likes > 0`, [id]);

      // 게시글 작성자의 받은 좋아요 수 감소
      if (postAuthorId) {
        await client.query(
          `UPDATE members SET total_likes_received = total_likes_received - 1 WHERE id = $1 AND total_likes_received > 0`,
          [postAuthorId],
        );

        // 프로필 캐시 무효화 (실제 구현 시)
        // invalidateUserProfileCacheById(postAuthorId);
      }

      await client.query("COMMIT");
      return NextResponse.json({ success: true, liked: false }, { status: 200 });
    } else {
      // 좋아요 추가
      await client.query(`INSERT INTO post_actions (user_id, post_id, action_type) VALUES($1, $2, 'like')`, [
        isUserId,
        id,
      ]);

      await client.query(`UPDATE posts SET likes = likes + 1 WHERE id = $1`, [id]);

      // 게시글 작성자의 받은 좋아요 수 증가
      if (postAuthorId) {
        await client.query(`UPDATE members SET total_likes_received = total_likes_received + 1 WHERE id = $1`, [
          postAuthorId,
        ]);

        // 프로필 캐시 무효화 (실제 구현 시)
        // invalidateUserProfileCacheById(postAuthorId);
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
