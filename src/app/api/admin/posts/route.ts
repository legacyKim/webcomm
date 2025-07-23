import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

export async function GET(req: Request) {
  try {
    // 관리자 권한 확인
    const userData = await serverTokenCheck();
    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const board = searchParams.get("board") || "";
    const archived = searchParams.get("archived") === "true"; // 보관된 게시물인지 확인

    const offset = (page - 1) * limit;

    // 검색 조건 구성
    const whereCondition: any = {
      deleted: archived, // archived가 true면 삭제된 것(보관된 것), false면 일반 게시물
    };

    if (board && board !== "all" && board !== "") {
      whereCondition.board_name = board;
    }

    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { user_nickname: { contains: search, mode: "insensitive" } },
      ];
    }

    // 게시물 조회
    const posts = await prisma.post.findMany({
      where: whereCondition,
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip: offset,
      take: limit + 1, // 다음 페이지 존재 여부 확인
    });

    const hasMore = posts.length > limit;
    const postsToReturn = hasMore ? posts.slice(0, limit) : posts;

    // 응답 데이터 형식 맞추기
    const formattedPosts = postsToReturn.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      board_name: post.board_name,
      user_nickname: post.user_nickname,
      created_at: post.created_at,
      views: post.views,
      likes: post.likes,
      dislike: post.dislikes,
      reports: post.reports,
      is_deleted: post.deleted,
      comment_count: post._count.comments,
    }));

    return NextResponse.json({
      posts: formattedPosts,
      hasMore,
    });
  } catch (error) {
    console.error("Posts fetch error:", error);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}

// 게시물 삭제
export async function DELETE(req: Request) {
  try {
    const userData = await serverTokenCheck();
    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    const { postIds } = await req.json();

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json({ error: "삭제할 게시물 ID가 필요합니다" }, { status: 400 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Posts delete error:", error);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}
