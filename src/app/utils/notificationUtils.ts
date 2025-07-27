import { useAuth } from "@/AuthContext";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

// VAPID 키 변환 함수
export const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// 알림 권한 요청
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("serviceWorker" in navigator && "PushManager" in window)) {
    alert("이 브라우저는 푸시 알림을 지원하지 않습니다.");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    return false;
  }
};

// Service Worker 등록
export const registerServiceWorker = async () => {
  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    return registration;
  } catch (error) {
    throw error;
  }
};

// 푸시 알림 구독
export const subscribeToNotifications = async (isUserId: number | null): Promise<boolean> => {
  if (!isUserId || isUserId === 0) {
    alert("로그인이 필요합니다.");
    return false;
  }

  if (!VAPID_PUBLIC_KEY) {
    alert("VAPID 공개 키가 설정되지 않았습니다.");
    return false;
  }

  try {
    // 권한 요청
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      alert("알림 권한이 필요합니다. 브라우저 설정에서 알림을 허용해주세요.");
      return false;
    }

    // Service Worker 등록 및 준비 대기
    await registerServiceWorker();
    const registration = await navigator.serviceWorker.ready;

    // VAPID 키를 ArrayBuffer로 변환
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

    // 푸시 구독 생성
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    });

    // 구독 정보를 JSON으로 변환
    const subscriptionObject = subscription.toJSON();

    // 서버에 구독 정보 저장
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        subscription: subscriptionObject,
      }),
    });

    const responseData = await response.json();

    if (response.ok) {
      return true;
    } else {
      throw new Error(`구독 저장 실패: ${responseData.error || "알 수 없는 오류"}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    alert(`알림 구독 중 오류가 발생했습니다: ${errorMessage}`);
    return false;
  }
};

// 알림 활성화를 위한 공통 함수
export const handleNotificationActivation = async (
  isNotificationEnabled: boolean | null,
  isUserId: number | null,
  onSuccess?: () => void,
): Promise<boolean> => {
  if (isNotificationEnabled) {
    // 이미 활성화된 경우
    return true;
  }

  const isConfirmed = confirm(
    "알림 수신에 동의하지 않으셨습니다. 알림을 활성화하시겠습니까?\n\n활성화하면 새로운 댓글, 좋아요, 메시지 등을 실시간으로 받아보실 수 있습니다.",
  );

  if (!isConfirmed) {
    return false;
  }

  // 알림 구독 진행
  const success = await subscribeToNotifications(isUserId);

  if (success && onSuccess) {
    onSuccess();
  }

  return success;
};

// 구독 상태 확인 (브라우저 + 서버 DB)
export const checkSubscriptionStatus = async (): Promise<boolean> => {
  try {
    if (!("serviceWorker" in navigator && "PushManager" in window)) {
      return false;
    }

    // 브라우저 권한이 거부된 경우 false 반환
    if (Notification.permission === "denied") {
      return false;
    }

    // 권한이 허용되지 않은 경우 false 반환
    if (Notification.permission !== "granted") {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    // 브라우저에 구독이 없으면 서버 DB 상태도 확인
    if (!subscription) {
      try {
        const response = await fetch("/api/push/status", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          return data.hasSubscription || false;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    }

    return !!subscription;
  } catch (error) {
    return false;
  }
};
