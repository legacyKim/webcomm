"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { useAuth } from "@/AuthContext";
import Message from "@/components/message";

import { useLoginCheck } from "@/func/hook/useLoginCheck";

// import Link from 'next/link';

interface DropDownMenuProps {
  style: React.CSSProperties;
  userInfoInDropMenu: {
    userId: number;
    userNickname: string;
    userUiWidth?: number;
  };
}

export default function DropDownMenu({ style, userInfoInDropMenu }: DropDownMenuProps) {
  const router = useRouter();
  const [isBlocked, setIsBlocked] = useState(false);

  const { isUserId, messageToUser, setMessageToUser } = useAuth();
  const loginCheck = useLoginCheck();

  // 작성글 검색
  const searchPosts = () => {
    // setBoardType("userPost");
    router.push(`/board/post/${userInfoInDropMenu.userNickname}`);
  };

  // 댓글 검색
  const searchComments = () => {
    // setBoardType("userComment");
    router.push(`/board/comment/${userInfoInDropMenu.userNickname}`);
  };

  const sendMessage = () => {
    setMessageToUser(userInfoInDropMenu.userId);
  };

  // 차단하기
  const blockUserConfirm = () => {
    const isConfirmed = confirm(`${userInfoInDropMenu.userNickname}님을 차단하시겠습니까?`);
    if (isConfirmed) {
      blockUser();
    }
  };

  const blockUser = async () => {
    try {
      const response = await axios.post("/api/user/block", {
        blockerId: isUserId,
        blockedId: userInfoInDropMenu.userId,
      });
      const userName = userInfoInDropMenu.userNickname;
      if (response.data.success) {
        setIsBlocked(true);
        alert(`${userName}님을 차단했습니다. 해당 유저의 댓글 및 게시글을 확인할 수 없습니다.`);
      }
    } catch (error) {
      console.error("차단 실패:", error);
      alert("차단에 실패했습니다.");
    }
  };

  // 신고하기
  const reportUser = async () => {
    const reason = prompt("신고 사유를 입력해주세요.");
    if (!reason) return;

    try {
      const response = await axios.post("/api/user/report", {
        isUserId,
        reportedUserId: userInfoInDropMenu.userId,
        reason,
        type: "post",
      });
      if (response.data.success) {
        alert("신고가 접수되었습니다.");
      }
    } catch (error) {
      console.error("신고 실패:", error);
      alert("신고에 실패했습니다.");
    }
  };

  return (
    <>
      <ul className='dropDownMenu' style={style}>
        <li>
          <button onClick={searchPosts}>작성글 검색</button>
        </li>
        <li>
          <button onClick={searchComments}>댓글 검색</button>
        </li>
        <li>
          <button onClick={sendMessage}>쪽지 보내기</button>
        </li>
        <li>
          <button
            onClick={async () => {
              const ok = await loginCheck();
              if (!ok) return;

              blockUserConfirm();
            }}
            disabled={isBlocked}
            style={{ color: isBlocked ? "gray" : "inherit" }}>
            {isBlocked ? "차단됨" : "차단하기"}
          </button>
        </li>
        <li>
          <button
            onClick={async () => {
              const ok = await loginCheck();
              if (!ok) return;

              reportUser();
            }}>
            신고하기
          </button>
        </li>
      </ul>

      {messageToUser !== null && (
        <Message
          messageFromUser={isUserId}
          messageToUser={messageToUser}
          messageToUserNickname={userInfoInDropMenu.userNickname}
          setMessageToUser={setMessageToUser}
        />
      )}
    </>
  );
}
