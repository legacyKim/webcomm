import { NextResponse } from "next/server";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import { prisma } from "../../../lib/prisma";

export async function POST(request) {
  try {
    const user = await serverTokenCheck(request);

    if (!user.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const subscription = body.subscription || body; // subscription이 감싸진 경우 처리

    // subscription 데이터 구조 검증
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription data: missing endpoint" }, { status: 400 });
    }

    if (!subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return NextResponse.json({ error: "Invalid subscription data: missing keys" }, { status: 400 });
    }

    // 데이터베이스에 저장 시도
    // 먼저 해당 사용자의 기존 구독을 모두 삭제 (한 사용자당 하나의 구독만 유지)
    await prisma.pushSubscription.deleteMany({
      where: {
        user_id: user.id,
      },
    });

    // 새로운 구독 생성
    await prisma.pushSubscription.create({
      data: {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    // members 테이블의 notification_enabled도 true로 업데이트
    await prisma.member.update({
      where: {
        id: user.id,
      },
      data: {
        notification_enabled: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to save subscription:", err);
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }
}
