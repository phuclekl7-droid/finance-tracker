'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Giữ component render thêm `delayMs` sau khi `show` chuyển sang false,
 * đủ để chạy exit animation, rồi mới unmount thật.
 *
 * Quan trọng chống flash: khi show false→true, phải set mounted + phase='entering'
 * trong CÙNG một lần render (React batch), để element được chèn vào DOM đã mang
 * class animation mở ngay từ khung hình đầu tiên — không render pha "đóng" trước.
 */
export function useDelayedUnmount(show: boolean, delayMs = 280) {
  const [mounted, setMounted] = useState(show);
  const [phase, setPhase] = useState<'entering' | 'exiting'>(show ? 'entering' : 'exiting');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevShowRef = useRef(show);

  useEffect(() => {
    const wasShow = prevShowRef.current;
    prevShowRef.current = show;

    if (show && !wasShow) {
      // Vừa mở: mount + phase entering cùng render (không flash)
      if (timerRef.current) clearTimeout(timerRef.current);
      setMounted(true);
      setPhase('entering');
    } else if (!show && wasShow) {
      // Vừa đóng: chạy exit animation rồi mới unmount
      setPhase('exiting');
      timerRef.current = setTimeout(() => setMounted(false), delayMs);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show, delayMs]);

  return { mounted, phase };
}