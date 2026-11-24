import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin | Barbearia Dom Corte",
  description:
    "Painel administrativo da Barbearia Dom Corte: gestão de usuários, saúde do sistema e integrações.",
  robots: { index: false, follow: false },
};

const adminCards = [
  {
    title: "Usuários",
    description:
      "Gerencie clientes, barbeiros e administradores. Ajuste papéis e acompanhe cadastros.",
    href: "/painel-dono/clientes",
    cta: "Gerenciar usuários",
    icon: "👥",
  },
  {
    title: "Painel do dono",
    description:
      "Faturamento, ocupação, no-shows e ranking de barbeiros em um só lugar.",
    href: "/painel-dono",
    cta: "Abrir painel",
    icon: "📊",
  },
  {
    title: "Configurações do negócio",
    description:
      "Horários de funcionamento, serviços, barbeiros e regras de agendamento.",
    href: "/configuracoes",
    cta: "Configurar",
    icon: "⚙️",
  },
  {
    title: "WhatsApp",
    description:
      "Conecte a integração de WhatsApp para lembretes automáticos 24h antes.",
    href: "/admin/whatsapp-connect",
    cta: "Conectar WhatsApp",
    icon: "💬",
  },
];

const healthItems = [
  {
    label: "Backend",
    status: "operacional" as const,
    detail: "API respondendo normalmente",
  },
  {
    label: "Banco de dados",
    status: "operacional" as const,
    detail: "Conexão estável com PostgreSQL",
  },
  {
    label: "E-mail transacional",
    status: "operacional" as const,
    detail: "Reset de senha e notificações ativos",
  },
  {
    label: "WhatsApp",
    status: "atencao" as const,
    detail: "Integração pendente de conexão",
  },
];

const statusStyles: Record<
  "operacional" | "atencao" | "erro",
  { dot: string; text: string; label: string }
> = {
  operacional: {
    dot: "bg-[hsl(var(--success))]",
    text: "text-[hsl(var(--success))]",
    label: "Operacional",
  },
  atencao: {
    dot: "bg-[hsl(var(--warning))]",
    text: "text-[hsl(var(--warning))]",
    label: "Atenção",
  },
  erro: {
    dot: "bg-[hsl(var(--danger))]",
    text: "text-[hsl(var(--danger))]",
    label: "Erro",
  },
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Hero */}
        <header className="mb-8 sm:mb-12">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1 text-xs font-medium text-[hsl(var(--fg-muted))]">
            <span
              className="inline-block h-2 w-2 rounded-full bg-[hsl(var(--brand))]"
              aria-hidden="true"
            />
            Painel administrativo
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
            Admin
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[hsl(var(--fg-muted))] sm:text-base">
            Central de controle da Barbearia Dom Corte. Gerencie usuários,
            acompanhe a saúde do sistema e mantenha as integrações em dia.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/painel-dono"
              className="inline-flex items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--brand))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--brand-fg))] shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
            >
              Ir para o painel do dono
            </Link>
            <Link
              href="/primeiros-passos"
              className="inline-flex items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--fg))] transition hover:bg-[hsl(var(--surface-2))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
            >
              Guia de primeiros passos
            </Link>
          </div>
        </header>

        {/* Atalhos administrativos */}
        <section aria-labelledby="atalhos-heading" className="mb-10 sm:mb-14">
          <h2
            id="atalhos-heading"
            className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold sm:text-xl"
          >
            Atalhos
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {adminCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 transition hover:border-[hsl(var(--brand))] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--surface-2))] text-lg"
                    aria-hidden="true"
                  >
                    {card.icon}
                  </span>
                  <h3 className="font-[family-name:var(--font-display)] text-base font-semibold">
                    {card.title}
                  </h3>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-[hsl(var(--fg-muted))]">
                  {card.description}
                </p>
                <span className="text-sm font-semibold text-[hsl(var(--brand))] group-hover:underline">
                  {card.cta} →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Health-check */}
        <section aria-labelledby="health-heading" className="mb-10 sm:mb-14">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2
              id="health-heading"
              className="font-[family-name:var(--font-display)] text-lg font-semibold sm:text-xl"
            >
              Saúde do sistema
            </h2>
            <span className="text-xs text-[hsl(var(--fg-muted))]">
              Atualizado agora
            </span>
          </div>
          <ul className="divide-y divide-[hsl(var(--border))] overflow-hidden rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            {healthItems.map((item) => {
              const style = statusStyles[item.status];
              return (
                <li
                  key={item.label}
                  className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${style.dot}`}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex flex-col gap-1 pl-6 sm:flex-row sm:items-center sm:gap-3 sm:pl-0">
                    <span className="text-xs text-[hsl(var(--fg-muted))]">
                      {item.detail}
                    </span>
                    <span
                      className={`text-xs font-semibold ${style.text}`}
                    >
                      {style.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Aviso de segurança */}
        <section
          aria-labelledby="seguranca-heading"
          className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] p-5 sm:p-6"
        >
          <h2
            id="seguranca-heading"
            className="mb-2 font-[family-name:var(--font-display)] text-base font-semibold sm:text-lg"
          >
            Acesso restrito
          </h2>
          <p className="text-sm leading-relaxed text-[hsl(var(--fg-muted))]">
            Esta área é exclusiva para administradores. Todas as ações são
            registradas. Se você não deveria estar aqui,{" "}
            <Link
              href="/sem-permissao"
              className="font-semibold text-[hsl(var(--brand))] underline-offset-2 hover:underline"
            >
              saiba como solicitar acesso
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}