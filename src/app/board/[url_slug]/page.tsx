import React from "react";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { fetchBoardData } from "@/api/api";

import Board from "@/board/board";

interface CustomJwtPayload {
  id: number;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ url_slug: string }> }) {
  const { url_slug } = await params;
  return {
    title: `${url_slug} 게시판`,
    description: `${url_slug} 게시판의 최신 글 목록입니다.`,

    openGraph: {
      title: `tokti ${url_slug} 게시판`,
      description: `tokti ${url_slug} 게시판의 최신 글 목록입니다.`,
      url: `https://www.tokti.net/board/${url_slug}`,
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
      title: `tokti ${url_slug} 게시판`,
      description: `tokti ${url_slug} 게시판의 최신 글 목록입니다.`,
      imagimages: ["https://www.tokti.net/default-thumbnail.jpg"],
    },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { url_slug: string; id: string };
  searchParams: { page?: string };
}) {
  const { url_slug } = params;
  const { page = 1 } = searchParams;

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

  return <Board url_slug={url_slug} page={Number(page)} boardType='board' initData={data} />;
}
