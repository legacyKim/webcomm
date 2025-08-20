// app/page.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import type { Metadata } from "next";

import Home from "@/(site)/Home";
import { fetchHomePop } from "@/api/api";
// import { fetchHome } from "@/api/api";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "톡티(Tokti) - 자유로운 소통의 커뮤니티",
  description: "톡티(Tokti)에서 유머, 일상, 정보공유 등 다양한 주제로 자유롭게 소통하세요. 한국 최고의 온라인 커뮤니티에서 활발한 토론과 재미있는 게시글을 만나보세요!",
  keywords: [
    "톡티", "Tokti", "커뮤니티", "게시판", "유머게시판", "자유게시판", 
    "베스트게시글", "온라인커뮤니티", "소통", "토론", "정보공유",
    "한국커뮤니티", "인터넷커뮤니티", "무료게시판"
  ],
  openGraph: {
    title: "톡티(Tokti) - 자유로운 소통의 커뮤니티",
    description: "유머, 일상, 정보공유 등 다양한 주제로 자유롭게 소통할 수 있는 한국 최고의 온라인 커뮤니티",
    url: "https://tokti.net",
    siteName: "톡티(Tokti)",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "톡티(Tokti) - 자유로운 소통의 커뮤니티",
    description: "유머, 일상, 정보공유 등 다양한 주제로 자유롭게 소통하세요!",
  },
  alternates: {
    canonical: "https://tokti.net",
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
