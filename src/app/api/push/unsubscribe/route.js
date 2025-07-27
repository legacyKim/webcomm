import { NextResponse } from "next/server";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import { prisma } from "../../../lib/prisma";

export async function POST(request) {
  try {
    const user = await serverTokenCheck(request);
    if (!user.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint is required" }, { status: 400 });
    }

    await prisma.pushSubscription.delete({
      where: {
        endpoint: endpoint,
      },
    });

    // members 테이블의 notification_enabled도 false로 업데이트
    await prisma.member.update({
      where: {
        id: user.id,
      },
      data: {
        notification_enabled: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to unsubscribe:", err);
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}
