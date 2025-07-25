import type { Metadata } from "next";

import QueryProvider from "@/QueryProvider";
import { AuthProvider } from "@/AuthContext";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import LayoutWrapper from "@/(site)/layoutWrapper";
import prisma from "@/db/db.js";

import "@/style/base.css";
import "@/style/font.css";
import "@/style/fontello/css/fontello.css";
import "@/style/fontello/css/animation.css";
import "@/style/style.common.scss";

// 사이트 설정 가져오기 (직접 DB 접근)
async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      orderBy: { id: "desc" },
    });
    return settings;
  } catch (error) {
    console.error("사이트 설정 가져오기 실패:", error);
    return null;
  }
}

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

  // 사이트 설정 가져오기
  const siteSettings = await getSiteSettings();

  let username = "";
  let userId = null;
  let userNick = "";
  let userProfile = "";
  let userEmail = "";
  let userAuthority = null;
  let tokenExp = null;
  let userNickUpdatedAt = null;

  let loginStatusCheck = null;

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

      loginStatusCheck = true;
    } catch (error) {
      console.error("토큰 검증 실패:", error);
    }
  } else {
    loginStatusCheck = false;
  }

  return (
    <html lang='kor'>
      <body>
        <AuthProvider
          username={username}
          userId={userId}
          userNick={userNick}
          userProfile={userProfile}
          userEmail={userEmail}
          userAuthority={userAuthority}
          tokenExp={tokenExp}
          userNickUpdatedAt={userNickUpdatedAt}
          loginStatusCheck={loginStatusCheck}>
          <QueryProvider>
            <LayoutWrapper siteSettings={siteSettings}>{children}</LayoutWrapper>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
