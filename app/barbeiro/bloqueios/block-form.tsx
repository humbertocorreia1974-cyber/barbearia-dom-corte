'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MOTIVOS = [
  { value: 'almoco', label: 'Almoço' },
  { value: 'folga', label: 'Folga' },
  { value: 'feriado', label: 'Feriado' },
  { value: 'outro', label: 'Outro' },
];

export function BlockForm() {
  const router = useRouter();
  const [data, setData] = useState('');
  const [horaInicio, setHoraInicio] = useState('12:00');
  const [horaFim, setHoraFim] = useState('13:00');
  const [motivo, setMotivo] = useState('almoco');
  const [descricao, setDescricao] = useState('');
  const [recorrente, setRecorrente] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOk(null);
    setLoading(true);
    try {
      const res = await fetch('/api/barber/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, horaInicio, horaFim, motivo, descricao: descricao || null, recorrente }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(json.error || 'Não foi possível criar o bloqueio.');
        return;
      }
      setOk('Bloqueio criado com sucesso.');
      setDescricao('');
      router.refresh();
    } catch {
      setErro('Falha de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="data" className="mb-1 block text-xs font-medium text-fg">Data</label>
        <Input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="horaInicio" className="mb-1 block text-xs font-medium text-fg">Início</label>
          <Input id="horaInicio" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="horaFim" className="mb-1 block text-xs font-medium text-fg">Fim</label>
          <Input id="horaFim" type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} required />
        </div>
      </div>
      <div>
        <label htmlFor="motivo" className="mb-1 block text-xs font-medium text-fg">Motivo</label>
        <select
          id="motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {MOTIVOS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="descricao" className="mb-1 block text-xs font-medium text-fg">Observação (opcional)</label>
        <Input
          id="descricao"
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex.: consulta médica"
        />
      </div>
      <label className="flex items-center gap-2 text-xs text-fg-muted">
        <input
          type="checkbox"
          checked={recorrente}
          onChange={(e) => setRecorrente(e.target.checked)}
          className="h-4 w-4 rounded border-border text-brand focus-visible:ring-brand"
        />
        Repetir toda semana neste mesmo dia e horário
      </label>

      {erro && <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-600">{erro}</p>}
      {ok && <p className="rounded-md bg-brand/10 px-3 py-2 text-xs text-brand">{ok}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Salvando...' : 'Adicionar bloqueio'}
      </Button>
    </form>
  );
}
