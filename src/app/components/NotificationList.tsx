"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/AuthContext";
import formatDate from "@/components/formatDate";

interface Notification {
  id: number;
  type: "comment" | "reply" | "like_comment" | "message" | "mention";
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationListProps {
  limit?: number;
}

export default function NotificationList({ limit = 10 }: NotificationListProps) {
  const { isUserId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!isUserId) {
      console.log("No user ID, skipping notification fetch");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching notifications for user:", isUserId);
      const response = await axios.get(`/api/notifications?limit=${limit}`);
      console.log("Notifications response:", response.data);

      if (response.data) {
        setNotifications(response.data);
        const unread = response.data.filter((n: Notification) => !n.is_read).length;
        setUnreadCount(unread);
        console.log("Set notifications count:", response.data.length, "unread:", unread);
      }
    } catch (error) {
      console.error("알림 목록 가져오기 실패:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Fetch notifications error details:", {
          status: error.response.status,
          data: error.response.data,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [isUserId, limit]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isUserId) return;

    try {
      const response = await axios.get("/api/notifications/unread-count");
      if (response.data && typeof response.data.count === "number") {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("읽지 않은 알림 수 가져오기 실패:", error);
    }
  }, [isUserId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const markAsRead = async (notificationId: number) => {
    try {
      console.log("Marking notification as read:", notificationId);
      await axios.patch("/api/notifications", {
        notificationIds: [notificationId],
      });

      // 로컬 상태 업데이트
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification,
        ),
      );

      // 읽지 않은 알림 수 업데이트
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // 헤더의 알림 뱃지 업데이트
      updateNotificationBadge(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    }
  };

  const updateNotificationBadge = (count: number) => {
    const badge = document.querySelector(".notification-badge") as HTMLElement;
    if (badge) {
      if (count > 0) {
        badge.textContent = count > 99 ? "99+" : count.toString();
        badge.style.display = "block";
      } else {
        badge.style.display = "none";
      }
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  if (loading) {
    return (
      <div className='notification-list'>
        <div className='notification-loading'>알림을 불러오는 중...</div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className='notification-list'>
        <div className='notification-empty'>알림이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className='notification-list'>
      <div className='notification-header'>
        <h3>알림 목록</h3>
        {unreadCount > 0 && <span className='unread-count'>읽지 않음: {unreadCount}개</span>}
      </div>

      <div className='notification-items'>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-item ${!notification.is_read ? "unread" : ""}`}
            onClick={() => handleNotificationClick(notification)}>
            <Link href={notification.link} className='notification-link'>
              <div className='notification-content'>
                <div className='notification-message'>{notification.message}</div>
                <div className='notification-time'>{formatDate(notification.created_at)}</div>
              </div>
              {!notification.is_read && <div className='notification-indicator' />}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
