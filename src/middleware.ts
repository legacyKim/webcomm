import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const PROTECTED_PATHS = [
  "/write",
  "/my",
  "/admin",

  "/api/board/popular",
  "/api/board/userPost",
  "/api/board/userComment",
  "/api/board/search",
  "/api/board/stream",

  "/api/comment/action",
  "/api/comment/upload",

  "/api/member",
  "/api/message",
  "/api/my",

  "/api/post/action",
  "/api/upload",

  "/api/user/block",
  "/api/user/report",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("authToken")?.value;
  if (!token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const authority = (decoded as jwt.JwtPayload).userAuthority;

    if (pathname.startsWith("/admin") && authority !== 0) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ success: false, message: "관리자 권한이 필요합니다." }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ success: false, message: "토큰이 만료되었거나 유효하지 않습니다." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/write/:path*", "/my/:path*", "/api/:path*"],
};
