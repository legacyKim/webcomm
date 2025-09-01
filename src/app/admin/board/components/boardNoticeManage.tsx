"use client";

import axios from "axios";

import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";

import { useInfiniteScrollQuery } from "@/func/hook/useInfiniteQuery";
import { QueryInfiniteScrollContainer } from "@/components/QueryComponents";

import BoardNoticePopup from "./popup/boardNoticePopup";
import BoardNoticeViewPopup from "./popup/boardNoticeViewPopup";
import TiptapViewer from "@/components/tiptapViewer";

import type { Notice } from "@/type/adminType";

// 날짜 포맷팅 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function BoardNoticeManage() {
  const fetchNotices = async (page: number, limit: number = 10) => {
    const { data } = await axios.get(`/api/notice?page=${page}&limit=${limit}`);
    if (!data.success) throw new Error("공지 불러오기 실패");
    return {
      data: data.data as Notice[],
      hasMore: data.hasMore || false,
    };
  };

  const {
    data,
    loading,
    loadingMore,
    hasMore,
    lastElementRef,
    refresh,
    error,
  } = useInfiniteScrollQuery<Notice>({
    queryKey: ["notices"],
    queryFn: fetchNotices,
    limit: 10,
  });

  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [viewPopupOpen, setViewPopupOpen] = useState<boolean>(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const noticeDelete = async (id: number) => {
    const confirmed = confirm("이 공지를 삭제하시겠습니까?");
    if (!confirmed) return;
    try {
      await axios.delete(`/api/notice/${id}`);
      alert("삭제되었습니다.");
      location.reload();
    } catch (err) {
      console.error(err);
      alert("삭제 실패");
    }
  };

  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  return (
    <div className="admin_content_wrap">
      <div className="admin_title">
        <h4>공지 관리</h4>
        <div className="admin_btn">
          <button
            onClick={() => {
              setPopupOpen(true);
              setEditingNotice(null);
            }}
          >
            공지 추가
          </button>
        </div>
      </div>
      <div className="admin_content">
        {!loading ? (
          <ol className="table">
            <li className="table_header">
              <div className="table_no">No</div>
              <div className="table_board">게시판</div>
              <div className="table_title">제목</div>
              <div className="table_content">내용</div>
              <div className="table_comments">댓글</div>
              <div className="table_date">작성일</div>
              <div className="table_btn">관리</div>
            </li>
            <QueryInfiniteScrollContainer
              data={data}
              loading={loading}
              loadingMore={loadingMore}
              hasMore={hasMore}
              lastElementRef={lastElementRef}
              error={error}
              onRetry={() => refresh()}
              renderItem={(notice: Notice) => (
                <li
                  key={notice.id}
                  onClick={() => {
                    setSelectedNotice(notice);
                    setViewPopupOpen(true);
                  }}
                >
                  <div className="table_no">
                    <span>{notice.id}</span>
                  </div>
                  <div className="table_board">
                    <span>{notice.board_name}</span>
                  </div>
                  <div className="table_title">
                    <span>{notice.title}</span>
                  </div>
                  <div className="table_content">
                    <TiptapViewer content={notice.content ?? ""} />
                  </div>
                  <div className="table_comments">
                    <span>{notice.comment_count || 0}</span>
                  </div>
                  <div className="table_date">
                    <span>{formatDate(notice.created_at)}</span>
                  </div>
                  <div className="table_btn btn_wrap">
                    <button
                      onClick={() => {
                        setSelectedNotice(notice);
                        setViewPopupOpen(true);
                      }}
                    >
                      보기
                    </button>
                    <button
                      className="edit_btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNotice(notice);
                        setPopupOpen(true);
                      }}
                    >
                      수정
                    </button>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        noticeDelete(notice.id);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </li>
              )}
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
        <BoardNoticePopup
          setPopupOpen={setPopupOpen}
          editingNotice={editingNotice}
          setEditingNotice={setEditingNotice}
        />
      )}

      {viewPopupOpen && selectedNotice && (
        <BoardNoticeViewPopup
          notice={selectedNotice}
          isOpen={viewPopupOpen}
          onClose={() => {
            setViewPopupOpen(false);
            setSelectedNotice(null);
          }}
        />
      )}
    </div>
  );
}
