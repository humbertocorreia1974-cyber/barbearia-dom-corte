import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { PeriodoFiltro } from "./periodo-filtro-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Painel do dono | Barbearia Dom Corte",
  description:
    "Visão geral do negócio: faturamento, ocupação, taxa de no-show e ranking de barbeiros da Barbearia Dom Corte.",
  openGraph: {
    title: "Painel do dono | Barbearia Dom Corte",
    description:
      "Faturamento, ocupação e no-show em tempo real na Barbearia Dom Corte.",
    type: "website",
  },
};

function inicioDoDia(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function fimDoDia(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PainelDonoPage({
  searchParams,
}: {
  searchParams: { periodo?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/entrar");
  if (session.user.role !== "admin") redirect("/sem-permissao");

  const periodo = searchParams.periodo === "semana" ? "semana" : "dia";
  const agora = new Date();
  const inicio =
    periodo === "semana"
      ? inicioDoDia(new Date(agora.getTime() - 6 * 24 * 60 * 60 * 1000))
      : inicioDoDia(agora);
  const fim = fimDoDia(agora);

  const [agendamentos, barbeiros, servicos, settings] = await Promise.all([
    prisma.appointment.findMany({
      where: { dataAgendamento: { gte: inicio, lte: fim } },
      include: {
        barber: { select: { id: true, nomeCompleto: true, apelido: true } },
        service: { select: { nomeServico: true, duracaoMinutos: true } },
        client: { select: { name: true } },
      },
      orderBy: [{ dataAgendamento: "asc" }, { horaInicio: "asc" }],
    }),
    prisma.barber.findMany({
      where: { ativo: true },
      select: { id: true, nomeCompleto: true, apelido: true },
    }),
    prisma.service.findMany({
      where: { ativo: true },
      select: { id: true, nomeServico: true, duracaoMinutos: true },
    }),
    prisma.businessSettings.findFirst(),
  ]);

  const faturamento = agendamentos
    .filter((a) => a.status === "atendido")
    .reduce((s, a) => s + Number(a.valorTotal), 0);

  const total = agendamentos.length;
  const atendidos = agendamentos.filter((a) => a.status === "atendido").length;
  const noShow = agendamentos.filter((a) => a.status === "no_show").length;
  const cancelados = agendamentos.filter((a) => a.status === "cancelado").length;
  const confirmados = agendamentos.filter((a) => a.status === "confirmado").length;
  const taxaNoShow = total > 0 ? (noShow / total) * 100 : 0;

  const minutosDisponiveisPorBarbeiro =
    (() => {
      const ab = settings?.horarioAbertura ?? "09:00";
      const fe = settings?.horarioFechamento ?? "19:00";
      const [h1, m1] = ab.split(":").map(Number);
      const [h2, m2] = fe.split(":").map(Number);
      return Math.max(0, h2 * 60 + m2 - (h1 * 60 + m1));
    })() * (periodo === "semana" ? 7 : 1);

  const minutosOcupados = agendamentos
    .filter((a) => a.status !== "cancelado")
    .reduce((s, a) => s + (a.service?.duracaoMinutos ?? 30), 0);

  const capacidadeTotal = minutosDisponiveisPorBarbeiro * Math.max(1, barbeiros.length);
  const ocupacao =
    capacidadeTotal > 0 ? Math.min(100, (minutosOcupados / capacidadeTotal) * 100) : 0;

  const rankingMap = new Map<string, { nome: string; total: number; receita: number }>();
  for (const a of agendamentos) {
    if (a.status !== "atendido") continue;
    const key = a.barber.id;
    const atual = rankingMap.get(key) ?? {
      nome: a.barber.apelido || a.barber.nomeCompleto,
      total: 0,
      receita: 0,
    };
    atual.total += 1;
    atual.receita += Number(a.valorTotal);
    rankingMap.set(key, atual);
  }
  const ranking = Array.from(rankingMap.values())
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 5);

  const proximos = agendamentos
    .filter((a) => a.status === "confirmado")
    .slice(0, 6);

  const servicoMap = new Map<string, number>();
  for (const a of agendamentos) {
    if (a.status !== "atendido") continue;
    const k = a.service?.nomeServico ?? "Outro";
    servicoMap.set(k, (servicoMap.get(k) ?? 0) + 1);
  }
  const topServicos = Array.from(servicoMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-accent">
                Painel do dono
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold text-fg sm:text-4xl">
                Visão geral do negócio
              </h1>
              <p className="mt-2 max-w-xl text-sm text-fg-muted">
                Faturamento, ocupação e no-show da Barbearia Dom Corte em{" "}
                {periodo === "semana" ? "últimos 7 dias" : "hoje"}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/painel-dono/servicos">
                <Button variant="secondary" size="sm">
                  Serviços
                </Button>
              </Link>
              <Link href="/painel-dono/barbeiros">
                <Button variant="secondary" size="sm">
                  Barbeiros
                </Button>
              </Link>
              <Link href="/painel-dono/agenda">
                <Button variant="primary" size="sm">
                  Agenda geral
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>

        <div className="mt-6">
          <PeriodoFiltro atual={periodo} />
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Reveal variant="up" delay={0}>
            <Card className="hover-lift">
              <CardBody>
                <p className="text-xs uppercase tracking-wider text-fg-muted">
                  Faturamento
                </p>
                <p className="mt-2 font-display text-3xl font-bold text-brand">
                  <CountUp to={Math.round(faturamento)} prefix="R$ " />
                </p>
                <p className="mt-1 text-xs text-fg-muted">
                  {atendidos} atendimento{atendidos === 1 ? "" : "s"} concluído
                  {atendidos === 1 ? "" : "s"}
                </p>
              </CardBody>
            </Card>
          </Reveal>
          <Reveal variant="up" delay={80}>
            <Card className="hover-lift">
              <CardBody>
                <p className="text-xs uppercase tracking-wider text-fg-muted">
                  Ocupação
                </p>
                <p className="mt-2 font-display text-3xl font-bold text-fg">
                  <CountUp to={Math.round(ocupacao)} suffix="%" />
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${Math.min(100, ocupacao)}%` }}
                  />
                </div>
              </CardBody>
            </Card>
          </Reveal>
          <Reveal variant="up" delay={160}>
            <Card className="hover-lift">
              <CardBody>
                <p className="text-xs uppercase tracking-wider text-fg-muted">
                  Taxa de no-show
                </p>
                <p className="mt-2 font-display text-3xl font-bold text-fg">
                  <CountUp to={Math.round(taxaNoShow)} suffix="%" />
                </p>
                <p className="mt-1 text-xs text-fg-muted">
                  {noShow} falta{noShow === 1 ? "" : "s"} de {total} agendamento
                  {total === 1 ? "" : "s"}
                </p>
              </CardBody>
            </Card>
          </Reveal>
          <Reveal variant="up" delay={240}>
            <Card className="hover-lift">
              <CardBody>
                <p className="text-xs uppercase tracking-wider text-fg-muted">
                  Agendamentos
                </p>
                <p className="mt-2 font-display text-3xl font-bold text-fg">
                  <CountUp to={total} />
                </p>
                <p className="mt-1 text-xs text-fg-muted">
                  {confirmados} confirmado{confirmados === 1 ? "" : "s"} ·{" "}
                  {cancelados} cancelado{cancelados === 1 ? "" : "s"}
                </p>
              </CardBody>
            </Card>
          </Reveal>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <Reveal variant="left" delay={0}>
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-display text-lg font-semibold text-fg">
                Ranking de barbeiros
              </h2>
              <p className="mt-1 text-xs text-fg-muted">
                Por receita no período selecionado.
              </p>
              {ranking.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-fg-muted">
                    Nenhum atendimento concluído ainda neste período.
                  </p>
                  <Link href="/painel-dono/agenda" className="mt-3 inline-block">
                    <Button variant="secondary" size="sm">
                      Ver agenda geral
                    </Button>
                  </Link>
                </div>
              ) : (
                <ol className="mt-4 space-y-3">
                  {ranking.map((r, i) => (
                    <li
                      key={r.nome}
                      className="flex items-center justify-between rounded-xl border border-border bg-bg/40 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                          #{i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-fg">{r.nome}</p>
                          <p className="text-xs text-fg-muted">
                            {r.total} atendimento{r.total === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-brand">
                        {brl(r.receita)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </Reveal>

          <Reveal variant="up" delay={80}>
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-display text-lg font-semibold text-fg">
                Próximos agendamentos
              </h2>
              <p className="mt-1 text-xs text-fg-muted">
                Confirmados no período.
              </p>
              {proximos.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-fg-muted">
                    Sem agendamentos confirmados no período.
                  </p>
                  <Link href="/agendar" className="mt-3 inline-block">
                    <Button variant="secondary" size="sm">
                      Novo agendamento
                    </Button>
                  </Link>
                </div>
              ) : (
                <ul className="mt-4 space-y-2">
                  {proximos.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-fg">
                          {a.horaInicio} · {a.client.name}
                        </p>
                        <p className="text-xs text-fg-muted">
                          {a.service?.nomeServico} com{" "}
                          {a.barber.apelido || a.barber.nomeCompleto}
                        </p>
                      </div>
                      <Link
                        href={`/agendamentos/${a.id}`}
                        className="text-xs font-medium text-brand hover:underline"
                      >
                        Detalhes
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>

          <Reveal variant="right" delay={160}>
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-display text-lg font-semibold text-fg">
                Serviços mais vendidos
              </h2>
              <p className="mt-1 text-xs text-fg-muted">
                Baseado em atendimentos concluídos.
              </p>
              {topServicos.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-fg-muted">
                    Ainda sem dados de serviços no período.
                  </p>
                  <Link href="/painel-dono/servicos" className="mt-3 inline-block">
                    <Button variant="secondary" size="sm">
                      Gerenciar serviços
                    </Button>
                  </Link>
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {topServicos.map(([nome, qtd]) => {
                    const pct = atendidos > 0 ? (qtd / atendidos) * 100 : 0;
                    return (
                      <li key={nome}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-fg">{nome}</span>
                          <span className="text-fg-muted">{qtd}x</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full rounded-full bg-brand"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Reveal>
        </section>

        <Reveal variant="up" delay={0}>
          <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-fg">
                  Todos os agendamentos do período
                </h2>
                <p className="mt-1 text-xs text-fg-muted">
                  {total} registro{total === 1 ? "" : "s"} em{" "}
                  {periodo === "semana" ? "7 dias" : "hoje"}.
                </p>
              </div>
              <Link href="/painel-dono/agenda">
                <Button variant="ghost" size="sm">
                  Abrir agenda completa
                </Button>
              </Link>
            </div>

            {agendamentos.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-fg-muted">
                  Nenhum agendamento registrado neste período.
                </p>
                <Link href="/agendar" className="mt-3 inline-block">
                  <Button variant="primary" size="sm">
                    Criar agendamento
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-fg-muted">
                      <th className="py-2 pr-3">Data</th>
                      <th className="py-2 pr-3">Hora</th>
                      <th className="py-2 pr-3">Cliente</th>
                      <th className="py-2 pr-3">Barbeiro</th>
                      <th className="py-2 pr-3">Serviço</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendamentos.slice(0, 20).map((a) => (
                      <tr
                        key={a.id}
                        className="border-b border-border/60 last:border-0"
                      >
                        <td className="py-2 pr-3 text-fg-muted">
                          {new Date(a.dataAgendamento).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-2 pr-3 text-fg">{a.horaInicio}</td>
                        <td className="py-2 pr-3 text-fg">{a.client.name}</td>
                        <td className="py-2 pr-3 text-fg-muted">
                          {a.barber.apelido || a.barber.nomeCompleto}
                        </td>
                        <td className="py-2 pr-3 text-fg-muted">
                          {a.service?.nomeServico}
                        </td>
                        <td className="py-2 pr-3">
                          <span
                            className={
                              "rounded-full px-2 py-0.5 text-xs " +
                              (a.status === "atendido"
                                ? "bg-brand/10 text-brand"
                                : a.status === "no_show"
                                ? "bg-accent/15 text-accent"
                                : a.status === "cancelado"
                                ? "bg-border text-fg-muted"
                                : "bg-brand/5 text-fg")
                            }
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-right text-fg">
                          {brl(Number(a.valorTotal))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </main>
  );
}
