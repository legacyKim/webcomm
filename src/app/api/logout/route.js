import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    // 쿠키에서 토큰 추출
    const authToken = request.cookies.get("authToken")?.value;

    if (authToken) {
      try {
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);

        // 사용자 오프라인 상태로 업데이트
        await prisma.member.update({
          where: { id: decoded.id },
          data: {
            is_online: false,
            last_seen: new Date(),
          },
        });
      } catch (jwtError) {
        // JWT 토큰이 유효하지 않더라도 로그아웃 진행
        console.warn(
          "JWT verification failed during logout:",
          jwtError.message
        );
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "로그아웃 되었습니다.",
    });

    response.headers.set(
      "Set-Cookie",
      `authToken=; Path=/; HttpOnly; Max-Age=0; Secure; SameSite=Strict`
    );

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 }
    );
  }
}
