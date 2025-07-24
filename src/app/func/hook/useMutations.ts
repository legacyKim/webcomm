"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

// 옵티미스틱 업데이트를 위한 타입
interface OptimisticUpdateConfig<T> {
  queryKey: (string | number)[];
  updateData?: (oldData: T[], updatedItem: Partial<T> & { id: number }) => T[];
  removeData?: (oldData: T[], removedId: number) => T[];
}

// 멤버 권한 변경 뮤테이션
export function useMemberAuthorityMutation<T extends { id: number; authority: number }>() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, authority }: { memberId: number; authority: number }) => {
      const response = await fetch("/api/admin/members/authority", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, authority }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "권한 변경 실패");
      }

      return response.json();
    },
    onMutate: async ({ memberId, authority }) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ["members"] });

      // 이전 데이터 스냅샷 저장
      const previousData = queryClient.getQueryData(["members"]);

      // 옵티미스틱 업데이트
      queryClient.setQueriesData({ queryKey: ["members"] }, (old: any) => {
        if (!old?.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((member: T) => (member.id === memberId ? { ...member, authority } : member)),
          })),
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // 에러 시 이전 데이터로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(["members"], context.previousData);
      }
    },
    onSettled: () => {
      // 성공/실패와 관계없이 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

// 멤버 삭제 뮤테이션
export function useMemberDeleteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: number) => {
      const response = await fetch("/api/admin/members/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "회원 삭제 실패");
      }

      return response.json();
    },
    onSuccess: () => {
      // 성공 시 멤버 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

// 멤버 제한 설정 뮤테이션
export function useMemberRestrictionMutation<
  T extends { id: number; restriction_until?: string | null; authority: number },
>() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      restrictionUntil,
      reason,
    }: {
      memberId: number;
      restrictionUntil: string | null;
      reason?: string;
    }) => {
      const response = await fetch("/api/admin/members/restriction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, restrictionUntil, reason }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "제한 설정 실패");
      }

      return response.json();
    },
    onMutate: async ({ memberId, restrictionUntil }) => {
      await queryClient.cancelQueries({ queryKey: ["members"] });
      const previousData = queryClient.getQueryData(["members"]);

      // 옵티미스틱 업데이트
      queryClient.setQueriesData({ queryKey: ["members"] }, (old: any) => {
        if (!old?.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((member: T) =>
              member.id === memberId
                ? {
                    ...member,
                    restriction_until: restrictionUntil,
                    authority: restrictionUntil ? 3 : 1, // 제한 시 정지회원(3), 해제 시 일반회원(1)
                  }
                : member,
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["members"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

// 통계 업데이트 뮤테이션
export function useStatsUpdateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/members/update-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("통계 업데이트에 실패했습니다.");
      }

      return response.json();
    },
    onSuccess: () => {
      // 성공 시 모든 관련 쿼리 새로고침
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}
