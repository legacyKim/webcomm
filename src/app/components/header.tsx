"use client";

import axios from "axios";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

import {
  ArrowRightStartOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  UserIcon,
  UserCircleIcon,
  BellIcon,
  WrenchScrewdriverIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";

type Notification = {
  id: number;
  type:
    | "comment"
    | "reply"
    | "mention"
    | "liked_post_comment"
    | "liked_comment_reply"
    | "message"
    | "post_like"
    | "comment_like";
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

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dark mode toggle function
  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    // Save to sessionStorage
    sessionStorage.setItem("darkMode", newDarkMode.toString());

    // Save to localStorage as fallback
    localStorage.setItem("darkMode", newDarkMode.toString());

    // Apply theme
    document.documentElement.setAttribute(
      "data-theme",
      newDarkMode ? "dark" : "light"
    );

    // Save to server session if user is logged in
    if (loginStatus) {
      try {
        await axios.post("/api/user/theme", {
          darkMode: newDarkMode,
        });
      } catch (error) {
        console.error("Failed to save theme to server:", error);
      }
    }
  };

  // Initialize dark mode from sessionStorage, localStorage, or server
  useEffect(() => {
    const initializeDarkMode = async () => {
      let shouldUseDark = false;

      // Check sessionStorage first
      const sessionDarkMode = sessionStorage.getItem("darkMode");
      if (sessionDarkMode !== null) {
        shouldUseDark = sessionDarkMode === "true";
      } else {
        // Check localStorage
        const localDarkMode = localStorage.getItem("darkMode");
        if (localDarkMode !== null) {
          shouldUseDark = localDarkMode === "true";
        } else if (loginStatus) {
          // If logged in, try to get from server
          try {
            const response = await axios.get("/api/user/theme");
            if (response.data.success) {
              shouldUseDark = response.data.darkMode;
            } else {
              // Fallback to system preference
              shouldUseDark = window.matchMedia(
                "(prefers-color-scheme: dark)"
              ).matches;
            }
          } catch {
            // Fallback to system preference
            shouldUseDark = window.matchMedia(
              "(prefers-color-scheme: dark)"
            ).matches;
          }
        } else {
          // Fallback to system preference
          shouldUseDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
        }
      }

      setIsDarkMode(shouldUseDark);
      sessionStorage.setItem("darkMode", shouldUseDark.toString());
      localStorage.setItem("darkMode", shouldUseDark.toString());
      document.documentElement.setAttribute(
        "data-theme",
        shouldUseDark ? "dark" : "light"
      );
    };

    initializeDarkMode();
  }, [loginStatus]);

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
      const noticePopup = document.querySelector(".notice_popup");
      const noticeMessage = document.querySelector(".notice_message");

      // 알림 팝업 영역 내부 클릭이면 무시
      if (
        (noticePopup && noticePopup.contains(target)) ||
        (noticeMessage && noticeMessage.contains(target))
      ) {
        return;
      }

      // 알림 팝업 외부 클릭 시 닫기
      setMessageBox(false);
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
        const limit = 5;
        const currentPage = 1;
        const { data } = await axios.get(
          `/api/notifications?limit=${limit}&page=${currentPage}`
        );

        // 새로운 API 응답 구조에 맞게 수정
        setNotifications(data.notifications || []);

        // 읽지 않은 알림 수 계산
        const unreadCount = (data.notifications || []).filter(
          (n: Notification) => !n.is_read
        ).length;
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

        // 새로운 API 응답 구조에 맞게 수정
        setNotifications(data.notifications || []);

        const unreadCount = (data.notifications || []).filter(
          (n: Notification) => !n.is_read
        ).length;
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
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // 알림 상태 업데이트 후 페이지 이동
      setMessageBox(false);
      router.push(link);
    } catch (err) {
      console.error("알림 읽음 처리 실패", err);
    }
  };

  return (
    <header className="header">
      <div className="header_top page">
        <Link href="/" className="logo">
          <Logo />
        </Link>

        <div className="header_info">
          {loginStatus === null ? (
            <>
              <p>로딩 중...</p>
            </>
          ) : loginStatus ? (
            <>
              <div className="userinfo">
                <img
                  className="profile_img"
                  src={isUserProfile ?? "/profile/basic.png"}
                  alt={`${isUserNick}의 프로필`}
                />

                <div className="userinfo_name">
                  <span>{isUserNick}</span>님 환영합니다.
                </div>
              </div>

              {/* Dark Mode Toggle */}
              <div className="dark-mode-toggle">
                <button
                  onClick={toggleDarkMode}
                  className="dark-mode-btn"
                  aria-label={`${isDarkMode ? "라이트" : "다크"} 모드로 전환`}
                >
                  <div
                    className={`toggle-slider ${isDarkMode ? "dark" : "light"}`}
                  >
                    <div className="toggle-icon">
                      {isDarkMode ? (
                        <MoonIcon className="icon" />
                      ) : (
                        <SunIcon className="icon" />
                      )}
                    </div>
                  </div>
                </button>
              </div>

              <div className="notice_popup">
                <button
                  className="header_btn"
                  ref={messageBoxRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setMessageBox(!messageBox);
                  }}
                >
                  <div className="notification-icon-container">
                    <BellIcon className="icon" />
                    {unreadCount > 0 && (
                      <span className="notification-badge">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span>알림</span>
                </button>

                <div className={`notice_message ${messageBox ? "active" : ""}`}>
                  {notifications.length === 0 ? (
                    <div className="no-notifications">
                      <span>새로운 알림이 없습니다.</span>
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div
                        key={i}
                        className={`message_box ${n.is_read ? "read" : "unread"}`}
                      >
                        <Link
                          href={`${n.link}`}
                          onClick={async (e) => {
                            e.preventDefault();
                            await notifyCheck(n.id, n.link);
                          }}
                        >
                          <span>{n.message}</span>
                          {!n.is_read && <span className="unread-dot"></span>}
                        </Link>
                      </div>
                    ))
                  )}
                  <Link
                    href="/my/notice"
                    className="notice_btn"
                    onClick={() => {
                      setMessageBox(false);
                    }}
                  >
                    알림함 이동하기
                  </Link>
                </div>
              </div>

              {isUserAuthority === 0 ? (
                <Link href="/admin">
                  <WrenchScrewdriverIcon className="icon" />
                  <span>관리자 페이지</span>
                </Link>
              ) : (
                <Link href="/my" className="header_btn">
                  <UserCircleIcon className="icon" />
                  <span>마이페이지</span>
                </Link>
              )}

              <button
                onClick={() => {
                  logoutPop();
                }}
                className="header_btn"
              >
                <ArrowRightStartOnRectangleIcon className="icon icon_space" />
                <span>로그아웃</span>
              </button>
            </>
          ) : (
            <>
              {/* Dark Mode Toggle */}
              <div className="dark-mode-toggle">
                <button
                  onClick={toggleDarkMode}
                  className="dark-mode-btn"
                  aria-label={`${isDarkMode ? "라이트" : "다크"} 모드로 전환`}
                >
                  <div
                    className={`toggle-slider ${isDarkMode ? "dark" : "light"}`}
                  >
                    <div className="toggle-icon">
                      {isDarkMode ? (
                        <MoonIcon className="icon" />
                      ) : (
                        <SunIcon className="icon" />
                      )}
                    </div>
                  </div>
                </button>
              </div>

              <Link href="/login" className="">
                <ArrowRightEndOnRectangleIcon className="icon icon_space" />
                <span>로그인</span>
              </Link>
              <Link href="/agree" className="">
                <UserIcon className="icon" />
                <span>회원가입</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
