'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Props = {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  tipoLabel: string;
  tipoCor: string;
  dataFormatada: string;
  appointmentId: string | null;
  appointmentResumo: string | null;
};

export function NotificationItemClient({
  id,
  titulo,
  mensagem,
  lida,
  tipoLabel,
  tipoCor,
  dataFormatada,
  appointmentId,
  appointmentResumo,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function marcarLida() {
    if (lida || loading) return;
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Falha ao marcar como lida');
      router.refresh();
    } catch {
      setErro('Não foi possível marcar como lida. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <li
      className={`rounded-2xl border p-4 transition-all duration-200 ${
        lida
          ? 'border-border bg-surface'
          : 'border-brand/30 bg-surface shadow-[0_2px_0_0_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.15)]'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${
            lida ? 'bg-border' : 'bg-brand'
          }`}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tipoCor}`}>
              {tipoLabel}
            </span>
            <span className="text-xs text-fg-muted">{dataFormatada}</span>
          </div>
          <h3 className={`mt-1.5 font-display text-base ${lida ? 'text-fg-muted' : 'text-fg'}`}>
            {titulo}
          </h3>
          <p className="mt-1 text-sm text-fg-muted">{mensagem}</p>

          {appointmentResumo && appointmentId && (
            <Link
              href={`/meus-agendamentos/${appointmentId}`}
              className="mt-2 inline-flex items-center gap-1 text-xs text-brand hover:underline"
            >
              Ver agendamento: {appointmentResumo}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          )}

          {erro && <p className="mt-2 text-xs text-accent">{erro}</p>}

          {!lida && (
            <button
              type="button"
              onClick={marcarLida}
              disabled={loading}
              className="mt-3 rounded-full border border-border bg-bg px-3 py-1 text-xs text-fg-muted transition-all duration-200 hover:border-brand/40 hover:text-brand disabled:opacity-50"
            >
              {loading ? 'Marcando...' : 'Marcar como lida'}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
