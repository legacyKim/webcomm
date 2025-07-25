"use client";

import { useState, useEffect } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";

interface SiteSettings {
  id: number;
  logo_url: string | null;
  site_name: string | null;
}

export default function SiteSettingsManage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [siteName, setSiteName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/site/settings");
      const result = await response.json();

      if (result.success && result.data) {
        setSettings(result.data);
        setLogoUrl(result.data.logo_url || "");
        setSiteName(result.data.site_name || "");
      }
    } catch (error) {
      console.error("사이트 설정 로딩 실패:", error);
    } finally {
      setIsLoading(false);
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
          site_name: siteName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("사이트 설정이 저장되었습니다.");
        setSettings(result.data);
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
    <div className='site-settings-manage'>
      <h2>사이트 설정 관리</h2>

      <div className='setting-group'>
        <label htmlFor='siteName'>사이트 이름:</label>
        <input
          id='siteName'
          type='text'
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder='사이트 이름을 입력하세요'
        />
      </div>

      <div className='setting-group'>
        <label htmlFor='logoUrl'>로고 URL:</label>
        <input
          id='logoUrl'
          type='text'
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder='로고 이미지 URL을 입력하세요'
        />

        {logoUrl && (
          <div className='logo-preview'>
            <p>미리보기:</p>
            <img src={logoUrl} alt='로고 미리보기' style={{ maxWidth: "200px", height: "auto" }} />
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={isSaving} className='save-btn'>
        {isSaving ? "저장 중..." : "설정 저장"}
      </button>

      <style jsx>{`
        .site-settings-manage {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .setting-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .logo-preview {
          margin-top: 10px;
          padding: 10px;
          border: 1px solid #eee;
          border-radius: 4px;
          background-color: #f9f9f9;
        }

        .save-btn {
          background-color: #007bff;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        .save-btn:hover {
          background-color: #0056b3;
        }

        .save-btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
