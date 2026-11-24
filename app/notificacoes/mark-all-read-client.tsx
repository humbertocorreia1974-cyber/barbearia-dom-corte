'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function MarkAllReadClient({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function marcarTodas() {
    if (disabled || loading) return;
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'PATCH' });
      if (!res.ok) throw new Error('Falha');
      router.refresh();
    } catch {
      setErro('Não foi possível marcar todas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="secondary"
        size="sm"
        onClick={marcarTodas}
        disabled={disabled || loading}
      >
        {loading ? 'Marcando...' : 'Marcar todas como lidas'}
      </Button>
      {erro && <p className="text-xs text-accent">{erro}</p>}
    </div>
  );
}
