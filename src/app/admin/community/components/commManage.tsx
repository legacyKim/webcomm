"use client";

import { useState, useRef } from "react";

export default function CommManage() {
  const [currentLogo, setCurrentLogo] = useState<string>("/logo.png");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 로고 업로드 처리
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await fetch("/api/admin/community/logo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("로고 업로드에 실패했습니다.");
      }

      const result = await response.json();
      setCurrentLogo(result.logoUrl);
      alert("로고가 성공적으로 변경되었습니다.");
    } catch (error) {
      console.error("Logo upload error:", error);
      alert("로고 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='admin_content_wrap'>
      <div className='admin_title'>
        <h4>커뮤니티 관리</h4>
      </div>
      <div className='admin_content'>
        <div className='logo-management'>
          <div className='current-logo'>
            <h5>현재 로고</h5>
            <img
              src={currentLogo}
              alt='현재 로고'
              className='logo-preview'
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logo.png";
              }}
            />
          </div>

          <div className='logo-upload'>
            <h5>로고 변경</h5>
            <div className='upload-area'>
              <input
                type='file'
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept='image/*'
                style={{ display: "none" }}
              />
              <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className='upload-btn'>
                {isUploading ? "업로드 중..." : "로고 파일 선택"}
              </button>
              <p className='upload-info'>권장 크기: 200x60px, 파일 형식: JPG, PNG, SVG (최대 5MB)</p>
            </div>
          </div>

          <div className='logo-reset'>
            <button
              onClick={() => {
                setCurrentLogo("/logo.png");
                alert("기본 로고로 변경되었습니다.");
              }}
              className='reset-btn'>
              기본 로고로 복원
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
