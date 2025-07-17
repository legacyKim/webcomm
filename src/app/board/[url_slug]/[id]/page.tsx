// app/board/[url_slug]/[postId]/page.tsx

import React from "react";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import fetchPostDetail from "@/api/api";

import View from "./View";

interface CustomJwtPayload {
  id: number;
}

export const dynamic = "force-dynamic"; // SSR 강제화

export async function generateMetadata({ params }: { params: { url_slug: string; id: string } }) {
  const { url_slug, id } = await params;

  const postData = await fetchPostDetail(url_slug, id);
  const post = postData.post;

  return {
    title: post.title || "게시글",
    description: post.content?.slice(0, 150) || "상세 게시글 내용",

    openGraph: {
      title: post.title,
      description: post.content.slice(0, 150),
      url: `https://www.tokti.net/board/${params.url_slug}/${params.id}`,
      type: "article",
      images: [
        {
          url: post.thumbnail || "https://www.tokti.net/default-thumbnail.jpg",
          width: 800,
          height: 600,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.content.slice(0, 150),
      imagimages: [post.thumbnail || "https://www.tokti.net/default-thumbnail.jpg"],
    },
  };
}

export default async function Page({ params }: { params: { url_slug: string; id: string } }) {
  const { url_slug, id } = await params;

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

  const post = await fetchPostDetail(url_slug, id);

  return <View post={post.post} />;
}
