"use client";

import { useState, useEffect } from "react";
import TiptapViewer from "@/components/tiptapViewer";

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
      <div className="policy-page">
        <div className="policy-container">
          <h1>이용약관</h1>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="policy-page">
      <div className="policy-container">
        <h1>이용약관</h1>
        <div className="policy-content">
          <TiptapViewer content={content} />
        </div>
        <div className="policy-footer">
          <p>최종 업데이트: {new Date().toLocaleDateString("ko-KR")}</p>
        </div>
      </div>
    </div>
  );
}
