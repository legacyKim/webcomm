"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface LogoProps {
  siteSettings?: {
    id: number;
    logo_url: string | null;
    site_name: string | null;
    created_at: Date;
    updated_at: Date;
  } | null;
}

export default function Logo({ siteSettings }: LogoProps) {
  const [imageError, setImageError] = useState<boolean>(false);

  // SSR로 받은 데이터가 있으면 사용하고, 없으면 클라이언트에서 로딩
  const [logoUrl, setLogoUrl] = useState<string>(siteSettings?.logo_url || "");
  const [siteName, setSiteName] = useState<string>(siteSettings?.site_name || "Tokti");
  const [isLoading, setIsLoading] = useState<boolean>(!siteSettings);

  useEffect(() => {
    // SSR 데이터가 없는 경우에만 클라이언트에서 로딩
    if (!siteSettings) {
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
    }
  }, [siteSettings]);

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
