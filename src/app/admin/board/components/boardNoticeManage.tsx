"use client";

import axios from "axios";

import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";

import formatPostDate from "@/components/formatDate";
import { useInfiniteScrollQuery } from "@/func/hook/useInfiniteQuery";
import { QueryInfiniteScrollContainer } from "@/components/QueryComponents";

import BoardNoticePopup from "./popup/boardNoticePopup";
import BoardNoticeViewPopup from "./popup/boardNoticeViewPopup";
import TiptapViewer from "@/components/tiptapViewer";

interface Notice {
  url_slug: string;
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function BoardNoticeManage() {
  const fetchNotices = async (page: number, limit: number = 10) => {
    const { data } = await axios.get(`/api/notice?page=${page}&limit=${limit}`);
    if (!data.success) throw new Error("공지 불러오기 실패");
    return {
      data: data.data as Notice[],
      hasMore: data.hasMore || false,
    };
  };

  const { data, loading, loadingMore, hasMore, lastElementRef, refresh, error } = useInfiniteScrollQuery<Notice>({
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
    <div className='admin_content_wrap'>
      <div className='admin_title'>
        <h4>공지 관리</h4>
        <div className='admin_btn'>
          <button
            onClick={() => {
              setPopupOpen(true);
              setEditingNotice(null);
            }}>
            공지 추가
          </button>
        </div>
      </div>
      <div className='admin_content'>
        <ol className='table'>
          <li className='table_header'>
            <span>No</span>
            <span className='table_board'>게시판</span>
            <span className='table_title'>제목</span>
            <span className='table_content'>내용</span>
            <span className='table_date'>날짜</span>
            <span className='table_btn'>관리</span>
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
              <li key={notice.id}>
                <span>{notice.id}</span>
                <span className='table_board'>{notice.url_slug}</span>
                <span className='table_title'>{notice.title}</span>
                <span className='table_content'>
                  <TiptapViewer content={notice.content ?? ""} />
                </span>
                <span className='table_date'>{formatPostDate(notice.created_at)}</span>
                <span className='table_btn btn_wrap'>
                  <button
                    onClick={() => {
                      setSelectedNotice(notice);
                      setViewPopupOpen(true);
                    }}>
                    보기
                  </button>
                  <button
                    onClick={() => {
                      setEditingNotice(notice);
                      setPopupOpen(true);
                    }}>
                    수정
                  </button>
                  <button onClick={() => noticeDelete(notice.id)}>삭제</button>
                </span>
              </li>
            )}
          />
        </ol>
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
