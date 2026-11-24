'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  id: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  motivoLabel: string;
  descricao: string | null;
  recorrente: boolean;
};

export function BlockRow({ id, data, horaInicio, horaFim, motivoLabel, descricao, recorrente }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function remover() {
    if (!confirm('Remover este bloqueio?')) return;
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch(`/api/barber/blocks/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErro(json.error || 'Não foi possível remover.');
        return;
      }
      router.refresh();
    } catch {
      setErro('Falha de conexão.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-3">
      <div className="min-w-0">
        <p className="text-sm text-fg">
          {data} · {horaInicio} às {horaFim}
        </p>
        <p className="text-xs text-fg-muted">
          {motivoLabel}
          {recorrente ? ' · semanal' : ''}
          {descricao ? ` · ${descricao}` : ''}
        </p>
        {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
      </div>
      <button
        type="button"
        onClick={remover}
        disabled={loading}
        className="rounded-md border border-border px-2 py-1 text-xs text-fg-muted transition-colors duration-150 hover:bg-surface hover:text-fg disabled:opacity-50"
      >
        {loading ? 'Removendo...' : 'Remover'}
      </button>
    </li>
  );
}
