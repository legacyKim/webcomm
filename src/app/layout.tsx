import type { Metadata } from "next";

import QueryProvider from "./QueryProvider";
import { AuthProvider } from "./AuthContext";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import LayoutWrapper from "./layoutWrapper";

import "@/style/base.css";
import "@/style/font.css";
import "@/style/fontello/css/fontello.css";
import "@/style/fontello/css/animation.css";
import "@/style/style.common.scss";

export const metadata: Metadata = {
  title: "New web",
  description: "community",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAdmin = "admin";

  const cookieStore = cookies();
  const token = (await cookieStore).get("authToken")?.value ?? "";

  let authToken = false;
  let username = "";
  let userId = 0;
  let userNick = "";
  let userProfile = "";
  let userEmail = "";

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        username: string;
        id: number;
        userNick: string;
        profile: string;
        userEmail: string;
      };

      authToken = true;
      username = decoded.username;
      userId = decoded.id;
      userNick = decoded.userNick;
      userProfile = decoded.profile;
      userEmail = decoded.userEmail;
    } catch (error) {
      console.error("토큰 검증 실패:", error);
    }
  }

  return (
    <html lang='en'>
      <body>
        <AuthProvider
          username={username}
          userId={userId}
          userNick={userNick}
          userProfile={userProfile}
          userEmail={userEmail}>
          <QueryProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
