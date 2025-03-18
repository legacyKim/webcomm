import { NextResponse } from "next/server";
import pool from "../../../db/db";

export async function POST(req) {

    const client = await pool.connect();
    try {
        const { userid, userNickname } = await req.json();

        const user = await client.query(
            "SELECT EXISTS (SELECT 1 FROM members WHERE user_id = $1)",
            [userid]
        );

        const nickname = await client.query(
            "SELECT EXISTS (SELECT 1 FROM members WHERE user_nickname = $1)",
            [userNickname]
        );

        const isUserDupli = user.rows[0].exists;
        const isNickDupli = nickname.rows[0].exists;

        if (isUserDupli) {
            return NextResponse.json({ success: false, isUserDupli, message: "아이디가 중복됩니다." }, { status: 200 });
        } else if (isNickDupli) {
            return NextResponse.json({ success: false, isNickDupli, message: "별명이 중복됩니다." }, { status: 200 });
        }

        return NextResponse.json({ success: true, message: "아이디와 별명을 사용하실 수 있습니다." }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}
