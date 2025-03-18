import { NextResponse } from "next/server";
import pool from "../../db/db";

export async function GET() {
    
    try {
        const query = `
        WITH RankedPosts AS (
            SELECT id, board_name, title, created_at,
                   ROW_NUMBER() OVER (PARTITION BY board_name ORDER BY created_at DESC) AS rn
            FROM posts
        )
        SELECT id, board_name, title, created_at
        FROM RankedPosts
        WHERE rn <= 5;
      `;

        const { rows } = await pool.query(query);

        return res.status(200).json(rows);
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
