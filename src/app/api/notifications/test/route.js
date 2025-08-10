import { NextResponse } from "next/server";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    // 인증 확인
    const user = await serverTokenCheck();

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    // 테스트 알림 생성
    const testNotification = await prisma.notification.create({
      data: {
        type: "test",
        sender_id: user.id,
        receiver_id: user.id,
        is_read: false,
      },
    });

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
