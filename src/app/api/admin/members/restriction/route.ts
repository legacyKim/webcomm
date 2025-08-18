import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

export async function POST(req: Request) {
  try {
    const userData = await serverTokenCheck();
    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      );
    }

    const { memberId, restrictionUntil, authority } = await req.json();

    if (!memberId) {
      return NextResponse.json(
        { error: "멤버 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // 자기 자신을 제한할 수 없음
    if (memberId === userData.id) {
      return NextResponse.json(
        { error: "자신에게는 제한을 설정할 수 없습니다" },
        { status: 400 }
      );
    }

    // 멤버 제한 설정
    await prisma.member.update({
      where: { id: memberId },
      data: {
        restriction_until: restrictionUntil ? new Date(restrictionUntil) : null,
        authority: authority,
      },
    });

    const message = restrictionUntil
      ? `제한이 설정되었습니다 (해제 예정: ${new Date(restrictionUntil).toLocaleString()})`
      : "제한이 해제되었습니다";

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Member restriction error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
