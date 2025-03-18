import { NextResponse } from "next/server";
import pool from "../../../db/db";

export async function GET(req, context) {

    const { id } = await context.params;
    const client = await pool.connect();

    try {

        const query = `SELECT * FROM posts WHERE id = $1;`;
        const posts = await client.query(query, [id]);

        return NextResponse.json({ success: true, posts });

    } finally {
        client.release();
    }
}

export async function PUT(req) {

    const client = await pool.connect();
    const { id, boardname, url_slug, user_id, user_nickname, title, content } = await req.json();

    try {
        const result = await client.query(
            `UPDATE posts SET board_name = $1, url_slug = $2, user_id = $3, user_nickname = $4, title = $5, content = $6 WHERE id = $7 RETURNING * `,
            [boardname, url_slug, user_id, user_nickname, title, content, id]
        );
        await client.query(
            "UPDATE members SET all_posts = all_posts - 1 WHERE user_id = $1 AND all_posts > 0",
            [user_id]
        )
        return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}