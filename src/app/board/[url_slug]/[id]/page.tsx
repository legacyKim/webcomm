// app/board/[url_slug]/[postId]/page.tsx

import React from "react";
import fetchPostDetail from "@/api/api";

import View from "./View";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { url_slug: string; id: string } }) {
  const { url_slug, id } = params;

  const postData = await fetchPostDetail(url_slug, id);
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
  params: { url_slug: string; id: string };
  searchParams: { page?: string };
}) {
  const { url_slug, id } = params;
  const { page = "1" } = searchParams;

  const post = await fetchPostDetail(url_slug, id);

  return <View post={post.post} page={Number(page)} />;
}
