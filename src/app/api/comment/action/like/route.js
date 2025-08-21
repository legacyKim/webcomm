import { NextResponse } from "next/server";
import pool from "@/db/db";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import { createNotificationService } from "@/lib/notification-service";
import { callRevalidate } from "@/lib/revalidate";

export async function GET(req) {
  const client = await pool.connect();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  const commentId = searchParams.get("comment_id");

  try {
    if (userId && commentId) {
      // 특정 댓글에 대한 좋아요 상태 확인
      const existingLike = await client.query(
        `SELECT * FROM comment_actions WHERE user_id = $1 AND comment_id = $2 AND action_type = '1'`,
        [userId, commentId]
      );

      return NextResponse.json({ isLiked: existingLike.rowCount > 0 });
    } else {
      // 기존 로직: 사용자의 모든 댓글 좋아요 조회
      const isUserId = searchParams.get("user_id");
      const query = `SELECT * FROM comment_actions WHERE user_id = $1 AND action_type = '1'`;
      const comment_action = await client.query(query, [isUserId]);

      return NextResponse.json({ comment_action });
    }
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
      return NextResponse.json(
        { success: false, message: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    await client.query("BEGIN");

    // 댓글과 관련 게시글 정보 조회
    const commentQuery = await client.query(
      `SELECT c.user_id, p.id as post_id, p.url_slug 
       FROM comments c 
       JOIN posts p ON c.post_id = p.id 
       WHERE c.id = $1`,
      [id]
    );

    if (commentQuery.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { success: false, message: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const {
      user_id: commentAuthorId,
      post_id: postId,
      url_slug: urlSlug,
    } = commentQuery.rows[0];

    // 기존 좋아요 여부 확인
    const existingLike = await client.query(
      `SELECT * FROM comment_actions WHERE user_id = $1 AND comment_id = $2 AND action_type = '1'`,
      [isUserId, id]
    );

    if (existingLike.rowCount > 0) {
      // 기존 좋아요가 있으면 삭제 (좋아요 취소)
      await client.query(
        `DELETE FROM comment_actions WHERE user_id = $1 AND comment_id = $2 AND action_type = '1'`,
        [isUserId, id]
      );

      await client.query(
        `UPDATE comments SET likes = likes - 1 WHERE id = $1 AND likes > 0`,
        [id]
      );

      // 댓글 작성자의 받은 좋아요 수 감소
      if (commentAuthorId) {
        await client.query(
          `UPDATE members SET total_likes_received = total_likes_received - 1 WHERE id = $1 AND total_likes_received > 0`,
          [commentAuthorId]
        );

        // 좋아요 취소 시 관련 알림 삭제 (자기 자신 제외)
        if (commentAuthorId !== isUserId) {
          await client.query(
            `DELETE FROM notifications 
             WHERE type = 'comment_like' 
               AND sender_id = $1 
               AND receiver_id = $2 
               AND comment_id = $3`,
            [isUserId, commentAuthorId, id]
          );
        }

        // 프로필 캐시 무효화 (실제 구현 시)
        // import { invalidateUserProfileCacheById } from "@/src/lib/cache-utils";
        // invalidateUserProfileCacheById(commentAuthorId);
      }

      await client.query("COMMIT");

      // 업데이트된 likers 정보 조회
      const likersQuery = await client.query(
        `SELECT ca.user_id, m.user_nickname, m.profile as user_profile, ca.created_at
         FROM comment_actions ca
         LEFT JOIN members m ON ca.user_id = m.id
         WHERE ca.comment_id = $1 AND ca.action_type = '1'
         ORDER BY ca.created_at DESC`,
        [id]
      );

      // 댓글 좋아요 변경 시 게시글 캐시 무효화
      await callRevalidate([
        `/board/${urlSlug}/${postId}`,
        `/board/${urlSlug}`,
        `/board/popular`,
      ]);

      return NextResponse.json(
        { success: true, liked: false, likers: likersQuery.rows },
        { status: 200 }
      );
    } else {
      // 좋아요 추가
      await client.query(
        `INSERT INTO comment_actions (user_id, comment_id, action_type) VALUES($1, $2, '1')`,
        [isUserId, id]
      );

      await client.query(
        `UPDATE comments SET likes = likes + 1 WHERE id = $1`,
        [id]
      );

      // 댓글 작성자의 받은 좋아요 수 증가
      if (commentAuthorId) {
        await client.query(
          `UPDATE members SET total_likes_received = total_likes_received + 1 WHERE id = $1`,
          [commentAuthorId]
        );

        // 댓글 좋아요 알림 생성 (자기 자신 제외)
        if (commentAuthorId !== isUserId) {
          const notificationService = createNotificationService(client);
          await notificationService.createCommentLikeNotificationWithPostInfo(
            isUserId,
            commentAuthorId,
            id
          );
        }

        // 프로필 캐시 무효화 (실제 구현 시)
        // import { invalidateUserProfileCacheById } from "@/src/lib/cache-utils";
        // invalidateUserProfileCacheById(commentAuthorId);
      }

      await client.query("COMMIT");

      // 업데이트된 likers 정보 조회
      const likersQuery = await client.query(
        `SELECT ca.user_id, m.user_nickname, m.profile as user_profile, ca.created_at
         FROM comment_actions ca
         LEFT JOIN members m ON ca.user_id = m.id
         WHERE ca.comment_id = $1 AND ca.action_type = '1'
         ORDER BY ca.created_at DESC`,
        [id]
      );

      // 댓글 좋아요 변경 시 게시글 캐시 무효화
      await callRevalidate([
        `/board/${urlSlug}/${postId}`,
        `/board/${urlSlug}`,
        `/board/popular`,
      ]);

      return NextResponse.json(
        { success: true, liked: true, likers: likersQuery.rows },
        { status: 201 }
      );
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
