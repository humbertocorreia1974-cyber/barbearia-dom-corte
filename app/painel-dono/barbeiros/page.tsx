import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Barbeiros | Barbearia Dom Corte",
  description:
    "Conheça os barbeiros da Barbearia Dom Corte em Volta Redonda. Agenda individual, especialidades e horários de atendimento.",
  openGraph: {
    title: "Barbeiros | Barbearia Dom Corte",
    description:
      "Conheça os barbeiros da Barbearia Dom Corte em Volta Redonda. Agenda individual, especialidades e horários de atendimento.",
    type: "website",
  },
};

type BarberCard = {
  id: string;
  nome: string;
  apelido?: string;
  especialidades: string[];
  bio: string;
  dias: string;
  horario: string;
  iniciais: string;
  destaque?: boolean;
};

const barbeiros: BarberCard[] = [
  {
    id: "dom-corte",
    nome: "Seu Domingos",
    apelido: "Dom",
    especialidades: ["Corte clássico", "Barba na navalha", "Combo"],
    bio: "Fundador da casa. Mais de 20 anos de tesoura e navalha. Atende com hora marcada e gosta de conversa boa.",
    dias: "Terça a sábado",
    horario: "09h às 19h",
    iniciais: "DC",
    destaque: true,
  },
  {
    id: "rafael",
    nome: "Rafael Souza",
    apelido: "Rafa",
    especialidades: ["Degradê", "Sobrancelha", "Corte infantil"],
    bio: "Especialista em degradê e acabamento. Paciência de sobra com os pequenos na primeira visita.",
    dias: "Segunda a sábado",
    horario: "10h às 20h",
    iniciais: "RS",
  },
  {
    id: "bruno",
    nome: "Bruno Lima",
    apelido: "Bruninho",
    especialidades: ["Barba desenhada", "Combo", "Pigmentação"],
    bio: "Cuida da barba como ninguém. Trabalha com produtos veganos e finalização com toalha quente.",
    dias: "Terça a domingo",
    horario: "11h às 21h",
    iniciais: "BL",
  },
];

