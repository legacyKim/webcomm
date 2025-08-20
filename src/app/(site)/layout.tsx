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
    default: "톡티(Tokti) - 자유로운 소통의 커뮤니티",
    template: "%s | 톡티(Tokti)",
  },
  description:
    "톡티(Tokti)는 한국의 자유로운 온라인 커뮤니티입니다. 유머, 일상, 정보공유, 베스트 게시글 등 다양한 주제로 소통하고 토론할 수 있는 공간입니다. 지금 가입하고 활발한 커뮤니티 활동을 시작해보세요!",
  keywords: [
    "톡티",
    "Tokti",
    "톡티넷",
    "toktinet",
    "커뮤니티",
    "게시판",
    "유머",
    "베스트",
    "자유게시판",
    "온라인 커뮤니티",
    "토론",
    "정보공유",
    "소통",
    "한국 커뮤니티",
    "인터넷 커뮤니티",
    "게시글",
    "댓글",
    "회원가입",
    "무료 커뮤니티",
    "일상",
    "취미",
    "관심사",
    "네티즌",
    "온라인 소통",
    "유머게시판",
    "베스트게시글",
    "실시간 소통",
    "커뮤니티 사이트",
    "토론 게시판",
    "자유로운 소통",
    "한국 게시판",
    "온라인 게시판",
    "커뮤니티 플랫폼",
  ],
  authors: [{ name: "톡티(Tokti)" }],
  creator: "톡티(Tokti)",
  publisher: "톡티(Tokti)",
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
    url: "https://tokti.net",
    siteName: "톡티(Tokti)",
    title: "톡티(Tokti) - 자유로운 소통의 커뮤니티",
    description:
      "한국의 자유로운 온라인 커뮤니티. 유머, 일상, 정보공유 등 다양한 주제로 소통하고 토론할 수 있는 공간입니다.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "톡티(Tokti) 로고 - 자유로운 커뮤니티",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "톡티(Tokti) - 자유로운 소통의 커뮤니티",
    description:
      "한국의 자유로운 온라인 커뮤니티. 유머, 일상, 정보공유 등 다양한 주제로 소통하세요!",
    images: ["/logo.png"],
  },
  verification: {
    google: "Xs9n-dVFNWqn8Ts4OUr0653gRrIJI9p462ejmEekYJw",
  },
  other: {
    "naver-site-verification": "113ec5b9421fac8a8f7a561c17556a50535999f5",
  },
  alternates: {
    canonical: "https://tokti.net",
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
    <html lang="ko">
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "톡티(Tokti)",
              alternateName: ["Tokti", "톡티", "tokti.net", "톡티넷"],
              url: "https://tokti.net",
              description:
                "한국의 자유로운 온라인 커뮤니티. 유머, 일상, 정보공유 등 다양한 주제로 소통하고 토론할 수 있는 공간입니다.",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://tokti.net/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
              publisher: {
                "@type": "Organization",
                name: "톡티(Tokti)",
                url: "https://tokti.net",
                logo: {
                  "@type": "ImageObject",
                  url: "https://tokti.net/logo.png",
                },
              },
              mainEntity: {
                "@type": "WebSite",
                "@id": "https://tokti.net",
                name: "톡티(Tokti)",
                description: "한국 최고의 온라인 커뮤니티",
                category: ["커뮤니티", "게시판", "소통", "토론"],
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "톡티(Tokti)",
              alternateName: ["Tokti", "톡티넷"],
              url: "https://tokti.net",
              logo: "https://tokti.net/logo.png",
              description: "한국의 자유로운 온라인 커뮤니티 플랫폼",
              foundingDate: "2024",
              serviceType: "온라인 커뮤니티",
              areaServed: "대한민국",
              sameAs: ["https://tokti.net"],
            }),
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
