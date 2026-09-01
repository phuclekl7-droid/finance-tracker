'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Giữ component render thêm `delayMs` sau khi `show` chuyển sang false,
 * đủ để chạy exit animation, rồi mới unmount thật.
 * Trả về `{ mounted, phase }` — phase là 'entering' | 'exiting'.
 */
export function useDelayedUnmount(show: boolean, delayMs = 280) {
  const [mounted, setMounted] = useState(show);
  const [phase, setPhase] = useState<'entering' | 'exiting'>(show ? 'entering' : 'exiting');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (show) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMounted(true);
      // Cần chờ mount xong mới set phase entering để animation chạy
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase('entering'));
      });
    } else if (mounted) {
      setPhase('exiting');
      timerRef.current = setTimeout(() => {
        setMounted(false);
      }, delayMs);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, delayMs]);

  return { mounted, phase };
}