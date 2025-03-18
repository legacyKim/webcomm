import { NextResponse } from "next/server";
import pool from "../../../../db/db";

export async function GET(req, context) {

    const { url_slug, id } = await context.params;
    const client = await pool.connect();

    try {

        const query = `SELECT * FROM posts WHERE url_slug = $1 AND id = $2;`;
        const posts = await client.query(query, [url_slug, id]);

        return NextResponse.json({ response: true, posts });

    } finally {
        client.release();
    }
}

export async function PUT(req, context) {

    const { id } = await context.params;
    const client = await pool.connect();

    try {

        const query = `UPDATE posts SET views = views + 1 WHERE id = $1 RETURNING *;`;
        const posts = await client.query(query, [id]);

        return NextResponse.json({ posts });

    } finally {
        client.release();
    }

}
