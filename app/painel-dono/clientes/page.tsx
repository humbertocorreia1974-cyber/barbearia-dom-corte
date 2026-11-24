import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardBody, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Reveal } from '@/components/motion/reveal';
import { CountUp } from '@/components/motion/count-up';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Clientes | Painel do Dono | Barbearia Dom Corte',
  description: 'Lista de clientes da Barbearia Dom Corte com histórico de agendamentos, gasto total e nível de fidelidade.',
  openGraph: {
    title: 'Clientes | Barbearia Dom Corte',
    description: 'Gestão de clientes, fidelidade e histórico de atendimentos.',
  },
};

type SearchParams = { q?: string; nivel?: string };

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(d: Date | null) {
  if (!d) return 'Sem visitas';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const NIVEL_LABEL: Record<string, string> = {
  bronze: 'Bronze',
  prata: 'Prata',
  ouro: 'Ouro',
};

export default async function ClientesPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') redirect('/sem-permissao');

  const q = (searchParams.q ?? '').trim();
  const nivel = (searchParams.nivel ?? '').trim();

  const where: any = { role: 'user' };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
  }

  const clientes = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      loyaltyAccount: {
        select: {
          saldoPontos: true,
          nivelFidelidade: true,
          ativo: true,
        },
      },
      appointmentsAsClient: {
        select: {
          id: true,
          status: true,
          valorTotal: true,
          dataAgendamento: true,
        },
      },
    },
  });

  const agora = new Date();
  const trintaDias = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

  const enriquecidos = clientes.map((c) => {
    const atendidos = c.appointmentsAsClient.filter((a) => a.status === 'atendido');
    const totalGasto = atendidos.reduce((acc, a) => acc + Number(a.valorTotal ?? 0), 0);
    const ultimaVisita = atendidos.reduce<Date | null>((acc, a) => {
      const d = new Date(a.dataAgendamento);
      return !acc || d > acc ? d : acc;
    }, null);
    const ativo30d = c.appointmentsAsClient.some(
      (a) => new Date(a.dataAgendamento) >= trintaDias && a.status !== 'cancelado'
    );
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      createdAt: c.createdAt,
      nivel: c.loyaltyAccount?.nivelFidelidade ?? 'bronze',
      pontos: c.loyaltyAccount?.saldoPontos ?? 0,
      totalAgendamentos: c.appointmentsAsClient.length,
      totalGasto,
      ultimaVisita,
      ativo30d,
    };
  });

  const filtrados = nivel ? enriquecidos.filter((c) => c.nivel === nivel) : enriquecidos;

  const totalClientes = enriquecidos.length;
  const ativos30d = enriquecidos.filter((c) => c.ativo30d).length;
  const comVisita = enriquecidos.filter((c) => c.totalGasto > 0);
  const ticketMedio = comVisita.length
    ? comVisita.reduce((acc, c) => acc + c.totalGasto, 0) / comVisita.length
    : 0;
  const taxaRetorno = totalClientes ? Math.round((comVisita.filter((c) => c.totalAgendamentos > 1).length / totalClientes) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Reveal variant="up">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-fg-muted">Painel do dono</p>
            <h1 className="mt-1 font-display text-3xl text-fg">Clientes</h1>
            <p className="mt-1 text-sm text-fg-muted">
              Base completa com histórico, fidelidade e ticket médio.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/painel-dono">
              <Button variant="ghost" size="sm">Voltar ao painel</Button>
            </Link>
            <a href="/api/admin/clients/export" download>
              <Button variant="secondary" size="sm">Exportar CSV</Button>
            </a>
          </div>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal variant="up" delay={0}>
          <Card className="hover-lift">
            <CardBody>
              <p className="text-xs uppercase tracking-wider text-fg-muted">Total de clientes</p>
              <p className="mt-2 font-display text-3xl text-brand">
                <CountUp to={totalClientes} />
              </p>
            </CardBody>
          </Card>
        </Reveal>
        <Reveal variant="up" delay={80}>
          <Card className="hover-lift">
            <CardBody>
              <p className="text-xs uppercase tracking-wider text-fg-muted">Ativos (30 dias)</p>
              <p className="mt-2 font-display text-3xl text-accent">
                <CountUp to={ativos30d} />
              </p>
            </CardBody>
          </Card>
        </Reveal>
        <Reveal variant="up" delay={160}>
          <Card className="hover-lift">
            <CardBody>
              <p className="text-xs uppercase tracking-wider text-fg-muted">Ticket médio</p>
              <p className="mt-2 font-display text-3xl text-fg">{fmtBRL(ticketMedio)}</p>
            </CardBody>
          </Card>
        </Reveal>
        <Reveal variant="up" delay={240}>
          <Card className="hover-lift">
            <CardBody>
              <p className="text-xs uppercase tracking-wider text-fg-muted">Taxa de retorno</p>
              <p className="mt-2 font-display text-3xl text-fg">
                <CountUp to={taxaRetorno} />%
              </p>
            </CardBody>
          </Card>
        </Reveal>
      </div>

      <Reveal variant="up" delay={120}>
        <form className="mt-8 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-4">
          <div className="min-w-[220px] flex-1">
            <label htmlFor="q" className="mb-1 block text-xs uppercase tracking-wider text-fg-muted">
              Buscar
            </label>
            <Input id="q" name="q" defaultValue={q} placeholder="Nome ou e-mail" />
          </div>
          <div>
            <label htmlFor="nivel" className="mb-1 block text-xs uppercase tracking-wider text-fg-muted">
              Nível
            </label>
            <select
              id="nivel"
              name="nivel"
              defaultValue={nivel}
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-fg"
            >
              <option value="">Todos</option>
              <option value="bronze">Bronze</option>
              <option value="prata">Prata</option>
              <option value="ouro">Ouro</option>
            </select>
          </div>
          <Button type="submit" size="sm">Filtrar</Button>
          {(q || nivel) && (
            <Link href="/painel-dono/clientes">
              <Button type="button" variant="ghost" size="sm">Limpar</Button>
            </Link>
          )}
        </form>
      </Reveal>

      <Reveal variant="up" delay={160}>
        <Card className="mt-6">
          <CardTitle>Lista de clientes</CardTitle>
          <CardBody>
            {filtrados.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-fg-muted">Nenhum cliente encontrado com esses filtros.</p>
                <p className="mt-1 text-sm text-fg-muted">
                  Compartilhe o link de agendamento para começar a receber clientes.
                </p>
                <Link href="/agendar" className="mt-4 inline-block">
                  <Button size="sm">Ver página de agendamento</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-fg-muted">
                      <th className="py-2 pr-3">Cliente</th>
                      <th className="py-2 pr-3">Contato</th>
                      <th className="py-2 pr-3">Nível</th>
                      <th className="py-2 pr-3">Pontos</th>
                      <th className="py-2 pr-3">Agendamentos</th>
                      <th className="py-2 pr-3">Total gasto</th>
                      <th className="py-2 pr-3">Última visita</th>
                      <th className="py-2 pr-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((c) => (
                      <tr key={c.id} className="border-b border-border/60 transition-colors duration-150 hover:bg-brand/5">
                        <td className="py-3 pr-3">
                          <p className="font-medium text-fg">{c.name}</p>
                          <p className="text-xs text-fg-muted">Desde {fmtDate(c.createdAt)}</p>
                        </td>
                        <td className="py-3 pr-3 text-fg-muted">
                          <p>{c.email}</p>
                          <p className="text-xs">{c.phone ?? 'Sem telefone'}</p>
                        </td>
                        <td className="py-3 pr-3">
                          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">
                            {NIVEL_LABEL[c.nivel] ?? c.nivel}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-fg">{c.pontos}</td>
                        <td className="py-3 pr-3 text-fg">{c.totalAgendamentos}</td>
                        <td className="py-3 pr-3 text-fg">{fmtBRL(c.totalGasto)}</td>
                        <td className="py-3 pr-3 text-fg-muted">{fmtDate(c.ultimaVisita)}</td>
                        <td className="py-3 pr-3">
                          {c.ativo30d ? (
                            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">Ativo</span>
                          ) : (
                            <span className="rounded-full bg-fg-muted/10 px-2 py-0.5 text-xs text-fg-muted">Inativo</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </Reveal>
    </div>
  );
}
