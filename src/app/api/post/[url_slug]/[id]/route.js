import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(req, context) {
  const { id } = await context.params;
  const client = await pool.connect();

  try {
    // 트랜잭션 시작
    await client.query("BEGIN");

    // 게시물 조회
    const query = `
      SELECT 
        p.*, 
        m.profile AS user_profile
      FROM posts p
      LEFT JOIN members m ON p.user_id = m.id
      WHERE p.deleted = FALSE AND p.id = $1;
    `;
    const posts = await client.query(query, [id]);

    if (posts.rows.length === 0) {
      return NextResponse.json({ response: false, message: "Post not found" });
    }

    // 댓글 조회
    const commentQuery = `
      WITH RECURSIVE comment_tree AS (
      SELECT 
        c.id, c.post_id, c.user_id, c.user_nickname, c.parent_id, c.content, c.likes, c.dislikes, c.created_at, 0 AS depth,
        m.profile,
        ARRAY[]::JSONB[] AS children
      FROM comments c
      LEFT JOIN members m ON c.user_id = m.id
      WHERE c.post_id = $1 AND c.parent_id IS NULL

      UNION ALL

      SELECT 
        c.id, c.post_id, c.user_id, c.user_nickname, c.parent_id, c.content, c.likes, c.dislikes, c.created_at, c.depth,
        m.profile,
        ARRAY_APPEND(ct.children, to_jsonb(c))
      FROM comments c
      INNER JOIN comment_tree ct ON c.parent_id = ct.id
      LEFT JOIN members m ON c.user_id = m.id
    )
    SELECT *
    FROM comment_tree
    ORDER BY depth ASC, created_at ASC;`;

    const comments = await client.query(commentQuery, [id]);

    const viewsQuery = `UPDATE posts SET views = views + 1 WHERE id = $1 RETURNING views;`;
    await client.query(viewsQuery, [id]);

    // 트랜잭션 커밋
    await client.query("COMMIT");

    return NextResponse.json({ response: true, post: posts.rows[0], comments: comments.rows });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return NextResponse.json({ response: false, message: "Internal server error" });
  } finally {
    client.release();
  }
}

export async function POST(req, context) {
  const { id } = context.params;
  const client = await pool.connect();

  try {
    await client.query(`UPDATE posts SET deleted = TRUE WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("삭제 실패:", err);
    return NextResponse.json({ success: false, message: "삭제 실패" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(req, context) {
  const { id } = await context.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 게시글 조회수 증가
    const query = `UPDATE posts SET views = views + 1 WHERE id = $1 RETURNING user_id, views;`;
    const result = await client.query(query, [id]);

    if (result.rows.length > 0) {
      const { user_id } = result.rows[0];

      // 게시글 작성자의 총 조회수 증가
      await client.query(`UPDATE members SET all_views = all_views + 1 WHERE id = $1`, [user_id]);

      // 프로필 캐시 무효화 (실제 구현 시)
      // import { invalidateUserProfileCacheById } from "@/src/lib/cache-utils";
      // invalidateUserProfileCacheById(user_id);
    }

    await client.query("COMMIT");
    return NextResponse.json({ posts: result.rows });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("조회수 업데이트 실패:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
