import React from "react";
import Board from "@/board/board";

export default function Page({ params }: { params: Promise<{ nickname: string }> }) {
  const unwrappedParams = React.use(params);
  const boardType = "userComment";

  return <Board url_slug={unwrappedParams.nickname} boardType={boardType} />;
}
