import { NextResponse } from "next/server";
import pool from "@/db/db";
import { revalidatePost } from "@/lib/revalidate.js";

// 슬러그에서 ID 추출하는 함수
function extractIdFromSlug(slug) {
  const match = slug.match(/-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

export async function GET(req, context) {
  const { title } = await context.params;
  const client = await pool.connect();

  try {
    // 슬러그에서 ID 추출
    const postId = extractIdFromSlug(title);

    if (!postId) {
      return NextResponse.json({
        response: false,
        message: "Invalid post URL",
      });
    }

    // 트랜잭션 시작
    await client.query("BEGIN");

    // 게시물 조회 (ID 기반으로 조회)
    const query = `
      SELECT 
        p.*, 
        m.profile AS user_profile
      FROM posts p
      LEFT JOIN members m ON p.user_id = m.id
      WHERE p.deleted = FALSE AND p.id = $1;
    `;

    const posts = await client.query(query, [postId]);

    if (posts.rows.length === 0) {
      return NextResponse.json({ response: false, message: "Post not found" });
    }

    // 게시글 좋아요한 사용자 목록 조회 (모든 사용자)
    const postLikersQuery = `
      SELECT pa.user_id, m.user_nickname, m.profile
      FROM post_actions pa
      LEFT JOIN members m ON pa.user_id = m.id
      WHERE pa.post_id = $1 AND pa.action_type = 'like'
      ORDER BY pa.created_at DESC;
    `;
    const postLikers = await client.query(postLikersQuery, [postId]);

    // 댓글 조회 (개인화 없이 공통 데이터만)
    const commentQuery = `
      WITH RECURSIVE comment_tree AS (
      SELECT 
        c.id, c.post_id, c.user_id, c.user_nickname, c.parent_id, c.content, c.likes, c.dislikes, c.created_at, 0 AS depth,
        m.profile
      FROM comments c
      LEFT JOIN members m ON c.user_id = m.id
      WHERE c.post_id = $1 AND c.parent_id IS NULL

      UNION ALL

      SELECT 
        c.id, c.post_id, c.user_id, c.user_nickname, c.parent_id, c.content, c.likes, c.dislikes, c.created_at, c.depth,
        m.profile
      FROM comments c
      INNER JOIN comment_tree ct ON c.parent_id = ct.id
      LEFT JOIN members m ON c.user_id = m.id
    )
    SELECT *
    FROM comment_tree
    ORDER BY depth ASC, created_at ASC;`;

    const comments = await client.query(commentQuery, [postId]);

    // 각 댓글별 좋아요한 사용자 목록 조회
    const commentLikersQuery = `
      SELECT 
        ca.comment_id,
        ca.user_id,
        m.user_nickname,
        m.profile
      FROM comment_actions ca
      LEFT JOIN members m ON ca.user_id = m.id
      WHERE ca.comment_id = ANY(
        SELECT id FROM comments WHERE post_id = $1
      ) AND ca.action_type = '1'
      ORDER BY ca.created_at DESC;
    `;
    const commentLikers = await client.query(commentLikersQuery, [postId]);

    // 댓글별 좋아요 데이터 그룹화
    const commentLikersMap = {};
    commentLikers.rows.forEach((liker) => {
      if (!commentLikersMap[liker.comment_id]) {
        commentLikersMap[liker.comment_id] = [];
      }
      commentLikersMap[liker.comment_id].push({
        user_id: liker.user_id,
        user_nickname: liker.user_nickname,
        profile: liker.profile,
      });
    });

    // 댓글에 좋아요 정보 추가
    const commentsWithLikers = comments.rows.map((comment) => ({
      ...comment,
      likers: commentLikersMap[comment.id] || [],
    }));

    const viewsQuery = `UPDATE posts SET views = views + 1 WHERE id = $1 RETURNING views;`;
    await client.query(viewsQuery, [postId]);

    // 트랜잭션 커밋
    await client.query("COMMIT");

    // 게시글에 좋아요 정보 추가
    const postWithLikers = {
      ...posts.rows[0],
      likers: postLikers.rows,
    };

    return NextResponse.json({
      response: true,
      post: postWithLikers,
      comments: commentsWithLikers,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return NextResponse.json({
      response: false,
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
}

// 게시글 삭제
export async function POST(req, context) {
  const { id, url_slug } = await context.params;
  const client = await pool.connect();

  try {
    await client.query(`UPDATE posts SET deleted = TRUE WHERE id = $1`, [id]);

    // 게시글 삭제 후 캐시 무효화
    await revalidatePost(id, url_slug, "delete");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("삭제 실패:", err);
    return NextResponse.json(
      { success: false, message: "삭제 실패" },
      { status: 500 }
    );
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
      await client.query(
        `UPDATE members SET all_views = all_views + 1 WHERE id = $1`,
        [user_id]
      );

      // 프로필 캐시 무효화 (실제 구현 시)
      // import { invalidateUserProfileCacheById } from "@/src/lib/cache-utils";
      // invalidateUserProfileCacheById(user_id);
    }

    await client.query("COMMIT");
    return NextResponse.json({ posts: result.rows });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("조회수 업데이트 실패:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
