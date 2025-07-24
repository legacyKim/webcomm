"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

interface InfiniteQueryResult<T> {
  data: T[];
  hasMore: boolean;
}

interface UseProgressiveInfiniteScrollProps<T> {
  queryKey: (string | number)[];
  queryFn: (page: number, limit: number) => Promise<InfiniteQueryResult<T>>;
  limit?: number;
  staleTime?: number;
  gcTime?: number;
  enabled?: boolean;
}

// 점진적 DOM 추가를 위한 무한 스크롤 훅
export const useProgressiveInfiniteScroll = <T,>({
  queryKey,
  queryFn,
  limit = 20,
  staleTime = 5 * 60 * 1000,
  gcTime = 10 * 60 * 1000,
  enabled = true,
}: UseProgressiveInfiniteScrollProps<T>) => {
  // 점진적으로 관리할 로컬 상태
  const [localData, setLocalData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // React Query의 장점을 살리기 위한 백그라운드 캐싱
  const {
    data: queryData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error: queryError,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => queryFn(pageParam, limit),
    getNextPageParam: (lastPage, pages) => (lastPage.hasMore ? pages.length + 1 : undefined),
    initialPageParam: 1,
    staleTime,
    gcTime,
    enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // React Query 데이터를 점진적으로 로컬 상태에 동기화
  useEffect(() => {
    if (queryData?.pages) {
      const allData = queryData.pages.flatMap((page) => page.data);

      // 새로운 데이터만 추가 (기존 데이터는 유지)
      setLocalData((prevData) => {
        if (prevData.length === 0) {
          // 첫 로드이거나 새로고침 시 전체 데이터 설정
          return allData;
        } else if (allData.length > prevData.length) {
          // 새 데이터가 있을 때만 추가
          const newItems = allData.slice(prevData.length);
          return [...prevData, ...newItems];
        }
        return prevData;
      });

      // hasMore 상태 업데이트
      const lastPage = queryData.pages[queryData.pages.length - 1];
      setHasMore(lastPage?.hasMore ?? false);
    }
  }, [queryData]);

  // 에러 상태 동기화
  useEffect(() => {
    setError(queryError?.message || null);
  }, [queryError]);

  // 로딩 상태 동기화
  useEffect(() => {
    setLoading(isLoading || isFetchingNextPage);
  }, [isLoading, isFetchingNextPage]);

  // Intersection Observer 설정
  const observer = useRef<IntersectionObserver>();
  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            setCurrentPage((prev) => prev + 1);
            fetchNextPage();
          }
        },
        {
          rootMargin: "100px",
          threshold: 0.1,
        },
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  // 새로고침 함수
  const refresh = useCallback(() => {
    setLocalData([]);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    refetch();
  }, [refetch]);

  // setData 함수 (기존 코드와의 호환성을 위해)
  const setData = useCallback((updater: (prevData: T[]) => T[]) => {
    setLocalData(updater);
  }, []);

  return {
    data: localData,
    loading,
    hasMore,
    error,
    lastElementRef,
    refresh,
    setData,
  };
};

// 기존 useInfiniteScroll 훅 (Toast.tsx 방식 - sessionStorage 제거)
export const useInfiniteScroll = <T,>(
  fetchFunction: (page: number, limit: number) => Promise<{ data: T[]; hasMore: boolean }>,
  limit: number = 20,
  queryKey?: string[],
) => {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFunctionRef = useRef(fetchFunction);
  fetchFunctionRef.current = fetchFunction;

  const observer = useRef<IntersectionObserver>();
  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prevPage) => prevPage + 1);
          }
        },
        {
          rootMargin: "100px",
          threshold: 0.1,
        },
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunctionRef.current(page, limit);

      setData((prevData) => {
        if (page === 1) {
          return result.data;
        }
        // 점진적으로 새 데이터만 추가
        return [...prevData, ...result.data];
      });

      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터 로딩 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, loading, hasMore]);

  useEffect(() => {
    loadMore();
  }, [page]);

  const refresh = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  return {
    data,
    loading,
    hasMore,
    error,
    lastElementRef,
    refresh,
    setData,
  };
};

// 로딩 스피너 컴포넌트
export const LoadingSpinner = ({ size = "medium" }: { size?: "small" | "medium" | "large" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div className='loading-spinner'>
      <div className={`spinner ${sizeClasses[size]}`}></div>

      <style jsx>{`
        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .spinner {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

// 에러 메시지 컴포넌트
export const ErrorMessage = ({ message, onRetry }: { message: string; onRetry?: () => void }) => {
  return (
    <div className='error-message'>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className='retry-button'>
          다시 시도
        </button>
      )}

      <style jsx>{`
        .error-message {
          text-align: center;
          padding: 20px;
          color: #e74c3c;
          background-color: #fdf2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          margin: 10px 0;
        }

        .retry-button {
          margin-top: 10px;
          padding: 8px 16px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .retry-button:hover {
          background-color: #2980b9;
        }
      `}</style>
    </div>
  );
};

// 무한 스크롤 컨테이너 컴포넌트 (점진적 렌더링)
interface InfiniteScrollContainerProps<T> {
  data: T[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  lastElementRef: (node: HTMLElement | null) => void;
  onRetry: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  loadingComponent?: React.ReactNode;
}

export const InfiniteScrollContainer = <T,>({
  data,
  loading,
  hasMore,
  error,
  lastElementRef,
  onRetry,
  renderItem,
  emptyMessage = "데이터가 없습니다.",
  loadingComponent,
}: InfiniteScrollContainerProps<T>) => {
  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (data.length === 0 && !loading) {
    return (
      <div className='empty-message'>
        <p>{emptyMessage}</p>

        <style jsx>{`
          .empty-message {
            text-align: center;
            padding: 40px 20px;
            color: #666;
            background-color: #f8f9fa;
            border-radius: 6px;
            margin: 20px 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className='infinite-scroll-container'>
      {data.map((item, index) => {
        const isLast = index === data.length - 1;
        // 안정적인 key 생성 (id가 있으면 사용, 없으면 index)
        const itemKey = (item as any)?.id !== undefined ? `item-${(item as any).id}` : `index-${index}`;
        return (
          <div key={itemKey} ref={isLast ? lastElementRef : null} className='scroll-item'>
            {renderItem(item, index)}
          </div>
        );
      })}

      {loading && (loadingComponent || <LoadingSpinner />)}

      {!hasMore && data.length > 0 && (
        <div className='end-message'>
          <p>모든 데이터를 불러왔습니다.</p>
        </div>
      )}

      <style jsx>{`
        .infinite-scroll-container {
          width: 100%;
        }

        .scroll-item {
          margin-bottom: 1px;
        }

        .end-message {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 14px;
          border-top: 1px solid #eee;
        }
      `}</style>
    </div>
  );
};
