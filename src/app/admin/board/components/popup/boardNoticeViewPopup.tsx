"use client";

import TiptapViewer from "@/components/tiptapViewer";

import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import { Notice } from "@/type/adminType";

interface BoardNoticeViewPopupProps {
  notice: Notice;
  isOpen: boolean;
  onClose: () => void;
}

export default function BoardNoticeViewPopup({
  notice,
  isOpen,
  onClose,
}: BoardNoticeViewPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="admin_popup_bg" onClick={onClose}>
      <div className="admin_popup" onClick={(e) => e.stopPropagation()}>
        <div className="admin_popup_header">
          <h3>공지사항 보기</h3>
          <button onClick={onClose}>
            <XMarkIcon className="icon" />
          </button>
        </div>

        <div className="admin_popup_body">
          <div className="admin_notice_info">
            <div className="info-row">
              <span className="label">게시판:</span>
              <span className="value">{notice.board_name}</span>
            </div>
            <div className="info-row">
              <span className="label">제목:</span>
              <span className="value">{notice.title}</span>
            </div>
            <div className="info-row">
              <span className="label">작성일:</span>
              <span className="value">
                {new Date(notice.created_at).toLocaleDateString("ko-KR")}
              </span>
            </div>
          </div>

          <div className="notice-content">
            <h4>내용</h4>
            <div className="content-viewer">
              <TiptapViewer content={notice.content} />
            </div>
          </div>
        </div>

        <div className="popup-footer">
          <button className="btn-secondary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
