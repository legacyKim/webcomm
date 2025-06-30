import React from "react";
import Board from "@/board/board";

export default function Page({ params }: { params: Promise<{ url_slug: string }> }) {
  const unwrappedParams = React.use(params);
  const boardType = "popular";

  return <Board url_slug={unwrappedParams.url_slug} boardType={boardType} />;
}
