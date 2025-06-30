"use client";

import "@/style/base.css";
import "@/style/font.css";
import "@/style/fontello/css/fontello.css";
import "@/style/fontello/css/animation.css";

// import Image from "next/image";
import "@/style/style.common.scss";

type PageProps = {
  params: {
    keyword: string;
  };
};

import Board from "@/board/board";

export default async function Page({ params }: PageProps) {
  const boardType = "search";
  return <Board url_slug={params.keyword} boardType={boardType} />;
}
