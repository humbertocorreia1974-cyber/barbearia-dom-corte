import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardBody, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: 'Detalhe do agendamento | Barbearia Dom Corte',
    description: 'Detalhes do seu horário reservado na Barbearia Dom Corte.',
    openGraph: {
      title: 'Detalhe do agendamento | Barbearia Dom Corte',
      description: 'Detalhes do seu horário reservado na Dom Corte.',
      type: 'website',
    },
  };
}

const STATUS_LABEL: Record<string, string> = {
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
  atendido: 'Atendido',
  no_show: 'Não compareceu',
  reagendado: 'Reagendado',
};

function fmtData(d: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

function fmtValor(v: unknown) {
  const n = typeof v === 'number' ? v : Number(v ?? 0);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/entrar?next=/meus-agendamentos/${params.id}`);

  const a = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      service: true,
      barber: { select: { nomeCompleto: true, apelido: true, telefoneCelular: true } },
      review: true,
    },
  });

  if (!a) notFound();
  if (a.clientId !== session.user.id) redirect('/sem-permissao');

  const podeCancelar = a.status === 'confirmado';
  const podeAvaliar = a.status === 'atendido' && !a.review;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <Reveal variant="up">
        <Link href="/meus-agendamentos" className="text-sm text-fg-muted hover:text-fg transition-colors">
          ← Voltar para meus agendamentos
        </Link>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl text-fg">Detalhe do agendamento</h1>
        <p className="mt-2 text-sm text-fg-muted">
          {STATUS_LABEL[a.status] ?? a.status} · {fmtData(new Date(a.dataAgendamento))}
        </p>
      </Reveal>

      <Reveal variant="up" delay={80}>
        <Card className="mt-6">
          <CardBody className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-fg-muted">Serviço</p>
                <CardTitle className="mt-1">{a.service.nomeServico}</CardTitle>
                <p className="text-sm text-fg-muted">
                  {a.service.duracaoMinutos} min · {a.horaInicio} às {a.horaFim}
                </p>
              </div>
              <span className="font-display text-2xl text-brand">{fmtValor(a.valorTotal)}</span>
            </div>

            <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-fg-muted">Barbeiro</p>
                <p className="text-fg">{a.barber.apelido || a.barber.nomeCompleto}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-fg-muted">Data</p>
                <p className="text-fg">{fmtData(new Date(a.dataAgendamento))}</p>
              </div>
              {a.observacoes && (
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-widest text-fg-muted">Observações</p>
                  <p className="text-fg">{a.observacoes}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <a href={`/api/appointments/${a.id}/pdf`} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm">Baixar PDF</Button>
              </a>
              {podeCancelar && (
                <Link href={`/meus-agendamentos/${a.id}/cancelar`}>
                  <Button variant="ghost" size="sm">Cancelar</Button>
                </Link>
              )}
              {podeCancelar && (
                <Link href={`/agendar?reagendar=${a.id}`}>
                  <Button variant="ghost" size="sm">Reagendar</Button>
                </Link>
              )}
              {podeAvaliar && (
                <Link href={`/meus-agendamentos/${a.id}/avaliar`}>
                  <Button variant="primary" size="sm">Avaliar atendimento</Button>
                </Link>
              )}
            </div>
          </CardBody>
        </Card>
      </Reveal>
    </main>
  );
}
