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
    views: number;
    likes: number;
    comments: number;
    dislike: number;
    reports: number;
    created_at: Date;
    updated_at: Date;
}

export interface Member {
    id: number;
    userid: string;
    email: string;
    all_posts: number;
    all_views: number;
    authority: number;
}

export interface AuthContextType {
    loginStatus: boolean | null,
    setLoginStatus: (loginStatus: boolean) => void,
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
}
