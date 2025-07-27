import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import webpush from "web-push";

// VAPID 키 설정 (환경변수로 관리)
webpush.setVapidDetails("mailto:admin@tokti.net", process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");

  try {
    // 토큰에서 사용자 정보 확인
    const userData = await serverTokenCheck(req);
    if (!userData.success) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const limit = limitParam ? parseInt(limitParam, 10) : null;

    // Prisma로 알림 조회
    const notifications = await prisma.notification.findMany({
      where: {
        receiver_id: userData.id,
        OR: [
          { is_read: false },
          {
            created_at: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
            },
          },
        ],
      },
      include: {
        sender: {
          select: {
            user_nickname: true,
          },
        },
        post: {
          select: {
            board_name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: limit || undefined,
    });

    // 메시지와 링크 생성
    const processedNotifications = notifications.map((n) => {
      let message = "";
      let link = "/";

      switch (n.type) {
        case "comment":
          message = `게시물에 ${n.sender.user_nickname}님이 댓글을 달았습니다.`;
          link = `/board/${n.post?.board_name}/${n.post_id}`;
          break;
        case "reply":
          message = `댓글에 ${n.sender.user_nickname}님이 대댓글을 달았습니다.`;
          link = `/board/${n.post?.board_name}/${n.post_id}#comment-${n.comment_id}`;
          break;
        case "like_comment":
          message = `${n.sender.user_nickname}님이 댓글을 좋아합니다.`;
          link = `/board/${n.post?.board_name}/${n.post_id}#comment-${n.comment_id}`;
          break;
        case "post_like":
          message = `${n.sender.user_nickname}님이 게시글을 좋아합니다.`;
          link = `/board/${n.post?.board_name}/${n.post_id}`;
          break;
        case "message":
          message = `${n.sender.user_nickname}님이 쪽지를 보냈습니다.`;
          link = `/my/message`;
          break;
        case "mention":
          message = `${n.sender.user_nickname}님이 언급했습니다.`;
          link = `/board/${n.post?.board_name}/${n.post_id}#comment-${n.comment_id}`;
          break;
        default:
          message = "새로운 알림이 있습니다.";
      }

      return {
        id: n.id,
        type: n.type,
        message,
        link,
        is_read: n.is_read,
        created_at: n.created_at,
        sender_nickname: n.sender.user_nickname,
      };
    });

    return NextResponse.json(processedNotifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}

// 알림 읽음 처리
export async function PATCH(req) {
  try {
    const userData = await serverTokenCheck(req);
    if (!userData.success) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const { notificationIds } = await req.json();

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json({ error: "notificationIds는 배열이어야 합니다" }, { status: 400 });
    }

    // 해당 사용자의 알림만 읽음 처리
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        receiver_id: userData.id,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error marking notifications as read:", err);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}

// 새 알림 생성 및 웹푸시 발송
export async function POST(req) {
  try {
    const { receiver_id, sender_id, type, post_id, comment_id, content } = await req.json();

    if (!receiver_id || !sender_id || !type) {
      return NextResponse.json({ error: "필수 필드가 누락되었습니다" }, { status: 400 });
    }

    // 알림 생성
    const notification = await prisma.notification.create({
      data: {
        receiver_id,
        sender_id,
        type,
        post_id,
        comment_id,
        content,
        is_read: false,
        created_at: new Date(),
      },
      include: {
        sender: {
          select: {
            user_nickname: true,
          },
        },
        post: {
          select: {
            board_name: true,
          },
        },
      },
    });

    // 웹푸시 알림 발송
    try {
      const pushSubscriptions = await prisma.pushSubscription.findMany({
        where: { user_id: receiver_id },
      });

      if (pushSubscriptions.length > 0) {
        // 메시지 생성
        let pushMessage = "";
        switch (type) {
          case "comment":
            pushMessage = `${notification.sender.user_nickname}님이 댓글을 달았습니다.`;
            break;
          case "reply":
            pushMessage = `${notification.sender.user_nickname}님이 대댓글을 달았습니다.`;
            break;
          case "like_comment":
            pushMessage = `${notification.sender.user_nickname}님이 댓글을 좋아합니다.`;
            break;
          case "post_like":
            pushMessage = `${notification.sender.user_nickname}님이 게시글을 좋아합니다.`;
            break;
          case "message":
            pushMessage = `${notification.sender.user_nickname}님이 쪽지를 보냈습니다.`;
            break;
          case "mention":
            pushMessage = `${notification.sender.user_nickname}님이 언급했습니다.`;
            break;
          default:
            pushMessage = "새로운 알림이 있습니다.";
        }

        const payload = JSON.stringify({
          title: "새 알림",
          body: pushMessage,
          icon: "/logo.png",
          badge: "/logo.png",
          data: {
            notificationId: notification.id,
            url:
              type === "message"
                ? "/my/message"
                : `/board/${notification.post?.board_name}/${post_id}${comment_id ? `#comment-${comment_id}` : ""}`,
          },
        });

        // 모든 구독에 푸시 발송
        const pushPromises = pushSubscriptions.map(async (subscription) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: subscription.endpoint,
                keys: {
                  p256dh: subscription.p256dh,
                  auth: subscription.auth,
                },
              },
              payload,
            );
          } catch (error) {
            console.error("Push send error:", error);
            // 만료된 구독 삭제
            if (error.statusCode === 410) {
              await prisma.pushSubscription.delete({
                where: { id: subscription.id },
              });
            }
          }
        });

        await Promise.allSettled(pushPromises);
      }
    } catch (pushError) {
      console.error("Push notification error:", pushError);
      // 푸시 에러가 있어도 알림 생성은 성공으로 처리
    }

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        type: notification.type,
        created_at: notification.created_at,
      },
    });
  } catch (err) {
    console.error("Error creating notification:", err);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}
