import axios from "axios";

// 메인
export const fetchHome = async (isUserId) => {
  try {
    const response = await axios.get(`/api/home`, {
      params: { userId: isUserId },
    });
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// 메인 페이지 베스트 게시판
export const fetchHomePop = async (page, limit, isUserId) => {
  try {
    const response = await axios.get(`/api/home/popular/${page}/${limit}`, {
      params: { userId: isUserId },
    });
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// 게시판
export const fetchBoard = async () => {
  try {
    const response = await axios.get(`/api/board`);
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// 각 게시판
export async function fetchBoardData(url_slug, page, limit, isUserId) {
  try {
    // Axios를 사용한 API 요청
    const response = await axios.get(`/api/board/${url_slug}/${page}/${limit}`, {
      params: { userId: isUserId },
    });
    return response.data;
  } catch (err) {
    console.error(err);
    return []; // 에러 발생 시 빈 배열 반환
  }
}

// 특정 유저가 작성한 게시물
export async function fetchUserPostData(nickname, page, limit) {
  try {
    // Axios를 사용한 API 요청
    const response = await axios.get(`/api/board/userPost/${nickname}/${page}/${limit}`);
    return response.data;
  } catch (err) {
    console.error(err);
    return []; // 에러 발생 시 빈 배열 반환
  }
}

// 특정 유저의 댓글이 적힌 게시물
export async function fetchUserCommentData(nickname, page, limit) {
  try {
    // Axios를 사용한 API 요청
    const response = await axios.get(`/api/board/userComment/${nickname}/${page}/${limit}`);
    return response.data;
  } catch (err) {
    console.error(err);
    return []; // 에러 발생 시 빈 배열 반환
  }
}

// 인기 게시판
export const fetchBoardPop = async (page, limit, isUserId) => {
  try {
    const response = await axios.get(`/api/board/popular/${page}/${limit}`, {
      params: { userId: isUserId },
    });
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// 검색한 게시물
export async function fetchSearchData(keyword, page, limit, isUserId) {
  try {
    // Axios를 사용한 API 요청
    const response = await axios.get(`/api/board/search/${keyword}/${page}/${limit}`, {
      params: { userId: isUserId },
    });
    return response.data;
  } catch (err) {
    console.error(err);
    return []; // 에러 발생 시 빈 배열 반환
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
