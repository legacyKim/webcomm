// app/page.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import type { Metadata } from "next";

import Home from "@/(site)/Home";
import { fetchHomePop } from "@/api/api";
// import { fetchHome } from "@/api/api";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "홈 - 인기 게시글과 최신 소식",
  description: "Tokti 커뮤니티의 인기 게시글과 최신 소식을 확인해보세요. 다양한 주제의 베스트 게시글과 활발한 커뮤니티 활동을 만나보실 수 있습니다.",
  openGraph: {
    title: "Tokti - 자유로운 소통의 공간",
    description: "인기 게시글과 최신 소식을 확인하고, 다양한 주제로 소통해보세요.",
  },
};

interface CustomJwtPayload {
  id: number;
}

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  let userId: number | null = null;

  if (token) {
    try {
      const decoded = jwt.decode(token) as CustomJwtPayload | null;
      userId = decoded?.id || null;
    } catch (err) {
      console.error("토큰 디코딩 실패", err);
    }
  }

  // 인기 게시글 ISR
  const popBoardData = await fetchHomePop(1, 10, userId);
  // const eachBoardData = await fetchHome(userId);

  return <Home popBoardposts={{ posts: popBoardData }} />;
}