export default function BarbeirosPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Trilha de navegação"
          className="mb-6 text-sm text-[hsl(var(--fg-muted))]"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/painel-dono"
                className="rounded underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
              >
                Painel do dono
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-[hsl(var(--fg))]">
              Barbeiros
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <header className="mb-10 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-sm sm:p-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[hsl(var(--brand))]">
            Equipe Dom Corte
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-4xl">
            Barbeiros
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[hsl(var(--fg-muted))] sm:text-lg">
            Cada barbeiro tem agenda própria, especialidades e horários
            definidos. Aqui você acompanha quem está atendendo, o que cada um
            faz melhor e como o time está distribuído na semana.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/agendar"
              className="inline-flex items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--brand))] px-5 py-3 text-sm font-semibold text-[hsl(var(--brand-fg))] shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
            >
              Agendar com um barbeiro
            </Link>
            <Link
              href="/painel-dono"
              className="inline-flex items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-5 py-3 text-sm font-semibold text-[hsl(var(--fg))] transition hover:bg-[hsl(var(--surface))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
            >
              Voltar ao painel
            </Link>
          </div>
        </header>

        {/* Resumo */}
        <section
          aria-label="Resumo da equipe"
          className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--fg-muted))]">
              Barbeiros ativos
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
              {barbeiros.length}
            </p>
            <p className="mt-1 text-sm text-[hsl(var(--fg-muted))]">
              Incluindo o dono, que também atende.
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--fg-muted))]">
              Cobertura semanal
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
              7 dias
            </p>
            <p className="mt-1 text-sm text-[hsl(var(--fg-muted))]">
              Escalas se sobrepõem para reduzir fila.
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--fg-muted))]">
              Especialidades
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
              9
            </p>
            <p className="mt-1 text-sm text-[hsl(var(--fg-muted))]">
              Do corte clássico à pigmentação.
            </p>
          </div>
        </section>

        {/* Lista de barbeiros */}
        <section aria-labelledby="lista-barbeiros" className="mb-12">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2
              id="lista-barbeiros"
              className="font-[family-name:var(--font-display)] text-xl font-semibold sm:text-2xl"
            >
              Time da casa
            </h2>
            <Link
              href="/painel-dono/clientes"
              className="text-sm font-medium text-[hsl(var(--brand))] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
            >
              Ver clientes
            </Link>
          </div>

          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {barbeiros.map((b) => (
              <li
                key={b.id}
                className="flex flex-col rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent))] font-[family-name:var(--font-display)] text-base font-bold text-[hsl(var(--accent-fg))]"
                  >
                    {b.iniciais}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-[family-name:var(--font-display)] text-lg font-semibold">
                      {b.nome}
                    </p>
                    {b.apelido ? (
                      <p className="truncate text-sm text-[hsl(var(--fg-muted))]">
                        “{b.apelido}”
                      </p>
                    ) : null}
                  </div>
                  {b.destaque ? (
                    <span className="ml-auto rounded-full bg-[hsl(var(--warning))] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--warning-fg))]">
                      Dono
                    </span>
                  ) : null}
                </div>

                <p className="mb-4 text-sm leading-relaxed text-[hsl(var(--fg-muted))]">
                  {b.bio}
                </p>

                <div className="mb-4 flex flex-wrap gap-1.5">
                  {b.especialidades.map((esp) => (
                    <span
                      key={esp}
                      className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--fg))]"
                    >
                      {esp}
                    </span>
                  ))}
                </div>

                <dl className="mt-auto space-y-1.5 border-t border-[hsl(var(--border))] pt-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[hsl(var(--fg-muted))]">Dias</dt>
                    <dd className="font-medium">{b.dias}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[hsl(var(--fg-muted))]">Horário</dt>
                    <dd className="font-medium">{b.horario}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href="/agendar"
                    className="inline-flex flex-1 items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--brand))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--brand-fg))] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
                  >
                    Agendar
                  </Link>
                  <Link
                    href="/barbeiro/bloqueios"
                    className="inline-flex flex-1 items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--fg))] transition hover:bg-[hsl(var(--surface))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
                  >
                    Bloqueios
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Como funciona */}
        <section
          aria-labelledby="como-funciona"
          className="mb-12 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 sm:p-8"
        >
          <h2
            id="como-funciona"
            className="font-[family-name:var(--font-display)] text-xl font-semibold sm:text-2xl"
          >
            Como a agenda de cada barbeiro funciona
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <li className="rounded-[var(--radius)] bg-[hsl(var(--surface-2))] p-4">
              <p className="mb-1 text-sm font-semibold">Slot único</p>
              <p className="text-sm text-[hsl(var(--fg-muted))]">
                Cada horário pertence a um barbeiro. O sistema bloqueia
                overbooking no servidor.
              </p>
            </li>
            <li className="rounded-[var(--radius)] bg-[hsl(var(--surface-2))] p-4">
              <p className="mb-1 text-sm font-semibold">Duração por serviço</p>
              <p className="text-sm text-[hsl(var(--fg-muted))]">
                O tempo do slot respeita a duração do serviço escolhido — combo
                ocupa mais, sobrancelha ocupa menos.
              </p>
            </li>
            <li className="rounded-[var(--radius)] bg-[hsl(var(--surface-2))] p-4">
              <p className="mb-1 text-sm font-semibold">Bloqueios</p>
              <p className="text-sm text-[hsl(var(--fg-muted))]">
                Almoço e folga são registrados como bloqueios e somem da agenda
                do cliente automaticamente.
              </p>
            </li>
          </ul>
        </section>

        {/* CTA final */}
        <section className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--accent))] p-6 text-[hsl(var(--accent-fg))] sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold sm:text-2xl">
            Precisa ajustar a equipe?
          </h2>
          <p className="mt-2 max-w-2xl text-sm opacity-90 sm:text-base">
            Cadastre novos barbeiros, defina especialidades e horários no painel
            do dono. Se preferir, comece pelos primeiros passos para configurar
            o negócio do zero.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/primeiros-passos"
              className="inline-flex items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--surface))] px-5 py-3 text-sm font-semibold text-[hsl(var(--fg))] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--surface))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--accent))]"
            >
              Primeiros passos
            </Link>
            <Link
              href="/configuracoes"
              className="inline-flex items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--accent-fg))] px-5 py-3 text-sm font-semibold text-[hsl(var(--accent-fg))] transition hover:bg-[hsl(var(--accent-fg))] hover:text-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--surface))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--accent))]"
            >
              Configurações do negócio
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}