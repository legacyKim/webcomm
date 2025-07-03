"use client";

import { Member } from "@/type/type";

import { useQuery } from "@tanstack/react-query";
import { fetchMember } from "@/api/api";

export default function MemberManage() {
  const { data: memberData, isLoading } = useQuery({ queryKey: ["boardData"], queryFn: fetchMember });

  return (
    <div className='admin_content_wrap'>
      <div className='admin_title'>
        <h4>회원 관리</h4>
      </div>
      <div className='admin_content'>
        <ol className='table'>
          <li className='table_header'>
            <span>No</span>
            <span>이름</span>
            <span>이메일</span>
            <span>작성 게시물</span>
            <span>총 조회수</span>
            <span>권한</span>
            <span>관리</span>
          </li>
          {!isLoading &&
            memberData.members.map((m: Member, i: number) => (
              <li key={m.id}>
                <span>{i}</span>
                <span>{m.userid}</span>
                <span>{m.email}</span>
                <span>{m.all_posts}</span>
                <span>{m.all_views}</span>
                <span>
                  <button>닫기</button>
                  <button>삭제</button>
                </span>
              </li>
            ))}
        </ol>
      </div>
    </div>
  );
}
