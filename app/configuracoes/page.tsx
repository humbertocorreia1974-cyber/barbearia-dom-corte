import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { SettingsFormClient } from './settings-form-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Configurações do negócio | Barbearia Dom Corte',
  description:
    'Defina horários de funcionamento, dias de atendimento e intervalo de slots da Barbearia Dom Corte.',
  openGraph: {
    title: 'Configurações do negócio | Barbearia Dom Corte',
    description:
      'Horários de funcionamento, dias de atendimento e intervalo de slots da Barbearia Dom Corte.',
  },
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/entrar');
  if (session.user.role !== 'admin') redirect('/sem-permissao');

  let settings = await prisma.businessSettings.findFirst();
  if (!settings) {
    settings = await prisma.businessSettings.create({ data: {} });
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-fg-muted">Painel do dono</p>
        <h1 className="mt-1 font-display text-3xl text-fg sm:text-4xl">Configurações do negócio</h1>
        <p className="mt-2 max-w-2xl text-sm text-fg-muted">
          Ajuste os horários de funcionamento, os dias de atendimento e o intervalo entre slots.
          Essas regras alimentam a grade de horários disponíveis no agendamento online.
        </p>
      </header>

      <Card>
        <CardTitle>Horário de funcionamento</CardTitle>
        <CardBody>
          <SettingsFormClient
            initial={{
              id: settings.id,
              nomeNegocio: settings.nomeNegocio,
              telefone: settings.telefone,
              endereco: settings.endereco,
              horarioAbertura: settings.horarioAbertura,
              horarioFechamento: settings.horarioFechamento,
              diasFuncionamento: settings.diasFuncionamento,
              intervaloSlotMinutos: settings.intervaloSlotMinutos,
              whatsappLembreteAtivo: settings.whatsappLembreteAtivo,
            }}
          />
        </CardBody>
      </Card>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase tracking-widest text-fg-muted">Abre</p>
          <p className="mt-1 font-display text-2xl text-brand">{settings.horarioAbertura}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase tracking-widest text-fg-muted">Fecha</p>
          <p className="mt-1 font-display text-2xl text-brand">{settings.horarioFechamento}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase tracking-widest text-fg-muted">Slot</p>
          <p className="mt-1 font-display text-2xl text-brand">{settings.intervaloSlotMinutos} min</p>
        </div>
      </section>
    </main>
  );
}
