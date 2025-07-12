"use client";

import { useRouter } from "next/navigation";

export function useLoginCheck() {
  const router = useRouter();

  const loginCheck = async () => {
    try {
      const res = await fetch("/api/authCheck");
      const data = await res.json();

      // 토큰 만료
      if (res.status === 401) {
        return false;
      }

      if (!data.isAuthenticated) {
        const isConfirmed = confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?");
        if (isConfirmed) {
          router.push("/login");
        }
        return false;
      }
      return true;
    } catch (e) {
      console.error("인증 체크 실패", e);
      return false;
    }
  };

  return loginCheck;
}
