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
  user_id: string;
  user_nickname: string;
  user_profile: string;
  views: number;
  likes: number;
  comments: number;
  dislike: number;
  reports: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: number;
  userid: number;
  email: string;
  all_posts: number;
  all_views: number;
  authority: number;
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
  setIsUsername: (userid: string) => void;
  isUserId: number | null;
  setIsUserId: (userId: number) => void;
  isUserNick: string | null;
  setIsUserNick: (userNick: string) => void;
  isUserProfile: string | null;
  setIsUserProfile: (userProfile: string) => void;
  isUserEmail: string | null;
  setIsUserEmail: (userProfile: string) => void;
  boardType: string | null;
  setBoardType: (type: string | null) => void;
  messageToUser: number | null;
  setMessageToUser: (type: number | null) => void;
  isUserAuthority: number | null;
  setIsUserAuthority: (authority: number | null) => void;
}
