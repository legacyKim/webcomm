"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useRef, useEffect } from "react";

interface InfiniteQueryResult<T> {
  data: T[];
  hasMore: boolean;
}

interface UseInfiniteScrollQueryProps<T> {
  queryKey: (string | number)[];
  queryFn: (page: number, limit: number) => Promise<InfiniteQueryResult<T>>;
  limit?: number;
  staleTime?: number;
  gcTime?: number;
  enabled?: boolean;
}

export function useInfiniteScrollQuery<T>({
  queryKey,
  queryFn,
  limit = 20,
  staleTime = 5 * 60 * 1000, // 5분
  gcTime = 10 * 60 * 1000, // 10분
  enabled = true,
}: UseInfiniteScrollQueryProps<T>) {
  // 스크롤 위치 저장용
  const scrollPositionRef = useRef<number>(0);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => queryFn(pageParam, limit),
    getNextPageParam: (lastPage, pages) => (lastPage.hasMore ? pages.length + 1 : undefined),
    initialPageParam: 1,
    staleTime,
    gcTime,
    enabled,
    // 구조적 공유로 불필요한 리렌더링 방지
    structuralSharing: true,
  });

  // 평면화된 데이터
  const flatData = data?.pages.flatMap((page) => page.data) ?? [];

  // 스크롤 위치 저장
  const saveScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;
    }
  }, []);

  // 스크롤 위치 복원
  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== "undefined" && scrollPositionRef.current > 0) {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current);
      });
    }
  }, []);

  // 새 데이터 로딩 전에 스크롤 위치 저장
  useEffect(() => {
    if (isFetchingNextPage) {
      saveScrollPosition();
    }
  }, [isFetchingNextPage, saveScrollPosition]);

  // 데이터 로딩 완료 후 스크롤 위치 복원
  useEffect(() => {
    if (!isFetchingNextPage && flatData.length > 0) {
      // 짧은 지연 후 스크롤 위치 복원 (DOM 업데이트 완료 대기)
      const timer = setTimeout(() => {
        restoreScrollPosition();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isFetchingNextPage, flatData.length, restoreScrollPosition]);

  // Intersection Observer 설정
  const observer = useRef<IntersectionObserver>();
  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            // 스크롤 위치 저장 후 다음 페이지 로드
            saveScrollPosition();
            fetchNextPage();
          }
        },
        {
          rootMargin: "200px", // 더 일찍 로딩 시작
          threshold: 0.1,
        },
      );

      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage, saveScrollPosition],
  );

  return {
    data: flatData as T[],
    loading: isLoading,
    loadingMore: isFetchingNextPage,
    hasMore: hasNextPage,
    error: error?.message || null,
    lastElementRef,
    refresh: refetch,
    loadMore: fetchNextPage,
  };
}

// 단일 페이지 쿼리용 훅
interface UseQueryProps<T> {
  queryKey: (string | number)[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  gcTime?: number;
  enabled?: boolean;
}

export function useQueryData<T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000,
  gcTime = 10 * 60 * 1000,
  enabled = true,
}: UseQueryProps<T>) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn,
    staleTime,
    gcTime,
    enabled,
  });

  return {
    data,
    loading: isLoading,
    error: error?.message || null,
    refresh: refetch,
  };
}
