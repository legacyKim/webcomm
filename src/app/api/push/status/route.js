import { NextResponse } from "next/server";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import { prisma } from "../../../lib/prisma";

export async function GET(request) {
  try {
    const user = await serverTokenCheck(request);

    if (!user.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 사용자의 구독 정보 확인
    const subscription = await prisma.pushSubscription.findFirst({
      where: {
        user_id: user.id,
      },
    });

    // members 테이블의 notification_enabled 상태도 확인
    const member = await prisma.member.findUnique({
      where: {
        id: user.id,
      },
      select: {
        notification_enabled: true,
      },
    });

    const hasSubscription = !!subscription && (member?.notification_enabled || false);

    return NextResponse.json({
      hasSubscription,
      dbSubscription: !!subscription,
      notificationEnabled: member?.notification_enabled || false,
    });
  } catch (err) {
    console.error("Failed to check subscription status:", err);
    return NextResponse.json({ error: "Failed to check subscription status" }, { status: 500 });
  }
}
