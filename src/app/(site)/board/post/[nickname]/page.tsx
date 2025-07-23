import React from "react";
import Board from "@/(site)/board/board";

export default function Page({ params }: { params: Promise<{ nickname: string }> }) {
  const unwrappedParams = React.use(params);
  const boardType = "userPost";

  return <Board url_slug={unwrappedParams.nickname} page={Number(1)} boardType={boardType} />;
}
