import { useEffect, useRef } from 'react';

export function useStickyState() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const sticky = stickyRef.current;

    if (!sentinel || !sticky) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        sticky.classList.toggle('is-stuck', !entry.isIntersecting);
      },
      {
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  return { sentinelRef, stickyRef };
}
