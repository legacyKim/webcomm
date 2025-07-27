"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// 무한 스크롤 훅
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
  const [isInitialized, setIsInitialized] = useState(false);

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
          rootMargin: "100px", // 요소가 100px 전에 미리 로딩 시작
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
        return [...prevData, ...result.data];
      });

      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터 로딩 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, loading, hasMore]); // fetchFunction 의존성 제거

  useEffect(() => {
    // 초기화가 완료된 후에만 로딩 시작
    if (isInitialized) {
      loadMore();
    }
  }, [page, isInitialized]);

  const refresh = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setIsInitialized(false); // 초기화 플래그 리셋
    // 캐시 클리어
    if (typeof window !== "undefined") {
      const keys = Object.keys(sessionStorage);
      keys.forEach((key) => {
        if (key.startsWith("infiniteScroll-")) {
          sessionStorage.removeItem(key);
        }
      });
    }
  }, []);

  // 초기 데이터 로딩 및 캐시 복원
  useEffect(() => {
    if (typeof window !== "undefined" && queryKey && !isInitialized) {
      const cacheKey = `infiniteScroll-${queryKey.join("-")}`;
      const savedData = sessionStorage.getItem(cacheKey);

      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.data && Array.isArray(parsed.data) && parsed.data.length > 0) {
            // 캐시된 데이터가 5분 이내인 경우만 사용
            if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
              setData(parsed.data);
              setPage(parsed.page || 1);
              setHasMore(parsed.hasMore !== false);
              setIsInitialized(true);
              return; // 캐시 데이터 사용 시 초기 로딩 건너뛰기
            }
          }
        } catch {
          // 파싱 에러 시 무시하고 일반 로딩 진행
        }
      }

      // 캐시가 없거나 만료된 경우 초기 로딩
      setIsInitialized(true);
    }
  }, [queryKey, isInitialized]);

  // 데이터 변경 시 sessionStorage에 저장
  useEffect(() => {
    if (typeof window !== "undefined" && data.length > 0 && queryKey) {
      const cacheKey = `infiniteScroll-${queryKey.join("-")}`;
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          data,
          page,
          hasMore,
          timestamp: Date.now(),
        }),
      );
    }
  }, [data, page, hasMore, queryKey]);

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

// 무한 스크롤 컨테이너 컴포넌트
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
        return (
          <div key={index} ref={isLast ? lastElementRef : null} className='scroll-item'>
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
