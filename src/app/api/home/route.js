import { NextResponse } from "next/server";
import pool from "../../db/db";

export async function GET() {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            WITH RankedPosts AS (
                SELECT 
                    b.board_name,
                    b.url_slug,
                    p.id AS post_id,
                    p.title,
                    p.user_id,
                    p.views,
                    p.created_at,
                    ROW_NUMBER() OVER (PARTITION BY b.board_name ORDER BY p.created_at DESC) AS row_num
                FROM 
                    boards b
                LEFT JOIN 
                    posts p ON p.board_name = b.board_name
            )
            SELECT 
                board_name, 
                url_slug,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', post_id,
                        'title', title,
                        'user_id', user_id,
                        'views', views,
                        'created_at', created_at
                    )
                ) AS posts
            FROM 
                RankedPosts
            WHERE 
                row_num <= 5
            GROUP BY 
                board_name, url_slug
            ORDER BY 
                board_name;
        `);

        // 결과를 { board_name: { 0: post1, 1: post2, ... } } 형태로 변환
        const postsByBoard = result.rows.reduce((acc, row) => {
            acc[row.board_name] = {
                url_slug: row.url_slug,  // url_slug 추가
                posts: row.posts
            };
            return acc;
        }, {});

        return NextResponse.json(postsByBoard);
        
    } finally {
        client.release();
    }
}
