'use client';

import { useEffect } from 'react';

const BASE = '/finance-tracker';

/** Đăng ký manifest + service worker để cài app / chạy offline */
export default function PwaRegister() {
  useEffect(() => {
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = `${BASE}/manifest.webmanifest`;
      document.head.appendChild(link);
    }
    if (!document.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#1c1917';
      document.head.appendChild(meta);
    }
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${BASE}/sw.js`).catch(() => {});
    }
  }, []);
  return null;
}
