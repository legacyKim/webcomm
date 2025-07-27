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
    const user = await serverTokenCheck(req);
    if (!user.success) {
      return NextResponse.json(
        { success: false, message: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    await client.query("BEGIN");

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

      // 업데이트된 좋아요 수 조회
      const updatedComment = await client.query(
        `SELECT likes FROM comments WHERE id = $1`,
        [id]
      );
      const currentLikes = updatedComment.rows[0]?.likes || 0;

      await client.query("COMMIT");

      // Redis로 좋아요 변경 이벤트 발행
      try {
        const likeEvent = {
          type: "comment_like_update",
          comment_id: id,
          user_id: isUserId,
          liked: false,
          likes_count: currentLikes,
          timestamp: new Date().toISOString(),
        };

        if (process.env.SSE_BASE_URL) {
          await fetch(`${process.env.SSE_BASE_URL}/api/comment/like-notify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(likeEvent),
          });
        }
      } catch (err) {
        console.error("좋아요 실시간 알림 전송 실패:", err);
      }

      return NextResponse.json(
        { success: true, liked: false, likesCount: currentLikes },
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

      // 업데이트된 좋아요 수 조회
      const updatedComment = await client.query(
        `SELECT likes FROM comments WHERE id = $1`,
        [id]
      );
      const currentLikes = updatedComment.rows[0]?.likes || 0;

      await client.query("COMMIT");

      // Redis로 좋아요 변경 이벤트 발행
      try {
        const likeEvent = {
          type: "comment_like_update",
          comment_id: id,
          user_id: isUserId,
          liked: true,
          likes_count: currentLikes,
          timestamp: new Date().toISOString(),
        };

        if (process.env.SSE_BASE_URL) {
          await fetch(`${process.env.SSE_BASE_URL}/api/comment/like-notify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(likeEvent),
          });
        }
      } catch (err) {
        console.error("좋아요 실시간 알림 전송 실패:", err);
      }

      return NextResponse.json(
        { success: true, liked: true, likesCount: currentLikes },
        { status: 201 }
      );
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in liking comment:", error);
    return NextResponse.json(
      { success: false, message: "좋아요 처리 중 오류 발생" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
