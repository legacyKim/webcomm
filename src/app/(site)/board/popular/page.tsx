import React from "react";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { fetchBoardPop } from "@/api/api";
import Board from "@/(site)/board/board";

interface CustomJwtPayload {
  id: number;
}

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: `Tokti 인기 게시판`,
    description: `Tokti 인기 게시판의 최신 글 목록입니다.`,

    openGraph: {
      title: `Tokti 인기 게시판`,
      description: `Tokti 인기 게시판의 최신 글 목록입니다.`,
      url: `https://www.tokti.net/board/popular`,
      type: "website",
      images: [
        {
          url: "https://www.tokti.net/default-thumbnail.jpg",
          width: 800,
          height: 600,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `Tokti 인기 게시판`,
      description: `Tokti 인기 게시판의 최신 글 목록입니다.`,
      images: ["https://www.tokti.net/default-thumbnail.jpg"],
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

  const data = await fetchBoardPop(page, 20, userId);

  return (
    <Board
      url_slug={url_slug}
      page={Number(page)}
      boardType={"popular"}
      initData={data}
    />
  );
}
