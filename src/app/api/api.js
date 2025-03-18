import axios from 'axios';

// 메인
export const fetchHome = async () => {
    try {
        const response = await axios.get(`/api/home`);
        return response.data;
    } catch (err) {
        console.error(err);
        return [];
    }
}

export const fetchHomePop = async () => {
    try {
        const response = await axios.get("/api/home/popular");
        return response.data;
    } catch (err) {
        console.error(err);
        return [];
    }
}

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
export const fetchBoardData = async (url_slug) => {
    try {
        const response = await axios.get(`/api/post/${url_slug}`);
        return response.data;
    } catch (err) {
        console.error(err);
        return [];
    }
}

// 게시물
export const fetchPost = async () => {
    try {
        const response = await axios.get(`/api/post`);
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
