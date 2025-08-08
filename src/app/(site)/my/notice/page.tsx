"use client";

import { useState, useEffect } from "react";
import axios from "axios";

import MyHeader from "../myHeader";
import { useAuth } from "@/contexts/AuthContext";
import NotificationList from "@/components/NotificationList";
import NotificationManager from "@/components/NotificationManager";

export default function MyNotice() {
  const { isUserId } = useAuth();

  const [permission, setPermission] = useState("default");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // 마케팅 수신 동의 상태
  const [marketingConsent, setMarketingConsent] = useState<boolean>(false);

  // 사용자의 마케팅 수신 동의 상태 가져오기
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!isUserId) return;

      try {
        const response = await axios.get(`/api/my/bio`);
        if (response.data.success && response.data.user) {
          setMarketingConsent(response.data.user.marketing_enabled || false);
        }
      } catch (error) {
        console.error("사용자 설정 가져오기 실패:", error);
      }
    };

    fetchUserSettings();
  }, [isUserId]);

  // 마케팅 수신 동의 설정 업데이트
  const updateMarketingConsent = async (consent: boolean) => {
    if (!isUserId) return;

    try {
      const formData = new FormData();
      formData.append("userid", String(isUserId));
      formData.append("marketingConsent", consent.toString());
      // 다른 필드들은 변경하지 않도록 현재 값 전송
      formData.append("userNickname", ""); // 빈 값으로 전송하여 변경하지 않음
      formData.append("userBio", "");
      formData.append("userPassword", "");
      formData.append("userEmail", "");

      const response = await axios.put("/api/user", formData);

      if (response.data.success) {
        setMarketingConsent(consent);
        alert(
          consent
            ? "마케팅 정보 수신이 활성화되었습니다."
            : "마케팅 정보 수신이 비활성화되었습니다."
        );
      } else {
        alert("설정 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("마케팅 설정 업데이트 실패:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };

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

                {/* 마케팅 정보 수신 설정 */}
                <div className="notification-manager">
                  <div className="notification-controls">
                    <p className="notice">
                      마케팅 정보: 새로운 기능, 이벤트, 프로모션 소식을 이메일로
                      받아보실 수 있습니다.
                    </p>
                    <div className="toggle-container">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={marketingConsent}
                          onChange={(e) =>
                            updateMarketingConsent(e.target.checked)
                          }
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 알림 목록은 항상 표시하도록 변경 */}
              <div className="notification-list-section">
                <NotificationList isUserId={isUserId} limit={50} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </sub>
  );
}
