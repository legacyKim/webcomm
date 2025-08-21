import React from "react";
import fetchPostDetail from "@/api/api";

import View from "./View";

export const revalidate = 86400; // 24시간 ISR 캐시

export async function generateMetadata({
  params,
}: {
  params: Promise<{ url_slug: string; id: string }>;
}) {
  const { url_slug, id } = await params;

  const postData = await fetchPostDetail(url_slug, id);

  if (!postData || !postData.post) {
    return {
      title: "게시글을 찾을 수 없음 | 톡티(Tokti)",
      description: "존재하지 않거나 삭제된 게시글입니다.",
      robots: { index: false, follow: false },
    };
  }

  const post = postData.post;
  const cleanContent =
    post.content?.replace(/<[^>]*>/g, "").slice(0, 160) ||
    "톡티 커뮤니티 게시글";

  return {
    title: `${post.title} | 톡티(Tokti)`,
    description: cleanContent,
    keywords: [
      "톡티",
      "Tokti",
      "커뮤니티",
      "게시글",
      post.title,
      url_slug,
      "온라인커뮤니티",
      "소통",
      "토론",
      "댓글",
    ],
    authors: [{ name: post.user_nick || "익명" }],
    openGraph: {
      title: post.title,
      description: cleanContent,
      url: `https://tokti.net/board/${url_slug}/${id}`,
      siteName: "톡티(Tokti)",
      type: "article",
      locale: "ko_KR",
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: [post.user_nick || "익명"],
      section: url_slug,
      images: [
        {
          url: post.thumbnail || "https://tokti.net/logo.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: cleanContent,
      creator: `@${post.user_nick || "tokti"}`,
      images: [post.thumbnail || "https://tokti.net/logo.png"],
    },
    alternates: {
      canonical: `https://tokti.net/board/${url_slug}/${id}`,
    },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ url_slug: string; id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { url_slug, id } = await params;
  const { page = "1" } = await searchParams;

  const post = await fetchPostDetail(url_slug, id);

  return <View post={post.post} comment={post.comments} page={Number(page)} />;
}
