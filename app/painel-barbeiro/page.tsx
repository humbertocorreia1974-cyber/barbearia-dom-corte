import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Painel barbeiro | Barbearia Dom Corte",
  description:
    "Agenda do dia, marcação de atendimento, no-show e bloqueios de horário para barbeiros da Barbearia Dom Corte.",
  robots: { index: false, follow: false },
};

type Appointment = {
  id: string;
  hora: string;
  cliente: string;
  servico: string;
  duracao: number;
  preco: number;
  status: "confirmado" | "atendido" | "no-show" | "pendente";
};

const agendaDoDia: Appointment[] = [
  {
    id: "ag-001",
    hora: "09:00",
    cliente: "Rafael Souza",
    servico: "Corte + Barba",
    duracao: 60,
    preco: 70,
    status: "atendido",
  },
  {
    id: "ag-002",
    hora: "10:00",
    cliente: "Marcos Vinícius",
    servico: "Corte",
    duracao: 30,
    preco: 40,
    status: "atendido",
  },
  {
    id: "ag-003",
    hora: "11:00",
    cliente: "Diego Almeida",
    servico: "Barba",
    duracao: 30,
    preco: 35,
    status: "confirmado",
  },
  {
    id: "ag-004",
    hora: "13:30",
    cliente: "Bruno Carvalho",
    servico: "Corte + Sobrancelha",
    duracao: 45,
    preco: 55,
    status: "confirmado",
  },
  {
    id: "ag-005",
    hora: "14:30",
    cliente: "Felipe Nunes",
    servico: "Corte",
    duracao: 30,
    preco: 40,
    status: "pendente",
  },
  {
    id: "ag-006",
    hora: "16:00",
    cliente: "João Pedro Lima",
    servico: "Combo Dom Corte",
    duracao: 75,
    preco: 90,
    status: "confirmado",
  },
];

const statusLabel: Record<Appointment["status"], string> = {
  confirmado: "Confirmado",
  atendido: "Atendido",
  "no-show": "No-show",
  pendente: "Aguardando",
};

