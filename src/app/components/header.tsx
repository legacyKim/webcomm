"use client";

import axios from "axios";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "@/AuthContext";

import {
  ArrowRightStartOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  UserIcon,
  UserCircleIcon,
  BellIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { SSE_BASE_URL } from "@/lib/sse";

type Notification = {
  id: number;
  type: "comment" | "reply" | "like_comment" | "message" | "mention";
  message: string;
  link: string;
  is_read: boolean;
};

export default function Header() {
  const pathname = usePathname();

  const router = useRouter();
  const {
    loginStatus,
    setLoginStatus,
    setIsUsername,
    isUserId,
    isUserNick,
    isUserProfile,
    isUserAuthority,
    setIsUserAuthority,
    tokenExpiration,
  } = useAuth();

  const logout = async () => {
    const response = await axios.post("/api/logout");
    if (response.data.success) {
      alert("로그아웃 되었습니다.");

      setIsUsername("");
      setLoginStatus(false);
      setIsUserAuthority(null);

      if (pathname.startsWith("/my")) {
        router.push("/");
      }
    }
  };

  const logoutPop = () => {
    const isConfirmed = confirm("로그아웃 하시겠습니까?");
    if (isConfirmed) {
      logout();
    }
  };

  // 토큰 만료시 자동 로그아웃
  useEffect(() => {
    if (tokenExpiration) {
      const now = Math.floor(Date.now() / 1000);
      const msUntilExpire = (tokenExpiration - now) * 1000;

      if (msUntilExpire <= 0) {
        alert("토큰이 만료되어 로그아웃됩니다.");
        logout();
      } else {
        const timer = setTimeout(() => {
          alert("토큰이 만료되어 로그아웃됩니다.");
          logout();
        }, msUntilExpire);

        return () => clearTimeout(timer);
      }
    }
  }, [tokenExpiration]);

  const [messageBox, setMessageBox] = useState<boolean>(false);
  const messageBoxRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const clickOutSide = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const messageBtn = document.querySelector(".header_btn"); // 버튼 클래스명 확인
      const dropdownBox = document.querySelector(".message");

      if ((dropdownBox && dropdownBox.contains(target)) || (messageBtn && messageBtn.contains(target))) {
        return;
      }

      // 최신 상태 참조하여 messageBox가 열려있을 때만 닫기 실행
      if (messageBoxRef.current) {
        setMessageBox(false);
      }
    };

    document.addEventListener("mousedown", clickOutSide);
    return () => {
      document.removeEventListener("mousedown", clickOutSide);
    };
  }, []);

  // 알림 SSE
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!isUserId) return;

    setLoginStatus(true);

    const fetchNotifications = async () => {
      try {
        const limit = 10;
        const { data } = await axios.get(`/api/notifications?userId=${isUserId}&limit=${limit}`);
        setNotifications(data);
      } catch (err) {
        console.error("알림 가져오기 실패:", err);
      }
    };

    fetchNotifications();
  }, [isUserId]);

  useEffect(() => {
    const eventSource = new EventSource(`${SSE_BASE_URL}/notifications/stream/${isUserId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // 예: 알림의 종류를 구분
        let type: Notification["type"] = "comment";
        let message = "새 알림이 도착했습니다.";
        let link = "/";

        if (data.type === "comment") {
          message = "댓글이 등록되었습니다.";
          type = "comment";
          link = `/board/${data.board_name}/${data.post_id}`;
        } else if (data.type === "reply") {
          message = `${data.sender_nickname}님이 대댓글을 달았습니다.`;
          type = "reply";
          link = `/board/${data.board_name}/${data.post_id}#comment-${data.comment_id}`;
        } else if (data.type === "like_comment") {
          message = `${data.sender_nickname}님이 댓글을 공감했습니다.`;
          type = "like_comment";
          link = `/board/${data.board_name}/${data.post_id}#comment-${data.comment_id}`;
        } else if (data.type === "message") {
          message = "새 쪽지가 도착했습니다.";
          type = "message";
          link = `/messages`;
        } else if (data.type === "mention") {
          message = `${data.sender_nickname}님이 언급했습니다.`;
          type = "mention";
          link = `/board/${data.board_name}/${data.post_id}#comment-${data.comment_id}`;
        }

        setNotifications((prev) => [
          ...prev,
          {
            id: data.id,
            type,
            message,
            link,
            is_read: false,
          },
        ]);
        setMessageBox(true);
      } catch (err) {
        console.error("SSE 메시지 처리 오류:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE 연결 오류:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const notifyCheck = async (id: number, link: string) => {
    try {
      await axios.patch(`/api/notifications/${id}`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      router.push(link);
    } catch (err) {
      console.error("알림 읽음 처리 실패", err);
    }
  };

  return (
    <header className='header'>
      <div className='header_top page'>
        <Link href='/' className='logo'>
          로고
        </Link>

        <div className='header_info'>
          {loginStatus === null ? (
            <>
              <p>로딩 중...</p>
            </>
          ) : loginStatus ? (
            <>
              <div className='userinfo'>
                <img
                  className='profile_img'
                  src={isUserProfile ?? "/profile/basic.png"}
                  alt={`${isUserNick}의 프로필`}
                />

                <div className='userinfo_name'>
                  <span>{isUserNick}</span>님 환영합니다.
                </div>
              </div>

              <div className='notice_popup'>
                <button
                  className='header_btn'
                  ref={messageBoxRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setMessageBox(!messageBox);
                  }}>
                  <BellIcon className='icon' />
                  <span>알림</span>
                </button>

                <div className={`message ${messageBox ? "active" : ""}`}>
                  {notifications.map((n, i) => (
                    <div key={i} className={`message_box ${n.is_read ? "read" : "unread"}`}>
                      <Link
                        href='#'
                        onClick={(e) => {
                          e.preventDefault();
                          notifyCheck(n.id, n.link);
                        }}>
                        <span>{n.message}</span>
                      </Link>
                    </div>
                  ))}
                  <Link href='/my/notice' className='notice_btn'>
                    알림함 이동하기
                  </Link>
                </div>
              </div>

              {isUserAuthority === 0 ? (
                <Link href='/admin'>
                  <WrenchScrewdriverIcon className='icon' />
                  <span>관리자 페이지</span>
                </Link>
              ) : (
                <Link href='/my' className='header_btn'>
                  <UserCircleIcon className='icon' />
                  <span>마이페이지</span>
                </Link>
              )}

              <button
                onClick={() => {
                  logoutPop();
                }}
                className='header_btn'>
                <ArrowRightStartOnRectangleIcon className='icon icon_space' />
                <span>로그아웃</span>
              </button>
            </>
          ) : (
            <>
              <Link href='/login' className=''>
                <ArrowRightEndOnRectangleIcon className='icon icon_space' />
                <span>로그인</span>
              </Link>
              <Link href='/agree' className=''>
                <UserIcon className='icon' />
                <span>회원가입</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
