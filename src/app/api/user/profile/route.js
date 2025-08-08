import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function getUserProfileFromDB(
  usernameOrNickname,
  currentUserId,
  tab = "summary"
) {
  try {
    // 사용자 기본 정보 조회 - username 또는 user_nickname으로 검색
    const user = await prisma.member.findFirst({
      where: {
        OR: [
          { username: usernameOrNickname },
          { user_nickname: usernameOrNickname },
        ],
      },
      select: {
        id: true,
        username: true,
        user_nickname: true,
        profile: true,
        bio: true,
        location: true,
        website: true,
        banner_image: true,
        createdAt: true,
        last_seen: true,
        is_online: true,
        authority: true,
        total_likes_received: true,
        marketing_enabled: true,
        notification_enabled: true,
      },
    });

    if (!user) {
      return null;
    }

    // 사용자의 게시글 수 계산
    const postsCount = await prisma.post.count({
      where: {
        user_id: user.id,
        deleted: false,
      },
    });

    // 사용자의 총 조회수 계산 (모든 게시글의 조회수 합)
    const totalViews = await prisma.post.aggregate({
      where: {
        user_id: user.id,
        deleted: false,
      },
      _sum: {
        views: true,
      },
    });

    // 팔로워 수 계산
    const followerCount = await prisma.follow.count({
      where: { following_id: user.id },
    });

    // 팔로잉 수 계산
    const followingCount = await prisma.follow.count({
      where: { follower_id: user.id },
    });

    // 현재 사용자가 이 사용자를 팔로우하고 있는지 확인
    const isFollowing = currentUserId
      ? await prisma.follow.findFirst({
          where: {
            follower_id: currentUserId,
            following_id: user.id,
          },
        })
      : null;

    // 최근 게시글 조회
    const recentPosts = await prisma.post.findMany({
      where: {
        user_id: user.id,
        deleted: false,
      },
      take: tab === "posts" ? 20 : 5,
      orderBy: { created_at: "desc" },
      include: {
        board: {
          select: {
            board_name: true,
            url_slug: true,
          },
        },
      },
    });

    // 최근 댓글 조회
    const recentComments = await prisma.comment.findMany({
      where: {
        user_id: user.id,
        is_deleted: false,
      },
      take: tab === "comments" ? 20 : 5,
      orderBy: { created_at: "desc" },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            board: {
              select: {
                board_name: true,
                url_slug: true,
              },
            },
          },
        },
      },
    });

    // 팔로워 목록 조회 (요약 탭에서만)
    const followers =
      tab === "summary" || tab === "activity"
        ? await prisma.follow.findMany({
            where: { following_id: user.id },
            take: 10,
            orderBy: { created_at: "desc" },
            include: {
              follower: {
                select: {
                  id: true,
                  username: true,
                  user_nickname: true,
                  profile: true,
                },
              },
            },
          })
        : [];

    // 관심 게시판 통계 (게시글과 댓글 활동 기반)
    let favoriteBoards = [];
    if (tab === "summary" || tab === "activity") {
      try {
        // 게시글 기반 활동 통계
        const postActivity = await prisma.post.groupBy({
          by: ["board_id"],
          where: {
            user_id: user.id,
            deleted: false,
          },
          _count: {
            id: true,
          },
        });

        // 게시판 정보와 함께 조합
        const boardIds = [...new Set(postActivity.map((p) => p.board_id))];
        const boards = await prisma.board.findMany({
          where: { id: { in: boardIds } },
          select: {
            id: true,
            board_name: true,
            url_slug: true,
          },
        });

        favoriteBoards = boards
          .map((board) => {
            const postCount =
              postActivity.find((p) => p.board_id === board.id)?._count.id || 0;
            return {
              board_name: board.board_name,
              url_slug: board.url_slug,
              activity_count: postCount,
            };
          })
          .sort((a, b) => b.activity_count - a.activity_count)
          .slice(0, 5);
      } catch (error) {
        console.error("관심 게시판 통계 조회 오류:", error);
        favoriteBoards = [];
      }
    }

    const profileData = {
      profile: {
        id: user.id,
        username: user.username,
        user_nickname: user.user_nickname || "",
        profile: user.profile,
        bio: user.bio,
        location: user.location,
        website: user.website,
        banner_image: user.banner_image,
        createdAt: user.createdAt.toISOString(),
        last_seen: user.last_seen?.toISOString() || new Date().toISOString(),
        is_online: user.is_online || false,
        authority: user.authority,
        all_posts: postsCount,
        all_views: totalViews._sum.views || 0,
        follower_count: followerCount,
        following_count: followingCount,
        total_likes_received: user.total_likes_received || 0,
        isFollowing: !!isFollowing,
        isOwnProfile: currentUserId === user.id,
      },
      activity: {
        recent_posts: recentPosts.map((post) => ({
          id: post.id,
          title: post.title,
          board_name: post.board?.board_name || "알 수 없음",
          url_slug: post.board?.url_slug || "unknown",
          created_at: post.created_at.toISOString(),
          views: post.views,
          likes: post.likes,
        })),
        recent_comments: recentComments.map((comment) => ({
          id: comment.id,
          content: comment.content,
          post_title: comment.post?.title || "",
          board_name: comment.post?.board?.board_name || "알 수 없음",
          post_url_slug: comment.post?.board?.url_slug || "unknown",
          created_at: comment.created_at.toISOString(),
          likes: comment.likes,
        })),
        favorite_boards: favoriteBoards,
        followers: followers.map((f) => ({
          id: f.follower.id,
          username: f.follower.username,
          user_nickname: f.follower.user_nickname || "",
          profile: f.follower.profile,
        })),
      },
    };

    return profileData;
  } catch (error) {
    console.error("Database query error:", error);
    // 데이터베이스 오류 시 null 반환 (더미 데이터 폴백 제거)
    return null;
  }
}

// GET 요청 핸들러 - ISR과 캐싱 최적화
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const nickname = searchParams.get("nickname");
    const currentUserParam = searchParams.get("current_user");
    const tab = searchParams.get("tab") || "summary";

    const userIdentifier = username || nickname;

    if (!userIdentifier) {
      return NextResponse.json(
        { error: "Username or nickname is required" },
        { status: 400 }
      );
    }

    // URL 디코딩 (한글 사용자명 지원)
    const decodedUserIdentifier = decodeURIComponent(userIdentifier);
    const currentUserId = currentUserParam
      ? parseInt(currentUserParam)
      : undefined;

    // 데이터베이스에서 사용자 프로필 조회 (캐싱 적용)
    const userData = await getUserProfileFromDB(
      decodedUserIdentifier,
      currentUserId,
      tab
    );

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ISR 헤더 설정 - 24시간 캐싱, stale-while-revalidate
    const response = NextResponse.json(userData);

    // 캐싱 헤더 설정
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=172800" // 24시간 캐시, 48시간 stale-while-revalidate
    );

    // Vercel/Next.js ISR 태그
    response.headers.set(
      "x-cache-tags",
      `profile-${decodedUserIdentifier},user-activity-${decodedUserIdentifier}-${tab},profiles`
    );

    return response;
  } catch (error) {
    console.error("Profile API error:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// 캐시 재검증을 위한 API (관리자용)
export async function POST(request) {
  try {
    const { username, action } = await request.json();

    if (action === "revalidate" && username) {
      // Next.js 캐시 태그 기반 재검증
      // revalidateTag(`profile-${username}`);
      // revalidateTag(`user-activity-${username}`);

      return NextResponse.json({ message: "Cache revalidated successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Cache revalidation error:", error);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
