import { useEffect, useRef } from 'react';

interface UseArticleReadTrackingProps {
  articleId: string;
  onRead: (articleId: string) => void;
  threshold?: number; // 0.0 to 1.0
  enabled?: boolean;
}

export function useArticleReadTracking({
  articleId,
  onRead,
  threshold = 0.9,
  enabled = true,
}: UseArticleReadTrackingProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const hasMarkedAsRead = useRef(false);

  useEffect(() => {
    if (!enabled || !articleId || hasMarkedAsRead.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasMarkedAsRead.current) {
          hasMarkedAsRead.current = true;
          onRead(articleId);
          
          // Cleanup after marking as read
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      },
      {
        threshold: threshold,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [articleId, onRead, threshold, enabled]);

  return { elementRef };
}
