import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

export async function PATCH(req: Request) {
  try {
    const userData = await serverTokenCheck();
    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    const { memberId, authority } = await req.json();

    if (!memberId || authority === undefined) {
      return NextResponse.json({ error: "멤버 ID와 권한이 필요합니다" }, { status: 400 });
    }

    // 자기 자신의 권한은 변경할 수 없음
    if (memberId === userData.id) {
      return NextResponse.json({ error: "자신의 권한은 변경할 수 없습니다" }, { status: 400 });
    }

    // 멤버 권한 변경
    await prisma.member.update({
      where: { id: memberId },
      data: { authority },
    });

    return NextResponse.json({
      success: true,
      message: "권한이 변경되었습니다.",
    });
  } catch (error) {
    console.error("Member authority update error:", error);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}
