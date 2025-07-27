import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "@/db/db";

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
        userNickUpdatedAt: user.nickname_updated_at,
        notificationEnabled: user.notification_enabled || false,
        marketingEnabled: user.marketing_enabled || false,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    const decoded = jwt.decode(token);
    const exp = decoded?.exp;

    const response = NextResponse.json({
      success: true,
      username: user.username,
      userId: user.id,
      userNick: user.user_nickname,
      userProfile: user.profile,
      userEmail: user.email,
      userAuthority: user.authority,
      userNickUpdatedAt: user.nickname_updated_at,
      notificationEnabled: user.notification_enabled || false,
      marketingEnabled: user.marketing_enabled || false,
      exp,
    });

    const isProduction = process.env.NODE_ENV === "production";

    // 인증 토큰 쿠키 설정
    const authCookie = [
      `authToken=${token}`,
      `Path=/`,
      `HttpOnly`,
      `Max-Age=3600`,
      `SameSite=Lax`,
      ...(isProduction ? ["Secure"] : []),
    ].join("; ");

    // 다크모드 쿠키가 없는 경우 기본값으로 false 설정
    const existingDarkMode = req.cookies.get("darkMode");
    if (!existingDarkMode) {
      const darkModeCookie = [
        `darkMode=false`,
        `Path=/`,
        `Max-Age=${60 * 60 * 24 * 30}`, // 30일
        `SameSite=Lax`,
        ...(isProduction ? ["Secure"] : []),
      ].join("; ");

      response.headers.set("Set-Cookie", [authCookie, darkModeCookie]);
    } else {
      response.headers.set("Set-Cookie", authCookie);
    }

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
