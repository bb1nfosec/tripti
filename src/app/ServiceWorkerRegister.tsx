'use client';

import { useEffect } from 'react';

// Registered from a real component (not an inline <script>) so the strict,
// nonce-based CSP needs no 'unsafe-inline'.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return; // avoid caching the dev server
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        /* offline support is a progressive enhancement; ignore failures */
      });
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return null;
}
