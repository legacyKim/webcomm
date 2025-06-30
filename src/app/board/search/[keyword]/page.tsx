"use client";

import "@/style/base.css";
import "@/style/font.css";
import "@/style/fontello/css/fontello.css";
import "@/style/fontello/css/animation.css";

// import Image from "next/image";
import "@/style/style.common.scss";

import Board from "@/board/board";

export default async function Page({ params }: { params: { keyword: string } }) {
  const boardType = "search";
  return <Board url_slug={params.keyword} boardType={boardType} />;
}
