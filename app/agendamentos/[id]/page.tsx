import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { CancelarClient } from './cancelar-client';
import { ReagendarClient } from './reagendar-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Detalhe do agendamento | Barbearia Dom Corte',
  description: 'Veja os detalhes do seu agendamento, cancele ou reagende com poucos cliques.',
  openGraph: {
    title: 'Detalhe do agendamento | Barbearia Dom Corte',
    description: 'Cancele ou reagende seu horário na Barbearia Dom Corte.',
  },
};

const STATUS_LABEL: Record<string, string> = {
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
  atendido: 'Atendido',
  no_show: 'Não compareceu',
  reagendado: 'Reagendado',
};

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/entrar?next=/agendamentos/${params.id}`);
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      service: true,
      barber: true,
      client: { select: { id: true, name: true, email: true, phone: true } },
      review: true,
    },
  });

  if (!appointment) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <Card>
          <CardBody>
            <CardTitle>Agendamento não encontrado</CardTitle>
            <p className="mt-2 text-sm text-fg-muted">
              Esse agendamento não existe ou foi removido.
            </p>
            <a href="/agendamentos" className="mt-4 inline-block text-sm text-brand hover:underline">
              Voltar para meus agendamentos
            </a>
          </CardBody>
        </Card>
      </main>
    );
  }

  const isOwner = appointment.clientId === session.user.id;
  const isBarber = appointment.barber.userId === session.user.id;
  const isAdmin = session.user.role === 'admin';

  if (!isOwner && !isBarber && !isAdmin) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <Card>
          <CardBody>
            <CardTitle>Sem permissão</CardTitle>
            <p className="mt-2 text-sm text-fg-muted">
              Você não tem acesso a este agendamento.
            </p>
            <a href="/agendamentos" className="mt-4 inline-block text-sm text-brand hover:underline">
              Voltar para meus agendamentos
            </a>
          </CardBody>
        </Card>
      </main>
    );
  }

  const podeAcao = appointment.status === 'confirmado' || appointment.status === 'reagendado';
  const dataFmt = appointment.dataAgendamento.toISOString().slice(0, 10);
  const valorFmt = Number(appointment.valorTotal).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <a href="/agendamentos" className="text-sm text-fg-muted hover:text-brand">
        ← Voltar para meus agendamentos
      </a>

      <header className="mt-4">
        <h1 className="font-display text-3xl text-fg">Detalhe do agendamento</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Confira os dados, cancele ou escolha um novo horário.
        </p>
      </header>

      <Card className="mt-6">
        <CardBody>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>{appointment.service.nomeServico}</CardTitle>
              <p className="mt-1 text-sm text-fg-muted">
                com {appointment.barber.nomeCompleto}
                {appointment.barber.apelido ? ` (${appointment.barber.apelido})` : ''}
              </p>
            </div>
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
              {STATUS_LABEL[appointment.status] ?? appointment.status}
            </span>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-fg-muted">Data</dt>
              <dd className="mt-1 text-fg">{dataFmt}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-fg-muted">Horário</dt>
              <dd className="mt-1 text-fg">
                {appointment.horaInicio} às {appointment.horaFim}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-fg-muted">Duração</dt>
              <dd className="mt-1 text-fg">{appointment.service.duracaoMinutos} minutos</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-fg-muted">Valor</dt>
              <dd className="mt-1 text-fg">{valorFmt}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-fg-muted">Cliente</dt>
              <dd className="mt-1 text-fg">{appointment.client.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-fg-muted">Contato</dt>
              <dd className="mt-1 text-fg">
                {appointment.client.phone ?? appointment.client.email}
              </dd>
            </div>
          </dl>

          {appointment.observacoes && (
            <div className="mt-6 rounded-lg border border-border p-3">
              <p className="text-xs uppercase tracking-wide text-fg-muted">Observações</p>
              <p className="mt-1 text-sm text-fg">{appointment.observacoes}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {podeAcao && (
        <section className="mt-6">
          <h2 className="font-display text-xl text-fg">Ações</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Precisa mudar de horário ou desmarcar? Faça aqui mesmo.
          </p>
          <div className="mt-4 flex flex-wrap items-start gap-3">
            <ReagendarClient appointmentId={appointment.id} />
            <CancelarClient appointmentId={appointment.id} />
          </div>
        </section>
      )}

      {!podeAcao && (
        <Card className="mt-6">
          <CardBody>
            <p className="text-sm text-fg-muted">
              Este agendamento está {STATUS_LABEL[appointment.status]?.toLowerCase() ?? appointment.status} e não pode mais ser alterado.
            </p>
            <a href="/agendar" className="mt-3 inline-block text-sm text-brand hover:underline">
              Fazer um novo agendamento
            </a>
          </CardBody>
        </Card>
      )}

      {appointment.review && (
        <Card className="mt-6">
          <CardBody>
            <CardTitle>Sua avaliação</CardTitle>
            <p className="mt-2 text-sm text-fg">
              Nota: {appointment.review.notaAtendimento} de 5
            </p>
            {appointment.review.comentario && (
              <p className="mt-1 text-sm text-fg-muted">{appointment.review.comentario}</p>
            )}
          </CardBody>
        </Card>
      )}
    </main>
  );
}
