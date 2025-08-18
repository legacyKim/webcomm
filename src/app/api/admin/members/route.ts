import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

export async function GET(req: Request) {
  try {
    const userData = await serverTokenCheck();
    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const authority = searchParams.get("authority") || "";

    const offset = (page - 1) * limit;

    // 검색 조건 구성
    const whereCondition: Record<string, unknown> = {};

    if (authority && authority !== "all") {
      whereCondition.authority = parseInt(authority);
    }

    if (search) {
      whereCondition.OR = [
        { user_nickname: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // 멤버 조회 (댓글 수 포함)
    const members = await prisma.member.findMany({
      where: whereCondition,
      select: {
        id: true,
        username: true,
        user_nickname: true,
        email: true,
        all_posts: true,
        all_views: true,
        authority: true,
        createdAt: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit + 1, // 다음 페이지 존재 여부 확인
    });

    const hasMore = members.length > limit;
    const membersToReturn = hasMore ? members.slice(0, limit) : members;

    // 응답 데이터 형식 맞추기
    const formattedMembers = membersToReturn.map((member) => ({
      id: member.id,
      userid: member.username,
      user_nickname: member.user_nickname,
      email: member.email,
      all_posts: member.all_posts,
      comment_count: member._count.comments,
      all_views: member.all_views,
      authority: member.authority,
    }));

    return NextResponse.json({
      members: formattedMembers,
      hasMore,
    });
  } catch (error) {
    console.error("Members fetch error:", error);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}
