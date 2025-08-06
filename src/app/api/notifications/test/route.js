import { NextResponse } from "next/server";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import prisma from "@/lib/prisma.js";

export async function POST() {
  try {
    console.log("=== 테스트 알림 API 시작 ===");

    // 인증 확인
    const user = await serverTokenCheck();
    console.log("사용자 정보:", user);

    if (!user) {
      console.log("인증 실패");
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    console.log("Prisma 클라이언트 확인:", !!prisma);

    // 간단한 테스트 쿼리 먼저 실행
    try {
      console.log("멤버 테이블 확인 중...");
      const memberCount = await prisma.member.count();
      console.log("멤버 총 수:", memberCount);
      
      // 현재 사용자 정보 확인
      const currentUser = await prisma.member.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          username: true,
          user_nickname: true
        }
      });
      console.log("현재 사용자 정보:", currentUser);
      
    } catch (dbError) {
      console.error("DB 연결 오류:", dbError);
      return NextResponse.json(
        {
          error: "데이터베이스 연결 실패",
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    // 테스트 알림 생성
    console.log("알림 생성 시도...");
    const testNotification = await prisma.notification.create({
      data: {
        type: "test",
        sender_id: user.id,
        receiver_id: user.id,
        is_read: false,
      },
    });

    console.log("테스트 알림 생성 성공:", testNotification);

    return NextResponse.json({
      success: true,
      message: "테스트 알림이 생성되었습니다.",
      notification: testNotification,
    });
  } catch (error) {
    console.error("테스트 알림 생성 실패:", error);
    return NextResponse.json(
      {
        success: false,
        error: "테스트 알림 생성에 실패했습니다.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
