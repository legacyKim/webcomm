import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverTokenCheck } from "../../../../lib/serverTokenCheck";

export async function POST(req: Request) {
  try {
    const userData = await serverTokenCheck();
    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    const { memberId } = await req.json();

    if (!memberId) {
      return NextResponse.json({ error: "삭제할 멤버 ID가 필요합니다" }, { status: 400 });
    }

    // 자기 자신은 삭제할 수 없음
    if (memberId === userData.id) {
      return NextResponse.json({ error: "자신은 삭제할 수 없습니다" }, { status: 400 });
    }

    // 트랜잭션으로 관련 데이터와 함께 삭제
    await prisma.$transaction(async (tx) => {
      // 관련 데이터 삭제 (cascading은 스키마에서 설정되어 있다고 가정)
      await tx.member.delete({
        where: { id: memberId },
      });
    });

    return NextResponse.json({
      success: true,
      message: "회원이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("Member delete error:", error);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}
