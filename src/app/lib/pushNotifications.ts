import prisma from "@/lib/prisma";
import webpush from "web-push";

// VAPID 설정
webpush.setVapidDetails("mailto:your-email@example.com", process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
}

export async function sendPushNotificationToUser(userId: number, payload: NotificationPayload) {
  try {
    // 해당 사용자의 모든 구독 정보 가져오기
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { user_id: userId },
    });

    if (subscriptions.length === 0) {
      return;
    }

    // 각 구독에 대해 푸시 전송
    const sendPromises = subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        const pushPayload = JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || "/logo.png",
          url: payload.url || "/",
          tag: payload.tag || "default",
        });

        await webpush.sendNotification(pushSubscription, pushPayload);
      } catch (error: any) {
        // 유효하지 않은 구독은 삭제
        if (error?.statusCode === 410 || error?.statusCode === 404) {
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          });
        }
      }
    });

    await Promise.allSettled(sendPromises);
  } catch (error) {
    // Push notification error - silently handle
  }
}

export async function sendCommentNotification(
  postId: number,
  commentId: number,
  senderId: number,
  receiverId: number,
  senderNickname: string,
  postTitle: string,
) {
  await sendPushNotificationToUser(receiverId, {
    title: "새 댓글",
    body: `${senderNickname}님이 댓글을 남겼습니다: ${postTitle}`,
    url: `/board/post/${postId}#comment-${commentId}`,
    tag: `comment-${commentId}`,
  });
}

export async function sendMentionNotification(
  postId: number,
  commentId: number,
  senderId: number,
  receiverId: number,
  senderNickname: string,
  postTitle: string,
) {
  await sendPushNotificationToUser(receiverId, {
    title: "멘션 알림",
    body: `${senderNickname}님이 회원님을 언급했습니다: ${postTitle}`,
    url: `/board/post/${postId}#comment-${commentId}`,
    tag: `mention-${commentId}`,
  });
}
