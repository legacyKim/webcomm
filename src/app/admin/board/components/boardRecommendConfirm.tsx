"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Image from "next/image";

import BoardRecommendPopup from "./popup/boardRecommentPopup";

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

import { BoardRecommendation, PaginationData } from "@/type/adminType";

export default function BoardRecommendConfirm() {
  const [recommendations, setRecommendations] = useState<BoardRecommendation[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
    hasMore: false,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<BoardRecommendation | null>(null);

  const [adminResponse, setAdminResponse] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);

  // 게시판 추천 목록 조회
  const fetchRecommendations = useCallback(
    async (page = 1, reset = false) => {
      setLoading(true);
      try {
        const response = await axios.get("/api/admin/board-recommend", {
          params: {
            page,
            limit: pagination.limit,
            status: statusFilter,
            search: searchTerm,
          },
        });

        if (response.data.success) {
          const {
            recommendations: newRecommendations,
            pagination: paginationData,
          } = response.data.data;

          if (reset || page === 1) {
            setRecommendations(newRecommendations);
          } else {
            setRecommendations((prev) => [...prev, ...newRecommendations]);
          }

          setPagination(paginationData);
        }
      } catch (error) {
        console.error("게시판 추천 목록 조회 실패:", error);
        alert("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, searchTerm, pagination.limit]
  );

  // 무한 스크롤
  const loadMore = () => {
    if (!loading && pagination.hasMore) {
      fetchRecommendations(pagination.currentPage + 1, false);
    }
  };

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, pagination.hasMore, pagination.currentPage]);

  // 초기 데이터 로드 및 필터 변경 시 리로드
  useEffect(() => {
    fetchRecommendations(1, true);
  }, [fetchRecommendations]);

  // 상태 업데이트
  const updateStatus = async (id: number, status: string, response = "") => {
    try {
      const result = await axios.patch("/api/admin/board-recommend", {
        id,
        status,
        admin_response: response.trim() || null,
      });

      if (result.data.success) {
        setRecommendations((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: status as "pending" | "approved" | "rejected",
                  admin_response: response.trim() || null,
                  updated_at: new Date().toISOString(),
                }
              : item
          )
        );
        alert("상태가 업데이트되었습니다.");
        setPopupOpen(false);
        setSelectedRecommendation(null);
        setAdminResponse("");
      }
    } catch (error) {
      console.error(error);
      alert("상태 업데이트에 실패했습니다.");
    }
  };

  // 모달 열기
  const openModal = (recommendation: BoardRecommendation) => {
    setSelectedRecommendation(recommendation);
    setAdminResponse(recommendation.admin_response || "");
    setPopupOpen(true);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 상태 표시 스타일
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "status_pending";
      case "approved":
        return "status_approved";
      case "rejected":
        return "status_rejected";
      default:
        return "";
    }
  };

  // 상태 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "대기";
      case "approved":
        return "승인";
      case "rejected":
        return "거부";
      default:
        return status;
    }
  };

  return (
    <div className="admin_content_wrap">
      <div className="admin_title">
        <h4>게시판 추천 관리</h4>
      </div>

      <div className="admin_content">
        {/* 필터 및 검색 */}
        <div className="search_filters">
          <div className="filter_group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">전체</option>
              <option value="pending">대기</option>
              <option value="approved">승인</option>
              <option value="rejected">거부</option>
            </select>
          </div>

          <div className="search_group">
            <input
              type="text"
              placeholder="게시판명 또는 사용자명으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  fetchRecommendations(1, true);
                }
              }}
            />
            <button
              onClick={() => fetchRecommendations(1, true)}
              className="search_btn"
            >
              <MagnifyingGlassIcon className="icon" />
            </button>
          </div>
        </div>
      </div>

      {/* 게시판 추천 목록 테이블 */}

      {!loading ? (
        <ol className="table">
          <li className="table_header">
            <div className="table_no">No</div>
            <div className="table_nickname table_nickname_recommend">
              추천자
            </div>
            <div className="table_board">게시판명</div>
            <div className="table_reason">추천사유</div>
            <div className="table_status">상태</div>
            <div className="table_date">등록일</div>
            <div className="table_btn">액션</div>
          </li>
          {recommendations.map((recommendation) => (
            <li key={recommendation.id}>
              <div className="table_no">
                <span>{recommendation.id}</span>
              </div>
              <div className="table_nickname table_nickname_recommend">
                <div>
                  <Image
                    src={recommendation.user.profile || "/profile/basic.png"}
                    alt="프로필"
                    width={32}
                    height={32}
                    className="user_avatar"
                  />
                  <span>{recommendation.user.user_nickname}</span>
                </div>
              </div>
              <div className="table_board">
                <span>{recommendation.board_name}</span>
              </div>
              <div className="table_reason">
                {recommendation.reason ? (
                  recommendation.reason.length > 50 ? (
                    <span title={recommendation.reason}>
                      {recommendation.reason.substring(0, 50)}...
                    </span>
                  ) : (
                    <span>{recommendation.reason}</span>
                  )
                ) : (
                  <span className="no_reason">사유 없음</span>
                )}
              </div>
              <div
                className={`table_status ${getStatusStyle(recommendation.status)}`}
              >
                <span>{getStatusText(recommendation.status)}</span>
              </div>
              <div className="table_date">
                <span>{formatDate(recommendation.created_at)}</span>
              </div>
              <div className="table_btn">
                <button
                  className="btn_action"
                  onClick={() => openModal(recommendation)}
                >
                  처리
                </button>
              </div>
            </li>
          ))}

          {!loading && recommendations.length === 0 && (
            <div className="empty_state">
              <p>게시판 추천이 없습니다.</p>
            </div>
          )}
        </ol>
      ) : (
        <div className="loading_spinner_container">
          <div className="loading_spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      )}

      {/* 처리 모달 */}
      {popupOpen && selectedRecommendation && (
        <BoardRecommendPopup
          recommendation={selectedRecommendation}
          adminResponse={adminResponse}
          setPopupOpen={() => setPopupOpen(false)}
          setAdminResponse={(response) => setAdminResponse(response)}
          updateStatus={updateStatus}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}
