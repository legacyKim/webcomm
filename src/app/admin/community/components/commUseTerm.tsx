"use client";

import { useState, useEffect } from "react";

export default function CommUseTerm() {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // 현재 이용약관 불러오기
  useEffect(() => {
    fetchTermsOfService();
  }, []);

  const fetchTermsOfService = async () => {
    try {
      const response = await fetch("/api/admin/community/terms");
      if (response.ok) {
        const data = await response.json();
        setContent(data.content || "");
      }
    } catch (error) {
      console.error("이용약관 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 이용약관 저장
  const handleSave = async () => {
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/community/terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("저장에 실패했습니다.");
      }

      alert("이용약관이 성공적으로 저장되었습니다.");
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 미리보기
  const handlePreview = () => {
    const previewWindow = window.open("", "_blank", "width=800,height=600");
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>이용약관 미리보기</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            </style>
          </head>
          <body>
            <h1>이용약관</h1>
            <div>${content.replace(/\n/g, "<br>")}</div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  if (isLoading) {
    return (
      <div className='admin_content_wrap'>
        <div className='admin_title'>
          <h4>이용약관 변경</h4>
        </div>
        <div className='admin_content'>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='admin_content_wrap'>
      <div className='admin_title'>
        <h4>이용약관 변경</h4>
      </div>
      <div className='admin_content'>
        <div className='policy-editor'>
          <div className='editor-toolbar'>
            <button onClick={handlePreview} className='preview-btn'>
              미리보기
            </button>
            <button onClick={handleSave} disabled={isSaving} className='save-btn'>
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder='이용약관 내용을 입력하세요...'
            className='policy-textarea'
            rows={20}
          />

          <div className='editor-info'>
            <p>* 이용약관은 사이트 footer에서 확인할 수 있습니다.</p>
            <p>* 변경 사항은 즉시 사이트에 반영됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
