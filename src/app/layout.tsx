import type { Metadata } from "next";

import QueryProvider from "@/QueryProvider";
import { AuthProvider } from "@/AuthContext";

import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";

import LayoutWrapper from "@/layoutWrapper";

import "@/style/base.css";
import "@/style/font.css";
import "@/style/fontello/css/fontello.css";
import "@/style/fontello/css/animation.css";
import "@/style/style.common.scss";

export const metadata: Metadata = {
  title: "Tokti",
  description: "Tokti 커뮤니티",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("authToken")?.value ?? "";

  let username = "";
  let userId = null;
  let userNick = "";
  let userProfile = "";
  let userEmail = "";
  let userAuthority = null;
  let tokenExp = null;
  let userNickUpdatedAt = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        username: string;
        id: number;
        userNick: string;
        profile: string;
        userEmail: string;
        userAuthority: number | null;
        exp: number | null;
        userNickUpdatedAt: Date | null;
      };

      username = decoded.username;
      userId = decoded.id;
      userNick = decoded.userNick;
      userProfile = decoded.profile;
      userEmail = decoded.userEmail;
      userAuthority = decoded.userAuthority;
      tokenExp = decoded.exp;
      userNickUpdatedAt = decoded.userNickUpdatedAt;
    } catch (error) {
      console.error("토큰 검증 실패:", error);
    }
  }

  const pathname = (await headers()).get("x-next-url") || "/";

  return (
    <html lang='en'>
      <body>
        <AuthProvider
          username={username}
          userId={userId}
          userNick={userNick}
          userProfile={userProfile}
          userEmail={userEmail}
          userAuthority={userAuthority}
          tokenExp={tokenExp}
          userNickUpdatedAt={userNickUpdatedAt}>
          <QueryProvider>
            <LayoutWrapper pathname={pathname}>{children}</LayoutWrapper>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
