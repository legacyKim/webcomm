"use client";

import { useState } from "react";

import MyHeader from "../myHeader";
import { useAuth } from "@/contexts/AuthContext";
import NotificationList from "@/components/NotificationList";
import NotificationManager from "@/components/NotificationManager";

export default function MyNotice() {
  const { isUserId } = useAuth();

  const [permission, setPermission] = useState("default");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // 테스트 알림 생성 함수
  // const createTestNotification = async () => {
  //   try {
  //     const response = await fetch("/api/notifications/test", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     const result = await response.json();

  //     if (result.success) {
  //       alert("테스트 알림이 생성되었습니다!");
  //       // 페이지 새로고침하여 알림 목록 업데이트
  //       window.location.reload();
  //     } else {
  //       alert("테스트 알림 생성 실패: " + result.error);
  //     }
  //   } catch (error) {
  //     console.error("테스트 알림 생성 오류:", error);
  //     alert("테스트 알림 생성 중 오류가 발생했습니다.");
  //   }
  // };

  return (
    <sub className="sub">
      <div className="mypage">
        <MyHeader />
        <div className="mypage_content">
          <div className="mypage_inner">
            <div className="notice-page-content">
              <div className="notification-settings">
                <h2 className="mypage_title">푸시 알림 설정</h2>

                {/* <button
                  onClick={createTestNotification}
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginBottom: "20px",
                  }}
                >
                  테스트 알림 생성
                </button> */}

                <NotificationManager
                  isUserId={isUserId}
                  permission={permission}
                  setPermission={setPermission}
                  isSubscribed={isSubscribed}
                  setIsSubscribed={setIsSubscribed}
                />
              </div>

              {/* 알림 목록은 항상 표시하도록 변경 */}
              <div className="notification-list-section">
                <h2>알림 목록</h2>
                <NotificationList isUserId={isUserId} limit={50} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </sub>
  );
}
