import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';
import ASSETS from '@/lib/assets';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sem permissão | Barbearia Dom Corte',
  description: 'Você não tem permissão para acessar esta área da Barbearia Dom Corte.',
  openGraph: {
    title: 'Sem permissão | Barbearia Dom Corte',
    description: 'Você não tem permissão para acessar esta área da Barbearia Dom Corte.',
    type: 'website',
  },
  robots: { index: false, follow: false },
};

type Role = 'cliente' | 'barbeiro' | 'admin' | string;

const ROLE_LABEL: Record<string, string> = {
  cliente: 'Cliente',
  barbeiro: 'Barbeiro',
  admin: 'Dono / Admin',
  user: 'Cliente',
};

const ROLE_HOME: Record<string, { href: string; label: string }> = {
  cliente: { href: '/meus-agendamentos', label: 'Meus agendamentos' },
  user: { href: '/meus-agendamentos', label: 'Meus agendamentos' },
  barbeiro: { href: '/barbeiro/agenda', label: 'Agenda do dia' },
  admin: { href: '/painel-dono', label: 'Painel do dono' },
};

const ROLE_SHORTCUTS: Record<string, { href: string; label: string; desc: string }[]> = {
  cliente: [
    { href: '/servicos', label: 'Serviços', desc: 'Ver cortes, barba e combos disponíveis' },
    { href: '/agendar', label: 'Agendar horário', desc: 'Escolher serviço, barbeiro e horário' },
    { href: '/meus-agendamentos', label: 'Meus agendamentos', desc: 'Cancelar ou reagendar' },
    { href: '/notificacoes', label: 'Notificações', desc: 'Lembretes e avisos' },
  ],
  user: [
    { href: '/servicos', label: 'Serviços', desc: 'Ver cortes, barba e combos disponíveis' },
    { href: '/agendar', label: 'Agendar horário', desc: 'Escolher serviço, barbeiro e horário' },
    { href: '/meus-agendamentos', label: 'Meus agendamentos', desc: 'Cancelar ou reagendar' },
    { href: '/notificacoes', label: 'Notificações', desc: 'Lembretes e avisos' },
  ],
  barbeiro: [
    { href: '/barbeiro/agenda', label: 'Agenda do dia', desc: 'Atendimentos de hoje' },
    { href: '/barbeiro/bloqueios', label: 'Bloqueios', desc: 'Almoço, folga e feriados' },
    { href: '/notificacoes', label: 'Notificações', desc: 'Avisos do sistema' },
  ],
  admin: [
    { href: '/painel-dono', label: 'Visão geral', desc: 'Faturamento, ocupação e no-show' },
    { href: '/painel-dono/servicos', label: 'Serviços', desc: 'Cadastrar e editar serviços' },
    { href: '/painel-dono/barbeiros', label: 'Barbeiros', desc: 'Gerenciar a equipe' },
    { href: '/painel-dono/agenda', label: 'Agenda geral', desc: 'Todos os agendamentos' },
    { href: '/painel-dono/clientes', label: 'Clientes', desc: 'Base de clientes' },
    { href: '/painel-dono/configuracoes', label: 'Configurações', desc: 'Horários de funcionamento' },
    { href: '/admin/usuarios', label: 'Usuários e health', desc: 'Papéis e status do sistema' },
  ],
};

export default async function SemPermissaoPage() {
  const session = await getServerSession(authOptions);
  const role: Role = (session?.user as { role?: string } | undefined)?.role ?? 'cliente';
  const home = ROLE_HOME[role] ?? ROLE_HOME.cliente;
  const shortcuts = ROLE_SHORTCUTS[role] ?? ROLE_SHORTCUTS.cliente;
  const roleLabel = ROLE_LABEL[role] ?? 'Cliente';

  return (
    <main className="min-h-screen bg-bg text-fg">
      <section className="mx-auto max-w-5xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
            <p className="text-xs uppercase tracking-[0.2em] text-fg-muted">Acesso restrito</p>
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
            Você não tem permissão para esta área
          </h1>
          <p className="mt-3 max-w-2xl text-fg-muted">
            Esta página é exclusiva de outro perfil na Barbearia Dom Corte. Se você acredita que
            deveria ter acesso, fale com o dono da barbearia para ajustar seu papel.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <Reveal variant="left" delay={80}>
            <Card className="border border-border">
              <CardTitle>O que fazer agora</CardTitle>
              <CardBody>
                <p className="text-sm text-fg-muted">
                  Você está logado como <span className="font-medium text-fg">{roleLabel}</span>
                  {session?.user?.email ? (
                    <>
                      {' '}
                      (<span className="text-fg">{session.user.email}</span>)
                    </>
                  ) : null}
                  . Escolha um dos caminhos abaixo.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={home.href}>
                    <Button variant="primary" size="md">
                      Ir para {home.label}
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="secondary" size="md">
                      Voltar ao início
                    </Button>
                  </Link>
                  {session?.user ? (
                    <form action="/api/auth/signout" method="post">
                      <Button variant="ghost" size="md" type="submit">
                        Entrar com outra conta
                      </Button>
                    </form>
                  ) : (
                    <Link href="/entrar">
                      <Button variant="ghost" size="md">
                        Fazer login
                      </Button>
                    </Link>
                  )}
                </div>
              </CardBody>
            </Card>
          </Reveal>

          <Reveal variant="right" delay={160}>
            <div className="rounded-2xl border border-border p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-fg-muted">Sua conta</p>
              <p className="mt-2 font-display text-2xl">{session?.user?.name ?? 'Visitante'}</p>
              <p className="text-sm text-fg-muted">{session?.user?.email ?? 'Nenhuma sessão ativa'}</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                Papel: {roleLabel}
              </div>
              <p className="mt-6 text-xs text-fg-muted">
                Precisa de outro papel? O dono da barbearia pode ajustar em{' '}
                <span className="text-fg">Painel do dono &gt; Usuários</span>.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal variant="up" delay={240}>
          <h2 className="mt-14 font-display text-2xl">Atalhos do seu perfil</h2>
          <p className="mt-1 text-sm text-fg-muted">O que você pode acessar com o papel atual.</p>
        </Reveal>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((item, i) => (
            <Reveal key={item.href} variant="up" delay={i * 60}>
              <Link
                href={item.href}
                className="hover-lift block rounded-2xl border border-border bg-surface p-5 transition-all duration-150 hover:border-brand/40"
              >
                <p className="font-display text-lg text-fg">{item.label}</p>
                <p className="mt-1 text-sm text-fg-muted">{item.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs text-brand">
                  Abrir
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal variant="up" delay={320}>
          <div className="mt-14 rounded-2xl border border-border p-6">
            <p className="text-sm text-fg-muted">
              {ASSETS.slogan}
            </p>
            <p className="mt-2 text-xs text-fg-muted">
              Barbearia Dom Corte, Volta Redonda. Dúvidas sobre acesso:{' '}
              <Link href="/contato" className="text-brand underline-offset-4 hover:underline">
                fale com a gente
              </Link>
              .
            </p>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
