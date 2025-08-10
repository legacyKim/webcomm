import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { targetUserId, action } = body;

    if (!targetUserId || !action || !["follow", "unfollow"].includes(action)) {
      return NextResponse.json(
        { error: "targetUserId와 action(follow/unfollow)이 필요합니다." },
        { status: 400 }
      );
    }

    // JWT에서 현재 사용자 ID 추출
    const tokenData = await serverTokenCheck();

    if (!tokenData) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const currentUserId = tokenData.id;

    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: "자기 자신을 팔로우할 수 없습니다." },
        { status: 400 }
      );
    }

    // 실제 Prisma 쿼리 실행
    let targetUser;
    try {
      if (action === "follow") {
        // 이미 팔로우 중인지 확인
        const existingFollow = await prisma.follow.findUnique({
          where: {
            unique_follow: {
              follower_id: currentUserId,
              following_id: targetUserId,
            },
          },
        });

        if (existingFollow) {
          return NextResponse.json(
            { error: "이미 팔로우 중입니다." },
            { status: 400 }
          );
        }

        // 팔로우 추가
        await prisma.follow.create({
          data: {
            follower_id: currentUserId,
            following_id: targetUserId,
          },
        });
      } else {
        // 언팔로우
        const deletedFollow = await prisma.follow.deleteMany({
          where: {
            follower_id: currentUserId,
            following_id: targetUserId,
          },
        });

        if (deletedFollow.count === 0) {
          return NextResponse.json(
            { error: "팔로우 관계가 존재하지 않습니다." },
            { status: 400 }
          );
        }
      }

      // 캐시 무효화를 위해 대상 사용자 정보 조회
      targetUser = await prisma.member.findUnique({
        where: { id: targetUserId },
        select: { username: true, user_nickname: true },
      });
    } catch (dbError) {
      console.error("데이터베이스 오류:", dbError);
      return NextResponse.json(
        { error: "데이터베이스 처리 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 프로필 캐시 무효화 (username 기반)
    if (targetUser) {
      revalidateTag(`profile-${targetUser.username}`);
      if (targetUser.user_nickname) {
        revalidateTag(`profile-${targetUser.user_nickname}`);
      }
    }
    revalidateTag(`profile-${targetUserId}`);
    revalidateTag("profiles");

    return NextResponse.json({
      success: true,
      action,
      message: action === "follow" ? "팔로우했습니다." : "언팔로우했습니다.",
    });
  } catch (error) {
    console.error("팔로우 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 팔로우 상태 확인 및 목록 조회 API (통합)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("targetUserId");
    const userId = searchParams.get("userId"); // 기존 API 호환성
    const type = searchParams.get("type"); // "status", "list", "followers", "following"

    // JWT에서 현재 사용자 ID 추출 (status와 list의 경우)
    let tokenData;
    let currentUserId;
    
    if (type === "status" || type === "list") {
      tokenData = await serverTokenCheck(request);
      if (!tokenData) {
        return NextResponse.json(
          { error: "로그인이 필요합니다." },
          { status: 401 }
        );
      }
      currentUserId = tokenData.id;
    }

    if (type === "status" && targetUserId) {
      // 특정 사용자에 대한 팔로우 상태 확인
      const followStatus = await prisma.follow.findUnique({
        where: {
          unique_follow: {
            follower_id: currentUserId,
            following_id: parseInt(targetUserId),
          },
        },
      });

      return NextResponse.json({
        isFollowing: !!followStatus,
      });
    } else if (type === "list") {
      // 내 팔로우 목록 조회 (로그인 필요)
      const followType = searchParams.get("followType") || "following"; // "following" 또는 "followers"
      
      let users;
      if (followType === "following") {
        // 내가 팔로우하는 사람들
        const follows = await prisma.follow.findMany({
          where: { follower_id: currentUserId },
          include: {
            following: {
              select: {
                id: true,
                username: true,
                user_nickname: true,
                profile: true,
                bio: true,
              },
            },
          },
        });
        users = follows.map(f => f.following);
      } else {
        // 나를 팔로우하는 사람들
        const follows = await prisma.follow.findMany({
          where: { following_id: currentUserId },
          include: {
            follower: {
              select: {
                id: true,
                username: true,
                user_nickname: true,
                profile: true,
                bio: true,
              },
            },
          },
        });
        users = follows.map(f => f.follower);
      }

      return NextResponse.json({
        users,
        total: users.length,
        type: followType,
      });
    } else if ((type === "followers" || type === "following") && userId) {
      // 특정 사용자의 팔로우 목록 조회 (공개, 로그인 불필요)
      const followData = await prisma.follow.findMany({
        where:
          type === "followers"
            ? { following_id: parseInt(userId) }
            : { follower_id: parseInt(userId) },
        include: {
          follower:
            type === "followers"
              ? {
                  select: {
                    id: true,
                    username: true,
                    user_nickname: true,
                    profile: true,
                    is_online: true,
                    last_seen: true,
                  },
                }
              : undefined,
          following:
            type === "following"
              ? {
                  select: {
                    id: true,
                    username: true,
                    user_nickname: true,
                    profile: true,
                    is_online: true,
                    last_seen: true,
                  },
                }
              : undefined,
        },
        orderBy: {
          created_at: "desc",
        },
      });

      const users = followData.map((follow) =>
        type === "followers" ? follow.follower : follow.following
      );

      return NextResponse.json(
        {
          users: users,
          total: users.length,
          type,
        },
        {
          headers: {
            "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    } else {
      return NextResponse.json(
        { error: "올바른 파라미터를 제공해주세요. type은 status, list, followers, following 중 하나여야 합니다." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("팔로우 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