const statusClasses: Record<Appointment["status"], string> = {
  confirmado:
    "bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand))] ring-1 ring-[hsl(var(--brand))]/20",
  atendido:
    "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] ring-1 ring-[hsl(var(--success))]/20",
  "no-show":
    "bg-[hsl(var(--danger))]/10 text-[hsl(var(--danger))] ring-1 ring-[hsl(var(--danger))]/20",
  pendente:
    "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning-fg))] ring-1 ring-[hsl(var(--warning))]/30",
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function PainelBarbeiroPage() {
  const totalAtendidos = agendaDoDia.filter((a) => a.status === "atendido").length;
  const totalConfirmados = agendaDoDia.filter((a) => a.status === "confirmado").length;
  const totalNoShow = agendaDoDia.filter((a) => a.status === "no-show").length;
  const faturamentoPrevisto = agendaDoDia
    .filter((a) => a.status !== "no-show")
    .reduce((acc, a) => acc + a.preco, 0);
  const faturamentoRealizado = agendaDoDia
    .filter((a) => a.status === "atendido")
    .reduce((acc, a) => acc + a.preco, 0);

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <main className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Trilha de navegação"
          className="mb-4 flex items-center gap-2 text-xs text-[hsl(var(--fg-muted))]"
        >
          <Link
            href="/"
            className="rounded-sm underline-offset-4 hover:text-[hsl(var(--brand))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
          >
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-[hsl(var(--fg))]">Painel barbeiro</span>
        </nav>

        {/* Hero curto */}
        <header className="mb-8 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--brand))]">
                Painel barbeiro
              </p>
              <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight sm:text-3xl">
                Sua agenda de hoje
              </h1>
              <p className="mt-2 max-w-xl text-sm text-[hsl(var(--fg-muted))]">
                {hoje.charAt(0).toUpperCase() + hoje.slice(1)} · Acompanhe a fila do dia,
                marque atendimentos, registre no-shows e bloqueie horários de almoço ou folga.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/barbeiro/bloqueios"
                className="inline-flex items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-4 py-2 text-sm font-medium text-[hsl(var(--fg))] transition hover:bg-[hsl(var(--surface))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
              >
                Bloquear horário
              </Link>
              <Link
                href="/notificacoes"
                className="inline-flex items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--brand))] px-4 py-2 text-sm font-semibold text-[hsl(var(--brand-fg))] shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
              >
                Ver notificações
              </Link>
            </div>
          </div>
        </header>

        {/* KPIs */}
        <section
          aria-label="Resumo do dia"
          className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--fg-muted))]">
              Atendidos
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
              {totalAtendidos}
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--fg-muted))]">
              Confirmados
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
              {totalConfirmados}
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--fg-muted))]">
              No-show
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-[hsl(var(--danger))]">
              {totalNoShow}
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--fg-muted))]">
              Faturamento
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold sm:text-xl">
              {formatBRL(faturamentoRealizado)}
            </p>
            <p className="text-[11px] text-[hsl(var(--fg-muted))]">
              previsto {formatBRL(faturamentoPrevisto)}
            </p>
          </div>
        </section>

        {/* Agenda */}
        <section aria-labelledby="agenda-heading" className="mb-8">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2
              id="agenda-heading"
              className="font-[family-name:var(--font-display)] text-lg font-semibold sm:text-xl"
            >
              Fila do dia
            </h2>
            <Link
              href="/meus-agendamentos"
              className="text-sm font-medium text-[hsl(var(--brand))] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
            >
              Ver todos
            </Link>
          </div>

          {agendaDoDia.length === 0 ? (
            <div className="rounded-[var(--radius)] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-8 text-center">
              <p className="font-medium">Nenhum agendamento para hoje.</p>
              <p className="mt-1 text-sm text-[hsl(var(--fg-muted))]">
                Aproveite para revisar seus bloqueios ou atualizar seus horários.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {agendaDoDia.map((item) => (
                <li
                  key={item.id}
                  className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--surface-2))] text-[hsl(var(--fg))]">
                        <span className="font-[family-name:var(--font-display)] text-sm font-semibold">
                          {item.hora}
                        </span>
                        <span className="text-[10px] text-[hsl(var(--fg-muted))]">
                          {item.duracao}min
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.cliente}</p>
                        <p className="truncate text-sm text-[hsl(var(--fg-muted))]">
                          {item.servico} · {formatBRL(item.preco)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[item.status]}`}
                      >
                        {statusLabel[item.status]}
                      </span>
                      <Link
                        href={`/meus-agendamentos/${item.id}`}
                        className="inline-flex items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--fg))] transition hover:bg-[hsl(var(--surface))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
                      >
                        Detalhes
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Ações rápidas */}
        <section aria-labelledby="acoes-heading" className="mb-8">
          <h2
            id="acoes-heading"
            className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold sm:text-xl"
          >
            Ações rápidas
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/barbeiro/bloqueios"
              className="group rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 transition hover:border-[hsl(var(--brand))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
            >
              <p className="font-medium">Bloquear horário</p>
              <p className="mt-1 text-sm text-[hsl(var(--fg-muted))]">
                Almoço, folga ou pausa — o slot fica indisponível para novos agendamentos.
              </p>
            </Link>
            <Link
              href="/agendar"
              className="group rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 transition hover:border-[hsl(var(--brand))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
            >
              <p className="font-medium">Novo agendamento</p>
              <p className="mt-1 text-sm text-[hsl(var(--fg-muted))]">
                Encaixe um cliente manualmente escolhendo serviço, barbeiro e horário.
              </p>
            </Link>
            <Link
              href="/notificacoes"
              className="group rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 transition hover:border-[hsl(var(--brand))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
            >
              <p className="font-medium">Notificações</p>
              <p className="mt-1 text-sm text-[hsl(var(--fg-muted))]">
                Confirmações, cancelamentos e lembretes enviados aos clientes.
              </p>
            </Link>
          </div>
        </section>

        {/* Rodapé de apoio */}
        <footer className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] p-4 text-sm text-[hsl(var(--fg-muted))]">
          <p>
            Precisa de ajuda com o painel? Consulte o{" "}
            <Link
              href="/primeiros-passos"
              className="font-medium text-[hsl(var(--brand))] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-2))]"
            >
              guia de primeiros passos
            </Link>{" "}
            ou fale com o dono pelo{" "}
            <Link
              href="/contato"
              className="font-medium text-[hsl(var(--brand))] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-2))]"
            >
              canal de contato
            </Link>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}