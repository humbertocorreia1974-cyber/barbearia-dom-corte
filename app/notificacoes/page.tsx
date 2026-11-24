import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { MarkAllReadClient } from './mark-all-read-client';
import { NotificationItemClient } from './notification-item-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Notificações | Barbearia Dom Corte',
  description: 'Acompanhe confirmações, lembretes e avisos dos seus agendamentos na Barbearia Dom Corte.',
  openGraph: {
    title: 'Notificações | Barbearia Dom Corte',
    description: 'Confirmações, lembretes e avisos dos seus agendamentos.',
    type: 'website',
  },
};

const TIPO_LABEL: Record<string, string> = {
  confirmacao: 'Confirmação',
  cancelamento: 'Cancelamento',
  lembrete: 'Lembrete',
  avaliacao: 'Avaliação',
  sistema: 'Sistema',
};

const TIPO_COR: Record<string, string> = {
  confirmacao: 'bg-brand/10 text-brand',
  cancelamento: 'bg-accent/10 text-accent',
  lembrete: 'bg-accent/10 text-accent',
  avaliacao: 'bg-brand/10 text-brand',
  sistema: 'bg-fg-muted/10 text-fg-muted',
};

function formatarData(d: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export default async function NotificacoesPage({
  searchParams,
}: {
  searchParams: { filtro?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/entrar?callbackUrl=/notificacoes');

  const filtro = searchParams.filtro === 'nao-lidas' ? 'nao-lidas' : 'todas';

  const where: { userId: string; lida?: boolean } = { userId: session.user.id };
  if (filtro === 'nao-lidas') where.lida = false;

  const [notificacoes, totalNaoLidas] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { dataEnvio: 'desc' },
      take: 100,
      include: {
        appointment: {
          select: {
            id: true,
            dataAgendamento: true,
            horaInicio: true,
            service: { select: { nomeServico: true } },
          },
        },
      },
    }),
    prisma.notification.count({ where: { userId: session.user.id, lida: false } }),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Reveal variant="up">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-fg-muted">Sua caixa de entrada</p>
            <h1 className="mt-1 font-display text-3xl text-fg">Notificações</h1>
            <p className="mt-1 text-sm text-fg-muted">
              {totalNaoLidas === 0
                ? 'Tudo em dia por aqui.'
                : `${totalNaoLidas} ${totalNaoLidas === 1 ? 'aviso novo' : 'avisos novos'} esperando você.`}
            </p>
          </div>
          <MarkAllReadClient disabled={totalNaoLidas === 0} />
        </div>
      </Reveal>

      <Reveal variant="up" delay={80}>
        <div className="mb-6 flex gap-2">
          <Link
            href="/notificacoes"
            className={`rounded-full px-4 py-1.5 text-sm transition-all duration-200 ${
              filtro === 'todas'
                ? 'bg-brand text-brand-fg shadow-sm'
                : 'border border-border bg-surface text-fg-muted hover:bg-brand/5 hover:text-brand'
            }`}
          >
            Todas
          </Link>
          <Link
            href="/notificacoes?filtro=nao-lidas"
            className={`rounded-full px-4 py-1.5 text-sm transition-all duration-200 ${
              filtro === 'nao-lidas'
                ? 'bg-brand text-brand-fg shadow-sm'
                : 'border border-border bg-surface text-fg-muted hover:bg-brand/5 hover:text-brand'
            }`}
          >
            Não lidas {totalNaoLidas > 0 && <span className="ml-1 opacity-80">({totalNaoLidas})</span>}
          </Link>
        </div>
      </Reveal>

      {notificacoes.length === 0 ? (
        <Reveal variant="scale">
          <Card className="text-center">
            <CardBody className="flex flex-col items-center gap-3 py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </div>
              <CardTitle>
                {filtro === 'nao-lidas' ? 'Nenhum aviso pendente' : 'Nenhuma notificação ainda'}
              </CardTitle>
              <p className="max-w-sm text-sm text-fg-muted">
                {filtro === 'nao-lidas'
                  ? 'Você já leu tudo. Volte para a lista completa pra revisar o histórico.'
                  : 'Assim que você agendar um corte, a confirmação e o lembrete de 24h aparecem aqui.'}
              </p>
              <div className="mt-2 flex gap-2">
                {filtro === 'nao-lidas' && (
                  <Link href="/notificacoes">
                    <Button variant="secondary" size="sm">Ver todas</Button>
                  </Link>
                )}
                <Link href="/agendar">
                  <Button variant="primary" size="sm">Agendar horário</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </Reveal>
      ) : (
        <ul className="space-y-3">
          {notificacoes.map((n, i) => (
            <Reveal key={n.id} variant="up" delay={i * 40}>
              <NotificationItemClient
                id={n.id}
                titulo={n.titulo}
                mensagem={n.mensagem}
                lida={n.lida}
                tipoLabel={TIPO_LABEL[n.tipoNotificacao] ?? 'Aviso'}
                tipoCor={TIPO_COR[n.tipoNotificacao] ?? 'bg-fg-muted/10 text-fg-muted'}
                dataFormatada={formatarData(n.dataEnvio)}
                appointmentId={n.appointment?.id ?? null}
                appointmentResumo={
                  n.appointment
                    ? `${n.appointment.service.nomeServico} em ${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(n.appointment.dataAgendamento)} às ${n.appointment.horaInicio}`
                    : null
                }
              />
            </Reveal>
          ))}
        </ul>
      )}
    </main>
  );
}
