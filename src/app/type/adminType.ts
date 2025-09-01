export interface Notice {
  url_slug: string;
  board_name: string;
  id: number;
  title: string;
  views: number;
  likes: number;
  comment_count: number;
  content: string;
  created_at: string;
}

export interface BoardRecommendation {
  id: number;
  board_name: string;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    user_nickname: string;
    profile: string | null;
  };
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasMore: boolean;
}
