import type { Metadata } from "next";

import QueryProvider from "@/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import MenuProviderWrapper from "@/components/MenuProviderWrapper";
import { fetchBoard } from "@/api/api";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import LayoutWrapper from "@/(site)/layoutWrapper";

import "@/style/base.css";
import "@/style/font.css";
import "@/style/fontello/css/fontello.css";
import "@/style/fontello/css/animation.css";
import "@/style/style.common.scss";
import "@/style/checkbox.scss";

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

  // 게시판 데이터 가져오기
  const boardList = await fetchBoard();

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
    <html lang="kor">
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
          loginStatusCheck={loginStatusCheck}
        >
          <MenuProviderWrapper initialBoards={boardList}>
            <QueryProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </QueryProvider>
          </MenuProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
