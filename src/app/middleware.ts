import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface DecodedToken {
  userid: string;
  id: string;
  userNick: string;
  profile: string;
  email: string;
}

interface CustomNextRequest extends NextRequest {
  username?: string;
}

export function middleware(req: CustomNextRequest) {
  // const hostname = req.nextUrl.hostname; // 현재 요청된 도메인 (예: customer1.example.com)

  // "admin.customer1.example.com" 패턴 감지
  // if (hostname.startsWith("admin.")) {
  //     return NextResponse.rewrite(new URL(`/admin`, req.url));
  // }

  const token = req.cookies.get("authToken")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "토근이 만료되었습니다. 다시 로그인 해주세요." },
      { status: 401 },
    );
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;

    const username = decoded.userid;
    const userId = decoded.id;
    const userNick = decoded.userNick;
    const userProfile = decoded.profile;
    const userEmail = decoded.email;

    req.username = username;

    return NextResponse.json({
      authenticated: true,
      username: username,
      userId: userId,
      userNick: userNick,
      userProfile: userProfile,
      userEmail: userEmail,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, message: "유효하지 않은 토큰입니다." }, { status: 401 });
  }

  // "customer1.example.com" 같은 커뮤니티 사이트 감지
  return NextResponse.next();
}
