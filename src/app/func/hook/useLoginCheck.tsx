"use client";

import { useAuth } from "@/AuthContext";
import { useRouter } from "next/navigation";

export function useLoginCheck() {
  const router = useRouter();
  const { isUserId } = useAuth();

  const loginCheck = () => {
    if (isUserId === 0) {
      const isConfirmed = confirm("로그인이 필요합니다.");
      if (isConfirmed) {
        router.push("/login");
      }
      return false;
    }
    return true;
  };

  return { loginCheck };
}
