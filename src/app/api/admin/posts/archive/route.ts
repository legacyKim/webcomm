import { NextRequest, NextResponse } from "next/server";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const userData = await serverTokenCheck();
    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      );
    }

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: "게시물 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // 게시물을 삭제 상태로 업데이트 (보관처리)
    const post = await prisma.post.update({
      where: { id: postId },
      data: { deleted: true },
    });

    // 작성자의 all_posts 감소
    if (post.user_id) {
      await prisma.member.update({
        where: { id: post.user_id },
        data: { all_posts: { decrement: 1 } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("게시물 보관 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
