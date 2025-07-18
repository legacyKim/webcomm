import React from "react";
import Board from "@/board/board";

export default function Page({ params }: { params: Promise<{ keyword: string }> }) {
  const unwrappedParams = React.use(params);
  const boardType = "search";

  return <Board url_slug={unwrappedParams.keyword} page={Number(1)} boardType={boardType} />;
}
