"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useRef, useMemo } from "react";

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
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => queryFn(pageParam, limit),
    getNextPageParam: (lastPage, pages) => (lastPage.hasMore ? pages.length + 1 : undefined),
    initialPageParam: 1,
    staleTime,
    gcTime,
    enabled,
    // 새로고침 시에도 데이터 유지하도록 설정
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // 평면화된 데이터 - useMemo로 최적화
  const flatData = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  // Intersection Observer 설정 - 스크롤 점프 방지를 위해 단순화
  const observer = useRef<IntersectionObserver>();
  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        {
          rootMargin: "100px", // 적당한 미리 로딩
          threshold: 0.1,
        },
      );

      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
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
