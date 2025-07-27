"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/AuthContext";
import {
  requestNotificationPermission,
  registerServiceWorker,
  subscribeToNotifications,
  checkSubscriptionStatus,
  urlBase64ToUint8Array,
} from "@/utils/notificationUtils";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export default function NotificationManager({
  permission,
  setPermission,
}: {
  permission: string;
  setPermission: (value: string) => void;
}) {
  const { isUserId, isNotificationEnabled, setIsNotificationEnabled } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 브라우저 지원 여부 확인
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);

      setPermission(Notification.permission);

      // Service Worker 등록
      registerServiceWorkerLocal();

      // 기존 구독 상태 확인
      checkSubscriptionStatusLocal();
    }
  }, [isUserId]);

  // 권한 변경 감지를 위한 별도 useEffect
  useEffect(() => {
    if (!isSupported) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // 페이지가 다시 활성화될 때 권한 상태 확인
        const currentPermission = Notification.permission;
        if (currentPermission !== permission) {
          setPermission(currentPermission);
          checkSubscriptionStatusLocal();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [isSupported, permission]);

  const registerServiceWorkerLocal = async () => {
    try {
      const registration = await registerServiceWorker();

      // 메시지 리스너 등록
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "NOTIFICATION_CLICKED") {
          // 알림 클릭 시 해당 페이지로 이동
          window.location.href = event.data.url;

          // 알림을 읽음으로 표시
          if (event.data.notificationId) {
            markNotificationAsRead(event.data.notificationId);
          }
        } else if (event.data.type === "NOTIFICATION_COUNT_UPDATE") {
          // 알림 수 업데이트
          updateNotificationBadge(event.data.count);
        }
      });
    } catch (error) {
      // Service Worker registration failed - silently handle
    }
  };

  const checkSubscriptionStatusLocal = async () => {
    const subscribed = await checkSubscriptionStatus();
    setIsNotificationEnabled(subscribed);
  };
  const subscribeToNotificationsLocal = async () => {
    setIsLoading(true);
    const success = await subscribeToNotifications(isUserId);
    if (success) {
      setIsNotificationEnabled(true); // AuthContext 상태 업데이트
      alert("알림 구독이 완료되었습니다!");
    }
    setIsLoading(false);
  };

  const unsubscribeFromNotifications = async () => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;

        // 브라우저에서 구독 해제
        await subscription.unsubscribe();

        // 서버에서 구독 정보 삭제
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: endpoint,
          }),
        });

        setIsNotificationEnabled(false); // AuthContext 상태 업데이트
        alert("알림 구독이 해제되었습니다.");
      }
    } catch (error) {
      alert("구독 해제 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationIds: [notificationId],
        }),
      });
    } catch (error) {
      // Error marking notification as read - silently handle
    }
  };

  const updateNotificationBadge = (count: number) => {
    // 헤더의 알림 뱃지 업데이트
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

  // VAPID 키 변환 함수는 utils에서 가져와서 사용하므로 제거

  if (!isSupported) {
    return (
      <div className='notification-manager'>
        <p>이 브라우저는 푸시 알림을 지원하지 않습니다.</p>
      </div>
    );
  }

  if (!isUserId || isUserId === 0) {
    return null;
  }

  return (
    <div className='notification-manager'>
      <div className='notification-controls'>
        <div className='notification-setting'>
          {permission === "denied" ? (
            <div className='permission-denied'>
              <div className='toggle-container'>
                <div className='toggle-switch disabled'>
                  <div className='toggle-slider'></div>
                </div>
              </div>
            </div>
          ) : (
            <div className='toggle-container'>
              <div
                className={`toggle-switch ${permission === "granted" && isNotificationEnabled ? "active" : ""} ${isLoading ? "loading" : ""}`}
                onClick={
                  permission === "granted"
                    ? isNotificationEnabled
                      ? unsubscribeFromNotifications
                      : subscribeToNotificationsLocal
                    : subscribeToNotificationsLocal
                }>
                <div className='toggle-slider'>{isLoading && <div className='loading-spinner'></div>}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
