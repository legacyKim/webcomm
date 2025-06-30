import Board from "@/board/board";

export default async function Page({ params }: { params: { nickname: string } }) {
  const boardType = "userComment";
  return <Board url_slug={params.nickname} boardType={boardType} />;
}
