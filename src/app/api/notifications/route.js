import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const limitParam = searchParams.get("limit");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const limit = limitParam ? parseInt(limitParam, 10) : null;

  try {
    const baseQuery = `
      SELECT n.*, u.user_nickname AS sender_nickname, p.board_name
      FROM notifications n
      JOIN members u ON n.sender_id = u.id
      LEFT JOIN posts p ON n.post_id = p.id

      WHERE n.receiver_id = $1
        AND (n.is_read = false OR n.created_at >= NOW() - INTERVAL '7 days')
      ORDER BY n.created_at DESC
    `;

    const finalQuery = limit ? `${baseQuery} LIMIT $2` : baseQuery;
    const values = limit ? [userId, limit] : [userId];

    const result = await pool.query(finalQuery, values);

    const notifications = result.rows.map((n) => {
      let message = "";
      let link = "/";

      if (n.type === "comment") {
        message = `게시물에 ${n.sender_nickname}님이 댓글을 달았습니다.`;
        link = `/board/${n.board_name}/${n.post_id}`;
      } else if (n.type === "reply") {
        message = `댓글에 ${n.sender_nickname}님이 대댓글을 달았습니다.`;
        link = `/board/${n.board_name}/${n.post_id}#comment-${n.comment_id}`;
      } else if (n.type === "like_comment") {
        message = `${n.sender_nickname}님이 댓글을 좋아합니다.`;
        link = `/board/${n.board_name}/${n.post_id}#comment-${n.comment_id}`;
      } else if (n.type === "post_like") {
        message = `${n.sender_nickname}님이 게시글을 좋아합니다.`;
        link = `/board/${n.board_name}/${n.post_id}`;
      } else if (n.type === "message") {
        message = `${n.sender_nickname}님이 쪽지를 보냈습니다.`;
        link = `/my/message`;
      } else if (n.type === "mention") {
        message = `${n.sender_nickname}님이 언급했습니다.`;
        link = `/board/${n.board_name}/${n.post_id}#comment-${n.comment_id}`;
      }

      return { ...n, message, link };
    });

    return NextResponse.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}
