// app/page.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import type { Metadata } from "next";

import Home from "@/(site)/Home";
import { fetchHomePop } from "@/api/api";
// import { fetchHome } from "@/api/api";

export const revalidate = 600;

interface CustomJwtPayload {
  id: number;
}

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  let userId: number | null = null;

  if (token) {
    try {
      const decoded = jwt.decode(token) as CustomJwtPayload | null;
      userId = decoded?.id || null;
    } catch (err) {
      console.error("토큰 디코딩 실패", err);
    }
  }

  // 인기 게시글 ISR
  const popBoardData = await fetchHomePop(1, 10, userId);
  // const eachBoardData = await fetchHome(userId);

  return <Home popBoardposts={{ posts: popBoardData }} />;
}
