import { NextResponse } from "next/server";
import pool from "../../../../db/db";

export async function GET(req, context) {
    const { url_slug, id } = await context.params;
    const client = await pool.connect();

    try {
        // 트랜잭션 시작
        await client.query('BEGIN');

        // 게시물 조회
        const query = `SELECT * FROM posts WHERE url_slug = $1 AND id = $2;`;
        const posts = await client.query(query, [url_slug, id]);

        if (posts.rows.length === 0) {
            return NextResponse.json({ response: false, message: "Post not found" });
        }

        // 조회수 증가 (트랜잭션 내에서 한 번만 실행)
        const viewsQuery = `UPDATE posts SET views = views + 1 WHERE id = $1 RETURNING views;`;
        await client.query(viewsQuery, [id]);

        // 트랜잭션 커밋
        await client.query('COMMIT');

        return NextResponse.json({ response: true, posts });

    } catch (error) {
        // 에러 발생 시 롤백
        await client.query('ROLLBACK');
        console.error(error);
        return NextResponse.json({ response: false, message: "Internal server error" });
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
