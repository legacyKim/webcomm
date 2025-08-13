"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Image from "next/image";

interface BoardRecommendation {
  id: number;
  board_name: string;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    user_nickname: string;
    profile: string | null;
  };
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasMore: boolean;
}

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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        setIsModalOpen(false);
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
    setIsModalOpen(true);
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
    <div className="board_recommend_confirm">
      <div className="admin_header">
        <h2>게시판 추천 관리</h2>
        <div className="total_count">총 {pagination.totalCount}건</div>
      </div>

      {/* 필터 및 검색 */}
      <div className="filter_section">
        <div className="filter_group">
          <label htmlFor="statusFilter">상태 필터:</label>
          <select
            id="statusFilter"
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
          <button onClick={() => fetchRecommendations(1, true)}>검색</button>
        </div>
      </div>

      {/* 게시판 추천 목록 테이블 */}
      <div className="table_container">
        <table className="admin_table">
          <thead>
            <tr>
              <th>ID</th>
              <th>추천자</th>
              <th>게시판명</th>
              <th>추천사유</th>
              <th>상태</th>
              <th>등록일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((recommendation) => (
              <tr key={recommendation.id}>
                <td>{recommendation.id}</td>
                <td>
                  <div className="user_info">
                    <Image
                      src={recommendation.user.profile || "/profile/basic.png"}
                      alt="프로필"
                      width={32}
                      height={32}
                      className="user_avatar"
                    />
                    <div>
                      <div className="user_nickname">
                        {recommendation.user.user_nickname}
                      </div>
                      <div className="username">
                        @{recommendation.user.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <strong>{recommendation.board_name}</strong>
                </td>
                <td>
                  <div className="reason_cell">
                    {recommendation.reason ? (
                      recommendation.reason.length > 50 ? (
                        <span title={recommendation.reason}>
                          {recommendation.reason.substring(0, 50)}...
                        </span>
                      ) : (
                        recommendation.reason
                      )
                    ) : (
                      <span className="no_reason">사유 없음</span>
                    )}
                  </div>
                </td>
                <td>
                  <span
                    className={`status_badge ${getStatusStyle(recommendation.status)}`}
                  >
                    {getStatusText(recommendation.status)}
                  </span>
                </td>
                <td>{formatDate(recommendation.created_at)}</td>
                <td>
                  <button
                    className="btn_action"
                    onClick={() => openModal(recommendation)}
                  >
                    처리
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="loading_container">
            <div className="loading_spinner"></div>
            <p>데이터를 불러오는 중...</p>
          </div>
        )}

        {!loading && recommendations.length === 0 && (
          <div className="empty_state">
            <p>게시판 추천이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 처리 모달 */}
      {isModalOpen && selectedRecommendation && (
        <div className="modal_overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal_container" onClick={(e) => e.stopPropagation()}>
            <div className="modal_header">
              <h3>게시판 추천 처리</h3>
              <button
                className="close_btn"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal_content">
              <div className="recommendation_info">
                <h4>추천 정보</h4>
                <div className="info_grid">
                  <div className="info_item">
                    <label>추천자:</label>
                    <span>
                      {selectedRecommendation.user.user_nickname} (@
                      {selectedRecommendation.user.username})
                    </span>
                  </div>
                  <div className="info_item">
                    <label>게시판명:</label>
                    <span>{selectedRecommendation.board_name}</span>
                  </div>
                  <div className="info_item">
                    <label>추천사유:</label>
                    <span>{selectedRecommendation.reason || "사유 없음"}</span>
                  </div>
                  <div className="info_item">
                    <label>등록일:</label>
                    <span>{formatDate(selectedRecommendation.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="admin_response_section">
                <label htmlFor="adminResponse">관리자 응답:</label>
                <textarea
                  id="adminResponse"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="처리 결과에 대한 응답을 입력하세요 (선택사항)"
                  rows={4}
                />
              </div>

              <div className="modal_actions">
                <button
                  className="btn_approve"
                  onClick={() =>
                    updateStatus(
                      selectedRecommendation.id,
                      "approved",
                      adminResponse
                    )
                  }
                >
                  승인
                </button>
                <button
                  className="btn_reject"
                  onClick={() =>
                    updateStatus(
                      selectedRecommendation.id,
                      "rejected",
                      adminResponse
                    )
                  }
                >
                  거부
                </button>
                <button
                  className="btn_cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
