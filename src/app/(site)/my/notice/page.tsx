"use client";

import { useState, useEffect } from "react";

import MyHeader from "../myHeader";
import { useAuth } from "@/AuthContext";
import NotificationList from "@/components/NotificationList";
import NotificationManager from "@/components/NotificationManager";

export default function MyNotice() {
  const { isUserId, isNotificationEnabled } = useAuth();
  const [permission, setPermission] = useState("default");

  // 기본 인증 체크만 수행
  useEffect(() => {
    if (!isUserId) return;
  }, [isUserId]);

  return (
    <sub className='sub'>
      <div className='mypage'>
        <MyHeader />
        <div className='mypage_content'>
          <div className='mypage_inner'>
            <div className='notification_settings'>
              <div className='notification_text'>
                <h2 className='mypage_subtitle'>푸시 알림 설정</h2>
                <div className='mypage_info'>
                  <p>새로운 댓글, 좋아요, 멘션 등을 실시간으로 받아보세요.</p>
                </div>
              </div>

              <NotificationManager permission={permission} setPermission={setPermission} />
            </div>

            {permission === "denied" && (
              <div className={`denied-help`}>
                <p>🚫 알림이 차단되어 있습니다</p>
                <details>
                  <summary>알림 허용하는 방법</summary>
                  <div className='help-content'>
                    <p>
                      <strong>Chrome/Edge:</strong>
                    </p>
                    <ol>
                      <li>주소창 왼쪽의 🔒 또는 ⚠️ 아이콘 클릭</li>
                      <li>"알림" 설정을 "허용"으로 변경</li>
                      <li>페이지 새로고침</li>
                    </ol>
                    <p>
                      <strong>Firefox:</strong>
                    </p>
                    <ol>
                      <li>주소창 왼쪽의 방패 아이콘 클릭</li>
                      <li>"알림" 권한을 허용으로 변경</li>
                    </ol>
                  </div>
                </details>
              </div>
            )}

            {isNotificationEnabled && (
              <div className='notification-list-section'>
                <NotificationList limit={50} />
              </div>
            )}
          </div>
        </div>
      </div>
    </sub>
  );
}
