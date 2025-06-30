import Board from "@/board/board";

export default function Page({ params }: { params: { nickname: string } }) {
  const boardType = "userPost";
  return <Board url_slug={params.nickname} boardType={boardType} />;
}
