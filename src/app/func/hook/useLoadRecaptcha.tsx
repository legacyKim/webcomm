"use client";

import { useCallback } from "react";

export function useLoadRecaptcha(setRecaptchaToken: (token: string) => void) {
  const loadRecaptcha = useCallback(() => {
    const siteKey = process.env.RECAPTCHA_SITE_KEY;
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
            });
        });
      }
    };
    document.head.appendChild(script);
  }, [setRecaptchaToken]);

  return loadRecaptcha;
}
