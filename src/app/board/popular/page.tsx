import Board from "@/board/board";

export default function Page({ params }: { params: { url_slug: string } }) {
  const boardType = "popular";
  return <Board url_slug={params.url_slug} boardType={boardType} />;
}
