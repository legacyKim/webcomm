"use client";

import { Posts } from "@/type/type";

import formatPostDate from "@/components/formatDate";
import TiptapViewer from "@/components/tiptapViewer";

export default function BoardConManagePopup({
  boardContent,
  setPopupOpen,
}: {
  boardContent: Posts | null;
  setPopupOpen: (value: boolean) => void;
}) {
  if (!boardContent) return null;

  return (
    <div className='admin_popup_bg' onClick={() => setPopupOpen(false)}>
      <div className='admin_popup board_view_popup' onClick={(e) => e.stopPropagation()}>
        <div className='admin_popup_header'>
          <h6>게시글 상세보기</h6>
          <button className='close_btn' onClick={() => setPopupOpen(false)} aria-label='닫기'>
            <i className='icon-cancel'></i>
          </button>
        </div>

        <div className='admin_popup_content'>
          <div className='board_view_header'>
            <div className='board_meta'>
              <span className='category'>{boardContent.board_name}</span>
              <span className='post_id'>#{boardContent.id}</span>
            </div>
            <h4 className='post_title'>{boardContent.title}</h4>
            <div className='post_info'>
              <div className='author_info'>
                <span className='writer'>
                  <i className='icon-user'></i>
                  {boardContent.user_nickname}
                </span>
                <span className='date'>
                  <i className='icon-calendar'></i>
                  {formatPostDate(boardContent.created_at)}
                </span>
              </div>
              <div className='stats_info'>
                <span className='view'>
                  <i className='icon-eye'></i>
                  조회 {boardContent.views}
                </span>
                <span className='like'>
                  <i className='icon-heart'></i>
                  좋아요 {boardContent.likes}
                </span>
                <span className='comment'>
                  <i className='icon-comment'></i>
                  댓글 {boardContent.comment_count}
                </span>
              </div>
            </div>
          </div>

          <div className='board_view_content'>
            <TiptapViewer content={boardContent.content ?? ""} />
          </div>
        </div>

        <div className='admin_popup_footer'>
          <button className='btn_secondary' onClick={() => setPopupOpen(false)}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
