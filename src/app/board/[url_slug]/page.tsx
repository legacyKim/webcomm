import Board from "@/board/board";

export default async function Page({ params }: { params: { url_slug: string } }) {
  const boardType = "board";
  return <Board url_slug={params.url_slug} boardType={boardType} />;
}
