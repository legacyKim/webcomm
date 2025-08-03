"use client";

import { useState, useEffect } from "react";

import MyHeader from "../myHeader";
import { useAuth } from "@/AuthContext";
import NotificationList from "@/components/NotificationList";
import NotificationManager from "@/components/NotificationManager";

export default function MyNotice() {
  const { isUserId } = useAuth();

  const [permission, setPermission] = useState("default");
  const [isSubscribed, setIsSubscribed] = useState(false);

  return (
    <sub className='sub'>
      <div className='mypage'>
        <MyHeader />
        <div className='mypage_content'>
          <div className='mypage_inner'>
            <div className='notice-page-content'>
              <div className='notification-settings'>
                <h2>푸시 알림 설정</h2>

                <NotificationManager
                  isUserId={isUserId}
                  permission={permission}
                  setPermission={setPermission}
                  isSubscribed={isSubscribed}
                  setIsSubscribed={setIsSubscribed}
                />
              </div>

              {permission === "granted" && isSubscribed && (
                <div className='notification-list-section'>
                  <h2>알림 목록</h2>
                  <NotificationList isUserId={isUserId} limit={50} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </sub>
  );
}
