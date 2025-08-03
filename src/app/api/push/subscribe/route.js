import { NextResponse } from "next/server";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const user = await serverTokenCheck();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscription } = await request.json();

    // 디버깅 로그
    console.log("받은 구독 데이터:", JSON.stringify({ subscription }, null, 2));

    // 구독 데이터 유효성 검사
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: "Invalid subscription data" }, { status: 400 });
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    // 기존 구독이 있다면 업데이트, 없다면 생성
    await prisma.pushSubscription.upsert({
      where: {
        endpoint: endpoint,
      },
      update: {
        p256dh: p256dh,
        auth: auth,
      },
      create: {
        user_id: user.id,
        endpoint: endpoint,
        p256dh: p256dh,
        auth: auth,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("구독 저장 실패:", error);
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }
}
