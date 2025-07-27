// Service Worker for Web Push Notifications
const CACHE_NAME = "webcomm-notifications-v1";

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// Push event - 푸시 알림 수신
self.addEventListener("push", (event) => {
  console.log("Push event received:", event);

  let notificationData = {
    title: "새 알림",
    body: "새로운 알림이 있습니다.",
    icon: "/logo.png",
    badge: "/logo.png",
    data: {
      url: "/",
    },
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || "새 알림",
        body: data.body || "새로운 알림이 있습니다.",
        icon: data.icon || "/logo.png",
        badge: data.badge || "/logo.png",
        tag: data.data?.notificationId || "default",
        data: data.data || { url: "/" },
        requireInteraction: true,
        actions: [
          {
            action: "view",
            title: "보기",
          },
          {
            action: "dismiss",
            title: "닫기",
          },
        ],
      };
    } catch (error) {
      console.error("Error parsing push data:", error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData).then(() => {
      // 알림이 표시된 후 클라이언트에게 새 알림 도착을 알림
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "NEW_NOTIFICATION",
            data: notificationData,
          });
        });
      });
    }),
  );
});

// Notification click event - 알림 클릭 처리
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received:", event);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // 이미 열린 탭이 있는지 확인
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            client.postMessage({
              type: "NOTIFICATION_CLICKED",
              url: urlToOpen,
              notificationId: event.notification.data?.notificationId,
            });
            return;
          }
        }

        // 열린 탭이 없으면 새 탭 열기
        return clients.openWindow(urlToOpen);
      }),
  );
});

// Background sync for offline notifications
self.addEventListener("sync", (event) => {
  if (event.tag === "notification-sync") {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  try {
    // 오프라인 상태에서 쌓인 알림들을 동기화
    const response = await fetch("/api/notifications/unread-count");
    if (response.ok) {
      const data = await response.json();

      // 클라이언트에게 업데이트된 알림 수 전송
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: "NOTIFICATION_COUNT_UPDATE",
          count: data.count,
        });
      });
    }
  } catch (error) {
    console.error("Error syncing notifications:", error);
  }
}

// Message event - 클라이언트로부터 메시지 수신
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Periodic background sync (if supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "notification-check") {
    event.waitUntil(syncNotifications());
  }
});
