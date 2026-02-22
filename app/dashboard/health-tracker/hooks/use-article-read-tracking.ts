import { useEffect, useRef } from 'react';

interface UseArticleReadTrackingProps {
  articleId: string;
  onRead: (articleId: string) => void;
  threshold?: number; // 0.0 to 1.0 — доля прокрутки контента
  enabled?: boolean;
}

// Возвращает ближайший родитель с реальным скроллом (scrollHeight > clientHeight)
function getScrollParent(element: HTMLElement): HTMLElement | Window {
  let parent = element.parentElement;
  while (parent && parent !== document.body) {
    const { overflow, overflowY } = window.getComputedStyle(parent);
    const isScrollable = /auto|scroll/.test(overflow) || /auto|scroll/.test(overflowY);
    if (isScrollable && parent.scrollHeight > parent.clientHeight + 1) {
      return parent;
    }
    parent = parent.parentElement;
  }
  // Fallback: window — только если страница реально скроллируется
  return window;
}

export function useArticleReadTracking({
  articleId,
  onRead,
  threshold = 0.8,
  enabled = true,
}: UseArticleReadTrackingProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const hasMarkedAsRead = useRef(false);

  useEffect(() => {
    if (!enabled || !articleId) return;
    hasMarkedAsRead.current = false;

    let scrollParent: HTMLElement | Window | null = null;
    let cleanup: (() => void) | null = null;

    const setup = () => {
      if (!elementRef.current || hasMarkedAsRead.current) return;

      scrollParent = getScrollParent(elementRef.current);

      const getProgress = (): number => {
        if (!scrollParent) return 0;

        let scrollTop: number;
        let scrollHeight: number;
        let clientHeight: number;

        if (scrollParent instanceof Window) {
          scrollTop = window.scrollY;
          scrollHeight = document.documentElement.scrollHeight;
          clientHeight = window.innerHeight;
        } else {
          scrollTop = (scrollParent as HTMLElement).scrollTop;
          scrollHeight = (scrollParent as HTMLElement).scrollHeight;
          clientHeight = (scrollParent as HTMLElement).clientHeight;
        }

        const scrollable = scrollHeight - clientHeight;
        // Если нет места для скролла — прогресс 0 (не авто-срабатывает)
        if (scrollable <= 1) return 0;
        return scrollTop / scrollable;
      };

      const checkProgress = () => {
        if (hasMarkedAsRead.current) return;
        if (getProgress() >= threshold) {
          hasMarkedAsRead.current = true;
          onRead(articleId);
          scrollParent?.removeEventListener('scroll', checkProgress);
        }
      };

      scrollParent.addEventListener('scroll', checkProgress, { passive: true });

      cleanup = () => scrollParent?.removeEventListener('scroll', checkProgress);
    };

    // Даём статье время отрендериться и layout'у устояться
    const timer = setTimeout(setup, 500);

    return () => {
      clearTimeout(timer);
      cleanup?.();
    };
  }, [articleId, onRead, threshold, enabled]);

  return { elementRef };
}
