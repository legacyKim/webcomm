import { NextResponse } from "next/server";
import pool from "../../../db/db";

export async function GET(req, context) {

    const { url_slug } = await context.params;

    const client = await pool.connect();

    try {
        const query = `
            SELECT 
                *, 
                COUNT(*) OVER () - ROW_NUMBER() OVER (ORDER BY created_at DESC) + 1 AS post_number
            FROM posts 
            WHERE url_slug = $1 
            ORDER BY created_at DESC 
            LIMIT 20
        `;
        const result = await client.query(query, [url_slug]);

        return NextResponse.json({ posts: result.rows });
    } finally {
        client.release();
    }
}