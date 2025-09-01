"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues
const TiptapEditor = dynamic(
  () => import("@/admin/commonComponents/adminEditor"),
  {
    ssr: false,
  }
);

const CommSignupTerm: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchSignupTerms = async () => {
      try {
        const response = await fetch("/api/admin/community/signup-terms");
        if (response.ok) {
          const data = await response.json();
          setContent(data.content || "");
        }
      } catch (error) {
        console.error("회원가입약관 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignupTerms();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/community/signup-terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        alert("회원가입약관이 저장되었습니다.");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>회원가입약관 미리보기</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                max-width: 800px; 
                margin: 0 auto; 
                line-height: 1.6;
              }
              h1 { 
                color: #333; 
                border-bottom: 2px solid #eee; 
                padding-bottom: 10px; 
              }
              .content {
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <h1>회원가입약관 미리보기</h1>
            <div class="content">${content}</div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  return (
    <div className="admin_content_wrap">
      <div className="admin_title">
        <h4 className="">회원가입약관 관리</h4>
        <div className="admin_btn">
          <button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "저장 중..." : "저장"}
          </button>

          <button onClick={handlePreview}>미리보기</button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading_spinner_container">
          <div className="loading_spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      ) : (
        <TiptapEditor content={content} onChange={setContent} />
      )}
    </div>
  );
};

export default CommSignupTerm;
