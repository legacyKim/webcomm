import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_PATHS = [
  "/write",
  "/my",
  "/admin",
  "/api/comment",
  "/api/member",
  "/api/message",
  "/api/my",
  "/api/user",
  "/api/upload",
  "/api/post/action/like",
  "/api/post/action/report",
  "/api/post/action/scrap",
];

const EXCLUDE_PATHS = ["/api/user/duplicate", "/api/user/email", "/api/user/profile"];

function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  if (pathname.startsWith("/api/comment") && method === "GET") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/user") && method === "POST") {
    return NextResponse.next();
  }

  if (EXCLUDE_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (!PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("authToken")?.value;

  if (!token) {
    return pathname.startsWith("/api")
      ? NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    const authority = Number(payload.userAuthority);

    if (pathname.startsWith("/admin") && authority !== 0) {
      return pathname.startsWith("/api")
        ? NextResponse.json({ success: false, message: "관리자 권한이 필요합니다." }, { status: 403 })
        : NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("JWT Verify Error:", err);
    return pathname.startsWith("/api")
      ? NextResponse.json({ success: false, message: "토큰 검증 실패" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/write/:path*", "/my/:path*", "/api/:path*"],
};
