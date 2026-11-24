'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DIAS = [
  { v: 0, label: 'Dom' },
  { v: 1, label: 'Seg' },
  { v: 2, label: 'Ter' },
  { v: 3, label: 'Qua' },
  { v: 4, label: 'Qui' },
  { v: 5, label: 'Sex' },
  { v: 6, label: 'Sáb' },
];

type Settings = {
  id: string;
  nomeNegocio: string;
  telefone: string | null;
  endereco: string | null;
  horarioAbertura: string;
  horarioFechamento: string;
  diasFuncionamento: string;
  intervaloSlotMinutos: number;
  whatsappLembreteAtivo: boolean;
};

export function SettingsFormClient({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState({
    nomeNegocio: initial.nomeNegocio,
    telefone: initial.telefone ?? '',
    endereco: initial.endereco ?? '',
    horarioAbertura: initial.horarioAbertura,
    horarioFechamento: initial.horarioFechamento,
    intervaloSlotMinutos: initial.intervaloSlotMinutos,
    whatsappLembreteAtivo: initial.whatsappLembreteAtivo,
  });
  const [dias, setDias] = useState<number[]>(
    initial.diasFuncionamento
      .split(',')
      .map((d) => Number(d))
      .filter((d) => !Number.isNaN(d))
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  function toggleDia(d: number) {
    setDias((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, diasFuncionamento: dias }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ kind: 'err', text: data?.error ?? 'Não foi possível salvar.' });
      } else {
        setMsg({ kind: 'ok', text: 'Configurações salvas com sucesso.' });
        router.refresh();
      }
    } catch {
      setMsg({ kind: 'err', text: 'Falha de rede ao salvar.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-fg">Nome do negócio</span>
          <Input
            value={form.nomeNegocio}
            onChange={(e) => setForm({ ...form, nomeNegocio: e.target.value })}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-fg">Telefone</span>
          <Input
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            placeholder="(24) 99999-0000"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-fg">Endereço</span>
          <Input
            value={form.endereco}
            onChange={(e) => setForm({ ...form, endereco: e.target.value })}
            placeholder="Rua, número, bairro, Volta Redonda"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-fg">Abre às</span>
          <Input
            type="time"
            value={form.horarioAbertura}
            onChange={(e) => setForm({ ...form, horarioAbertura: e.target.value })}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-fg">Fecha às</span>
          <Input
            type="time"
            value={form.horarioFechamento}
            onChange={(e) => setForm({ ...form, horarioFechamento: e.target.value })}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-fg">Intervalo do slot (min)</span>
          <Input
            type="number"
            min={10}
            max={120}
            step={5}
            value={form.intervaloSlotMinutos}
            onChange={(e) => setForm({ ...form, intervaloSlotMinutos: Number(e.target.value) })}
            required
          />
        </label>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-fg">Dias de funcionamento</span>
        <div className="flex flex-wrap gap-2">
          {DIAS.map((d) => {
            const active = dias.includes(d.v);
            return (
              <button
                key={d.v}
                type="button"
                onClick={() => toggleDia(d.v)}
                aria-pressed={active}
                className={
                  'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150 ' +
                  (active
                    ? 'border-brand bg-brand text-brand-fg shadow-sm'
                    : 'border-border bg-surface text-fg-muted hover:bg-brand/10 hover:text-brand')
                }
              >
                {d.label}
              </button>
            );
          })}
        </div>
        {dias.length === 0 && (
          <p className="mt-2 text-xs text-fg-muted">Selecione ao menos um dia para aceitar agendamentos.</p>
        )}
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-border bg-surface/60 p-4">
        <input
          type="checkbox"
          checked={form.whatsappLembreteAtivo}
          onChange={(e) => setForm({ ...form, whatsappLembreteAtivo: e.target.checked })}
          className="mt-1 h-4 w-4 accent-[color:var(--brand)]"
        />
        <span>
          <span className="block text-sm font-medium text-fg">Lembrete por WhatsApp 24h antes</span>
          <span className="block text-xs text-fg-muted">
            Envia mensagem automática via WhatsApp Cloud API para o cliente confirmar o horário.
          </span>
        </span>
      </label>

      {msg && (
        <div
          className={
            'rounded-lg border px-4 py-3 text-sm ' +
            (msg.kind === 'ok'
              ? 'border-brand/40 bg-brand/10 text-brand'
              : 'border-accent/40 bg-accent/10 text-accent')
          }
        >
          {msg.text}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={saving || dias.length === 0}>
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </Button>
      </div>
    </form>
  );
}
