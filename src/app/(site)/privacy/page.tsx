"use client";

import { useState, useEffect } from "react";

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const fetchPrivacyPolicy = async () => {
    try {
      const response = await fetch("/api/admin/community/privacy");
      if (response.ok) {
        const data = await response.json();
        setContent(data.content || "개인정보처리방침이 아직 설정되지 않았습니다.");
      } else {
        setContent("개인정보처리방침을 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("개인정보처리방침 불러오기 실패:", error);
      setContent("개인정보처리방침을 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='policy-page'>
        <div className='policy-container'>
          <h1>개인정보처리방침</h1>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='policy-page'>
      <div className='policy-container'>
        <h1>개인정보처리방침</h1>
        <div className='policy-content'>
          {content.split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <div className='policy-footer'>
          <p>최종 업데이트: {new Date().toLocaleDateString("ko-KR")}</p>
        </div>
      </div>

      <style jsx>{`
        .policy-page {
          min-height: 100vh;
          background: #f8f9fa;
          padding: 40px 20px;
        }

        .policy-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        h1 {
          color: #333;
          border-bottom: 2px solid #007bff;
          padding-bottom: 15px;
          margin-bottom: 30px;
          font-size: 28px;
        }

        .policy-content {
          line-height: 1.8;
          color: #555;
          margin-bottom: 30px;
        }

        .policy-content p {
          margin-bottom: 16px;
        }

        .policy-footer {
          border-top: 1px solid #eee;
          padding-top: 20px;
          text-align: right;
          color: #777;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
