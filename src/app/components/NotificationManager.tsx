"use client";

import { NoSymbolIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export default function NotificationManager({
  isUserId,
  permission,
  setPermission,
  isSubscribed,
  setIsSubscribed,
}: {
  isUserId: number | null;
  permission: string;
  setPermission: (permission: string) => void;
  isSubscribed: boolean;
  setIsSubscribed: (isSubscribed: boolean) => void;
}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 브라우저 지원 여부 확인
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Service Worker 등록
      registerServiceWorker();

      // 기존 구독 상태 확인
      checkSubscriptionStatus();
    }
  }, [isUserId]);

  const registerServiceWorker = async () => {
    try {
      await navigator.serviceWorker.register("/sw.js");
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
      console.error("Service Worker registration failed:", error);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription status:", error);
    }
  };

  const requestNotificationPermission = async () => {
    if (!isSupported) return false;

    const permission = await Notification.requestPermission();
    setPermission(permission);
    return permission === "granted";
  };

  const subscribeToNotifications = async () => {
    if (!isUserId) {
      alert("로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);

    try {
      // 권한 요청
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        alert("알림 권한이 필요합니다.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      // VAPID 키를 ArrayBuffer로 변환
      if (!VAPID_PUBLIC_KEY) {
        throw new Error("VAPID 공개 키가 설정되지 않았습니다.");
      }

      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      // 푸시 구독 생성
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      // 서버에 구독 정보 저장
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        alert("알림 구독이 완료되었습니다!");
      } else {
        throw new Error("구독 저장 실패");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("알림 구독 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // 브라우저에서 구독 해제
        await subscription.unsubscribe();

        // 서버에서 구독 정보 삭제
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        setIsSubscribed(false);
        alert("알림 구독이 해제되었습니다.");
      }
    } catch (error) {
      console.error("Unsubscription error:", error);
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
      console.error("Error marking notification as read:", error);
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

  // VAPID 키 변환 함수
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (!isSupported) {
    return (
      <div className="notification-manager">
        <p className="warning">
          <NoSymbolIcon className="icon" />이 브라우저는 푸시 알림을 지원하지
          않습니다.
        </p>
      </div>
    );
  }

  if (!isUserId) {
    return null;
  }

  return (
    <div className="notification-manager">
      <div className="notification-controls">
        {permission === "granted" && isSubscribed ? (
          <p className="notice">푸시 알림이 활성화되었습니다.</p>
        ) : (
          <p className="notice">
            새로운 알림을 확인하고 푸시 알림을 설정하세요.
          </p>
        )}

        {permission === "granted" && (
          <div className="toggle-container">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isSubscribed}
                onChange={
                  isSubscribed
                    ? unsubscribeFromNotifications
                    : subscribeToNotifications
                }
                disabled={isLoading}
              />
              <span className="toggle-slider"></span>
            </label>
            {/* <span className='toggle-label'>
              {isLoading ? "처리중..." : isSubscribed ? "푸시 알림 켜짐" : "푸시 알림 꺼짐"}
            </span> */}
          </div>
        )}
      </div>
      {permission === "denied" && (
        <p className="warning">
          <NoSymbolIcon className="icon" />
          알림이 차단되어 있습니다. 브라우저 설정에서 알림을 허용해주세요.
        </p>
      )}
    </div>
  );
}
