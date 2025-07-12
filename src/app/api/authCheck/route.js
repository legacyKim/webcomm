import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const token = req.cookies.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "토큰 없음", isAuthenticated: false }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, username, userAuthority } = decoded;

    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      user: {
        id,
        username,
        userAuthority,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "토큰 오류 또는 만료", isAuthenticated: false },
      { status: 401 },
    );
  }
}
