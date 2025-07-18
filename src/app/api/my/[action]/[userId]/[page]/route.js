import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(req, context) {
  const { action, userId, page } = (await context.params) || {};
  const client = await pool.connect();

  try {
    if (!action || !userId) {
      return NextResponse.json({ message: "Missing parameters" }, { status: 400 });
    }

    const limit = 10;
    const offset = (page - 1) * limit;

    let queryText = "";
    let countQuery = "";
    let queryParams = [userId];

    switch (action) {
      case "write":
        countQuery = `SELECT COUNT(*) AS total FROM posts WHERE user_id = $1`;

        queryText = `
          SELECT
            p.id,
            b.board_name,
            p.title,
            p.views,
            p.likes,
            p.dislikes,
            p.created_at,
            p.updated_at,
            p.url_slug,
            COUNT(c.id) AS comments
          FROM posts p
          JOIN boards b ON p.board_id = b.id
          LEFT JOIN comments c ON c.post_id = p.id
          WHERE p.user_id = $1
          GROUP BY p.id, b.board_name
          ORDER BY p.updated_at DESC
          LIMIT $2 OFFSET $3
        `;
        queryParams = [userId, limit, offset];
        break;

      case "comment":
        countQuery = `
          SELECT COUNT(DISTINCT p.id) AS total
          FROM comments c
          JOIN posts p ON c.post_id = p.id
          WHERE c.user_id = $1
        `;

        queryText = `
          SELECT
            p.id,
            b.board_name,
            p.title,
            p.views,
            p.likes,
            p.dislikes,
            p.created_at,
            p.updated_at,
            p.url_slug,
            COUNT(c2.id) AS comments
          FROM comments c
          JOIN posts p ON c.post_id = p.id
          JOIN boards b ON p.board_id = b.id
          LEFT JOIN comments c2 ON c2.post_id = p.id
          WHERE c.user_id = $1
          GROUP BY p.id, b.board_name
          ORDER BY p.updated_at DESC
          LIMIT $2 OFFSET $3
        `;
        queryParams = [userId, limit, offset];
        break;

      case "like-post":
        countQuery = `
          SELECT COUNT(DISTINCT p.id) AS total
          FROM post_actions pa
          JOIN posts p ON pa.post_id = p.id
          WHERE pa.action_type = 'like' AND pa.user_id = $1
        `;

        queryText = `
          SELECT
            p.id,
            b.board_name,
            p.title,
            p.views,
            p.likes,
            p.dislikes,
            p.created_at,
            p.updated_at,
            p.url_slug,
            COUNT(c.id) AS comments
          FROM post_actions pa
          JOIN posts p ON pa.post_id = p.id
          JOIN boards b ON p.board_id = b.id
          LEFT JOIN comments c ON c.post_id = p.id
          WHERE pa.action_type = 'like' AND pa.user_id = $1
          GROUP BY p.id, b.board_name
          ORDER BY p.updated_at DESC
          LIMIT $2 OFFSET $3
        `;
        queryParams = [userId, limit, offset];
        break;

      case "like-comment":
        countQuery = `
          SELECT COUNT(DISTINCT p.id) AS total
          FROM comment_actions ca
          JOIN comments c ON ca.comment_id = c.id
          JOIN posts p ON c.post_id = p.id
          WHERE ca.action_type = '1' AND ca.user_id = $1
        `;

        queryText = `
          SELECT
            p.id,
            b.board_name,
            p.title,
            p.views,
            p.likes,
            p.dislikes,
            p.created_at,
            p.updated_at,
            p.url_slug,
            COUNT(c_all.id) AS comments
          FROM comment_actions ca
          JOIN comments c ON ca.comment_id = c.id
          JOIN posts p ON c.post_id = p.id
          JOIN boards b ON p.board_id = b.id
          LEFT JOIN comments c_all ON c_all.post_id = p.id
          WHERE ca.action_type = '1' AND ca.user_id = $1
          GROUP BY p.id, b.board_name
          ORDER BY p.updated_at DESC
          LIMIT $2 OFFSET $3
        `;
        queryParams = [userId, limit, offset];
        break;

      default:
        return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    const countRes = await client.query(countQuery, [userId]);
    const totalCount = Number(countRes.rows[0]?.total || 0);
    const totalPages = Math.ceil(totalCount / limit);

    const result = await client.query(queryText, queryParams);

    return NextResponse.json({
      posts: result.rows,
      totalPages,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "서버 에러" }, { status: 500 });
  } finally {
    client.release();
  }
}
