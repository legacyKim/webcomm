"use client";

import { Posts } from "@/type/type";

import formatPostDate from "@/components/formatDate";
import TiptapViewer from "@/components/tiptapViewer";

export default function BoardConManagePopup({
  boardContent,
  setPopupOpen,
}: {
  section: string;
  boardContent: Posts | null;
  setPopupOpen: (value: boolean) => void;
}) {
  return (
    <div className='admin_popup_bg'>
      <div className='admin_popup'>
        <div className='admin_popup_header'>
          <h6>게시글 조회</h6>
          <button
            onClick={() => {
              setPopupOpen(false);
            }}>
            <i className='icon-cancel'></i>
          </button>
        </div>

        <div className='admin_popup_content'>
          <div className='admin_popup_board_header'>
            <b className='category'>{boardContent?.board_name}</b>
            <h4 className='view_title'>{boardContent?.title}</h4>
            <div className='view_info'>
              <span className='writer'>
                <i></i>
                {boardContent?.user_nickname}
              </span>
              <span className='view'>
                <i></i>
                {boardContent?.views}
              </span>
              <span className='like'>
                <i></i>
                {boardContent?.likes}
              </span>
              <span className='comment'>
                <i></i>
                {boardContent?.comment_count}
              </span>
              <span className='date'>
                <i></i>
                {formatPostDate(boardContent?.created_at ?? "")}
              </span>
            </div>
          </div>
          <div className='admin_popup_board_content'>
            <TiptapViewer content={boardContent?.content ?? ""} />
          </div>
        </div>

        <div className='admin_popup_footer'>
          <button
            onClick={() => {
              setPopupOpen(false);
            }}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
