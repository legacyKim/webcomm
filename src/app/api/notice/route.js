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
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id: userId, userNick, userAuthority } = decoded;

    // 관리자 권한 확인
    if (Number(userAuthority) !== 0) {
      return NextResponse.json(
        { success: false, message: "관리자만 공지를 작성할 수 있습니다." },
        { status: 403 }
      );
    }

    const insertQuery = `
      INSERT INTO posts (board_name, title, content, user_id, url_slug, user_nickname, notice)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await client.query(insertQuery, [
      boardname,
      title,
      content,
      userId,
      url_slug,
      userNick,
      true,
    ]);

    return NextResponse.json({ success: true, message: "공지 등록 완료" });
  } catch (error) {
    console.error("공지 등록 오류:", error);
    return NextResponse.json(
      { success: false, message: "공지 등록 실패" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function GET(req) {
  const client = await pool.connect();

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const query = `
      SELECT id, title, content, created_at, user_nickname, url_slug, board_name, views, likes
      FROM posts
      WHERE notice = true
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM posts
      WHERE notice = true
    `;

    const [result, countResult] = await Promise.all([
      client.query(query, [limit + 1, offset]), // +1로 다음 페이지 존재 여부 확인
      client.query(countQuery),
    ]);

    const hasMore = result.rows.length > limit;
    const notices = hasMore ? result.rows.slice(0, limit) : result.rows;

    return NextResponse.json({
      success: true,
      data: notices,
      hasMore,
      total: parseInt(countResult.rows[0].total),
    });
  } catch (error) {
    console.error("공지 불러오기 오류:", error);
    return NextResponse.json(
      { success: false, message: "공지 불러오기 실패" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(_, { params }) {
  const client = await pool.connect();
  const { id } = params;

  try {
    await client.query("DELETE FROM posts WHERE id = $1 AND notice = true", [
      id,
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("공지 삭제 오류:", error);
    return NextResponse.json(
      { success: false, message: "공지 삭제 실패" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
