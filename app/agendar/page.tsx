import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AgendarFlow } from "./agendar-flow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Agendar horário | Barbearia Dom Corte",
  description: "Escolha serviço, barbeiro e horário livre na Barbearia Dom Corte.",
  openGraph: { title: "Agendar horário | Barbearia Dom Corte", description: "Escolha serviço, barbeiro e horário." },
};

export default async function AgendarPage({ searchParams }: { searchParams: { serviceId?: string; barberId?: string } }) {
  const [services, barbers] = await Promise.all([
    prisma.service.findMany({ where: { ativo: true }, orderBy: { nomeServico: "asc" } }),
    prisma.barber.findMany({ where: { ativo: true }, orderBy: { nomeCompleto: "asc" } }),
  ]);

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="font-display text-4xl font-bold">Agendar horário</h1>
        <p className="mt-2 text-fg-muted">Serviço, barbeiro, horário. Confirmado em segundos.</p>
        <div className="mt-8">
          <AgendarFlow
            services={services.map((s) => ({ id: s.id, nome: s.nomeServico, duracao: s.duracaoMinutos, preco: Number(s.preco), categoria: s.categoria }))}
            barbers={barbers.map((b) => ({ id: b.id, nome: b.apelido ?? b.nomeCompleto, especialidades: b.especialidades ?? "" }))}
            initialServiceId={searchParams.serviceId}
            initialBarberId={searchParams.barberId}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
