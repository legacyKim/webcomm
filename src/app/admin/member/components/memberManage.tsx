"use client";

import { Member } from "@/type/type";
import { useState } from "react";
import { useInfiniteScrollQuery } from "@/func/hook/useInfiniteQuery";
import { QueryInfiniteScrollContainer } from "@/components/QueryComponents";
import {
  useMemberAuthorityMutation,
  useMemberDeleteMutation,
  useStatsUpdateMutation,
} from "@/func/hook/useMutations";
import RestrictionPopup from "./popup/RestrictionPopup";
import MemberDetailModal from "./MemberDetailModal";

export default function MemberManage() {
  const [searchTerm, setSearchTerm] = useState("");
  // const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [filterAuthority, setFilterAuthority] = useState("all");
  const [restrictionPopup, setRestrictionPopup] = useState<{
    isOpen: boolean;
    member: Member | null;
  }>({ isOpen: false, member: null });

  // 회원 상세 모달 상태 추가
  const [memberDetailModal, setMemberDetailModal] = useState<{
    isOpen: boolean;
    member: Member | null;
  }>({ isOpen: false, member: null });

  // React Query 뮤테이션 훅들
  const authorityMutation = useMemberAuthorityMutation<Member>();
  const deleteMutation = useMemberDeleteMutation();
  // const restrictionMutation = useMemberRestrictionMutation<Member>(); // 현재 미사용
  const statsUpdateMutation = useStatsUpdateMutation();

  // 멤버 목록을 가져오는 함수
  const fetchMembers = async (page: number, limit: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: searchTerm,
      authority: filterAuthority,
    });

    const response = await fetch(`/api/admin/members?${params}`);
    if (!response.ok) {
      throw new Error("멤버 목록을 불러오는데 실패했습니다.");
    }

    const result = await response.json();
    return {
      data: result.members,
      hasMore: result.hasMore,
    };
  };

  // 무한 스크롤 훅 사용
  const {
    data: members,
    loading,
    loadingMore,
    hasMore,
    error,
    lastElementRef,
    refresh,
  } = useInfiniteScrollQuery<Member>({
    queryKey: ["members", searchTerm, filterAuthority],
    queryFn: fetchMembers,
    limit: 20,
  });

  // 검색 조건이 변경될 때 새로고침
  const handleSearch = () => {
    refresh();
  };

  // 멤버 권한 변경
  const handleAuthorityChange = async (
    memberId: number,
    newAuthority: number,
    selectElement: HTMLSelectElement
  ) => {
    const originalValue =
      selectElement.getAttribute("data-original-value") || "1";

    const authorityNames = {
      0: "관리자",
      1: "일반회원",
      2: "경고회원",
      3: "정지회원",
    };
    const authorityName =
      authorityNames[newAuthority as keyof typeof authorityNames] ||
      "알 수 없음";

    if (!confirm(`회원 권한을 '${authorityName}'으로 변경하시겠습니까?`)) {
      selectElement.value = originalValue;
      return;
    }

    try {
      await authorityMutation.mutateAsync({
        memberId,
        authority: newAuthority,
      });
      alert("권한이 변경되었습니다.");
      selectElement.setAttribute(
        "data-original-value",
        newAuthority.toString()
      );
      refresh(); // 전체 목록 새로고침
    } catch (error) {
      console.error("권한 변경 오류:", error);
      alert(
        `권한 변경 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
      selectElement.value = originalValue;
    }
  };

  // 멤버 삭제
  const handleDeleteMember = async (
    memberId: number,
    memberNickname: string
  ) => {
    if (
      !confirm(
        `정말로 '${memberNickname}' 회원을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없으며, 회원의 모든 게시물과 댓글이 함께 삭제됩니다.`
      )
    )
      return;

    try {
      await deleteMutation.mutateAsync(memberId);
      alert("회원이 삭제되었습니다.");
      refresh(); // 전체 목록 새로고침
    } catch (error) {
      console.error("회원 삭제 오류:", error);
      alert(
        `회원 삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  };

  // 회원 통계 업데이트
  const handleUpdateStats = async () => {
    if (
      !confirm(
        "모든 회원의 게시물 수와 조회수를 다시 계산하시겠습니까? 시간이 오래 걸릴 수 있습니다."
      )
    )
      return;

    try {
      const result = await statsUpdateMutation.mutateAsync();
      alert(result.message);
    } catch (error) {
      console.error("통계 업데이트 오류:", error);
      alert("통계 업데이트에 실패했습니다.");
    }
  };

  // 제한 설정 성공 처리
  const handleRestrictionSuccess = () => {
    refresh(); // 전체 목록 새로고침
  };

  const getAuthorityText = (authority: number) => {
    switch (authority) {
      case 0:
        return "관리자";
      case 1:
        return "일반회원";
      case 2:
        return "경고회원";
      case 3:
        return "정지회원";
      default:
        return "알 수 없음";
    }
  };

  const getAuthorityClass = (authority: number) => {
    switch (authority) {
      case 0:
        return "authority-admin";
      case 1:
        return "authority-user";
      case 2:
        return "authority-warning";
      case 3:
        return "authority-banned";
      default:
        return "";
    }
  };

  const renderMember = (member: Member, index: number) => (
    <li key={member.id}>
      <span>{index + 1}</span>
      <span
        onClick={() => setMemberDetailModal({ isOpen: true, member })}
        style={{
          cursor: "pointer",
          color: "#007bff",
          textDecoration: "underline",
        }}
      >
        {member.userid}
      </span>
      <span
        onClick={() => setMemberDetailModal({ isOpen: true, member })}
        style={{
          cursor: "pointer",
          color: "#007bff",
          textDecoration: "underline",
        }}
      >
        {member.email}
      </span>
      <span>{member.all_posts}</span>
      <span>{member.comment_count || 0}</span>
      <span className={getAuthorityClass(member.authority)}>
        {getAuthorityText(member.authority)}
      </span>
      <span className="member-actions">
        <select
          onChange={(e) =>
            handleAuthorityChange(member.id, parseInt(e.target.value), e.target)
          }
          defaultValue={member.authority}
          data-original-value={member.authority}
          disabled={authorityMutation.isPending}
        >
          <option value={0}>관리자</option>
          <option value={1}>일반회원</option>
          <option value={2}>경고회원</option>
          <option value={3}>정지회원</option>
        </select>
        <button
          onClick={() => handleDeleteMember(member.id, member.user_nickname)}
          className="delete-btn"
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? "삭제중..." : "삭제"}
        </button>
        <button
          onClick={() => setRestrictionPopup({ isOpen: true, member })}
          className="restriction-btn"
        >
          제한설정
        </button>
      </span>
    </li>
  );

  return (
    <div className="admin_content_wrap">
      <div className="admin_title">
        <h4>회원 관리</h4>
        <div className="admin_btn">
          <button
            onClick={handleUpdateStats}
            disabled={statsUpdateMutation.isPending}
          >
            {statsUpdateMutation.isPending ? "업데이트중..." : "통계 업데이트"}
          </button>
        </div>
      </div>

      <div className="admin_content">
        {/* 검색 및 필터 */}
        <div className="search-filters">
          <div className="search-group">
            <select
              value={filterAuthority}
              onChange={(e) => setFilterAuthority(e.target.value)}
            >
              <option value="all">전체 권한</option>
              <option value="0">관리자</option>
              <option value="1">일반회원</option>
              <option value="2">경고회원</option>
              <option value="3">정지회원</option>
            </select>

            <input
              type="text"
              placeholder="닉네임, 이메일로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button onClick={handleSearch}>검색</button>
          </div>
        </div>

        <ol className="table">
          <li className="table_header">
            <span>No</span>
            <span>닉네임</span>
            <span>이메일</span>
            <span>작성 게시물</span>
            <span>작성 댓글</span>
            <span>권한</span>
            <span>관리</span>
          </li>

          <QueryInfiniteScrollContainer
            data={members}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            error={error}
            lastElementRef={lastElementRef}
            onRetry={() => refresh()}
            renderItem={renderMember}
            emptyMessage="회원이 없습니다."
          />
        </ol>
      </div>

      {/* 제한 설정 팝업 */}
      {restrictionPopup.member && (
        <RestrictionPopup
          member={restrictionPopup.member}
          isOpen={restrictionPopup.isOpen}
          onClose={() => setRestrictionPopup({ isOpen: false, member: null })}
          onSuccess={handleRestrictionSuccess}
        />
      )}

      {/* 회원 상세 정보 모달 */}
      {memberDetailModal.member && (
        <MemberDetailModal
          member={memberDetailModal.member}
          isOpen={memberDetailModal.isOpen}
          onClose={() => setMemberDetailModal({ isOpen: false, member: null })}
        />
      )}
    </div>
  );
}
