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

    const { postIds } = await req.json();

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { error: "삭제할 게시물 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // 게시물 삭제 (soft delete)
    await prisma.post.updateMany({
      where: {
        id: { in: postIds },
      },
      data: {
        deleted: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "게시물이 삭제되었습니다",
    });
  } catch (error) {
    console.error("Posts delete error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
