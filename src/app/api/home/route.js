import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = parseInt(searchParams.get("userId") || "0");

  const client = await pool.connect();
  try {
    const result = await client.query(
      `
        WITH FilteredPosts AS (
            SELECT 
                * 
            FROM posts
            WHERE 
                deleted = FALSE
                AND notice = FALSE
                AND (
                  user_id IS NULL 
                  OR user_id NOT IN (
                    SELECT "blockedId" 
                    FROM blocked_users 
                    WHERE "blockerId" = $1
                  )
                )
        ),
        RankedPosts AS (
            SELECT 
                b.board_name,
                b.url_slug,
                p.id AS post_id,
                p.title,
                p.user_id,
                p.user_nickname,
                p.views,
                p.created_at,
                ROW_NUMBER() OVER (
                  PARTITION BY b.board_name 
                  ORDER BY p.created_at DESC
                ) AS row_num
            FROM boards b
            LEFT JOIN FilteredPosts p 
              ON p.board_name = b.board_name
        )
        SELECT 
            board_name, 
            url_slug,
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', post_id,
                    'title', title,
                    'user_id', user_id,
                    'user_nickname', user_nickname,
                    'views', views,
                    'created_at', created_at
                )
            ) FILTER (WHERE post_id IS NOT NULL) AS posts
        FROM RankedPosts
        WHERE row_num <= 5 OR row_num IS NULL
        GROUP BY board_name, url_slug
        ORDER BY board_name;
      `,
      [userId],
    );

    const postsByBoard = result.rows.reduce((acc, row) => {
      acc[row.board_name] = {
        url_slug: row.url_slug,
        posts: row.posts,
      };
      return acc;
    }, {});

    return NextResponse.json(postsByBoard);
  } finally {
    client.release();
  }
}
