import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agenda | Painel do Dono — Barbearia Dom Corte",
  description:
    "Agenda geral da Barbearia Dom Corte: acompanhe os horários do dia por barbeiro, o status de cada atendimento e a ocupação da equipe.",
  robots: { index: false, follow: false },
};

type StatusAtendimento = "confirmado" | "atendido" | "no-show" | "cancelado";

type Agendamento = {
  id: string;
  hora: string;
  cliente: string;
  servico: string;
  duracao: number;
  barbeiro: string;
  status: StatusAtendimento;
  valor: number;
};

const barbeiros = ["Dom Corte", "Rafa", "Léo"] as const;

const agendamentos: Agendamento[] = [
  {
    id: "ag-0900-dom",
    hora: "09:00",
    cliente: "Marcos Vinícius",
    servico: "Corte + Barba",
    duracao: 60,
    barbeiro: "Dom Corte",
    status: "atendido",
    valor: 70,
  },
  {
    id: "ag-0900-rafa",
    hora: "09:00",
    cliente: "Diego Almeida",
    servico: "Corte",
    duracao: 30,
    barbeiro: "Rafa",
    status: "atendido",
    valor: 45,
  },
  {
    id: "ag-1000-leo",
    hora: "10:00",
    cliente: "Felipe Souza",
    servico: "Barba",
    duracao: 30,
    barbeiro: "Léo",
    status: "atendido",
    valor: 35,
  },
  {
    id: "ag-1030-dom",
    hora: "10:30",
    cliente: "Rodrigo Lima",
    servico: "Corte",
    duracao: 30,
    barbeiro: "Dom Corte",
    status: "confirmado",
    valor: 45,
  },
  {
    id: "ag-1100-rafa",
    hora: "11:00",
    cliente: "Bruno Carvalho",
    servico: "Corte + Sobrancelha",
    duracao: 45,
    barbeiro: "Rafa",
    status: "confirmado",
    valor: 55,
  },
  {
    id: "ag-1130-leo",
    hora: "11:30",
    cliente: "Thiago Nunes",
    servico: "Corte + Barba",
    duracao: 60,
    barbeiro: "Léo",
    status: "no-show",
    valor: 70,
  },
  {
    id: "ag-1400-dom",
    hora: "14:00",
    cliente: "André Martins",
    servico: "Corte",
    duracao: 30,
    barbeiro: "Dom Corte",
    status: "confirmado",
    valor: 45,
  },
  {
    id: "ag-1430-rafa",
    hora: "14:30",
    cliente: "Gustavo Pereira",
    servico: "Barba",
    duracao: 30,
    barbeiro: "Rafa",
    status: "confirmado",
    valor: 35,
  },
  {
    id: "ag-1500-leo",
    hora: "15:00",
    cliente: "Henrique Dias",
    servico: "Corte + Barba",
    duracao: 60,
    barbeiro: "Léo",
    status: "cancelado",
    valor: 70,
  },
  {
    id: "ag-1600-dom",
    hora: "16:00",
    cliente: "Paulo Ricardo",
    servico: "Corte + Sobrancelha",
    duracao: 45,
    barbeiro: "Dom Corte",
    status: "confirmado",
    valor: 55,
  },
];

const statusLabel: Record<StatusAtendimento, string> = {
  confirmado: "Confirmado",
  atendido: "Atendido",
  "no-show": "No-show",
  cancelado: "Cancelado",
};

