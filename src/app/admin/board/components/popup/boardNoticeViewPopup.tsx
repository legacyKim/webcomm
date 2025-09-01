"use client";

import formatPostDate from "@/components/formatDate";
import TiptapViewer from "@/components/tiptapViewer";

import { Notice } from "@/type/adminType";

import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import {
  ChatBubbleLeftEllipsisIcon,
  EyeIcon,
  HeartIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function BoardNoticeViewPopup({
  notice,
  isOpen,
  onClose,
}: {
  notice: Notice;
  isOpen: boolean;
  onClose: (value: boolean) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="admin_popup_bg" onClick={() => onClose(false)}>
      <div
        className="admin_popup board_view_popup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin_popup_header">
          <h3>공지사항 보기</h3>
          <button onClick={() => onClose(false)}>
            <XMarkIcon className="icon" />
          </button>
        </div>

        <div className="admin_popup_content">
          <div className="board_view_header">
            <div className="board_meta">
              <span className="category">{notice.board_name}</span>
              <span className="post_id"># {notice.id}</span>
            </div>
            <h4 className="post_title">{notice.title}</h4>
            <div className="post_info">
              <div className="author_info">
                <span className="date">
                  <CalendarIcon className="icon" />
                  {formatPostDate(notice.created_at)}
                </span>
              </div>
              <div className="stats_info">
                <span className="view">
                  <EyeIcon className="icon" />
                  {notice.views ? notice.views : 0}
                </span>
                <span className="like">
                  <HeartIcon className="icon" />
                  {notice.likes ? notice.likes : 0}
                </span>
                <span className="comment">
                  <ChatBubbleLeftEllipsisIcon className="icon" />
                  {notice.comment_count ? notice.comment_count : 0}
                </span>
              </div>
            </div>
          </div>

          <div className="board_view_content">
            <TiptapViewer content={notice.content ?? ""} />
          </div>
        </div>

        {/* <div className="admin_popup_footer">
         
        </div> */}
      </div>
    </div>
  );
}
