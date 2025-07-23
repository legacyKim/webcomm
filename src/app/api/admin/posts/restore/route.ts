import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverTokenCheck } from "../../../../lib/serverTokenCheck";

export async function POST(req: Request) {
  try {
    const userData = await serverTokenCheck();
    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    const { postId, postIds } = await req.json();

    // 단일 ID 또는 배열 ID 모두 처리
    const idsToRestore = postIds || (postId ? [postId] : []);

    if (!Array.isArray(idsToRestore) || idsToRestore.length === 0) {
      return NextResponse.json({ error: "복원할 게시물 ID가 필요합니다" }, { status: 400 });
    }

    // 게시물 복원
    await prisma.post.updateMany({
      where: {
        id: { in: idsToRestore },
      },
      data: {
        deleted: false,
      },
    });

    return NextResponse.json({ success: true, message: "게시물이 복원되었습니다." });
  } catch (error) {
    console.error("Posts restore error:", error);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}
