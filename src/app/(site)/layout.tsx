import type { Metadata } from "next";

import QueryProvider from "@/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import MenuProviderWrapper from "@/components/MenuProviderWrapper";
// import OnlineStatusManager from "@/components/OnlineStatusManager";
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
  title: {
    default: "Tokti - 자유로운 소통의 공간",
    template: "%s | Tokti",
  },
  description:
    "Tokti는 다양한 주제로 자유롭게 소통할 수 있는 커뮤니티입니다. 유머, 정보 공유, 토론 등 다양한 게시판에서 활발한 커뮤니티 활동을 즐겨보세요.",
  keywords: [
    "커뮤니티",
    "게시판",
    "토론",
    "유머",
    "정보공유",
    "소통",
    "Tokti",
    "온라인 커뮤니티",
    "자유게시판",
    "베스트 게시글",
  ],
  authors: [{ name: "Tokti" }],
  creator: "Tokti",
  publisher: "Tokti",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://tokti.net", // 실제 도메인으로 변경 필요
    siteName: "Tokti",
    title: "Tokti - 자유로운 소통의 공간",
    description: "다양한 주제로 자유롭게 소통할 수 있는 커뮤니티 플랫폼",
    images: [
      {
        url: "/logo.png", // 실제 이미지 경로로 변경
        width: 1200,
        height: 630,
        alt: "Tokti 로고",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tokti - 자유로운 소통의 공간",
    description: "다양한 주제로 자유롭게 소통할 수 있는 커뮤니티 플랫폼",
    images: ["/logo.png"], // 실제 이미지 경로로 변경
  },
  verification: {
    google: "Xs9n-dVFNWqn8Ts4OUr0653gRrIJI9p462ejmEekYJw", // content 값만
  },
  other: {
    "naver-site-verification": "113ec5b9421fac8a8f7a561c17556a50535999f5", // content 값만
  },
  alternates: {
    canonical: "https://tokti.net", // 실제 도메인으로 변경 필요
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
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
  const boardData = await fetchBoard();
  const boardList = boardData?.boards || [];

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const darkMode = sessionStorage.getItem('darkMode') || 
                                  localStorage.getItem('darkMode') || 
                                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'true' : 'false');
                  
                  document.documentElement.setAttribute('data-theme', darkMode === 'true' ? 'dark' : 'light');
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>
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
              {/* <OnlineStatusManager /> */}
              <LayoutWrapper>{children}</LayoutWrapper>
            </QueryProvider>
          </MenuProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
