"use client";

import { useState, useEffect } from "react";
import TiptapViewer from "../../components/tiptapViewer";

export default function TermsOfServicePage() {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchTermsOfService();
  }, []);

  const fetchTermsOfService = async () => {
    try {
      const response = await fetch("/api/admin/community/terms");
      if (response.ok) {
        const data = await response.json();
        setContent(data.content || "이용약관이 아직 설정되지 않았습니다.");
      } else {
        setContent("이용약관을 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("이용약관 불러오기 실패:", error);
      setContent("이용약관을 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`policy-page `}>
        <div className='policy-container'>
          <h1>이용약관</h1>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`policy-page `}>
      <div className='policy-container'>
        <h1>이용약관</h1>
        <div className='policy-content'>
          <TiptapViewer content={content} />
        </div>
        <div className='policy-footer'>
          <p>최종 업데이트: {new Date().toLocaleDateString("ko-KR")}</p>
        </div>
      </div>

      <style jsx>{`
        .policy-page {
          min-height: 100vh;
          background: var(--bg-primary);
          padding: 40px 20px;
          transition: background-color 0.3s ease;
        }

        .policy-page.dark {
          --bg-primary: #1a1a1a;
          --bg-secondary: #2d2d2d;
          --text-primary: #ffffff;
          --text-secondary: #b0b0b0;
          --border-color: #404040;
          --accent-color: #4a9eff;
        }

        .policy-page:not(.dark) {
          --bg-primary: #f8f9fa;
          --bg-secondary: #ffffff;
          --text-primary: #333333;
          --text-secondary: #555555;
          --border-color: #eeeee;
          --accent-color: #007bff;
        }

        .policy-container {
          max-width: 800px;
          margin: 0 auto;
          background: var(--bg-secondary);
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        h1 {
          color: var(--text-primary);
          border-bottom: 2px solid var(--accent-color);
          padding-bottom: 15px;
          margin-bottom: 30px;
          font-size: 28px;
        }

        .policy-content {
          line-height: 1.8;
          color: var(--text-secondary);
          margin-bottom: 30px;
        }

        .policy-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 20px;
          text-align: right;
          color: var(--text-secondary);
          font-size: 14px;
        }

        :global(.ProseMirror) {
          color: var(--text-secondary) !important;
        }

        :global(.ProseMirror h1),
        :global(.ProseMirror h2),
        :global(.ProseMirror h3),
        :global(.ProseMirror h4),
        :global(.ProseMirror h5),
        :global(.ProseMirror h6) {
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
}
