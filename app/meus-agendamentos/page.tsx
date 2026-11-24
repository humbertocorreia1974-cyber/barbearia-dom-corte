import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Meus agendamentos | Barbearia Dom Corte',
  description: 'Veja, cancele ou reagende seus horários na Barbearia Dom Corte em Volta Redonda.',
  openGraph: {
    title: 'Meus agendamentos | Barbearia Dom Corte',
    description: 'Seus horários reservados na Dom Corte, em Volta Redonda.',
    type: 'website',
  },
};

const STATUS_LABEL: Record<string, string> = {
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
  atendido: 'Atendido',
  no_show: 'Não compareceu',
  reagendado: 'Reagendado',
};

const STATUS_CLASS: Record<string, string> = {
  confirmado: 'bg-brand/10 text-brand border-brand/30',
  cancelado: 'bg-accent/10 text-accent border-accent/30',
  atendido: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
  no_show: 'bg-red-500/10 text-red-700 border-red-500/30',
  reagendado: 'bg-fg-muted/10 text-fg-muted border-border',
};

function fmtData(d: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

function fmtValor(v: unknown) {
  const n = typeof v === 'number' ? v : Number(v ?? 0);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

type Search = { status?: string };

export default async function Page({ searchParams }: { searchParams: Search }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/entrar?next=/meus-agendamentos');

  const statusFiltro = searchParams?.status && searchParams.status !== 'todos' ? searchParams.status : undefined;

  const agendamentos = await prisma.appointment.findMany({
    where: {
      clientId: session.user.id,
      ...(statusFiltro ? { status: statusFiltro } : {}),
    },
    orderBy: [{ dataAgendamento: 'desc' }, { horaInicio: 'desc' }],
    include: {
      service: { select: { nomeServico: true, duracaoMinutos: true } },
      barber: { select: { nomeCompleto: true, apelido: true } },
      review: { select: { id: true } },
    },
    take: 100,
  });

  const total = agendamentos.length;
  const proximos = agendamentos.filter(
    (a) => a.status === 'confirmado' && new Date(a.dataAgendamento) >= new Date(new Date().toDateString()),
  ).length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <Reveal variant="up">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-fg-muted">Sua conta</p>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl text-fg">Meus agendamentos</h1>
            <p className="mt-2 text-sm text-fg-muted">
              {total === 0
                ? 'Nenhum horário por aqui ainda.'
                : `${total} ${total === 1 ? 'agendamento' : 'agendamentos'} · ${proximos} ${proximos === 1 ? 'próximo' : 'próximos'}`}
            </p>
          </div>
          <Link href="/agendar">
            <Button variant="primary" size="md">Novo agendamento</Button>
          </Link>
        </header>
      </Reveal>

      <Reveal variant="up" delay={80}>
        <form method="get" className="mt-6 flex flex-wrap items-center gap-2">
          {[
            { v: 'todos', l: 'Todos' },
            { v: 'confirmado', l: 'Confirmados' },
            { v: 'atendido', l: 'Atendidos' },
            { v: 'cancelado', l: 'Cancelados' },
            { v: 'no_show', l: 'No-show' },
          ].map((opt) => {
            const ativo = (searchParams?.status ?? 'todos') === opt.v;
            return (
              <button
                key={opt.v}
                type="submit"
                name="status"
                value={opt.v}
                className={`rounded-full border px-4 py-1.5 text-sm transition-all duration-150 hover-lift ${
                  ativo
                    ? 'border-brand bg-brand text-brand-fg'
                    : 'border-border bg-surface text-fg-muted hover:text-fg'
                }`}
              >
                {opt.l}
              </button>
            );
          })}
        </form>
      </Reveal>

      {agendamentos.length === 0 ? (
        <Reveal variant="scale" delay={120}>
          <Card className="mt-8">
            <CardBody className="flex flex-col items-center gap-4 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-xl text-fg">Nenhum agendamento por aqui</h2>
                <p className="mt-1 text-sm text-fg-muted">
                  Escolha serviço, barbeiro e horário livre. O slot fica reservado só pra você.
                </p>
              </div>
              <Link href="/agendar">
                <Button variant="primary" size="md">Agendar agora</Button>
              </Link>
            </CardBody>
          </Card>
        </Reveal>
      ) : (
        <ul className="mt-8 grid gap-4">
          {agendamentos.map((a, i) => {
            const barbeiro = a.barber.apelido || a.barber.nomeCompleto;
            const podeAvaliar = a.status === 'atendido' && !a.review;
            return (
              <Reveal key={a.id} variant="up" delay={i * 60}>
                <li>
                  <Card className="hover-lift">
                    <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[a.status] ?? 'border-border bg-surface text-fg-muted'}`}>
                            {STATUS_LABEL[a.status] ?? a.status}
                          </span>
                          <span className="text-xs text-fg-muted">{fmtData(new Date(a.dataAgendamento))}</span>
                        </div>
                        <h2 className="mt-2 font-display text-lg text-fg truncate">{a.service.nomeServico}</h2>
                        <p className="text-sm text-fg-muted">
                          com {barbeiro} · {a.horaInicio} às {a.horaFim} · {a.service.duracaoMinutos} min
                        </p>
                      </div>
                      <div className="flex flex-col items-start gap-2 sm:items-end">
                        <span className="font-display text-lg text-brand">{fmtValor(a.valorTotal)}</span>
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/meus-agendamentos/${a.id}`}>
                            <Button variant="secondary" size="sm">Ver detalhe</Button>
                          </Link>
                          {podeAvaliar && (
                            <Link href={`/meus-agendamentos/${a.id}/avaliar`}>
                              <Button variant="ghost" size="sm">Avaliar</Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </li>
              </Reveal>
            );
          })}
        </ul>
      )}

      <Reveal variant="up" delay={200}>
        <p className="mt-10 text-center text-xs text-fg-muted">
          Precisa remarcar? Abra o detalhe do agendamento. Cancelamento com menos de 2h pode ser cobrado.
        </p>
      </Reveal>
    </main>
  );
}
