"use client";

import dynamic from "next/dynamic";

import { BoardRecommendation, PaginationData } from "@/type/adminType";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";

const TiptapEditor = dynamic(
  () => import("@/admin/commonComponents/adminEditor"),
  {
    ssr: false,
    loading: () => <p>에디터 로딩 중...</p>,
  }
);

export default function BoardRecommentPopup({
  recommendation,
  adminResponse,
  setPopupOpen,
  setAdminResponse,
  updateStatus,
  formatDate,
}: {
  recommendation: BoardRecommendation | null;
  adminResponse: string;
  setPopupOpen: (open: boolean) => void;
  setAdminResponse: (response: string) => void;
  updateStatus: (
    id: number,
    status: string,
    response?: string
  ) => Promise<void>;
  formatDate: (dateString: string) => string;
}) {
  if (!recommendation) return;

  return (
    <div className="admin_popup_bg" onClick={() => setPopupOpen(false)}>
      <div
        className="admin_popup admin_popup_recommend"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin_popup_header">
          <h3>게시판 추천 처리</h3>
          <button className="close_btn" onClick={() => setPopupOpen(false)}>
            <XMarkIcon className="icon" />
          </button>
        </div>

        <div className="admin_popup_content">
          <div className="board_view_header">
            <div className="info_grid">
              <div className="info_item">
                <label>추천자</label>
                <span>{recommendation.user.user_nickname}</span>
              </div>
              <div className="info_item">
                <label>게시판명</label>
                <span>{recommendation.board_name}</span>
              </div>
              <div className="info_item">
                <label>추천사유</label>
                <span>{recommendation.reason || "사유 없음"}</span>
              </div>
              <div className="info_item">
                <label>등록일</label>
                <span>{formatDate(recommendation.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="admin_response_section">
            <label htmlFor="adminResponse">관리자 응답</label>
            <TiptapEditor content={adminResponse} onChange={setAdminResponse} />
          </div>

          <div className="admin_popup_footer">
            <button
              onClick={() =>
                updateStatus(recommendation.id, "approved", adminResponse)
              }
            >
              승인
            </button>
            <button
              onClick={() =>
                updateStatus(recommendation.id, "rejected", adminResponse)
              }
            >
              거부
            </button>
            <button
              className="btn_secondary"
              onClick={() => setPopupOpen(false)}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
