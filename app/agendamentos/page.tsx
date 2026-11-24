import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agendamentos | Barbearia Dom Corte",
  description:
    "Acompanhe seus agendamentos na Barbearia Dom Corte: veja próximos horários, cancele ou reagende com poucos cliques.",
  alternates: { canonical: "/agendamentos" },
  openGraph: {
    title: "Agendamentos | Barbearia Dom Corte",
    description:
      "Veja, cancele ou reagende seus horários na Barbearia Dom Corte.",
    type: "website",
  },
};

const steps = [
  {
    title: "Escolha o serviço",
    desc: "Corte, barba, combo ou sobrancelha — cada um com preço e duração próprios.",
  },
  {
    title: "Selecione o barbeiro",
    desc: "Três profissionais com agenda individual. O dono também atende.",
  },
  {
    title: "Confirme o horário",
    desc: "O sistema bloqueia overbooking: um slot por barbeiro e horário.",
  },
];

export default function AgendamentosPage() {
  return (
    <main className="min-h-dvh bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      <section className="mx-auto w-full max-w-5xl px-4 pt-10 pb-8 sm:px-6 sm:pt-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--brand))]">
          Barbearia Dom Corte
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-4xl">
          Agendamentos
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[hsl(var(--fg-muted))] sm:text-base">
          Seu corte, seu barbeiro, seu horário no Dom Corte. Aqui você
          acompanha seus horários, cancela ou reagenda quando precisar — sem
          ligação e sem espera.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/agendar"
            className="inline-flex items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--brand))] px-5 py-3 text-sm font-semibold text-[hsl(var(--brand-fg))] shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
          >
            Agendar novo horário
          </Link>
          <Link
            href="/meus-agendamentos"
            className="inline-flex items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-3 text-sm font-semibold text-[hsl(var(--fg))] transition hover:bg-[hsl(var(--surface-2))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
          >
            Ver meus agendamentos
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--surface-2))] text-sm font-bold text-[hsl(var(--accent))]">
                {i + 1}
              </span>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-base font-semibold">
                {s.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-[hsl(var(--fg-muted))]">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6">
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold sm:text-2xl">
            O que você pode fazer por aqui
          </h2>
          <ul className="mt-4 grid gap-3 text-sm text-[hsl(var(--fg-muted))] sm:grid-cols-2">
            <li className="flex gap-2">
              <span aria-hidden className="text-[hsl(var(--success))]">✓</span>
              Ver detalhes de cada agendamento, com serviço, barbeiro e horário.
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="text-[hsl(var(--success))]">✓</span>
              Cancelar com antecedência e liberar o horário para outro cliente.
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="text-[hsl(var(--success))]">✓</span>
              Reagendar para outro dia ou barbeiro disponível.
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="text-[hsl(var(--success))]">✓</span>
              Avaliar o atendimento com estrelas e comentário.
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="text-[hsl(var(--success))]">✓</span>
              Acompanhar o programa de fidelidade: a cada 10 cortes, 1 grátis.
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="text-[hsl(var(--success))]">✓</span>
              Receber lembrete por WhatsApp 24h antes do horário.
            </li>
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold sm:text-xl">
            Ainda não tem conta?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[hsl(var(--fg-muted))]">
            Crie sua conta em poucos segundos para agendar, acompanhar seus
            horários e acumular pontos de fidelidade.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/criar-conta"
              className="inline-flex items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--brand))] px-5 py-3 text-sm font-semibold text-[hsl(var(--brand-fg))] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-2))]"
            >
              Criar conta
            </Link>
            <Link
              href="/entrar"
              className="inline-flex items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-3 text-sm font-semibold text-[hsl(var(--fg))] transition hover:bg-[hsl(var(--surface-2))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-2))]"
            >
              Entrar
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}