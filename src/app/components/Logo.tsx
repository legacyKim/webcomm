"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Logo() {
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [siteName, setSiteName] = useState<string>("Tokti");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch("/api/site/settings");
        const result = await response.json();

        if (result.success && result.data) {
          setLogoUrl(result.data.logo_url || "");
          setSiteName(result.data.site_name || "Tokti");
        }
      } catch (error) {
        console.error("사이트 설정 로딩 실패:", error);
        setLogoUrl("");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteSettings();
  }, []);

  // 로딩 중이거나 로고 URL이 없거나 이미지 에러가 있으면 빈 공간 또는 사이트명 표시
  if (isLoading || !logoUrl || imageError) {
    return (
      <div
        className='logo-placeholder'
        style={{
          width: 100,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-primary, #333)",
          fontSize: "16px",
          fontWeight: "bold",
          transition: "color 0.3s ease",
        }}>
        {!isLoading && siteName}
      </div>
    );
  }

  return (
    <Image
      src={logoUrl}
      width={100}
      height={40}
      alt={`${siteName} Logo`}
      priority
      onError={() => {
        setImageError(true);
      }}
    />
  );
}