const statusClasses: Record<StatusAtendimento, string> = {
  confirmado:
    "bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))] ring-1 ring-[hsl(var(--brand)/0.25)]",
  atendido:
    "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))] ring-1 ring-[hsl(var(--success)/0.25)]",
  "no-show":
    "bg-[hsl(var(--danger)/0.12)] text-[hsl(var(--danger))] ring-1 ring-[hsl(var(--danger)/0.25)]",
  cancelado:
    "bg-[hsl(var(--surface-2))] text-[hsl(var(--fg-muted))] ring-1 ring-[hsl(var(--border))]",
};

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function hojeFormatado() {
  const hoje = new Date();
  return hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export default function PainelDonoAgendaPage() {
  const total = agendamentos.length;
  const atendidos = agendamentos.filter((a) => a.status === "atendido").length;
  const confirmados = agendamentos.filter((a) => a.status === "confirmado").length;
  const noShows = agendamentos.filter((a) => a.status === "no-show").length;
  const faturamentoPrevisto = agendamentos
    .filter((a) => a.status === "confirmado" || a.status === "atendido")
    .reduce((acc, a) => acc + a.valor, 0);
  const ocupacao = Math.round(((atendidos + confirmados) / total) * 100);

  const porBarbeiro = barbeiros.map((nome) => {
    const lista = agendamentos.filter((a) => a.barbeiro === nome);
    const ativos = lista.filter(
      (a) => a.status === "confirmado" || a.status === "atendido",
    );
    return {
      nome,
      total: lista.length,
      ativos: ativos.length,
      faturamento: ativos.reduce((acc, a) => acc + a.valor, 0),
    };
  });

  return (
    <main className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Trilha de navegação" className="mb-6 text-sm">
          <ol className="flex flex-wrap items-center gap-2 text-[hsl(var(--fg-muted))]">
            <li>
              <Link
                href="/painel-dono"
                className="rounded transition-colors hover:text-[hsl(var(--brand))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
              >
                Painel do dono
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-[hsl(var(--fg))]">
              Agenda
            </li>
          </ol>
        </nav>

        {/* Hero curto */}
        <header className="mb-8 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--brand))]">
                Visão geral do dia
              </p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
                Agenda
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[hsl(var(--fg-muted))] sm:text-base">
                Acompanhe os horários de {hojeFormatado()} por barbeiro, o status
                de cada atendimento e a ocupação da equipe em tempo real.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/painel-dono"
                className="inline-flex items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-medium text-[hsl(var(--fg))] transition-colors hover:bg-[hsl(var(--surface-2))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
              >
                Voltar ao painel
              </Link>
              <Link
                href="/agendar"
                className="inline-flex items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--brand))] px-4 py-2 text-sm font-semibold text-[hsl(var(--brand-fg))] transition-colors hover:bg-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
              >
                Novo agendamento
              </Link>
            </div>
          </div>
        </header>

        {/* KPIs */}
        <section
          aria-label="Indicadores do dia"
          className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
        >
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--fg-muted))]">
              Agendamentos
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold">
              {total}
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--fg-muted))]">
              Ocupação
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[hsl(var(--success))]">
              {ocupacao}%
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--fg-muted))]">
              No-shows
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[hsl(var(--danger))]">
              {noShows}
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--fg-muted))]">
              Faturamento previsto
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold">
              {formatBRL(faturamentoPrevisto)}
            </p>
          </div>
        </section>

        {/* Resumo por barbeiro */}
        <section aria-labelledby="por-barbeiro" className="mb-8">
          <h2
            id="por-barbeiro"
            className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold"
          >
            Resumo por barbeiro
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {porBarbeiro.map((b) => (
              <div
                key={b.nome}
                className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{b.nome}</p>
                  <span className="rounded-full bg-[hsl(var(--surface-2))] px-2 py-0.5 text-xs font-medium text-[hsl(var(--fg-muted))]">
                    {b.ativos}/{b.total} ativos
                  </span>
                </div>
                <p className="mt-2 text-sm text-[hsl(var(--fg-muted))]">
                  Faturamento:{" "}
                  <span className="font-semibold text-[hsl(var(--fg))]">
                    {formatBRL(b.faturamento)}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tabela de agenda */}
        <section aria-labelledby="agenda-do-dia">
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="agenda-do-dia"
              className="font-[family-name:var(--font-display)] text-lg font-semibold"
            >
              Agenda do dia
            </h2>
            <Link
              href="/barbeiro/bloqueios"
              className="text-sm font-medium text-[hsl(var(--brand))] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
            >
              Gerenciar bloqueios
            </Link>
          </div>

          {/* Mobile: cards */}
          <ul className="space-y-3 md:hidden">
            {agendamentos.map((a) => (
              <li
                key={a.id}
                className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-lg font-bold">
                      {a.hora}
                    </p>
                    <p className="text-sm font-medium">{a.cliente}</p>
                    <p className="text-xs text-[hsl(var(--fg-muted))]">
                      {a.servico} · {a.duracao} min · {a.barbeiro}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[a.status]}`}
                  >
                    {statusLabel[a.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold">{formatBRL(a.valor)}</p>
              </li>
            ))}
          </ul>

          {/* Desktop: tabela */}
          <div className="hidden overflow-hidden rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-[hsl(var(--surface-2))] text-xs uppercase tracking-wide text-[hsl(var(--fg-muted))]">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Hora
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Cliente
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Serviço
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Barbeiro
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {agendamentos.map((a) => (
                  <tr key={a.id} className="hover:bg-[hsl(var(--surface-2)/0.5)]">
                    <td className="px-4 py-3 font-[family-name:var(--font-display)] font-semibold">
                      {a.hora}
                    </td>
                    <td className="px-4 py-3">{a.cliente}</td>
                    <td className="px-4 py-3 text-[hsl(var(--fg-muted))]">
                      {a.servico}{" "}
                      <span className="text-xs">({a.duracao} min)</span>
                    </td>
                    <td className="px-4 py-3">{a.barbeiro}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[a.status]}`}
                      >
                        {statusLabel[a.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatBRL(a.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA final */}
        <section className="mt-10 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 text-center sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
            Precisa ajustar a operação?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[hsl(var(--fg-muted))]">
            Gerencie serviços, barbeiros e horários de funcionamento para manter a
            agenda sempre alinhada com a rotina da barbearia.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link
              href="/painel-dono"
              className="inline-flex items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--brand))] px-4 py-2 text-sm font-semibold text-[hsl(var(--brand-fg))] transition-colors hover:bg-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]">
              Voltar ao painel
            </Link>
            <Link
              href="/configuracoes"
              className="inline-flex items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-medium text-[hsl(var(--fg))] transition-colors hover:bg-[hsl(var(--surface-2))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
            >
              Configurações do negócio
            </Link>
            <Link
              href="/painel-dono/clientes"
              className="inline-flex items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-medium text-[hsl(var(--fg))] transition-colors hover:bg-[hsl(var(--surface-2))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
            >
              Ver clientes
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}