import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

interface DecodedToken {
  id: number;
  username: string;
  userNick: string;
  profile: string;
  userEmail: string;
  userAuthority: number;
  exp: number;
}

export async function serverTokenCheck(): Promise<DecodedToken | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error("JWT 인증 실패:", error);
    return null;
  }
}
