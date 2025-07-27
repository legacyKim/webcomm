import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

interface DecodedToken {
  id: number;
  username: string;
  userNick: string;
  profile: string;
  userEmail: string;
  userAuthority: number;
  exp: number;
}

interface TokenCheckResult {
  success: boolean;
  id?: number;
  username?: string;
  userNick?: string;
  profile?: string;
  userEmail?: string;
  userAuthority?: number;
  exp?: number;
}

export async function serverTokenCheck(request?: NextRequest): Promise<TokenCheckResult> {
  try {
    let token: string | undefined;

    if (request) {
      // request가 제공된 경우 쿠키에서 토큰 추출
      token = request.cookies.get("authToken")?.value;
    } else {
      // request가 없는 경우 cookies() 함수 사용
      const cookieStore = await cookies();
      token = cookieStore.get("authToken")?.value;
    }

    if (!token) {
      return { success: false };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    return {
      success: true,
      id: decoded.id,
      username: decoded.username,
      userNick: decoded.userNick,
      profile: decoded.profile,
      userEmail: decoded.userEmail,
      userAuthority: decoded.userAuthority,
      exp: decoded.exp,
    };
  } catch (error) {
    console.error("JWT 인증 실패:", error);
    return { success: false };
  }
}
