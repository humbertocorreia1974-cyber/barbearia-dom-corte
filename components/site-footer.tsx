import Link from "next/link";
import Image from "next/image";
import ASSETS from "@/lib/assets";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <Image src={ASSETS.logo} alt={ASSETS.name} width={32} height={32} className="rounded-md" />
            <span className="font-display text-lg font-semibold">{ASSETS.name}</span>
          </div>
          <p className="mt-3 text-sm text-fg-muted">{ASSETS.slogan}</p>
        </div>
        <div className="text-sm">
          <p className="font-display text-base font-semibold">Navegar</p>
          <ul className="mt-3 space-y-2 text-fg-muted">
            <li><Link href="/servicos" className="hover:text-fg">Serviços</Link></li>
            <li><Link href="/agendar" className="hover:text-fg">Agendar</Link></li>
            <li><Link href="/contato" className="hover:text-fg">Contato e localização</Link></li>
            <li><Link href="/primeiros-passos" className="hover:text-fg">Primeiros passos</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-display text-base font-semibold">Legal</p>
          <ul className="mt-3 space-y-2 text-fg-muted">
            <li><Link href="/termos" className="hover:text-fg">Termos de uso</Link></li>
            <li><Link href="/privacidade" className="hover:text-fg">Política de privacidade</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-fg-muted">
        {ASSETS.name} · Volta Redonda, RJ · {ASSETS.slogan}
      </div>
    </footer>
  );
}
