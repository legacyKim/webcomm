import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

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
    const posts = await prisma.post.updateMany({
      where: {
        id: { in: idsToRestore },
      },
      data: {
        deleted: false,
      },
    });

    // 복원된 게시물의 작성자들의 all_posts 증가
    const restoredPosts = await prisma.post.findMany({
      where: { id: { in: idsToRestore } },
      select: { user_id: true },
    });

    for (const post of restoredPosts) {
      if (post.user_id) {
        await prisma.member.update({
          where: { id: post.user_id },
          data: { all_posts: { increment: 1 } },
        });
      }
    }

    return NextResponse.json({ success: true, message: "게시물이 복원되었습니다." });
  } catch (error) {
    console.error("Posts restore error:", error);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}
