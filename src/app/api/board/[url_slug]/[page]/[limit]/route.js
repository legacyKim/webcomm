import { NextResponse } from "next/server";
import pool from "../../../../../db/db";

export async function GET(req, context) {
    const { url_slug, page, limit } = await context.params || {};

    const offset = (page - 1) * limit;
    const client = await pool.connect();

    try {
        // 전체 게시물 개수 조회
        const countQuery = `SELECT COUNT(*) FROM posts WHERE url_slug = $1`;
        const countResult = await client.query(countQuery, [url_slug]);
        const totalPosts = parseInt(countResult.rows[0].count, 10);

        // 게시물 조회 (페이지네이션 적용)
        const query = `
            SELECT 
                *, 
                COUNT(*) OVER () - ROW_NUMBER() OVER (ORDER BY created_at DESC) + 1 AS post_number
            FROM posts 
            WHERE url_slug = $1 
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3
        `;
        const result = await client.query(query, [url_slug, limit, offset]);

        return NextResponse.json({
            posts: result.rows,
            totalPosts,
            totalPages: Math.ceil(totalPosts / limit)
        });
    } finally {
        client.release();
    }
}
