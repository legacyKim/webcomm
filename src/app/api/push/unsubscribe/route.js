import { NextResponse } from "next/server";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const user = await serverTokenCheck();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint is required" },
        { status: 400 }
      );
    }

    // 먼저 해당 subscription이 존재하는지 확인
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: {
        endpoint: endpoint,
      },
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // subscription 삭제
    await prisma.pushSubscription.delete({
      where: {
        endpoint: endpoint,
      },
    });

    // 해당 사용자의 다른 subscription이 있는지 확인
    const remainingSubscriptions = await prisma.pushSubscription.findMany({
      where: {
        user_id: user.id,
      },
    });

    // 다른 subscription이 없으면 notification_enabled를 false로 업데이트
    if (remainingSubscriptions.length === 0) {
      await prisma.member.update({
        where: {
          id: user.id,
        },
        data: {
          notification_enabled: false,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to unsubscribe:", err);
    return NextResponse.json(
      { error: "Failed to unsubscribe", details: err.message },
      { status: 500 }
    );
  }
}
