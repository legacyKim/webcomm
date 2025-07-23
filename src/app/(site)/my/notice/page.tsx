"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import axios from "axios";
import Link from "next/link";

import MyHeader from "../myHeader";
import { useAuth } from "@/AuthContext";
import NotificationList from "../../../components/NotificationList";
import NotificationManager from "../../../components/NotificationManager";
import "../../../style/notification.css";

type Notification = {
  id: number;
  type: "comment" | "reply" | "message" | "mention";
  message: string;
  link: string;
  is_read: boolean;
};

export default function MyNotice() {
  const router = useRouter();
  const { isUserId } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!isUserId) return;

    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get(`/api/notifications`);
        setNotifications(data);
      } catch (err) {
        console.error("알림 가져오기 실패:", err);
      }
    };

    fetchNotifications();
  }, [isUserId]);

  const notifyCheck = async (id: number, link: string) => {
    try {
      await axios.patch(`/api/notifications`, {
        notificationIds: [id.toString()],
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      router.push(link);
    } catch (err) {
      console.error("알림 읽음 처리 실패", err);
    }
  };

  return (
    <sub className='sub'>
      <div className='mypage'>
        <MyHeader />
        <div className='mypage_content'>
          <div className='mypage_inner'>
            <div className='notice-page-content'>
              <div className='page-header'>
                <h1>알림 관리</h1>
                <p>새로운 알림을 확인하고 푸시 알림을 설정하세요.</p>
              </div>

              <div className='notification-settings'>
                <h2>푸시 알림 설정</h2>
                <NotificationManager />
              </div>

              <div className='notification-list-section'>
                <h2>알림 목록</h2>
                <NotificationList limit={50} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .notice-page-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 40px;
          padding: 40px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .page-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #333;
          margin: 0 0 12px 0;
        }

        .page-header p {
          font-size: 16px;
          color: #666;
          margin: 0;
        }

        .notification-settings {
          margin-bottom: 40px;
        }

        .notification-settings h2,
        .notification-list-section h2 {
          font-size: 24px;
          font-weight: 600;
          color: #333;
          margin: 0 0 20px 0;
        }

        .notification-list-section {
          margin-bottom: 40px;
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 30px 16px;
            margin-bottom: 30px;
          }

          .page-header h1 {
            font-size: 28px;
          }

          .page-header p {
            font-size: 14px;
          }

          .notification-settings h2,
          .notification-list-section h2 {
            font-size: 20px;
          }

          .notification-settings {
            margin-bottom: 30px;
          }
        }
      `}</style>
    </sub>
  );
}
