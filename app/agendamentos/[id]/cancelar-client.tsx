'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function CancelarClient({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/cancel`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível cancelar.');
        setLoading(false);
        return;
      }
      router.push('/agendamentos?aviso=cancelado');
      router.refresh();
    } catch {
      setError('Erro de rede. Tente novamente.');
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <Button variant="secondary" size="md" onClick={() => setConfirming(true)}>
        Cancelar agendamento
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-sm text-fg">Tem certeza que deseja cancelar este agendamento?</p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-3 flex gap-2">
        <Button variant="primary" size="sm" onClick={handleCancel} disabled={loading}>
          {loading ? 'Cancelando...' : 'Sim, cancelar'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={loading}>
          Voltar
        </Button>
      </div>
    </div>
  );
}
