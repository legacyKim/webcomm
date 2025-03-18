import { NextResponse } from "next/server";
import pool from "../../db/db";

export async function GET() {
    const client = await pool.connect();
    try {
        const posts = await client.query("SELECT * FROM members");
        return NextResponse.json(
            { posts }
        );
    } finally {
        client.release();
    }
}

export async function POST(req) {
    const client = await pool.connect();
    try {
        const { board_name } = await req.json();
        const result = await client.query(
            "INSERT INTO boards (board_name) VALUES ($1) RETURNING *",
            [board_name]
        );
        return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}
