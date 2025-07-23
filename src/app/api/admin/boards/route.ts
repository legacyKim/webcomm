import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

export async function GET() {
  try {
    const userData = await serverTokenCheck();
    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    const boards = await prisma.board.findMany({
      select: {
        id: true,
        board_name: true,
        url_slug: true,
        seq: true,
      },
      orderBy: {
        seq: "asc",
      },
    });

    return NextResponse.json({ boards });
  } catch (error) {
    console.error("Boards fetch error:", error);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}
