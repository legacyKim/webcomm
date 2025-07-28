import axios from "axios";

// 서버 사이드에서 사용할 URL 결정
function getServerUrl() {
  // 서버 사이드에서는 작동하는 Vercel 도메인 사용
  if (typeof window === "undefined") {
    return "https://webcomm-one.vercel.app";
  }
  return "";
}

// const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// 메인
export const fetchHome = async (isUserId) => {
  try {
    const url =
      typeof window === "undefined"
        ? `${getServerUrl()}/api/home?userId=${isUserId ?? ""}`
        : `/api/home?userId=${isUserId ?? ""}`;
    const response = await fetch(url);
    return response.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

// 메인 페이지 베스트 게시판
export const fetchHomePop = async (page, limit, isUserId) => {
  try {
    const url =
      typeof window === "undefined"
        ? `${getServerUrl()}/api/home/popular/${page}/${limit}?userId=${isUserId ?? ""}`
        : `/api/home/popular/${page}/${limit}?userId=${isUserId ?? ""}`;
    const res = await fetch(url, {
      next: {
        revalidate: 30, // 30초로 단축 (기존 10분)
      },
    });

    const data = await res.json();
    if (!Array.isArray(data)) {
      return Object.values(data);
    }
    return data;
  } catch (err) {
    console.error("ISR fetch error:", err);
    return [];
  }
};

// 게시판
export const fetchBoard = async () => {
  try {
    const url = typeof window === "undefined" ? `${getServerUrl()}/api/board` : `/api/board`;
    const res = await fetch(url, {
      next: { revalidate: 6000 },
    });
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

// 각 게시판
export async function fetchBoardData(url_slug, page, limit, isUserId) {
  try {
    const url =
      typeof window === "undefined"
        ? `${getServerUrl()}/api/board/${url_slug}/${page}/${limit}`
        : `/api/board/${url_slug}/${page}/${limit}`;
    const response = await axios.get(url, {
      params: { userId: isUserId },
    });
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// 특정 유저가 작성한 게시물
export async function fetchUserPostData(nickname, page, limit) {
  try {
    const response = await axios.get(`/api/board/userPost/${nickname}/${page}/${limit}`);
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// 특정 유저의 댓글이 적힌 게시물
export async function fetchUserCommentData(nickname, page, limit) {
  try {
    const response = await axios.get(`/api/board/userComment/${nickname}/${page}/${limit}`);
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// 인기 게시판
export const fetchBoardPop = async (page, limit, isUserId) => {
  try {
    const url =
      typeof window === "undefined"
        ? `${getServerUrl()}/api/board/popular/${page}/${limit}?userId=${isUserId ?? ""}`
        : `/api/board/popular/${page}/${limit}?userId=${isUserId ?? ""}`;
    const response = await fetch(url, {
      next: {
        revalidate: 60 * 10,
      },
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// 검색한 게시물
export async function fetchSearchData(keyword, page, limit, isUserId) {
  try {
    const url =
      typeof window === "undefined"
        ? `${getServerUrl()}/api/board/search/${keyword}/${page}/${limit}`
        : `/api/board/search/${keyword}/${page}/${limit}`;
    const response = await axios.get(url, {
      params: { userId: isUserId },
    });
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// 내가 작성한 게시글이 있는 게시판 목록
export async function mypageWrite(action, isUserId, page) {
  try {
    const response = await axios.get(`/api/my/${action}/${isUserId}/${page}`);
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// 내가 댓글을 작성한 게시판 목록
export async function mypageComments(action, isUserId, page) {
  try {
    const response = await axios.get(`/api/my/${action}/${isUserId}/${page}`);
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// 내가 좋아요 누른 게시글이 있는 게시판 목록
export async function mypageLikeWrite(action, isUserId, page) {
  try {
    const response = await axios.get(`/api/my/${action}/${isUserId}/${page}`);
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// 내가 좋아요 누른 댓글이 달린 게시판 목록
export async function mypageLikeComments(action, isUserId, page) {
  try {
    const response = await axios.get(`/api/my/${action}/${isUserId}/${page}`);
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// 게시물
export const fetchPost = async (url_slug) => {
  try {
    const response = await axios.get(`/api/post`, {
      params: { url_slug },
    });
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// 게시물 상세 조회
export default async function fetchPostDetail(url_slug, id) {
  try {
    const url =
      typeof window === "undefined" ? `${getServerUrl()}/api/post/${url_slug}/${id}` : `/api/post/${url_slug}/${id}`;
    const response = await fetch(url, {
      next: {
        revalidate: 60 * 10,
      },
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
    return {
      post: null,
      comments: [],
      response: false,
    };
  }
}

// 회원
export const fetchMember = async () => {
  try {
    const response = await axios.get(`/api/member`);
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const fetchToken = async () => {
  try {
    const response = await axios.get("/api/token", { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error fetching token:", error);
    return false;
  }
};
