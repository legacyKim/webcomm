import Menu from "./menu";

export const dynamic = "force-dynamic";
export const revalidate = 6000; // 100 분

export default async function MenuServer() {
  return <Menu />;
}
