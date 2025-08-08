"use client";

import { useCallback } from "react";

export function useLoadRecaptcha(setRecaptchaToken: (token: string) => void) {
  const loadRecaptcha = useCallback(() => {
    const isLocalEnvironment = process.env.NODE_ENV === "development";

    // 로컬 환경에서는 reCAPTCHA 건너뛰기
    if (isLocalEnvironment) {
      setRecaptchaToken("local-development-bypass");
      return;
    }

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
      console.error("reCAPTCHA site key 누락");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(siteKey, { action: "signup" })
            .then((token) => {
              setRecaptchaToken(token);
            })
            .catch((error) => {
              console.error("reCAPTCHA 토큰 생성 실패:", error);
            });
        });
      }
    };
    script.onerror = () => {
      console.error("reCAPTCHA 스크립트 로딩 실패");
    };
    document.head.appendChild(script);
  }, [setRecaptchaToken]);

  return loadRecaptcha;
}
