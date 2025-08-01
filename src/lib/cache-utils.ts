// 프로필 캐시 무효화 유틸리티
// src/lib/cache-utils.ts

import { revalidateTag } from "next/cache";

export function invalidateUserProfileCache(username: string) {
  // 프로필 관련 캐시 무효화
  revalidateTag(`profile-${username}`);
  revalidateTag(`user-activity-${username}`);
  revalidateTag(`profiles`);

  // 모든 탭의 캐시 무효화
  ["summary", "posts", "comments", "likes", "activity"].forEach((tab) => {
    revalidateTag(`user-activity-${username}-${tab}`);
  });
}

export function invalidateUserProfileCacheById(userId: number) {
  // TODO: userId로 username을 찾아서 캐시 무효화
  // 임시로 전체 프로필 캐시 무효화
  revalidateTag("profiles");
}
