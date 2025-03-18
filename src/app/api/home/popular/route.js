import { NextResponse } from "next/server";
import pool from "../../../db/db";

export async function GET() {
    try {
        const client = await pool.connect();
        const query = `
            SELECT 
                p.id, 
                p.title, 
                p.user_nickname, 
                p.likes, 
                p.views, 
                p.created_at, 
                p.board_name,
                p.url_slug,
                COALESCE(c.comments, 0) AS comments,  -- 댓글 수 추가
                (p.likes * 2 + p.views) / POWER(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 + 2, 1.5) AS score
            FROM posts p
            LEFT JOIN (
                SELECT post_id, COUNT(*) AS comments
                FROM comments
                GROUP BY post_id
            ) c ON p.id = c.post_id
            ORDER BY score DESC
            LIMIT 10;
        `;
        const result = await client.query(query);
        client.release();

        return NextResponse.json(result.rows);
    } catch (err) {
        console.error(err);
        return NextResponse.error();
    }
}
