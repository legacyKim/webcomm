"use client";

import { Posts, Board } from "@/type/type";
import { useQuery } from "@tanstack/react-query";
import { fetchBoard } from "@/api/api";
import { useState } from "react";
import { useInfiniteScroll, InfiniteScrollContainer } from "@/components/Toast";
import BoardConManagePopup from "./popup/boardConManagePopup";

export default function BoardConManage() {
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [boardContent, setBoardContent] = useState<Posts | null>(null);

  const { data: boardData } = useQuery({
    queryKey: ["boardData"],
    queryFn: fetchBoard,
  });

  // 게시물 보관 처리
  const handleArchivePost = async (postId: number) => {
    if (!confirm("이 게시물을 보관하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/admin/posts/archive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error("보관 처리에 실패했습니다.");
      }

      alert("게시물이 보관되었습니다.");
      refresh(); // 목록 새로고침
    } catch (error) {
      console.error("보관 처리 오류:", error);
      alert("보관 처리에 실패했습니다.");
    }
  };

  // 무한 스크롤 게시물 가져오기 함수
  const fetchPosts = async (page: number, limit: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      board: selectedSlug,
      search: searchTerm,
      archived: "false", // 일반 게시물만
    });

    const response = await fetch(`/api/admin/posts?${params}`);
    if (!response.ok) {
      throw new Error("게시물을 불러오는데 실패했습니다.");
    }

    const result = await response.json();
    return {
      data: result.posts,
      hasMore: result.hasMore,
    };
  };

  const { data: posts, loading, hasMore, error, lastElementRef, refresh } = useInfiniteScroll<Posts>(fetchPosts, 20);

  // 검색 조건이 변경될 때 새로고침
  const handleSearch = () => {
    refresh();
  };

  // 조회하기 버튼
  const handleViewPost = (post: Posts) => {
    setBoardContent(post);
    setPopupOpen(true);
  };

  return (
    <div className='admin_content_wrap'>
      <div className='admin_title'>
        <h4>게시글 관리</h4>
      </div>
      <div className='admin_content'>
        {/* 검색 및 필터 */}
        <div className='search-filters'>
          <div className='filter-group'>
            <select value={selectedSlug} onChange={(e) => setSelectedSlug(e.target.value)}>
              <option value=''>전체 게시판</option>
              {boardData?.boards?.map((b: Board) => (
                <option key={b.id} value={b.board_name}>
                  {b.board_name}
                </option>
              ))}
            </select>
          </div>
          <div className='search-group'>
            <input
              type='text'
              placeholder='제목, 내용, 작성자로 검색...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch} className='search-btn'>
              검색
            </button>
            <button onClick={refresh} className='reset-btn'>
              새로고침
            </button>
          </div>
        </div>

        <ol className='table'>
          <li className='table_header'>
            <span>No</span>
            <span className='table_board'>게시판</span>
            <span className='table_title'>제목</span>
            <span>닉네임</span>
            <span>조회수</span>
            <span>좋아요</span>
            <span>싫어요</span>
            <span>신고</span>
            <span className='table_date'>날짜</span>
            <span className='table_btn'>관리</span>
          </li>
          {!loading ? (
            <InfiniteScrollContainer
              data={posts}
              loading={loading}
              hasMore={hasMore}
              error={error}
              lastElementRef={lastElementRef}
              onRetry={refresh}
              renderItem={(post: Posts, index: number) => (
                <li key={post.id}>
                  <span>{index + 1}</span>
                  <span className='table_board'>{post.board_name}</span>
                  <span className='table_title'>{post.title}</span>
                  <span>{post.user_nickname}</span>
                  <span>{post.views}</span>
                  <span>{post.likes}</span>
                  <span>{post.dislike}</span>
                  <span>{post.reports}</span>
                  <span className='table_date'>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span className='table_btn'>
                    <button
                      onClick={() => {
                        setBoardContent(post);
                        setPopupOpen(true);
                      }}>
                      보기
                    </button>
                    <button onClick={() => handleArchivePost(post.id)}>보관</button>
                  </span>
                </li>
              )}
              emptyMessage='게시물이 없습니다.'
            />
          ) : (
            <li>로딩 중...</li>
          )}
        </ol>
      </div>

      {popupOpen && <BoardConManagePopup boardContent={boardContent} setPopupOpen={setPopupOpen} />}
    </div>
  );
}
