export type CommentImage = { file: File; blobUrl: string };

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
  children: CommentTreeNode[];
};

export type CommentTreeNodeArr = {
  comments: CommentTreeNode[];
};

interface MentionUser {
  id: number;
  name: string;
}

export interface CommentTreeProps {
  params: { id: string; url_slug: string };
  setCommentList: React.Dispatch<React.SetStateAction<CommentTreeNodeArr | null>>;

  comments: CommentTreeNode[];
  mentionUsers: MentionUser[];
  loginCheck: () => Promise<boolean>;
  userClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  setUserInfoInDropMenu: (info: { userId: number; userNickname: string }) => void;

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
  setRecommentAdd?: (recommentAdd: { user_id: number; id: number; recomment_id: number } | null) => void;

  commentPost?: (commentContent: string, id?: number, depth?: number) => void;

  commentCorrect: { content: string; id: number } | null;
  setCommentCorrect: React.Dispatch<React.SetStateAction<{ content: string; id: number } | null>>;
}
