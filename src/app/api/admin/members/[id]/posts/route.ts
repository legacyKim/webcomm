import { NextRequest, NextResponse } from "next/server";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 관리자 권한 확인
    const userData = await serverTokenCheck();
    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    const resolvedParams = await params;
    const memberId = parseInt(resolvedParams.id);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    // 회원의 최근 게시글 가져오기
    const posts = await prisma.post.findMany({
      where: {
        user_id: memberId,
        deleted: false,
      },
      select: {
        id: true,
        title: true,
        board_name: true,
        url_slug: true,
        created_at: true,
        views: true,
        likes: true,
      },
      orderBy: {
        created_at: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("회원 게시글 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
