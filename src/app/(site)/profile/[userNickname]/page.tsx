import Profile from "../profile";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { UserProfile, UserActivity } from "@/type/type";

// 사용자 프로필 데이터 타입

// API 응답 타입 정의
interface ProfileResponse {
  profile: UserProfile;
  activity: UserActivity;
}

// ISR과 캐싱이 적용된 사용자 데이터 가져오기 (API 라우트 사용)
async function getUserData(
  userNickname: string,
  currentUserId?: number,
  tab: string = "summary"
): Promise<ProfileResponse | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    // API 라우트 호출: /api/user/profile/[username]
    const url = `${baseUrl}/api/user/profile/${encodeURIComponent(userNickname)}?current_user=${currentUserId || ""}&tab=${tab}`;

    const response = await fetch(url, {
      next: {
        revalidate: 86400,
        tags: [
          `profile-${userNickname}`,
          `user-activity-${userNickname}-${tab}`,
          "profiles",
        ],
      },
      cache: "force-cache",
    });

    if (!response.ok) {
      console.warn(
        `Failed to fetch user data for ${userNickname}: ${response.status}`
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
  params: Promise<{ userNickname: string }>;
  searchParams: Promise<{
    tab?: "summary" | "posts" | "comments" | "likes" | "follower";
  }>;
}) {
  const { userNickname } = await params;
  const { tab = "summary" } = await searchParams;

  // URL 디코딩 (한글 사용자명 지원)
  const decodedUserNickname = decodeURIComponent(userNickname);

  // JWT에서 현재 로그인한 사용자 ID 가져오기
  let currentUserId: number | undefined;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (token && process.env.JWT_SECRET) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        id: number;
      };
      currentUserId = decoded.id;
    }
  } catch (error) {
    console.log(error);
    currentUserId = undefined;
  }

  // SSR + ISR: 단일 API 호출로 모든 데이터 가져오기
  const userData = await getUserData(decodedUserNickname, currentUserId, tab);

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
  params: Promise<{ userNickname: string }>;
}) {
  const { userNickname } = await params;

  const decodedUserNickname = decodeURIComponent(userNickname);

  const userData = await getUserData(decodedUserNickname);

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
