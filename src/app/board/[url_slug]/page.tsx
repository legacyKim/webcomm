import Board from "@/board/board";

type PageProps = {
  params: {
    url_slug: string;
  };
};

export default async function Page({ params }: PageProps) {
  const boardType = "board";
  return <Board url_slug={params.url_slug} boardType={boardType} />;
}
