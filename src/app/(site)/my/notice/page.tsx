"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import axios from "axios";
import Link from "next/link";

import MyHeader from "../myHeader";
import { useAuth } from "@/AuthContext";

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
        const { data } = await axios.get(`/api/notifications?userId=${isUserId}`);
        setNotifications(data);
      } catch (err) {
        console.error("알림 가져오기 실패:", err);
      }
    };

    fetchNotifications();
  }, [isUserId]);

  const notifyCheck = async (id: number, link: string) => {
    try {
      await axios.patch(`/api/notifications/${id}`);
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
            {notifications.map((n, i) => (
              <div key={i} className={`notice_box ${n.is_read ? "read" : "unread"}`}>
                <Link
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    notifyCheck(n.id, n.link);
                  }}>
                  <span className='num'>{i}</span>
                  <span className='message'>{n.message}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </sub>
  );
}
