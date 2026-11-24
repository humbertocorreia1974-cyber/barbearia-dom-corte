import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Serviços | Barbearia Dom Corte",
  description:
    "Gerencie o catálogo de serviços da Barbearia Dom Corte: preços, duração e disponibilidade.",
};

type Servico = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
  ativo: boolean;
  agendamentosMes: number;
};

const servicos: Servico[] = [
  {
    id: "corte",
    nome: "Corte",
    descricao: "Corte na tesoura ou máquina, finalização com pomada.",
    preco: 45,
    duracao: 30,
    ativo: true,
    agendamentosMes: 128,
  },
  {
    id: "barba",
    nome: "Barba",
    descricao: "Modelagem com navalha, toalha quente e balm.",
    preco: 35,
    duracao: 25,
    ativo: true,
    agendamentosMes: 74,
  },
  {
    id: "combo",
    nome: "Combo Corte + Barba",
    descricao: "O clássico do Dom Corte: corte completo e barba.",
    preco: 70,
    duracao: 50,
    ativo: true,
    agendamentosMes: 96,
  },
  {
    id: "sobrancelha",
    nome: "Sobrancelha",
    descricao: "Design com navalha e pinça, acabamento discreto.",
    preco: 20,
    duracao: 15,
    ativo: true,
    agendamentosMes: 41,
  },
  {
    id: "pigmentacao",
    nome: "Pigmentação de barba",
    descricao: "Preenchimento de falhas com pigmento temporário.",
    preco: 55,
    duracao: 40,
    ativo: false,
    agendamentosMes: 0,
  },
];

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDuracao(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, "0")}`;
}

export default function ServicosPage() {
  const totalAtivos = servicos.filter((s) => s.ativo).length;
  const ticketMedio =
    servicos.filter((s) => s.ativo).reduce((acc, s) => acc + s.preco, 0) /
    Math.max(totalAtivos, 1);

  return (
    <main className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Trilha de navegação"
          className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[hsl(var(--fg-muted))]"
        >
          <Link
            href="/painel-dono"
            className="rounded transition-colors hover:text-[hsl(var(--brand))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
          >
            Painel do dono
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-[hsl(var(--fg))]">Serviços</span>
        </nav>

        {/* Hero */}
        <header className="mb-8 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--brand))]">
                Catálogo
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight sm:text-3xl">
                Serviços
              </h1>
              <p className="mt-2 text-sm text-[hsl(var(--fg-muted))] sm:text-base">
                Ajuste preços, duração e disponibilidade dos serviços que
                aparecem para o cliente na hora de agendar. Alterações refletem
                imediatamente na agenda.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/agendar"
                className="inline-flex items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--brand))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--brand-fg))] shadow-sm transition-colors hover:bg-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
              >
                Ver como cliente
              </Link>
              <Link
                href="/painel-dono"
                className="inline-flex items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--fg))] transition-colors hover:bg-[hsl(var(--surface))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
              >
                Voltar ao painel
              </Link>
            </div>
          </div>
        </header>

        {/* Resumo */}
        <section
          aria-label="Resumo do catálogo"
          className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--fg-muted))]">
              Serviços ativos
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold">
              {totalAtivos}
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--fg-muted))]">
              Ticket médio
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold">
              {formatBRL(ticketMedio)}
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--fg-muted))]">
              Agendamentos no mês
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold">
              {servicos.reduce((acc, s) => acc + s.agendamentosMes, 0)}
            </p>
          </div>
        </section>

        {/* Lista */}
        <section aria-labelledby="lista-servicos">
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="lista-servicos"
              className="font-[family-name:var(--font-display)] text-lg font-semibold"
            >
              Todos os serviços
            </h2>
            <span className="text-xs text-[hsl(var(--fg-muted))]">
              {servicos.length} cadastrados
            </span>
          </div>

          <ul className="space-y-3">
            {servicos.map((s) => (
              <li
                key={s.id}
                className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-[family-name:var(--font-display)] text-base font-semibold">
                        {s.nome}
                      </h3>
                      {s.ativo ? (
                        <span className="inline-flex items-center rounded-full bg-[hsl(var(--success))]/10 px-2 py-0.5 text-xs font-medium text-[hsl(var(--success))]">
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-[hsl(var(--warning))]/15 px-2 py-0.5 text-xs font-medium text-[hsl(var(--warning-fg))]">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-[hsl(var(--fg-muted))]">
                      {s.descricao}
                    </p>
                    <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <div className="flex items-center gap-1.5">
                        <dt className="text-[hsl(var(--fg-muted))]">Preço:</dt>
                        <dd className="font-semibold">{formatBRL(s.preco)}</dd>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <dt className="text-[hsl(var(--fg-muted))]">Duração:</dt>
                        <dd className="font-semibold">
                          {formatDuracao(s.duracao)}
                        </dd>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <dt className="text-[hsl(var(--fg-muted))]">
                          No mês:
                        </dt>
                        <dd className="font-semibold">{s.agendamentosMes}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-sm font-medium text-[hsl(var(--fg))] transition-colors hover:bg-[hsl(var(--surface))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm font-medium text-[hsl(var(--fg-muted))] transition-colors hover:text-[hsl(var(--danger))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--danger))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
                    >
                      {s.ativo ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Aviso */}
        <aside
          role="note"
          className="mt-8 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] p-4 text-sm text-[hsl(var(--fg-muted))]"
        >
          <p>
            <strong className="text-[hsl(var(--fg))]">Dica:</strong> a duração
            do serviço define o tamanho do slot na agenda. Serviços com duração
            maior bloqueiam mais tempo do barbeiro — revise antes de ativar.
          </p>
        </aside>

        {/* CTA final */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/painel-dono"
            className="inline-flex items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--brand))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--brand-fg))] shadow-sm transition-colors hover:bg-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
          >
            Voltar ao painel do dono
          </Link>
          <Link
            href="/contato"
            className="inline-flex items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--fg))] transition-colors hover:bg-[hsl(var(--surface-2))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
          >
            Falar com o suporte
          </Link>
        </div>
      </div>
    </main>
  );
}