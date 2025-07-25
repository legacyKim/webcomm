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

    // 회원의 최근 댓글 가져오기 (게시글 정보 포함)
    const comments = await prisma.comment.findMany({
      where: {
        user_id: memberId,
        is_deleted: false,
      },
      select: {
        id: true,
        content: true,
        post_id: true,
        created_at: true,
        likes: true,
        post: {
          select: {
            title: true,
            board_name: true,
            url_slug: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: limit,
    });

    // 댓글 데이터 변환
    const commentsWithPostInfo = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      post_id: comment.post_id,
      created_at: comment.created_at,
      likes: comment.likes,
      post_title: comment.post.title,
      board_name: comment.post.board_name,
      url_slug: comment.post.url_slug,
    }));

    return NextResponse.json({ comments: commentsWithPostInfo });
  } catch (error) {
    console.error("회원 댓글 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
