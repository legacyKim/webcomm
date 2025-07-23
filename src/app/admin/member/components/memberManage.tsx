"use client";

import { Member } from "@/type/type";
import { useState } from "react";
import { useInfiniteScroll, InfiniteScrollContainer } from "@/components/Toast";

export default function MemberManage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [filterAuthority, setFilterAuthority] = useState("all");

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

  const {
    data: members,
    loading,
    hasMore,
    error,
    lastElementRef,
    refresh,
  } = useInfiniteScroll<Member>(fetchMembers, 20);

  // 검색 조건이 변경될 때 새로고침
  const handleSearch = () => {
    refresh();
  };

  // 멤버 권한 변경
  const handleAuthorityChange = async (memberId: number, newAuthority: number) => {
    if (!confirm("회원 권한을 변경하시겠습니까?")) return;

    try {
      const response = await fetch("/api/admin/members/authority", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, authority: newAuthority }),
      });

      if (response.ok) {
        alert("권한이 변경되었습니다.");
        refresh();
      } else {
        throw new Error("권한 변경 실패");
      }
    } catch (error) {
      alert("권한 변경 중 오류가 발생했습니다.");
    }
  };

  // 멤버 삭제
  const handleDeleteMember = async (memberId: number) => {
    if (!confirm("정말로 이 회원을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch("/api/admin/members/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });

      if (response.ok) {
        alert("회원이 삭제되었습니다.");
        refresh();
      } else {
        throw new Error("삭제 실패");
      }
    } catch (error) {
      alert("회원 삭제 중 오류가 발생했습니다.");
    }
  };

  const getAuthorityText = (authority: number) => {
    switch (authority) {
      case 0:
        return "관리자";
      case 1:
        return "일반회원";
      case 2:
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
        return "authority-banned";
      default:
        return "";
    }
  };

  const renderMember = (member: Member, index: number) => (
    <li key={member.id}>
      <span>{index + 1}</span>
      <span>{member.userid}</span>
      <span>{member.email}</span>
      <span>{member.all_posts}</span>
      <span>{member.comment_count || 0}</span>
      <span>{member.all_views}</span>
      <span className={getAuthorityClass(member.authority)}>{getAuthorityText(member.authority)}</span>
      <span className='member-actions'>
        <select
          onChange={(e) => handleAuthorityChange(member.id, parseInt(e.target.value))}
          defaultValue={member.authority}>
          <option value={0}>관리자</option>
          <option value={1}>일반회원</option>
          <option value={2}>정지회원</option>
        </select>
        <button onClick={() => handleDeleteMember(member.id)} className='delete-btn'>
          삭제
        </button>
      </span>
    </li>
  );

  return (
    <div className='admin_content_wrap'>
      <div className='admin_title'>
        <h4>회원 관리</h4>
      </div>

      <div className='admin_content'>
        {/* 검색 및 필터 */}
        <div className='search-filters'>
          <div className='search-group'>
            <select value={filterAuthority} onChange={(e) => setFilterAuthority(e.target.value)}>
              <option value='all'>전체 권한</option>
              <option value='0'>관리자</option>
              <option value='1'>일반회원</option>
              <option value='2'>정지회원</option>
            </select>

            <input
              type='text'
              placeholder='닉네임, 이메일로 검색...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button onClick={handleSearch}>검색</button>
          </div>
        </div>

        <ol className='table'>
          <li className='table_header'>
            <span>No</span>
            <span>닉네임</span>
            <span>이메일</span>
            <span>작성 게시물</span>
            <span>작성 댓글</span>
            <span>총 조회수</span>
            <span>권한</span>
            <span>관리</span>
          </li>

          <InfiniteScrollContainer
            data={members}
            loading={loading}
            hasMore={hasMore}
            error={error}
            lastElementRef={lastElementRef}
            onRetry={refresh}
            renderItem={renderMember}
            emptyMessage='회원이 없습니다.'
          />
        </ol>
      </div>

      <style jsx>{`
        .search-filters {
          margin-bottom: 20px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .search-group {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .search-group select,
        .search-group input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .search-group input {
          width: 300px;
        }

        .search-group button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .search-group button:hover {
          background-color: #0056b3;
        }

        .authority-admin {
          color: #dc3545;
          font-weight: bold;
        }

        .authority-user {
          color: #28a745;
        }

        .authority-banned {
          color: #6c757d;
          text-decoration: line-through;
        }

        .member-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .member-actions select {
          padding: 4px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 12px;
        }

        .delete-btn {
          background-color: #dc3545;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .delete-btn:hover {
          background-color: #c82333;
        }

        @media (max-width: 768px) {
          .search-group {
            flex-direction: column;
            align-items: stretch;
          }

          .search-group input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
