"use client";

import axios from "axios";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import formatPostDate from "@/components/formatDate";
import { useInfiniteScroll, InfiniteScrollContainer } from "@/components/Toast";

import BoardNoticePopup from "./popup/boardNoticePopup";
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

  const { data, loading, hasMore, lastElementRef, refresh, error } = useInfiniteScroll<Notice>(fetchNotices, 10);

  const [popupOpen, setPopupOpen] = useState<boolean>(false);

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
        <InfiniteScrollContainer
          data={data}
          loading={loading}
          hasMore={hasMore}
          lastElementRef={lastElementRef}
          error={error}
          onRetry={refresh}
          renderItem={(notice: Notice) => (
            <div key={notice.id} className='admin_notice_item'>
              <span className='category'>{notice.url_slug}</span>
              <h5 className='title'>{notice.title}</h5>
              <TiptapViewer content={notice.content ?? ""} />
              <span className='date'>{formatPostDate(notice.created_at)}</span>
              <div className='btn_wrap'>
                <button
                  onClick={() => {
                    setEditingNotice(notice);
                    setPopupOpen(true);
                  }}>
                  수정
                </button>
                <button onClick={() => noticeDelete(notice.id)}>삭제</button>
              </div>
            </div>
          )}
        />
      </div>

      {popupOpen && (
        <BoardNoticePopup
          setPopupOpen={setPopupOpen}
          editingNotice={editingNotice}
          setEditingNotice={setEditingNotice}
        />
      )}
    </div>
  );
}
