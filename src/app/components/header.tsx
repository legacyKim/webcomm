"use client";

import axios from "axios";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "@/AuthContext";
import Logo from "@/components/Logo";
import "../style/notification.css";

import {
  ArrowRightStartOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  UserIcon,
  UserCircleIcon,
  BellIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

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
    isUserId,
    isUserNick,
    isUserProfile,
    isUserAuthority,
    tokenExpiration,

    setLoginStatus,
    setIsUsername,
    setIsUserId,
    setIsUserNick,
    setIsUserProfile,
    setIsUserEmail,
    setIsUserAuthority,
    setTokenExpiration,
    setIsUserNickUpdatedAt,
  } = useAuth();

  const logout = async (exp?: number) => {
    const response = await axios.post("/api/logout");
    if (response.data.success) {
      if (exp) {
        alert("토큰이 만료되어 로그아웃됩니다.");
      } else {
        alert("로그아웃 되었습니다.");
      }

      setLoginStatus(false);
      setIsUsername(null);
      setIsUserId(null);
      setIsUserNick(null);
      setIsUserProfile(null);
      setIsUserEmail(null);
      setIsUserAuthority(null);
      setTokenExpiration(null);
      setIsUserNickUpdatedAt(null);

      if (pathname.startsWith("/my")) {
        router.push("/");
      }
      return;
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
        logout(msUntilExpire);
      } else {
        const timer = setTimeout(() => {
          logout(msUntilExpire);
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

      if (messageBoxRef.current) {
        setMessageBox(false);
      }
    };

    document.addEventListener("mousedown", clickOutSide);
    return () => {
      document.removeEventListener("mousedown", clickOutSide);
    };
  }, []);

  // 알림 폴링 + 웹푸시
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!isUserId) return;

    setLoginStatus(true);

    const fetchNotifications = async () => {
      try {
        const limit = 10;
        const { data } = await axios.get(`/api/notifications?limit=${limit}`);
        setNotifications(data);

        // 읽지 않은 알림 수 계산
        const unreadCount = data.filter((n: Notification) => !n.is_read).length;
        setUnreadCount(unreadCount);
      } catch (err) {
        console.error("알림 가져오기 실패:", err);
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const { data } = await axios.get("/api/notifications/unread-count");
        setUnreadCount(data.count);
      } catch (err) {
        console.error("읽지 않은 알림 수 가져오기 실패:", err);
      }
    };

    // 초기 로드
    fetchNotifications();

    // 30초마다 읽지 않은 알림 수만 폴링 (가벼운 요청)
    const pollingInterval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    // 5분마다 전체 알림 리스트 새로고침
    const refreshInterval = setInterval(() => {
      fetchNotifications();
    }, 300000);

    return () => {
      clearInterval(pollingInterval);
      clearInterval(refreshInterval);
    };
  }, [isUserId]);

  // 웹푸시 알림 처리를 위한 Service Worker 리스너
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "NOTIFICATION_COUNT_UPDATE") {
          setUnreadCount(event.data.count);
        } else if (event.data.type === "NEW_NOTIFICATION") {
          // 새 알림이 도착했을 때 리스트 새로고침
          fetchNotifications();
        }
      });
    }

    const fetchNotifications = async () => {
      try {
        const limit = 10;
        const { data } = await axios.get(`/api/notifications?limit=${limit}`);
        setNotifications(data);

        const unreadCount = data.filter((n: Notification) => !n.is_read).length;
        setUnreadCount(unreadCount);
      } catch (err) {
        console.error("알림 가져오기 실패:", err);
      }
    };
  }, []);

  const notifyCheck = async (id: number, link: string) => {
    try {
      await axios.patch(`/api/notifications`, {
        notificationIds: [id.toString()],
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      router.push(link);
    } catch (err) {
      console.error("알림 읽음 처리 실패", err);
    }
  };

  return (
    <header className='header'>
      <div className='header_top page'>
        <Link href='/' className='logo'>
          <Logo />
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
                  <div className='notification-icon-container'>
                    <BellIcon className='icon' />
                    {unreadCount > 0 && (
                      <span className='notification-badge'>{unreadCount > 99 ? "99+" : unreadCount}</span>
                    )}
                  </div>
                  <span>알림</span>
                </button>

                <div className={`message ${messageBox ? "active" : ""}`}>
                  {notifications.length === 0 ? (
                    <div className='no-notifications'>
                      <span>새로운 알림이 없습니다.</span>
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className={`message_box ${n.is_read ? "read" : "unread"}`}>
                        <Link
                          href='#'
                          onClick={(e) => {
                            e.preventDefault();
                            notifyCheck(n.id, n.link);
                          }}>
                          <span>{n.message}</span>
                          {!n.is_read && <span className='unread-dot'></span>}
                        </Link>
                      </div>
                    ))
                  )}
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
