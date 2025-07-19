import Menu from "./menu";
import { fetchBoard } from "@/api/api";

export const dynamic = "force-dynamic";
export const revalidate = 6000; // 100 분

export default async function MenuServer() {
  const boardList = await fetchBoard();

  return <Menu boardList={boardList} />;
}
