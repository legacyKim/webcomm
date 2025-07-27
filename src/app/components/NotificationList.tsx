"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/AuthContext";
import { useRouter } from "next/navigation";

// 날짜 포맷 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "방금 전";
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}일 전`;

  return date.toLocaleDateString("ko-KR");
};

interface Notification {
  id: string;
  type: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
  sender_nickname: string;
}

interface NotificationListProps {
  limit?: number;
  showOnlyUnread?: boolean;
}

export default function NotificationList({ limit = 20, showOnlyUnread = false }: NotificationListProps) {
  const { isUserId, isNotificationEnabled } = useAuth();

  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // 푸시 구독 상태 확인
  // const checkPushSubscription = async () => {
  //   try {
  //     if ("serviceWorker" in navigator && "PushManager" in window) {
  //       const registration = await navigator.serviceWorker.ready;
  //       const subscription = await registration.pushManager.getSubscription();
  //       setHasSubscription(!!subscription);
  //     }
  //   } catch (error) {
  //     console.error("구독 상태 확인 오류:", error);
  //     setHasSubscription(false);
  //   }
  // };

  // useEffect(() => {
  //   if (isUserId && isUserId > 0) {
  //     checkPushSubscription();
  //   }
  // }, [isUserId]);

  useEffect(() => {
    if (isUserId && isUserId > 0 && isNotificationEnabled) {
      fetchNotifications();

      // 주기적으로 알림 확인 (폴링)
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 300000); // 300초마다

      return () => clearInterval(interval);
    }
  }, [isUserId, limit, showOnlyUnread]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications?limit=${limit}`);

      if (response.ok) {
        const data = await response.json();
        const filteredData = showOnlyUnread ? data.filter((n: Notification) => !n.is_read) : data;
        setNotifications(filteredData);

        // 읽지 않은 알림 수 계산
        const unreadCount = data.filter((n: Notification) => !n.is_read).length;
        setUnreadCount(unreadCount);
        updateNotificationBadge(unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications/unread-count");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
        updateNotificationBadge(data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (response.ok) {
        // 로컬 상태 업데이트
        setNotifications((prev) =>
          prev.map((notification) =>
            notificationIds.includes(notification.id) ? { ...notification, is_read: true } : notification,
          ),
        );

        // 읽지 않은 알림 수 업데이트
        const newUnreadCount = notifications.filter((n) => !notificationIds.includes(n.id) && !n.is_read).length;
        setUnreadCount(newUnreadCount);
        updateNotificationBadge(newUnreadCount);
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // 읽지 않은 알림이면 읽음으로 표시
    if (!notification.is_read) {
      markAsRead([notification.id]);
    }

    // Next.js router로 이동
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const updateNotificationBadge = (count: number) => {
    const badge = document.querySelector(".notification-badge") as HTMLElement;
    if (badge) {
      if (count > 0) {
        badge.textContent = count > 99 ? "99+" : count.toString();
        badge.style.display = "inline-block";
      } else {
        badge.style.display = "none";
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "comment":
        return "💬";
      case "reply":
        return "↩️";
      case "like_comment":
        return "👍";
      case "post_like":
        return "❤️";
      case "message":
        return "📩";
      case "mention":
        return "@";
      default:
        return "🔔";
    }
  };

  if (!isUserId || isUserId === 0) {
    return (
      <div className='notification-list'>
        <p>로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className='notification-list'>
      <div className='notification-header'>
        <h2 className='mypage_subtitle'>알림 {showOnlyUnread && "(읽지 않음)"}</h2>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className='mark-all-read-btn'>
            모두 읽음
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className='no-notifications'>
          <p>{showOnlyUnread ? "읽지 않은 알림이 없습니다." : "알림이 없습니다."}</p>
        </div>
      ) : (
        <ul className='notification-items'>
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`notification-item ${!notification.is_read ? "unread" : ""}`}
              onClick={() => handleNotificationClick(notification)}>
              <div className='notification-icon'>{getNotificationIcon(notification.type)}</div>
              <div className='notification-content'>
                <div className='notification-message'>{notification.message}</div>
                <div className='notification-meta'>
                  <span className='notification-time'>{formatDate(notification.created_at)}</span>
                  {!notification.is_read && <span className='unread-indicator'>새 알림</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
