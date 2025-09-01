"use client";

import { Posts, Board } from "@/type/type";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBoard } from "@/api/api";
import { useInfiniteScrollQuery } from "@/func/hook/useInfiniteQuery";
import { QueryInfiniteScrollContainer } from "@/components/QueryComponents";
import formatPostDate from "@/components/formatDate";
import BoardConManagePopup from "./popup/boardConManagePopup";

import { MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

export default function BoardConManage() {
  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [boardContent, setBoardContent] = useState<Posts | null>(null);

  const { data: boardData } = useQuery({
    queryKey: ["boardData"],
    queryFn: fetchBoard,
  });

  // 보관된 게시물 가져오기 함수
  const fetchArchivedPosts = async (page: number, limit: number = 20) => {
    // url_slug를 통해 board_name 찾기
    let boardName = "";
    if (selectedBoard) {
      const selectedBoardData = boardData?.boards?.find(
        (b: Board) => b.url_slug === selectedBoard
      );
      boardName = selectedBoardData?.board_name || "";
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      board: boardName,
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
    loadingMore,
    hasMore,
    error,
    lastElementRef,
    refresh,
  } = useInfiniteScrollQuery<Posts>({
    queryKey: ["archived-posts", selectedBoard, searchTerm],
    queryFn: fetchArchivedPosts,
    limit: 20,
  });

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

      // 강제로 페이지를 새로고침하여 데이터 갱신
      refresh();
      // 추가로 검색 조건을 리셋하여 완전히 새로고침
      setSearchTerm("");
      setSelectedBoard("");
      setTimeout(() => {
        refresh();
      }, 100);
    } catch (error) {
      console.error("복구 처리 오류:", error);
      alert("복구 처리에 실패했습니다.");
    }
  };

  // 게시물 완전 삭제
  const handlePermanentDelete = async (postId: number) => {
    if (
      !confirm(
        "이 게시물을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    )
      return;

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
    <div className="admin_content_wrap">
      <div className="admin_title">
        <h4>게시글 보관 관리</h4>
      </div>
      <div className="admin_content">
        {/* 검색 및 필터 */}
        <div className="search_filters">
          <div className="filter_group">
            <select
              value={selectedBoard}
              onChange={(e) => {
                setSelectedBoard(e.target.value);
                // 게시판 선택 시 즉시 새로고침
                setTimeout(() => refresh(), 0);
              }}
            >
              <option value="">전체 게시판</option>
              {boardData?.boards?.map((b: Board) => (
                <option key={b.id} value={b.url_slug}>
                  {b.board_name}
                </option>
              ))}
            </select>
          </div>

          <div className="search_group">
            <input
              type="text"
              placeholder="제목, 내용, 작성자로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch} className="search_btn">
              <MagnifyingGlassIcon className="icon" />
            </button>
            <button onClick={() => refresh()} className="reset_btn">
              <ArrowPathIcon className="icon" />
            </button>
          </div>
        </div>

        {!loading ? (
          <ol className="table">
            <li className="table_header">
              <div className="table_no">No</div>
              <div className="table_board">게시판</div>
              <div className="table_title">제목</div>
              <div className="table_nickname">작성자</div>
              <div>조회수</div>
              <div>좋아요</div>
              <div>싫어요</div>
              <div>신고</div>
              <div className="table_date">날짜</div>
              <div className="table_btn">관리</div>
            </li>
            <QueryInfiniteScrollContainer
              data={posts}
              loading={loading}
              loadingMore={loadingMore}
              hasMore={hasMore}
              error={error}
              lastElementRef={lastElementRef}
              onRetry={() => refresh()}
              renderItem={(post: Posts, index: number) => (
                <li key={post.id}>
                  <div className="table_no">
                    <span>{index + 1}</span>
                  </div>
                  <div className="table_board">
                    <span>{post.board_name}</span>
                  </div>
                  <div className="table_title">
                    <span>{post.title}</span>
                  </div>
                  <div className="table_nickname">
                    <span>{post.user_nickname}</span>
                  </div>
                  <div>
                    <span>{post.views}</span>
                  </div>
                  <div>
                    <span>{post.likes}</span>
                  </div>
                  <div>
                    <span>{post.dislike}</span>
                  </div>
                  <div>
                    <span>{post.reports}</span>
                  </div>
                  <div className="table_date">
                    <span>{formatPostDate(post.created_at)}</span>
                  </div>
                  <div className="table_btn">
                    <button
                      onClick={() => {
                        setBoardContent(post);
                        setPopupOpen(true);
                      }}
                    >
                      보기
                    </button>
                    <button onClick={() => handleRestorePost(post.id)}>
                      복구
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(post.id)}
                      className="delete-btn"
                    >
                      완전삭제
                    </button>
                  </div>
                </li>
              )}
              emptyMessage="보관된 게시물이 없습니다."
            />
          </ol>
        ) : (
          <div className="loading_spinner_container">
            <div className="loading_spinner"></div>
            <p>데이터를 불러오는 중...</p>
          </div>
        )}
      </div>

      {popupOpen && (
        <BoardConManagePopup
          boardContent={boardContent}
          setPopupOpen={setPopupOpen}
        />
      )}
    </div>
  );
}
