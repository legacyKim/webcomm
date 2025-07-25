"use client";

import { useState, useEffect } from "react";

export default function CommSignupTerm() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSignupTerm();
  }, []);

  const fetchSignupTerm = async () => {
    try {
      const response = await fetch("/api/admin/signup-term");
      const result = await response.json();

      if (result.success && result.data) {
        setContent(result.data.content || "");
      }
    } catch (error) {
      console.error("회원가입약관 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/signup-term", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const result = await response.json();

      if (result.success) {
        alert("회원가입약관이 저장되었습니다.");
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

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className='signup-term-manage'>
      <h2>회원가입약관 관리</h2>

      <div className='content-section'>
        <label htmlFor='signupTermContent'>회원가입약관 내용:</label>
        <textarea
          id='signupTermContent'
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder='회원가입약관 내용을 입력하세요...'
          rows={20}
        />
      </div>

      <button onClick={handleSave} disabled={isSaving} className='save-btn'>
        {isSaving ? "저장 중..." : "저장"}
      </button>

      <style jsx>{`
        .signup-term-manage {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .content-section {
          margin-bottom: 20px;
        }

        .content-section label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #333;
        }

        .content-section textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          min-height: 400px;
        }

        .save-btn {
          padding: 12px 24px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
        }

        .save-btn:hover:not(:disabled) {
          background-color: #218838;
        }

        .save-btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
