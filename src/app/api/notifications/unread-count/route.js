import { NextResponse } from "next/server";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import prisma from "@/lib/prisma.js";

export async function GET() {
  try {
    const user = await serverTokenCheck();
    if (!user) {
      return NextResponse.json({ count: 0 });
    }

    const count = await prisma.notification.count({
      where: {
        receiver_id: user.id,
        is_read: false,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("알림 개수 조회 실패:", error);
    return NextResponse.json({ count: 0 });
  }
}
