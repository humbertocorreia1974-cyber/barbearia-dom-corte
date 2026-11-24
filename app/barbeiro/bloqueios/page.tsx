import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { BlockForm } from './block-form';
import { BlockRow } from './block-row';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Bloqueios de agenda | Barbearia Dom Corte',
  description: 'Registre almoço, folga e feriados para que clientes não agendem em horários indisponíveis.',
  openGraph: {
    title: 'Bloqueios de agenda | Barbearia Dom Corte',
    description: 'Registre almoço, folga e feriados para que clientes não agendem em horários indisponíveis.',
  },
};

const MOTIVO_LABEL: Record<string, string> = {
  almoco: 'Almoço',
  folga: 'Folga',
  feriado: 'Feriado',
  outro: 'Outro',
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/entrar');
  if (session.user.role !== 'barbeiro' && session.user.role !== 'admin') redirect('/sem-permissao');

  const barber = await prisma.barber.findUnique({
    where: { userId: session.user.id },
    select: { id: true, nomeCompleto: true, apelido: true },
  });

  if (!barber) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <Card>
          <CardBody>
            <CardTitle>Perfil de barbeiro não encontrado</CardTitle>
            <p className="mt-2 text-sm text-fg-muted">
              Sua conta ainda não está vinculada a um perfil de barbeiro. Fale com o dono da barbearia para ativar seu acesso.
            </p>
            <div className="mt-4">
              <Link href="/">
                <Button variant="secondary">Voltar para a home</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </main>
    );
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const [futuros, passados] = await Promise.all([
    prisma.scheduleBlock.findMany({
      where: { barberId: barber.id, dataBloqueio: { gte: hoje } },
      orderBy: [{ dataBloqueio: 'asc' }, { horaInicio: 'asc' }],
    }),
    prisma.scheduleBlock.findMany({
      where: { barberId: barber.id, dataBloqueio: { lt: hoje } },
      orderBy: [{ dataBloqueio: 'desc' }, { horaInicio: 'desc' }],
      take: 10,
    }),
  ]);

  const nome = barber.apelido || barber.nomeCompleto;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Reveal variant="up">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-fg-muted">Painel do barbeiro</p>
            <h1 className="font-display text-3xl text-fg">Bloqueios de agenda</h1>
            <p className="mt-1 text-sm text-fg-muted">
              Olá, {nome}. Marque almoço, folga ou feriado para que nenhum cliente reserve nesse intervalo.
            </p>
          </div>
          <Link href="/barbeiro/agenda">
            <Button variant="secondary" size="sm">Ver agenda do dia</Button>
          </Link>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1.2fr]">
        <Reveal variant="left">
          <Card>
            <CardBody>
              <CardTitle>Novo bloqueio</CardTitle>
              <p className="mt-1 text-xs text-fg-muted">Escolha a data e o intervalo que você não quer receber clientes.</p>
              <div className="mt-4">
                <BlockForm />
              </div>
            </CardBody>
          </Card>
        </Reveal>

        <Reveal variant="right">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <CardTitle>Próximos bloqueios</CardTitle>
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">{futuros.length}</span>
              </div>

              {futuros.length === 0 ? (
                <div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-fg-muted">Nenhum bloqueio futuro cadastrado.</p>
                  <p className="mt-1 text-xs text-fg-muted">Use o formulário ao lado para reservar seu almoço ou folga.</p>
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-border">
                  {futuros.map((b, i) => (
                    <Reveal key={b.id} variant="up" delay={i * 60}>
                      <BlockRow
                        id={b.id}
                        data={b.dataBloqueio.toISOString().slice(0, 10)}
                        horaInicio={b.horaInicio}
                        horaFim={b.horaFim}
                        motivoLabel={MOTIVO_LABEL[b.motivo] ?? b.motivo}
                        descricao={b.descricao}
                        recorrente={b.recorrente}
                      />
                    </Reveal>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </Reveal>
      </div>

      {passados.length > 0 && (
        <Reveal variant="up">
          <Card>
            <CardBody>
              <CardTitle>Histórico recente</CardTitle>
              <ul className="mt-4 divide-y divide-border text-sm">
                {passados.map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span className="text-fg">
                      {b.dataBloqueio.toISOString().slice(0, 10)} · {b.horaInicio} às {b.horaFim}
                    </span>
                    <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-fg-muted">
                      {MOTIVO_LABEL[b.motivo] ?? b.motivo}
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </Reveal>
      )}
    </main>
  );
}
