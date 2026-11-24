import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: "Agenda do dia | Barbearia Dom Corte",
  description:
    "Painel do barbeiro: veja a fila do dia, marque atendimentos como concluídos ou no-show e gerencie seus bloqueios.",
};

type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "DONE" | "NO_SHOW" | "CANCELED";

type AppointmentItem = {
  id: string;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  clientName: string;
  clientPhone: string | null;
};

const statusLabel: Record<AppointmentStatus, string> = {
  SCHEDULED: "Agendado",
  CONFIRMED: "Confirmado",
  DONE: "Atendido",
  NO_SHOW: "No-show",
  CANCELED: "Cancelado",
};

const statusClass: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-[hsl(var(--surface-2))] text-[hsl(var(--fg))] border-[hsl(var(--border))]",
  CONFIRMED: "bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand))] border-[hsl(var(--brand))]/30",
  DONE: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30",
  NO_SHOW: "bg-[hsl(var(--danger))]/10 text-[hsl(var(--danger))] border-[hsl(var(--danger))]/30",
  CANCELED: "bg-[hsl(var(--surface-2))] text-[hsl(var(--fg-muted))] border-[hsl(var(--border))]",
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

function startOfDaySP(date: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, m, d] = fmt.format(date).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 3, 0, 0));
}

function endOfDaySP(date: Date) {
  const start = startOfDaySP(date);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

async function loadAgenda(barberId: string) {
  const now = new Date();
  const from = startOfDaySP(now);
  const to = endOfDaySP(now);

  const appointments = await prisma.appointment.findMany({
    where: {
      barberId,
      startAt: { gte: from, lte: to },
      status: { in: ["SCHEDULED", "CONFIRMED", "DONE", "NO_SHOW"] },
    },
    orderBy: { startAt: "asc" },
    include: {
      service: { select: { name: true, durationMin: true, priceCents: true } },
      client: { select: { name: true, phone: true } },
    },
  });

  const blocks = await prisma.scheduleBlock.findMany({
    where: {
      barberId,
      startAt: { gte: from, lte: to },
    },
    orderBy: { startAt: "asc" },
  });

  return { appointments, blocks, from, to };
}

export default async function AgendaBarbeiroPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/entrar");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "BARBEIRO" && role !== "ADMIN") {
    redirect("/sem-permissao");
  }

  const barberId = (session.user as { barberId?: string }).barberId;
  if (!barberId) {
    return (
      <main className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6">
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
              Perfil de barbeiro não vinculado
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--fg-muted))]">
              Sua conta ainda não está associada a um barbeiro. Fale com o dono da
              barbearia para concluir a configuração.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center rounded-[var(--radius)] bg-[hsl(var(--brand))] px-4 py-2 text-sm font-medium text-[hsl(var(--brand-fg))] hover:opacity-90"
            >
              Voltar para a home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { appointments, blocks, from } = await loadAgenda(barberId);

  const items: AppointmentItem[] = appointments.map((a) => ({
    id: a.id,
    startAt: a.startAt,
    endAt: a.endAt,
    status: a.status as AppointmentStatus,
    serviceName: a.service.name,
    serviceDuration: a.service.durationMin,
    servicePrice: a.service.priceCents,
    clientName: a.client.name,
    clientPhone: a.client.phone ?? null,
  }));

  const total = items.length;
  const done = items.filter((i) => i.status === "DONE").length;
  const noShow = items.filter((i) => i.status === "NO_SHOW").length;
  const upcoming = items.filter(
    (i) => i.status === "SCHEDULED" || i.status === "CONFIRMED",
  ).length;
  const revenue = items
    .filter((i) => i.status === "DONE")
    .reduce((sum, i) => sum + i.servicePrice, 0);

  return (
    <main className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--fg-muted))]">
            Painel do barbeiro
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
            Agenda
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[hsl(var(--fg-muted))]">
            Sua fila de hoje, {formatLongDate(from)}. Marque atendimentos como
            concluídos, registre no-shows e bloqueie horários quando precisar.
          </p>
        </header>

        <section
          aria-label="Resumo do dia"
          className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <p className="text-xs text-[hsl(var(--fg-muted))]">Agendamentos</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
              {total}
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <p className="text-xs text-[hsl(var(--fg-muted))]">Ainda por vir</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
              {upcoming}
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <p className="text-xs text-[hsl(var(--fg-muted))]">Atendidos</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-[hsl(var(--success))]">
              {done}
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
            <p className="text-xs text-[hsl(var(--fg-muted))]">No-show</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-[hsl(var(--danger))]">
              {noShow}
            </p>
          </div>
        </section>

        <section className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/barbeiro/bloqueios"
            className="inline-flex items-center rounded-[var(--radius)] bg-[hsl(var(--brand))] px-4 py-2 text-sm font-medium text-[hsl(var(--brand-fg))] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2"
          >
            Gerenciar bloqueios
          </Link>
          <Link
            href="/notificacoes"
            className="inline-flex items-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-medium text-[hsl(var(--fg))] hover:bg-[hsl(var(--surface-2))]"
          >
            Notificações
          </Link>
          <Link
            href="/"
            className="inline-flex items-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-medium text-[hsl(var(--fg))] hover:bg-[hsl(var(--surface-2))]"
          >
            Início
          </Link>
        </section>

        <section aria-labelledby="fila-do-dia" className="mb-8">
          <h2
            id="fila-do-dia"
            className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold"
          >
            Fila do dia
          </h2>

          {items.length === 0 ? (
            <div className="rounded-[var(--radius)] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 text-center">
              <p className="text-sm font-medium">Nenhum agendamento para hoje.</p>
              <p className="mt-1 text-sm text-[hsl(var(--fg-muted))]">
                Aproveite para revisar seus bloqueios ou conferir a agenda dos
                próximos dias.
              </p>
              <Link
                href="/barbeiro/bloqueios"
                className="mt-4 inline-flex items-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-4 py-2 text-sm font-medium hover:bg-[hsl(var(--border))]"
              >
                Ver bloqueios
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-[family-name:var(--font-display)] text-lg font-semibold">
                          {formatTime(item.startAt)} – {formatTime(item.endAt)}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusClass[item.status]}`}
                        >
                          {statusLabel[item.status]}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm font-medium">
                        {item.clientName}
                      </p>
                      <p className="text-sm text-[hsl(var(--fg-muted))]">
                        {item.serviceName} · {item.serviceDuration} min ·{" "}
                        {formatCurrency(item.servicePrice)}
                      </p>
                      {item.clientPhone ? (
                        <p className="mt-1 text-xs text-[hsl(var(--fg-muted))]">
                          Contato: {item.clientPhone}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <Link
                        href={`/agendamentos/${item.id}`}
                        className="inline-flex items-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-1.5 text-xs font-medium hover:bg-[hsl(var(--border))]"
                      >
                        Detalhes
                      </Link>
                      {item.status === "SCHEDULED" || item.status === "CONFIRMED" ? (
                        <>
                          <Link
                            href={`/agendamentos/${item.id}?acao=concluir`}
                            className="inline-flex items-center rounded-[var(--radius)] bg-[hsl(var(--success))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--success-fg))] hover:opacity-90"
                          >
                            Marcar atendido
                          </Link>
                          <Link
                            href={`/agendamentos/${item.id}?acao=no-show`}
                            className="inline-flex items-center rounded-[var(--radius)] border border-[hsl(var(--danger))]/40 bg-[hsl(var(--danger))]/10 px-3 py-1.5 text-xs font-medium text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger))]/20"
                          >
                            No-show
                          </Link>
                        </>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="bloqueios-hoje" className="mb-8">
          <h2
            id="bloqueios-hoje"
            className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold"
          >
            Bloqueios de hoje
          </h2>
          {blocks.length === 0 ? (
            <p className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 text-sm text-[hsl(var(--fg-muted))]">
              Nenhum bloqueio programado para hoje.
            </p>
          ) : (
            <ul className="space-y-2">
              {blocks.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3 text-sm"
                >
                  <span className="font-medium">
                    {formatTime(b.startAt)} – {formatTime(b.endAt)}
                  </span>
                  <span className="text-[hsl(var(--fg-muted))]">
                    {b.reason ?? "Bloqueio"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-label="Faturamento do dia"
          className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4"
        >
          <p className="text-xs uppercase tracking-wider text-[hsl(var(--fg-muted))]">
            Faturamento do dia (atendidos)
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
            {formatCurrency(revenue)}
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--fg-muted))]">
            Soma dos serviços concluídos até agora. O dono vê o consolidado no
            painel dele.
          </p>
        </section>
      </div>
    </main>
  );
}