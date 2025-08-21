export type CommentImage = { file: File; blobUrl: string };

import { PostLiker } from "./type";

interface MentionUser {
  id: number;
  name: string;
}

export type CommentTreeNode = {
  id: number;
  parent_id: number | null;
  user_id: number;
  user_nickname: string;
  content: string;
  profile?: string;
  likes: number;
  depth: number;
  created_at: string;
  updated_at: string;
  event: string;
  post_id: string;
  children: CommentTreeNode[];
  likers?: PostLiker[]; // 좋아요한 사용자 목록 추가
};

export interface CommentTreeProps {
  params: { id: string; url_slug: string };
  commentList: CommentTreeNode[] | null;
  setCommentList: React.Dispatch<
    React.SetStateAction<CommentTreeNode[] | null>
  >;

  comments: CommentTreeNode[] | null;
  mentionUsers: MentionUser[];
  loginCheck: () => Promise<boolean>;
  userClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  setUserInfoInDropMenu: (info: {
    userId: number;
    userNickname: string;
  }) => void;

  singleCommentImageFile?: string | null;
  setSingleCommentImageFile?: (blobUrl: string | null) => void;

  setCommentImagesFile: (images: CommentImage[]) => void;

  commentContent?: string;
  setCommentContent: (content: string) => void;

  recommentContent: string;
  setRecommentContent: (content: string) => void;

  commentImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  reset: boolean;
  setReset: (reset: boolean) => void;

  setCommentMentionUser?: (mentionUsers: number[]) => void;

  commentAdd?: { user_id: number; id: number } | null;
  setCommentAdd?: (commentAdd: { user_id: number; id: number } | null) => void;
  recommentAdd?: { user_id: number; id: number; recomment_id: number } | null;
  setRecommentAdd?: (
    recommentAdd: { user_id: number; id: number; recomment_id: number } | null
  ) => void;

  commentPost?: (commentContent: string, id?: number, depth?: number) => void;

  commentCorrect: { content: string; id: number } | null;
  setCommentCorrect: React.Dispatch<
    React.SetStateAction<{ content: string; id: number } | null>
  >;

  commentLike?: (commentId: number, isLiked: boolean) => void;
  commentLikers?: { [key: number]: PostLiker[] };

  // 연타 방지 상태 (상위 컴포넌트에서 관리)
  clickHistory?: number[];
  setClickHistory?: React.Dispatch<React.SetStateAction<number[]>>;
  isRateLimited?: number;
  setIsRateLimited?: React.Dispatch<React.SetStateAction<number>>;
}
