import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 동적 라우팅: /api/user/profile/[username]
// username은 username 또는 nickname일 수 있음

async function getUserProfileFromDB(
  userNickname,
  currentUserId,
  tab = "summary"
) {
  try {
    // URL 디코딩
    const decodedUserNickname = decodeURIComponent(userNickname);

    // 사용자 기본 정보 조회 - username 또는 user_nickname으로 검색
    const user = await prisma.member.findFirst({
      where: {
        OR: [{ user_nickname: decodedUserNickname }],
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

    // 사용자의 댓글 수 계산
    const commentsCount = await prisma.comment.count({
      where: {
        user_id: user.id,
        is_deleted: false,
      },
    });

    // 사용자가 좋아요한 게시글 수 계산
    const likedPostsCount = await prisma.postAction.count({
      where: {
        user_id: user.id,
        action_type: "like",
      },
    });

    // 팔로워 수 계산
    let followerCount = 0;
    let followingCount = 0;
    let isFollowing = null;

    try {
      followerCount = await prisma.follow.count({
        where: { following_id: user.id },
      });
    } catch (error) {
      console.error("팔로워 수 계산 오류:", error);
    }

    try {
      // 팔로잉 수 계산
      followingCount = await prisma.follow.count({
        where: { follower_id: user.id },
      });
    } catch (error) {
      console.error("팔로잉 수 계산 오류:", error);
    }

    try {
      // 현재 사용자가 이 사용자를 팔로우하고 있는지 확인
      isFollowing = currentUserId
        ? await prisma.follow.findFirst({
            where: {
              follower_id: currentUserId,
              following_id: user.id,
            },
          })
        : null;
    } catch (error) {
      console.error("팔로우 상태 확인 오류:", error);
    }

    // 활동 데이터 조회
    let activityData = {
      recent_posts: [],
      recent_comments: [],
      favorite_boards: [],
      followers: [],
      liked_posts: [],
    };

    if (tab === "summary" || tab === "posts") {
      // 최근 게시글 조회
      const recentPosts = await prisma.post.findMany({
        where: {
          user_id: user.id,
          deleted: false,
        },
        take: 10,
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

      activityData.recent_posts = recentPosts.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content?.substring(0, 200) || "",
        board_name: post.board?.board_name || "알 수 없음",
        url_slug: post.board?.url_slug || "unknown",
        created_at: post.created_at.toISOString(),
        views: post.views,
        likes: post.likes,
      }));
    }

    if (tab === "summary" || tab === "comments") {
      // 최근 댓글 조회
      const recentComments = await prisma.comment.findMany({
        where: {
          user_id: user.id,
          is_deleted: false,
        },
        take: 10,
        orderBy: { created_at: "desc" },
        include: {
          post: {
            include: {
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

      activityData.recent_comments = recentComments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        post_title: comment.post?.title || "",
        board_name: comment.post?.board?.board_name || "알 수 없음",
        post_url_slug: comment.post?.board?.url_slug || "unknown",
        created_at: comment.created_at.toISOString(),
        likes: comment.likes,
      }));
    }

    if (tab === "summary" || tab === "likes") {
      // 좋아요한 게시글 조회
      const likedPosts = await prisma.postAction.findMany({
        where: {
          user_id: user.id,
          action_type: "like",
        },
        take: 10,
        orderBy: { created_at: "desc" },
        include: {
          post: {
            include: {
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

      activityData.liked_posts = likedPosts.map((action) => ({
        id: action.post.id,
        title: action.post.title,
        content: action.post.content?.substring(0, 200) || "",
        board_name: action.post.board?.board_name || "알 수 없음",
        url_slug: action.post.board?.url_slug || "unknown",
        created_at: action.post.created_at.toISOString(),
        liked_at: action.created_at.toISOString(),
        views: action.post.views,
        likes: action.post.likes,
      }));
    }

    if (tab === "summary") {
      // 즐겨찾는 게시판 조회 (사용자가 가장 많이 게시글을 작성한 게시판)
      const favoriteBoards = await prisma.post.groupBy({
        by: ["board_id"],
        where: {
          user_id: user.id,
          deleted: false,
        },
        _count: {
          board_id: true,
        },
        orderBy: {
          _count: {
            board_id: "desc",
          },
        },
        take: 5,
      });

      const boardDetails = await prisma.board.findMany({
        where: {
          id: {
            in: favoriteBoards.map((board) => board.board_id),
          },
        },
        select: {
          id: true,
          board_name: true,
          url_slug: true,
        },
      });

      activityData.favorite_boards = favoriteBoards.map((board) => {
        const boardDetail = boardDetails.find((b) => b.id === board.board_id);
        return {
          board_id: board.board_id,
          board_name: boardDetail?.board_name || "알 수 없음",
          url_slug: boardDetail?.url_slug || "unknown",
          post_count: board._count.board_id,
        };
      });
    }

    if (tab === "follower") {
      // 팔로워 목록 조회
      const followers = await prisma.follow.findMany({
        where: { following_id: user.id },
        take: 20,
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
      });

      activityData.followers = followers.map((f) => ({
        id: f.follower.id,
        username: f.follower.username,
        user_nickname: f.follower.user_nickname || "",
        profile: f.follower.profile,
      }));
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
        createdAt: user.createdAt?.toISOString(),
        last_seen: user.last_seen?.toISOString(),
        is_online: user.is_online || false,
        authority: user.authority || "user",
        total_likes_received: user.total_likes_received || 0,
        marketing_enabled: user.marketing_enabled || false,
        notification_enabled: user.notification_enabled || true,
        posts_count: postsCount,
        comments_count: commentsCount,
        liked_posts_count: likedPostsCount,
        total_views: totalViews._sum.views || 0,
        follower_count: followerCount,
        following_count: followingCount,
        is_following: isFollowing !== null,
      },
      activity: {
        recent_posts: activityData.recent_posts,
        recent_comments: activityData.recent_comments,
        favorite_boards: activityData.favorite_boards,
        followers: activityData.followers,
        liked_posts: activityData.liked_posts,
      },
    };

    return profileData;
  } catch (error) {
    console.error("Database query error (API):", error);
    console.error("Error details (API):", {
      message: error.message,
      stack: error.stack,
      userNickname,
      currentUserId,
      tab,
    });
    return null;
  }
}

export async function GET(request, { params }) {
  try {
    const { userNickname } = await params;
    const { searchParams } = new URL(request.url);
    const currentUserParam = searchParams.get("current_user");
    const tab = searchParams.get("tab") || "summary";

    if (!userNickname) {
      return NextResponse.json(
        { error: "User userNickname is required" },
        { status: 400 }
      );
    }

    const currentUserId = currentUserParam
      ? parseInt(currentUserParam)
      : undefined;

    const userData = await getUserProfileFromDB(
      userNickname,
      currentUserId,
      tab
    );

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response = NextResponse.json(userData);

    // 캐싱 헤더 설정
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=172800"
    );

    return response;
  } catch (error) {
    console.error("프로필 API error:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
