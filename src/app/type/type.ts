export interface BoardData {
  boards: {
    rows: {
      board_name: string;
    }[];
  };
}

export interface Board {
  id: number;
  seq: number;
  board_name: string;
  url_slug: string;
  post_count: number;
  total_views: number;
}

export interface Posts {
  id: number;
  post_number: number;
  board_name: string;
  url_slug: string;
  title: string;
  content: string;
  user_id: number;
  user_nickname: string;
  user_profile: string;
  views: number;
  likes: number;
  comments: number;
  dislike: number;
  reports: number;
  comment_count: number;
  notice: boolean;
  created_at: string;
  updated_at: string;
  is_liked_by_user?: boolean;
  likers?: PostLiker[];
}

export interface initDataPosts {
  posts: Posts[];
  totalPosts?: number;
  totalPages?: number;
  initUrlSlug?: string;
}

export interface Member {
  id: number;
  userid: string;
  user_nickname: string;
  email: string;
  all_posts: number;
  comment_count?: number;
  all_views: number;
  authority: number;
  restriction_until?: string | null;
}

export type ImageWithBlob = {
  file: File;
  blobUrl: string;
};

export interface VideoWithBlob {
  file: File;
  blobUrl: string;
}

export interface AuthContextType {
  loginStatus: boolean | null;
  setLoginStatus: (loginStatus: boolean) => void;
  isUsername: string | null;
  setIsUsername: (userid: string | null) => void;
  isUserId: number | null;
  setIsUserId: (userId: number | null) => void;
  isUserNick: string | null;
  setIsUserNick: (userNick: string | null) => void;
  isUserProfile: string | null;
  setIsUserProfile: (userProfile: string | null) => void;
  isUserEmail: string | null;
  setIsUserEmail: (userProfile: string | null) => void;
  boardType: string | null;
  setBoardType: (type: string | null) => void;
  messageToUser: number | null;
  setMessageToUser: (type: number | null) => void;
  isUserAuthority: number | null;
  setIsUserAuthority: (authority: number | null) => void;
  tokenExpiration: number | null;
  setTokenExpiration: (expiration: number | null) => void;
  isUserNickUpdatedAt: Date | null;
  setIsUserNickUpdatedAt: (userNickUpdatedAt: Date | null) => void;
  redirectPath: string | null;
  setRedirectPath: (path: string | null) => void;
  initData: { posts: Posts[] } | null;
  setInitData: (data: { posts: Posts[] } | null) => void;
  agreeCheck: boolean | null;
  setAgreeCheck: (agreeCheck: boolean | null) => void;
  boardRecommendPopup: boolean | null;
  setBoardRecommendPopup: (agreeCheck: boolean | null) => void;
}

// profile
export interface UserProfile {
  id: number;
  username: string;
  user_nickname: string;
  profile: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  banner_image: string | null;
  createdAt: string;
  last_seen: string;
  is_online: boolean;
  authority: number;
  all_posts: number;
  all_views: number;
  follower_count: number;
  following_count: number;
  total_likes_received: number;
  posts_count: number;
  comments_count: number;
  liked_posts_count: number;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
}

export interface UserActivity {
  recent_posts: {
    id: number;
    title: string;
    board_name: string;
    url_slug: string;
    created_at: string;
    views: number;
    likes: number;
  }[];
  recent_comments: {
    id: number;
    content: string;
    post_title: string;
    board_name: string;
    post_url_slug: string;
    created_at: string;
    likes: number;
  }[];
  liked_posts: {
    id: number;
    title: string;
    board_name: string;
    url_slug: string;
    created_at: string;
    views: number;
    likes: number;
  }[];
  favorite_boards: {
    board_name: string;
    url_slug: string;
    activity_count: number;
  }[];
  followers: {
    id: number;
    username: string;
    user_nickname: string;
    profile: string | null;
  }[];
}

export interface PostLiker {
  user_id: number;
  user_nickname: string;
  user_profile?: string;
  created_at: string;
}

export interface myActivityType {
  id: number;
  board_name: string;
  url_slug: string;
  title: string;
  comments: string;
  likes: number;
  views: number;
  created_at: string;
}
