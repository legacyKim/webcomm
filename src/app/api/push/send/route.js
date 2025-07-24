import webpush from "web-push";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// VAPID 키 설정 (환경변수에서 가져옴)
webpush.setVapidDetails(
  `mailto:${process.env.ADMIN_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

export async function POST(request) {
  try {
    const { userId, title, body, url, type = "default" } = await request.json();

    // 해당 사용자의 구독 정보 조회
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { user_id: userId },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({ message: "No subscriptions found" });
    }

    const payload = JSON.stringify({
      title,
      body,
      url,
      type,
      timestamp: Date.now(),
    });

    // 모든 디바이스에 푸시 발송
    const promises = subscriptions.map(async (sub) => {
      const subscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(subscription, payload);
      } catch (error) {
        console.error("푸시 발송 실패:", error);

        // 구독이 만료된 경우 DB에서 제거
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.pushSubscription
            .delete({
              where: { id: sub.id },
            })
            .catch(() => {}); // 이미 삭제된 경우 무시
        }
      }
    });

    await Promise.all(promises);

    return NextResponse.json({
      success: true,
      sent: subscriptions.length,
    });
  } catch (error) {
    console.error("푸시 발송 오류:", error);
    return NextResponse.json({ error: "Failed to send push" }, { status: 500 });
  }
}
