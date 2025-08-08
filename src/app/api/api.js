import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// 메인
export const fetchHome = async (isUserId) => {
  try {
    const response = await fetch(
      `${baseUrl}/api/home?userId=${isUserId ?? ""}`
    );
    return response.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

// 메인 페이지 베스트 게시판
export const fetchHomePop = async (page, limit, isUserId) => {
  try {
    const res = await fetch(
      `${baseUrl}/api/home/popular/${page}/${limit}?userId=${isUserId ?? ""}`,
      {
        next: {
          revalidate: 60 * 10,
        },
      }
    );

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
    const res = await fetch(`${baseUrl}/api/board`, {
      next: { revalidate: 6000 },
    });
    const data = await res.json();

    // API 응답 구조 확인 및 전체 객체 반환
    if (data && data.boards && Array.isArray(data.boards)) {
      return { boards: data.boards };
    }

    return { boards: [] };
  } catch (err) {
    console.error("fetchBoard error:", err);
    return { boards: [] };
  }
};

// 각 게시판
export async function fetchBoardData(url_slug, page, limit, isUserId) {
  try {
    const response = await axios.get(
      `${baseUrl}/api/board/${url_slug}/${page}/${limit}`,
      {
        params: { userId: isUserId },
      }
    );
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// 특정 유저가 작성한 게시물
export async function fetchUserPostData(nickname, page, limit) {
  try {
    const response = await axios.get(
      `/api/board/userPost/${nickname}/${page}/${limit}`
    );
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// 특정 유저의 댓글이 적힌 게시물
export async function fetchUserCommentData(nickname, page, limit) {
  try {
    const response = await axios.get(
      `/api/board/userComment/${nickname}/${page}/${limit}`
    );
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// 인기 게시판
export const fetchBoardPop = async (page, limit, isUserId) => {
  try {
    const response = await fetch(
      `${baseUrl}/api/board/popular/${page}/${limit}`,
      {
        params: { userId: isUserId },
        next: {
          revalidate: 60 * 10,
        },
      }
    );
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
    const response = await axios.get(
      `/api/board/search/${keyword}/${page}/${limit}`,
      {
        params: { userId: isUserId },
      }
    );
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
export default async function fetchPostDetail(url_slug, id, userId = null) {
  try {
    let url = `${baseUrl}/api/post/${url_slug}/${id}`;
    if (userId !== null && userId !== undefined) {
      url += `?userId=${userId}`;
    }

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
