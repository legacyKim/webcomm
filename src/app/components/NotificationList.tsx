"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Pagination from "@/components/pagination";
import { XMarkIcon } from "@heroicons/react/24/outline";

// 날짜 포맷 함수 (클라이언트에서만 실행)
const formatDate = (dateString: string, isClient: boolean = true) => {
  // 서버 사이드 또는 클라이언트 준비되지 않은 경우 기본 날짜만 반환
  if (typeof window === "undefined" || !isClient) {
    return new Date(dateString).toLocaleDateString("ko-KR");
  }

  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

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
  isUserId: number | null;
  limit?: number;
  showOnlyUnread?: boolean;
}

export default function NotificationList({
  isUserId,
  limit = 10, // 기본값을 10개로 변경
  showOnlyUnread = false,
}: NotificationListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const currentPage = parseInt(searchParams?.get("page") || "1", 10);

  const [isClient, setIsClient] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // React Query로 알림 데이터 관리
  const {
    data: notificationData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications", isUserId, limit, currentPage, showOnlyUnread],
    queryFn: async () => {
      if (!isUserId) return null;

      const params = new URLSearchParams({
        limit: limit.toString(),
        page: currentPage.toString(),
      });

      if (showOnlyUnread) {
        params.append("unreadOnly", "true");
      }

      const response = await fetch(`/api/notifications?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      // console.log("API 응답 데이터:", data); // 주석 처리

      return data;
    },
    enabled: !!isUserId, // isUserId가 있을 때만 쿼리 실행
    staleTime: 30000, // 30초 동안 캐시된 데이터 사용
    gcTime: 300000, // 5분 동안 캐시 유지
  });

  // 알림 데이터에서 필요한 값들 추출
  const notifications = notificationData?.notifications || [];
  const totalPages = notificationData?.pagination?.totalPages || 1;
  const totalCount = notificationData?.pagination?.totalCount || 0;

  // 클라이언트 사이드 렌더링 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 읽지 않은 알림 수 업데이트 (알림 데이터가 변경될 때마다)
  useEffect(() => {
    if (notifications.length > 0) {
      const unreadCount = notifications.filter(
        (n: Notification) => !n.is_read
      ).length;
      setUnreadCount(unreadCount);
      updateNotificationBadge(unreadCount);
    }
  }, [notifications]);

  // 주기적으로 읽지 않은 알림 수 확인
  useEffect(() => {
    if (!isUserId) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30초마다

    return () => clearInterval(interval);
  }, [isUserId]);

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

  const markAsRead = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }

      return response.json();
    },
    onSuccess: (_, notificationIds) => {
      // React Query 캐시 업데이트
      queryClient.setQueryData(
        ["notifications", isUserId, limit, currentPage, showOnlyUnread],
        (
          oldData:
            | {
                notifications: Notification[];
                totalCount: number;
                totalPages: number;
              }
            | undefined
        ) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            notifications: oldData.notifications.map(
              (notification: Notification) =>
                notificationIds.includes(notification.id)
                  ? { ...notification, is_read: true }
                  : notification
            ),
          };
        }
      );

      // 읽지 않은 알림 수 업데이트
      const newUnreadCount = notifications.filter(
        (n: Notification) => !notificationIds.includes(n.id) && !n.is_read
      ).length;
      setUnreadCount(newUnreadCount);
      updateNotificationBadge(newUnreadCount);
    },
    onError: (error) => {
      console.error("Error marking notifications as read:", error);
    },
  });

  const deleteNotifications = useMutation({
    mutationFn: async ({
      notificationIds,
      deleteAll,
    }: {
      notificationIds?: string[];
      deleteAll?: boolean;
    }) => {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds, deleteAll }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete notifications");
      }

      return response.json();
    },
    onSuccess: () => {
      // 캐시 무효화하여 새로고침
      queryClient.invalidateQueries({
        queryKey: ["notifications", isUserId],
      });
    },
    onError: (error) => {
      console.error("Error deleting notifications:", error);
    },
  });

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter((n: Notification) => !n.is_read)
      .map((n: Notification) => n.id);
    if (unreadIds.length > 0) {
      markAsRead.mutate(unreadIds);
    }
  };

  const deleteAllNotifications = () => {
    if (confirm("모든 알림을 삭제하시겠습니까?")) {
      deleteNotifications.mutate({ deleteAll: true });
    }
  };

  const deleteNotification = (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // 알림 클릭 이벤트 방지
    if (confirm("이 알림을 삭제하시겠습니까?")) {
      deleteNotifications.mutate({ notificationIds: [notificationId] });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log("알림 클릭:", notification); // 디버그 로그 추가

    // 읽지 않은 알림이면 읽음으로 표시
    if (!notification.is_read) {
      markAsRead.mutate([notification.id]);
    }

    // Next.js router로 이동
    if (notification.link) {
      console.log("이동할 링크:", notification.link); // 디버그 로그 추가
      router.push(notification.link);
    } else {
      console.log("링크가 없습니다:", notification); // 디버그 로그 추가
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

  // const getNotificationIcon = (type: string) => {
  //   switch (type) {
  //     case "comment":
  //       return "💬";
  //     case "reply":
  //       return "↩️";
  //     case "like_comment":
  //       return "👍";
  //     case "post_like":
  //       return "❤️";
  //     case "message":
  //       return "📩";
  //     case "mention":
  //       return "@";
  //     default:
  //       return "🔔";
  //   }
  // };

  if (!isUserId) {
    return (
      <div className="notification-list">
        <p>로그인이 필요합니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notification-list">
        <div className="error">알림을 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  return (
    <div className="notification-list">
      <div className="notification-header">
        <div className="flex-start">
          <h2>알림 목록</h2>

          {/* 디버그 정보 */}
          <div className="notice">전체 알림 {totalCount}</div>
        </div>

        <div className="notification_btn">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn_width_80 btn_notify_all"
            >
              모두 읽음
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={deleteAllNotifications}
              className="btn_width_80 btn_delete_all"
            >
              모두 삭제
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <p>
            {showOnlyUnread ? "읽지 않은 알림이 없습니다." : "알림이 없습니다."}
          </p>
        </div>
      ) : isLoading ? (
        <div className="notification-list">
          <div className="loading">알림을 불러오는 중...</div>
        </div>
      ) : (
        <ul className="notification-items">
          {notifications.map((notification: Notification) => (
            <li
              key={notification.id}
              className={`notification-item ${!notification.is_read ? "unread" : ""}`}
              onClick={() => handleNotificationClick(notification)}
            >
              {/* <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div> */}

              <div className="unread-dot"></div>

              <div className="notification-content">
                <div className="notification-message">
                  {notification.message}
                </div>
                <div className="notification-meta">
                  <span className="notification-time">
                    {formatDate(notification.created_at, isClient)}
                  </span>
                </div>
              </div>

              {/* 삭제 버튼 추가 */}
              <button
                className="notification-delete-btn"
                onClick={(e) => deleteNotification(notification.id, e)}
                title="삭제"
              >
                <XMarkIcon className="icon" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 페이지네이션 추가 - 임시로 항상 표시 */}
      <div className="notification-pagination">
        <Pagination
          page={currentPage}
          totalPage={Math.max(1, totalPages)}
          type="notifications"
        />
      </div>
    </div>
  );
}
