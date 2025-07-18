// app/page.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import Home from "@/Home";
import { fetchHomePop } from "@/api/api";

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

  const data = await fetchHomePop(1, 10, userId);

  return <Home posts={data} />;
}
