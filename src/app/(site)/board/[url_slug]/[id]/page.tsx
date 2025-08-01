import React from "react";
import fetchPostDetail from "@/api/api";

import View from "./View";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ url_slug: string; id: string }> }) {
  const { url_slug, id } = await params;

  const postData = await fetchPostDetail(url_slug, id);

  if (!postData || !postData.post) {
    return {
      title: "게시글을 찾을 수 없음",
      description: "존재하지 않거나 삭제된 게시글입니다.",
    };
  }

  const post = postData.post;

  return {
    title: post.title || "게시글",
    description: post.content?.slice(0, 150) || "상세 게시글 내용",

    openGraph: {
      title: post.title,
      description: post.content.slice(0, 150),
      url: `https://www.tokti.net/board/${url_slug}/${id}`,
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
      images: [post.thumbnail || "https://www.tokti.net/default-thumbnail.jpg"],
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
