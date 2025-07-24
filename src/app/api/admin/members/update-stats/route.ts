import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

// 회원 통계 업데이트 API
export async function POST(req: Request) {
  try {
    const userData = await serverTokenCheck();
    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    // 모든 회원의 실제 게시물 수와 조회수 합계 계산
    const members = await prisma.member.findMany({
      select: {
        id: true,
        posts: {
          where: { deleted: false },
          select: {
            id: true,
            views: true,
          },
        },
      },
    });

    // 각 회원의 통계 업데이트
    const updatePromises = members.map(async (member) => {
      const totalPosts = member.posts.length;
      const totalViews = member.posts.reduce((sum, post) => sum + (post.views || 0), 0);

      return prisma.member.update({
        where: { id: member.id },
        data: {
          all_posts: totalPosts,
          all_views: totalViews,
        },
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ 
      success: true, 
      message: `${members.length}명의 회원 통계가 업데이트되었습니다.`,
      updatedCount: members.length 
    });
  } catch (error) {
    console.error("Member stats update error:", error);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}
