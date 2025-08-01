"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Logo() {
  const [logoUrl, setLogoUrl] = useState<string>("/logo.png");
  const [siteName, setSiteName] = useState<string>("Tokti");

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch("/api/site/settings");
        const result = await response.json();

        if (result.success && result.data) {
          setLogoUrl(result.data.logo_url || "/logo.png");
          setSiteName(result.data.site_name || "Tokti");
        }
      } catch (error) {
        console.error("사이트 설정 로딩 실패:", error);
        // 에러 시 기본값 유지
      }
    };

    fetchSiteSettings();
  }, []);

  return <Image src={logoUrl} width={100} height={40} alt={`${siteName} Logo`} priority />;
}
