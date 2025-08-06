import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/db";

export async function GET(request) {
  try {
    // 각 게시판별로 (게시물 수 * 조회수)의 합을 계산
    const boardPopularity = await prisma.board.findMany({
      select: {
        id: true,
        board_name: true,
        url_slug: true,
        notice: true,
        _count: {
          select: {
            posts: {
              where: {
                deleted: false,
              },
            },
          },
        },
        posts: {
          select: {
            views: true,
          },
          where: {
            deleted: false,
          },
        },
      },
    });

    // 각 게시판의 인기도 점수 계산 (게시물 수 * 총 조회수)
    const boardsWithPopularity = boardPopularity.map((board) => {
      const totalViews = board.posts.reduce((sum, post) => sum + post.views, 0);
      const postCount = board._count.posts;
      const popularityScore = postCount * totalViews;

      return {
        id: board.id,
        board_name: board.board_name,
        url_slug: board.url_slug,
        notice: board.notice,
        postCount,
        totalViews,
        popularityScore,
      };
    });

    // 인기도 점수로 정렬 (내림차순)
    boardsWithPopularity.sort((a, b) => b.popularityScore - a.popularityScore);

    return NextResponse.json({
      success: true,
      boards: boardsWithPopularity,
    });
  } catch (error) {
    console.error("게시판 인기도 조회 실패:", error);
    return NextResponse.json(
      { success: false, error: "게시판 인기도 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
