import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const PROTECTED_PATHS = ["/write", "/my", "/admin", "/api"];

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
    let authority: number | undefined = undefined;
    let authorityRaw: number | undefined = undefined;

    console.log("decoded:", decoded);
    console.log("authority:", authority, typeof authority);

    if (typeof decoded === "object" && decoded !== null) {
      authority = decoded.userAuthority;
    }

    const authorityNum = Number(authorityRaw);

    const response = NextResponse.next();
    response.headers.set("x-auth-authority-raw", String(authority));
    response.headers.set("x-auth-authority-num", String(authorityNum));
    response.headers.set("x-request-path", pathname);

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
