import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../../db/db";

export async function POST(req) {
  const client = await pool.connect();

  try {
    const { userid, password } = await req.json();

    const query = "SELECT * FROM members WHERE username = $1";
    const result = await client.query(query, [userid]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "아이디가 없습니다." }, { status: 401 });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    const token = jwt.sign(
      {
        username: user.username,
        id: user.id,
        profile: user.profile,
        userNick: user.user_nickname,
        userEmail: user.email,
        userAuthority: user.authority,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    const response = NextResponse.json({
      success: true,
      username: user.username,
      userId: user.id,
      userNick: user.user_nickname,
      userProfile: user.profile,
      userEmail: user.email,
      userAuthority: user.authority,
    });
    response.headers.set(
      "Set-Cookie",
      `authToken=${token}; Path=/; HttpOnly; Max-Age=3600; Secure=${
        process.env.NODE_ENV === "production"
      }; SameSite=Strict`,
      // `authToken=${token}; Path=/; Max-Age=3600; SameSite=Strict`,
    );

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
