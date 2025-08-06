// 사용자 활동 통계 업데이트 유틸리티
import { revalidateTag } from "next/cache";
import { PrismaClient } from "@prisma/client";

// Prisma 클라이언트
const prisma = (global as unknown as { prisma: PrismaClient }).prisma;

export interface UserStats {
  userId: number;
  postViews?: number;
  likesReceived?: number;
  commentsCount?: number;
  postsCount?: number;
}

interface UpdateData {
  total_views_received?: { increment: number };
  total_likes_received?: { increment: number };
  all_comments?: { increment: number };
  all_posts?: { increment: number };
  total_comments_count?: { increment: number };
  total_posts_count?: { increment: number };
  last_seen?: Date;
  is_online?: boolean;
}

// 사용자 통계 업데이트 (실제 DB 업데이트 + 캐시 무효화)
export async function updateUserStats(stats: UserStats) {
  const { userId, postViews, likesReceived, commentsCount, postsCount } = stats;

  try {
    // 실제 DB 업데이트 실행
    const updateData: UpdateData = {};

    if (postViews !== undefined) {
      updateData.total_views_received = {
        increment: postViews,
      };
    }

    if (likesReceived !== undefined) {
      updateData.total_likes_received = {
        increment: likesReceived,
      };
    }

    if (commentsCount !== undefined) {
      updateData.total_comments_count = {
        increment: commentsCount,
      };
    }

    if (postsCount !== undefined) {
      updateData.total_posts_count = {
        increment: postsCount,
      };
    }

    // 마지막 활동 시간 업데이트
    updateData.last_seen = new Date();
    updateData.is_online = true;

    // 사용자 통계 업데이트
    await prisma.member.update({
      where: { id: userId },
      data: updateData,
    });

    // 프로필 캐시 무효화
    revalidateTag(`profile-${userId}`);
    revalidateTag("user-stats");

    return true;
  } catch (error) {
    console.error("사용자 통계 업데이트 오류:", error);
    return false;
  }
}

// 사용자 온라인 상태 업데이트
export async function updateUserOnlineStatus(
  userId: number,
  isOnline: boolean
) {
  try {
    // 사용자 온라인 상태 업데이트
    await prisma.member.update({
      where: { id: userId },
      data: {
        is_online: isOnline,
        last_seen: new Date(),
      },
    });

    // 프로필 캐시 무효화
    revalidateTag(`profile-${userId}`);

    return true;
  } catch (error) {
    console.error("온라인 상태 업데이트 오류:", error);
    return false;
  }
}

// 게시물 조회 시 호출
export async function incrementPostView(postId: number, authorId: number) {
  try {
    // 게시물 조회수 증가
    await prisma.post.update({
      where: { id: postId },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    // 작성자 통계 업데이트
    await updateUserStats({
      userId: authorId,
      postViews: 1,
    });

    return true;
  } catch (error) {
    console.error("게시물 조회수 업데이트 오류:", error);
    return false;
  }
}

// 좋아요 클릭 시 호출
export async function updateLikeStats(
  postId: number,
  authorId: number,
  isLike: boolean
) {
  try {
    // 게시물 좋아요 수 업데이트
    await prisma.post.update({
      where: { id: postId },
      data: {
        likes: {
          increment: isLike ? 1 : -1,
        },
      },
    });

    // 작성자 통계 업데이트
    await updateUserStats({
      userId: authorId,
      likesReceived: isLike ? 1 : -1,
    });

    return true;
  } catch (error) {
    console.error("좋아요 통계 업데이트 오류:", error);
    return false;
  }
}

// 댓글 작성 시 호출
export async function updateCommentStats(
  postId: number,
  authorId: number,
  isAdd: boolean
) {
  try {
    // 게시물 댓글 수는 Prisma에서 자동으로 계산되므로 별도 업데이트 불필요
    // 게시물 작성자 통계 업데이트 (댓글 받은 수)
    await updateUserStats({
      userId: authorId,
      commentsCount: isAdd ? 1 : -1,
    });

    // 캐시 무효화
    revalidateTag(`post-${postId}`);
    revalidateTag("posts");

    return true;
  } catch (error) {
    console.error("댓글 통계 업데이트 오류:", error);
    return false;
  }
}
