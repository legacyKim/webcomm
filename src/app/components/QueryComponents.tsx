"use client";

import React, { useRef, useEffect } from "react";

// 로딩 스피너 컴포넌트
export const LoadingSpinner = ({
  size = "medium",
}: {
  size?: "small" | "medium" | "large";
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div className="loading-spinner">
      <div className={`spinner ${sizeClasses[size]}`}></div>
    </div>
  );
};

// 에러 메시지 컴포넌트
export const ErrorMessage = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => {
  return (
    <div className="error-message">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          다시 시도
        </button>
      )}
    </div>
  );
};

// React Query 기반 무한 스크롤 컨테이너 - 스크롤 점프 방지 버전
interface QueryInfiniteScrollContainerProps<T> {
  data: T[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  lastElementRef: (node: HTMLElement | null) => void;
  onRetry: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  loadingComponent?: React.ReactNode;
}

export const QueryInfiniteScrollContainer = <T,>({
  data,
  loading,
  loadingMore,
  hasMore,
  error,
  lastElementRef,
  onRetry,
  renderItem,
  emptyMessage = "데이터가 없습니다.",
  loadingComponent,
}: QueryInfiniteScrollContainerProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousDataLengthRef = useRef(0);

  // 스크롤 위치 유지를 위한 effect
  useEffect(() => {
    if (
      data.length > previousDataLengthRef.current &&
      previousDataLengthRef.current > 0
    ) {
      // 새 데이터가 추가되었을 때 스크롤 위치 유지
      const container = containerRef.current;
      if (container) {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;

        // 다음 프레임에서 스크롤 위치 복원
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          const heightDiff = newScrollHeight - scrollHeight;
          container.scrollTop = scrollTop + heightDiff;
        });
      }
    }
    previousDataLengthRef.current = data.length;
  }, [data.length]);

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (data.length === 0 && loading) {
    return loadingComponent || <LoadingSpinner />;
  }

  if (data.length === 0 && !loading) {
    return (
      <div className="empty-message">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="infinite-scroll-container">
      {data.map((item, index) => {
        const isLast = index === data.length - 1;
        // 안정적인 key 생성
        const itemKey =
          (item as Record<string, unknown>)?.id !== undefined
            ? `item-${(item as Record<string, unknown>).id}`
            : `index-${index}`;
        return (
          <div
            key={itemKey}
            ref={isLast ? lastElementRef : null}
            className="scroll-item"
            // 추가 안정성을 위한 고유 식별자
            data-index={index}
          >
            {renderItem(item, index)}
          </div>
        );
      })}

      {loadingMore && (
        <div className="loading-more">
          {loadingComponent || <LoadingSpinner size="small" />}
        </div>
      )}

      {!hasMore && data.length > 0 && (
        <div className="end-message">
          <p>모든 데이터를 불러왔습니다.</p>
        </div>
      )}
    </div>
  );
};
