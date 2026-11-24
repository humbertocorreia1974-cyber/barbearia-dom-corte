'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ReagendarClient({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataAgendamento: data, horaInicio: hora }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? 'Não foi possível reagendar.');
        setLoading(false);
        return;
      }
      router.push('/agendamentos?aviso=reagendado');
      router.refresh();
    } catch {
      setError('Erro de rede. Tente novamente.');
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button variant="primary" size="md" onClick={() => setOpen(true)}>
        Reagendar
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-surface p-4">
      <p className="mb-3 text-sm text-fg">Escolha a nova data e o novo horário.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-fg-muted" htmlFor="nova-data">Data</label>
          <Input id="nova-data" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-xs text-fg-muted" htmlFor="nova-hora">Horário</label>
          <Input id="nova-hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-3 flex gap-2">
        <Button variant="primary" size="sm" type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Confirmar novo horário'}
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={() => setOpen(false)} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
