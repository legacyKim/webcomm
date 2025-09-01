"use client";

import { useState, useEffect, useRef } from "react";

export default function SiteSettingsManage() {
  const [logoUrl, setLogoUrl] = useState<string>("");
  // const [siteName, setSiteName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/site/settings");
      const result = await response.json();

      if (result.success && result.data) {
        setLogoUrl(result.data.logo_url || "");
        // setSiteName(result.data.site_name || "");
      }
    } catch (error) {
      console.error("사이트 설정 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    // 이미지 파일만 허용
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "logo");

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setLogoUrl(result.fileUrl);
        alert("로고 파일이 업로드되었습니다!");
      } else {
        throw new Error(result.error || "업로드 실패");
      }
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      alert("파일 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/site/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logo_url: logoUrl,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("사이트 설정이 저장되었습니다.");
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
    <div className="admin_content_wrap">
      <div className="admin_title">
        <h4 className="">일반 설정</h4>

        <div className="admin_btn">
          <button onClick={handleSave} disabled={isSaving} className="save-btn">
            {isSaving ? "저장 중..." : "설정 저장"}
          </button>
        </div>
      </div>

      <div className="setting_group">
        <div className="setting_info">
          {/* 현재 로고 미리보기 */}
          {logoUrl && (
            <div className="logo-preview">
              <img src={logoUrl} alt="현재 로고" />
            </div>
          )}

          <div className="upload_section">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="upload-btn"
            >
              {isUploading ? "업로드 중..." : "로고 파일 선택"}
            </button>
            <p className="notice">JPG, PNG, GIF 파일 (최대 5MB)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
