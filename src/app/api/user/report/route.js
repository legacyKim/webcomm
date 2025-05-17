import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(request) {
  try {
    const { userId, reason } = await request.json();

    // 신고 기록 추가
    await prisma.userReport.create({
      data: {
        reporterId: userId,
        reportedId: userId,
        reason: reason,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("신고 실패:", error);
    return NextResponse.json({ success: false, message: "신고에 실패했습니다." }, { status: 500 });
  }
}
