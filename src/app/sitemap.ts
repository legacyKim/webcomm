import { MetadataRoute } from "next";
import { fetchBoard } from "@/api/api";

interface Board {
  id: number;
  board_name: string;
  url_slug: string;
}

interface BoardData {
  boards: Board[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tokti.net";

  // 기본 정적 페이지들
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    // 동적으로 게시판 목록 가져오기
    const boardData = (await fetchBoard()) as BoardData;
    const boards = boardData?.boards || [];

    // 각 게시판 페이지 추가
    const boardPages: MetadataRoute.Sitemap = boards.map((board: Board) => ({
      url: `${baseUrl}/board/${board.url_slug}`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    }));

    return [...staticPages, ...boardPages];
  } catch (error) {
    console.error("사이트맵 생성 중 오류:", error);
    // 에러 시 기본 페이지들만 반환
    return [
      ...staticPages,
      {
        url: `${baseUrl}/board/free`,
        lastModified: new Date(),
        changeFrequency: "hourly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/board/humor`,
        lastModified: new Date(),
        changeFrequency: "hourly",
        priority: 0.8,
      },
    ];
  }
}
