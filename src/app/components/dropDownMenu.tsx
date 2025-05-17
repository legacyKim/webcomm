"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// import Link from 'next/link';

interface DropDownMenuProps {
  style: React.CSSProperties;
  userInfoInDropMenu: {
    userId: string;
    userName: string;
  };
}

export default function DropDownMenu({ style, userInfoInDropMenu }: DropDownMenuProps) {
  const router = useRouter();
  const [isBlocked, setIsBlocked] = useState(false);

  // 작성글 검색
  const handleSearchPosts = () => {
    router.push(`/search?type=posts&userId=${userInfoInDropMenu.userId}`);
  };

  // 댓글 검색
  const handleSearchComments = () => {
    router.push(`/search?type=comments&userId=${userInfoInDropMenu.userId}`);
  };

  // 차단하기
  const handleBlockUser = async () => {
    try {
      const response = await axios.post("/api/user/block", { userId: userInfoInDropMenu.userId });
      const userName = userInfoInDropMenu.userName;
      if (response.data.success) {
        setIsBlocked(true);
        alert(`${userName}님을 차단했습니다.`);
      }
    } catch (error) {
      console.error("차단 실패:", error);
      alert("차단에 실패했습니다.");
    }
  };

  // 신고하기
  const handleReportUser = async () => {
    const reason = prompt("신고 사유를 입력해주세요.");
    if (!reason) return;

    try {
      const response = await axios.post("/api/user/report", { userId: userInfoInDropMenu.userId, reason });
      if (response.data.success) {
        alert("신고가 접수되었습니다.");
      }
    } catch (error) {
      console.error("신고 실패:", error);
      alert("신고에 실패했습니다.");
    }
  };

  return (
    <ul className='dropDownMenu' style={style}>
      <li>
        <button onClick={handleSearchPosts}>작성글 검색</button>
      </li>
      <li>
        <button onClick={handleSearchComments}>댓글 검색</button>
      </li>
      <li>
        <button onClick={handleBlockUser} disabled={isBlocked} style={{ color: isBlocked ? "gray" : "inherit" }}>
          {isBlocked ? "차단됨" : "차단하기"}
        </button>
      </li>
      <li>
        <button onClick={handleReportUser}>신고하기</button>
      </li>
    </ul>
  );
}
