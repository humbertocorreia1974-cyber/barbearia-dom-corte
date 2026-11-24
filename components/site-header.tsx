"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import ASSETS from "@/lib/assets";

export function SiteHeader() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src={ASSETS.logo} alt={ASSETS.name} width={36} height={36} className="rounded-md" />
          <span className="font-display text-lg font-semibold text-fg">{ASSETS.name}</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-fg-muted md:flex">
          <Link href="/servicos" className="hover:text-fg transition-colors">Serviços</Link>
          <Link href="/agendar" className="hover:text-fg transition-colors">Agendar</Link>
          <Link href="/contato" className="hover:text-fg transition-colors">Contato</Link>
          {session && <Link href="/meus-agendamentos" className="hover:text-fg transition-colors">Meus agendamentos</Link>}
          {role === "barbeiro" && <Link href="/barbeiro/agenda" className="hover:text-fg transition-colors">Painel barbeiro</Link>}
          {role === "admin" && <Link href="/admin" className="hover:text-fg transition-colors">Painel do dono</Link>}
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link href="/notificacoes" className="rounded-full border border-border px-3 py-1.5 text-xs text-fg-muted hover:text-fg transition-colors">
                Notificações
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
              <Link href="/register"><Button variant="primary" size="sm">Criar conta</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
