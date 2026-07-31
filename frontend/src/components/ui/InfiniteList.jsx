import { useEffect, useRef, useCallback } from "react";
import { Spinner } from "./Spinner";

/**
 * InfiniteList
 * Props:
 *   onLoadMore  – () => void  called when sentinel enters viewport
 *   hasMore     – boolean
 *   isLoading   – boolean
 *   children    – the list content
 *   endMessage  – optional string (default "You've reached the end")
 */
export default function InfiniteList({
  onLoadMore,
  hasMore,
  isLoading,
  children,
  endMessage = "You've reached the end",
}) {
  const sentinelRef = useRef(null);

  const handleIntersect = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold: 0,
      rootMargin: "200px 0px",
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersect]);

  return (
    <div>
      {children}

      {/* Loading spinner */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner size="md" />
        </div>
      )}

      {/* Sentinel — hidden when no more pages */}
      {hasMore && !isLoading && (
        <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />
      )}

      {/* End message */}
      {!hasMore && !isLoading && (
        <p className="text-center text-slate-600 text-sm py-8">{endMessage}</p>
      )}
    </div>
  );
}
