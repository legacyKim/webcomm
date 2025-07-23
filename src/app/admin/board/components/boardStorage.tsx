"use client";

import { Posts, Board } from "@/type/type";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBoard } from "@/api/api";
import { useInfiniteScroll, InfiniteScrollContainer } from "../../../components/Toast";
import formatPostDate from "@/components/formatDate";

export default function BoardConManage() {
  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: boardData } = useQuery({
    queryKey: ["boardData"],
    queryFn: fetchBoard,
  });

  // 보관된 게시물 가져오기 함수
  const fetchArchivedPosts = async (page: number, limit: number = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      board: selectedBoard,
      search: searchTerm,
      archived: "true", // 보관된 게시물만
    });

    const response = await fetch(`/api/admin/posts?${params}`);
    if (!response.ok) {
      throw new Error("보관된 게시물을 불러오는데 실패했습니다.");
    }

    const result = await response.json();
    return {
      data: result.posts,
      hasMore: result.hasMore,
    };
  };

  const {
    data: posts,
    loading,
    hasMore,
    error,
    lastElementRef,
    refresh,
  } = useInfiniteScroll<Posts>(fetchArchivedPosts, 20);

  // 검색 조건이 변경될 때 새로고침
  const handleSearch = () => {
    refresh();
  };

  // 게시물 복구
  const handleRestorePost = async (postId: number) => {
    if (!confirm("이 게시물을 복구하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/admin/posts/restore`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error("복구 처리에 실패했습니다.");
      }

      alert("게시물이 복구되었습니다.");
      refresh(); // 목록 새로고침
    } catch (error) {
      console.error("복구 처리 오류:", error);
      alert("복구 처리에 실패했습니다.");
    }
  };

  // 게시물 완전 삭제
  const handlePermanentDelete = async (postId: number) => {
    if (!confirm("이 게시물을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

    try {
      const response = await fetch(`/api/admin/posts/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error("삭제 처리에 실패했습니다.");
      }

      alert("게시물이 완전히 삭제되었습니다.");
      refresh(); // 목록 새로고침
    } catch (error) {
      console.error("삭제 처리 오류:", error);
      alert("삭제 처리에 실패했습니다.");
    }
  };

  return (
    <div className='admin_content_wrap'>
      <div className='admin_title'>
        <h4>게시글 보관</h4>
      </div>
      <div className='admin_content'>
        {/* 검색 및 필터 */}
        <div className='search-filters'>
          <div className='filter-group'>
            <select value={selectedBoard} onChange={(e) => setSelectedBoard(e.target.value)}>
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
            <span className='table_content'>내용</span>
            <span>작성자</span>
            <span>조회수</span>
            <span>좋아요</span>
            <span>싫어요</span>
            <span>신고</span>
            <span className='table_date'>날짜</span>
            <span className='table_btn'>관리</span>
          </li>

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
                <span className='table_content'>{post.content.substring(0, 50)}...</span>
                <span>{post.user_nickname}</span>
                <span>{post.views}</span>
                <span>{post.likes}</span>
                <span>{post.dislike}</span>
                <span>{post.reports}</span>
                <span className='table_date'>{formatPostDate(post.created_at)}</span>
                <span className='table_btn'>
                  <button onClick={() => handleRestorePost(post.id)}>복구</button>
                  <button onClick={() => handlePermanentDelete(post.id)} className='delete-btn'>
                    완전삭제
                  </button>
                </span>
              </li>
            )}
            emptyMessage='보관된 게시물이 없습니다.'
          />
        </ol>
      </div>
    </div>
  );
}
