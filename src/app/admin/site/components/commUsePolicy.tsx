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

const CommUsePolicy: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await fetch("/api/admin/community/policy");
        if (response.ok) {
          const data = await response.json();
          setContent(data.content || "");
        }
      } catch (error) {
        console.error("개인정보처리방침 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicy();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/community/policy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        alert("개인정보처리방침이 저장되었습니다.");
      } else {
        alert("저장에 실패했습니다.");
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
            <title>개인정보처리방침 미리보기</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
            </style>
          </head>
          <body>
            <h1>개인정보처리방침 미리보기</h1>
            <div>${content}</div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  return (
    <div className="admin_content_wrap">
      <div className="admin_title">
        <h4 className="">개인정보처리방침 관리</h4>
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

export default CommUsePolicy;
