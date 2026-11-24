import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { brl } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Serviços | Barbearia Dom Corte",
  description: "Cortes, barba, combos e sobrancelha na Barbearia Dom Corte em Volta Redonda.",
  openGraph: { title: "Serviços | Barbearia Dom Corte", description: "Cortes, barba, combos e sobrancelha." },
};

export default async function ServicosPage() {
  const services = await prisma.service.findMany({ where: { ativo: true }, orderBy: [{ categoria: "asc" }, { nomeServico: "asc" }] });
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <Reveal variant="up">
          <h1 className="font-display text-4xl font-bold">Serviços</h1>
          <p className="mt-2 text-fg-muted">Tabela de serviços da casa. Escolha um e vá direto pro agendamento.</p>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {services.length === 0 && (
            <Card className="md:col-span-3"><CardBody><p className="text-fg-muted">Nenhum serviço cadastrado ainda.</p></CardBody></Card>
          )}
          {services.map((s, i) => (
            <Reveal key={s.id} variant="up" delay={i * 60}>
              <Card className="hover-lift h-full">
                <CardBody>
                  <p className="text-xs uppercase tracking-wide text-accent">{s.categoria}</p>
                  <CardTitle className="mt-1">{s.nomeServico}</CardTitle>
                  <p className="mt-2 text-sm text-fg-muted">{s.descricao ?? "Serviço tradicional da casa."}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-fg-muted">{s.duracaoMinutos} min</span>
                    <span className="font-display text-lg font-semibold text-brand">{brl(s.preco)}</span>
                  </div>
                  <Link href={`/agendar?serviceId=${s.id}`} className="mt-4 block">
                    <Button variant="primary" size="sm" className="w-full">Agendar</Button>
                  </Link>
                </CardBody>
              </Card>
            </Reveal>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
