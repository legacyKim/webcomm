"use client";

import formatPostDate from "@/components/formatDate";
import TiptapViewer from "@/components/tiptapViewer";

import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import { Posts } from "@/type/type";

import {
  ChatBubbleLeftEllipsisIcon,
  EyeIcon,
  HeartIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function BoardConManagePopup({
  boardContent,
  setPopupOpen,
}: {
  boardContent: Posts | null;
  setPopupOpen: (value: boolean) => void;
}) {
  if (!boardContent) return null;

  return (
    <div className="admin_popup_bg" onClick={() => setPopupOpen(false)}>
      <div
        className="admin_popup board_view_popup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin_popup_header">
          <h6>게시글 상세보기</h6>
          <button onClick={() => setPopupOpen(false)}>
            <XMarkIcon className="icon" />
          </button>
        </div>

        <div className="admin_popup_content">
          <div className="board_view_header">
            <div className="board_meta">
              <span className="category">{boardContent.board_name}</span>
              <span className="post_id"># {boardContent.id}</span>
            </div>
            <h4 className="post_title">{boardContent.title}</h4>
            <div className="post_info">
              <div className="author_info">
                <span className="writer">
                  <i className="icon-user"></i>
                  {boardContent.user_nickname}
                </span>
                <span className="date">
                  <CalendarIcon className="icon" />
                  {formatPostDate(boardContent.created_at)}
                </span>
              </div>
              <div className="stats_info">
                <span className="view">
                  <EyeIcon className="icon" />
                  {boardContent.views ? boardContent.views : 0}
                </span>
                <span className="like">
                  <HeartIcon className="icon" />
                  {boardContent.likes ? boardContent.likes : 0}
                </span>
                <span className="comment">
                  <ChatBubbleLeftEllipsisIcon className="icon" />
                  {boardContent.comment_count ? boardContent.comment_count : 0}
                </span>
              </div>
            </div>
          </div>

          <div className="board_view_content">
            <TiptapViewer content={boardContent.content ?? ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
