import React from "react";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { fetchBoardData } from "@/api/api";

import Board from "@/(site)/board/board";

interface CustomJwtPayload {
  id: number;
}

// 기본 캐시 시간 (서버에서 동적으로 조정됨)
export const revalidate = 1800; // 30분 기본값

export async function generateMetadata({
  params,
}: {
  params: Promise<{ url_slug: string }>;
}) {
  const { url_slug } = await params;

  // url_slug에 따른 한국어 게시판 이름 매핑
  const boardNames: { [key: string]: string } = {
    free: "자유게시판",
    humor: "유머게시판",
    best: "베스트게시판",
    notice: "공지사항",
    question: "질문게시판",
    info: "정보게시판",
    daily: "일상게시판",
  };

  const boardDisplayName = boardNames[url_slug] || `${url_slug} 게시판`;

  return {
    title: `${boardDisplayName} | 톡티(Tokti)`,
    description: `톡티(Tokti) ${boardDisplayName}에서 다양한 주제의 글을 읽고 댓글로 소통하세요. 실시간으로 업데이트되는 최신 게시글과 인기글을 만나보세요.`,
    keywords: [
      "톡티",
      "Tokti",
      boardDisplayName,
      url_slug,
      "게시판",
      "커뮤니티",
      "게시글",
      "댓글",
      "소통",
      "토론",
      "온라인커뮤니티",
      "한국커뮤니티",
    ],
    openGraph: {
      title: `${boardDisplayName} | 톡티(Tokti)`,
      description: `톡티(Tokti) ${boardDisplayName}에서 다양한 주제의 글을 읽고 소통하세요.`,
      url: `https://tokti.net/board/${url_slug}`,
      siteName: "톡티(Tokti)",
      type: "website",
      locale: "ko_KR",
      images: [
        {
          url: "https://tokti.net/logo.png",
          width: 1200,
          height: 630,
          alt: `톡티(Tokti) ${boardDisplayName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${boardDisplayName} | 톡티(Tokti)`,
      description: `톡티(Tokti) ${boardDisplayName}에서 다양한 주제의 글을 읽고 소통하세요.`,
      images: ["https://tokti.net/logo.png"],
    },
    alternates: {
      canonical: `https://tokti.net/board/${url_slug}`,
    },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ url_slug: string }>;
  searchParams: Promise<{ page?: number; limit?: string }>;
}) {
  const { url_slug } = await params;
  const { page = 1 } = await searchParams;

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

  const data = await fetchBoardData(url_slug, page, 20, userId);

  return (
    <Board
      url_slug={url_slug}
      page={Number(page)}
      boardType="board"
      initData={data}
    />
  );
}
