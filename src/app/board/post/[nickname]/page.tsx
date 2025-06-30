import Board from "@/board/board";

type PageProps = {
  params: {
    nickname: string;
  };
};

export default async function Page({ params }: PageProps) {
  const boardType = "userPost";
  return <Board url_slug={params.nickname} boardType={boardType} />;
}
