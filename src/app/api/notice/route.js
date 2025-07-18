import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/db/db";

export async function POST(req) {
  const client = await pool.connect();

  try {
    const { boardname, url_slug, title, content } = await req.json();

    // 쿠키에서 JWT 추출
    const cookieHeader = req.headers.get("cookie") || "";
    const token = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("authToken="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id: userId, userNick, userAuthority } = decoded;

    // 관리자 권한 확인
    if (Number(userAuthority) !== 0) {
      return NextResponse.json({ success: false, message: "관리자만 공지를 작성할 수 있습니다." }, { status: 403 });
    }

    const insertQuery = `
      INSERT INTO posts (board_name, title, content, user_id, url_slug, user_nickname, notice)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await client.query(insertQuery, [boardname, title, content, userId, url_slug, userNick, true]);

    return NextResponse.json({ success: true, message: "공지 등록 완료" });
  } catch (error) {
    console.error("공지 등록 오류:", error);
    return NextResponse.json({ success: false, message: "공지 등록 실패" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function GET() {
  const client = await pool.connect();

  try {
    const query = `
      SELECT id, title, content, created_at, user_nickname, url_slug
      FROM posts
      WHERE notice = true
      ORDER BY created_at DESC
    `;

    const result = await client.query(query);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("공지 불러오기 오류:", error);
    return NextResponse.json({ success: false, message: "공지 불러오기 실패" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(_, { params }) {
  const client = await pool.connect();
  const { id } = params;

  try {
    await client.query("DELETE FROM posts WHERE id = $1 AND notice = true", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("공지 삭제 오류:", error);
    return NextResponse.json({ success: false, message: "공지 삭제 실패" }, { status: 500 });
  } finally {
    client.release();
  }
}
