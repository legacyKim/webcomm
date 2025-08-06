import { NextResponse } from "next/server";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: 현재 사용자의 bio 및 설정 정보 조회
export async function GET() {
  try {
    // 사용자 인증 확인
    const userData = await serverTokenCheck();

    if (!userData) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 사용자 정보 조회
    const user = await prisma.member.findUnique({
      where: { id: userData.id },
      select: {
        id: true,
        username: true,
        user_nickname: true,
        bio: true,
        marketing_enabled: true,
        notification_enabled: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        user_nickname: user.user_nickname || "",
        bio: user.bio || "",
        marketing_enabled: user.marketing_enabled || false,
        notification_enabled: user.notification_enabled || false,
      },
    });
  } catch (error) {
    console.error("Bio 정보 조회 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
