"use client";

import { Posts, Board } from "@/type/type";

import { useQuery } from "@tanstack/react-query";
import { fetchPost, fetchBoard } from "@/api/api";

import { useState } from "react";
import BoardConManagePopup from "./popup/boardConManagePopup";

export default function BoardConManage({ section }: { section: string }) {
  const [selectedSlug, setSelectedSlug] = useState<string>("");

  const { data: postData, isLoading: postLoading } = useQuery({
    queryKey: ["postData", selectedSlug],
    queryFn: () => fetchPost(selectedSlug),
  });
  const { data: boardData } = useQuery({ queryKey: ["boardData"], queryFn: fetchBoard });

  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [boardContent, setBoardContent] = useState<Posts | null>(null);

  return (
    <div className='admin_content_wrap'>
      <div className='admin_title'>
        <h4>게시글 관리</h4>
      </div>
      <div className='admin_content'>
        <div className='select_group'>
          <select value={selectedSlug} onChange={(e) => setSelectedSlug(e.target.value)}>
            <option value=''>전체</option>
            {boardData?.boards?.map((b: Board) => (
              <option key={b.id} value={b.board_name}>
                {b.board_name}
              </option>
            ))}
          </select>

          <button>조회하기</button>
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
          {!postLoading &&
            postData.map((p: Posts, i: number) => (
              <li key={i}>
                <span>{i}</span>
                <span className='table_board'>{p.board_name}</span>
                <span className='table_title'>{p.title}</span>
                <span>{p.user_nickname}</span>
                <span>{p.views}</span>
                <span>{p.likes}</span>
                <span>{p.dislike}</span>
                <span>{p.reports}</span>
                <span className='table_date'>{new Date(p.created_at).toLocaleDateString()}</span>
                <span className='table_btn'>
                  <button
                    onClick={() => {
                      setBoardContent(p);
                      setPopupOpen(true);
                    }}>
                    보기
                  </button>
                  <button>보관</button>
                </span>
              </li>
            ))}
        </ol>
      </div>

      {popupOpen && <BoardConManagePopup section={section} boardContent={boardContent} setPopupOpen={setPopupOpen} />}
    </div>
  );
}
