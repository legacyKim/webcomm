import Profile from "../profile";
import { notFound } from "next/navigation";

import { UserProfile, UserActivity } from "@/type/type";

// 사용자 프로필 데이터 타입

// API 응답 타입 정의
interface ProfileResponse {
  profile: UserProfile;
  activity: UserActivity;
}

// ISR과 캐싱이 적용된 사용자 데이터 가져오기 (단일 API 호출)
async function getUserData(
  username: string,
  currentUserId?: number,
  tab: string = "summary"
): Promise<ProfileResponse | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    // 먼저 username으로 시도
    let url = `${baseUrl}/api/user/profile?username=${encodeURIComponent(username)}&current_user=${currentUserId || ""}&tab=${tab}`;

    let response = await fetch(url, {
      next: {
        // ISR: 24시간마다 재생성, 프로필은 자주 변경되지 않으므로
        revalidate: 86400, // 24시간 = 24 * 60 * 60
        tags: [
          `profile-${username}`, // 사용자별 캐시 태그
          `user-activity-${username}-${tab}`, // 탭별 캐시 태그
          "profiles", // 전체 프로필 캐시 태그
        ],
      },
      // 서버 컴포넌트에서 캐시 최적화
      cache: "force-cache",
    });

    // username으로 찾지 못하면 nickname으로 시도
    if (!response.ok && response.status === 404) {
      url = `${baseUrl}/api/user/profile?nickname=${encodeURIComponent(username)}&current_user=${currentUserId || ""}&tab=${tab}`;

      response = await fetch(url, {
        next: {
          revalidate: 86400,
          tags: [
            `profile-${username}`,
            `user-activity-${username}-${tab}`,
            "profiles",
          ],
        },
        cache: "force-cache",
      });
    }

    if (!response.ok) {
      console.warn(
        `Failed to fetch user data for ${username}: ${response.status}`
      );
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return null;
  }
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{
    tab?: "summary" | "posts" | "comments" | "likes" | "follower";
  }>;
}) {
  const { username } = await params;
  const { tab = "summary" } = await searchParams;

  // URL 디코딩 (한글 사용자명 지원)
  const decodedUsername = decodeURIComponent(username);

  // TODO: 현재 로그인한 사용자 ID 가져오기 (JWT에서)
  const currentUserId = undefined; // JWT에서 추출 예정

  // SSR + ISR: 단일 API 호출로 모든 데이터 가져오기
  const userData = await getUserData(decodedUsername, currentUserId, tab);

  if (!userData) {
    notFound();
  }

  return (
    <div className="profile">
      <Profile
        userProfile={userData.profile}
        userActivity={userData.activity}
        currentTab={tab}
      />
    </div>
  );
}

// 메타데이터 생성
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  const userData = await getUserData(decodedUsername);

  if (!userData) {
    return {
      title: "Profile Not Found",
    };
  }

  const { profile } = userData;

  // profile이 undefined인 경우를 방지
  if (!profile) {
    return {
      title: "Profile Not Found",
    };
  }

  return {
    title: `${profile?.user_nickname || profile?.username || "Unknown"} - Profile`,
    description:
      profile?.bio ||
      `${profile?.user_nickname || profile?.username || "Unknown"}'s profile`,
    openGraph: {
      title: `${profile?.user_nickname || profile?.username || "Unknown"} - Profile`,
      description:
        profile?.bio ||
        `${profile?.user_nickname || profile?.username || "Unknown"}'s profile`,
      images: profile?.profile ? [profile.profile] : [],
    },
  };
}
