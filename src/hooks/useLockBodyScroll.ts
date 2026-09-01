'use client';

import { useEffect } from 'react';

/** Khóa scroll body khi có phần tử overlay (modal, toast) mở */
export function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [active]);
}
