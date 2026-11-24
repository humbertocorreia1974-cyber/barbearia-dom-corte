'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function NotificationBell() {
  const [count, setCount] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      try {
        const res = await fetch('/api/notifications', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { naoLidas?: number };
        if (!cancelado) setCount(data.naoLidas ?? 0);
      } catch {
        // silencioso: sino não deve quebrar a página
      } finally {
        if (!cancelado) setLoaded(true);
      }
    }
    carregar();
    const t = setInterval(carregar, 60_000);
    return () => {
      cancelado = true;
      clearInterval(t);
    };
  }, []);

  return (
    <Link
      href="/notificacoes"
      aria-label={count > 0 ? `Notificações, ${count} não lidas` : 'Notificações'}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-fg-muted transition-all duration-200 hover:border-brand/40 hover:text-brand"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {loaded && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
