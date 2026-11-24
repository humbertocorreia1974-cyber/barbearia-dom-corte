import Link from "next/link";
import SocialProof from '@/components/brand/social-proof';
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { Marquee } from "@/components/motion/marquee";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { copy } from "@/content/copy";
import ASSETS from "@/lib/assets";
import { brl } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: copy.marketing.seoTitle,
  description: copy.marketing.seoDescription,
  openGraph: { title: copy.marketing.seoTitle, description: copy.marketing.seoDescription },
};

async function LandingBody() {
  const [services, barbers, totalAppointments] = await Promise.all([
    prisma.service.findMany({ where: { ativo: true }, take: 6, orderBy: { nomeServico: "asc" } }),
    prisma.barber.findMany({ where: { ativo: true }, take: 4 }),
    prisma.appointment.count(),
  ]);

  return (
    <div>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
            <Reveal variant="left">
              <p className="text-xs uppercase tracking-widest text-brand">Barbearia Dom Corte · Volta Redonda</p>
              <h1 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">
                {copy.marketing.headline}
              </h1>
              <p className="mt-4 text-base text-fg-muted md:text-lg">{copy.marketing.subheadline}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/agendar"><Button variant="primary" size="lg">{copy.sales.ctaPrimary}</Button></Link>
                <Link href="/servicos"><Button variant="secondary" size="lg">{copy.sales.ctaSecondary}</Button></Link>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-fg-muted">
                {copy.marketing.bullets.slice(0, 4).map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal variant="right" delay={120}>
              <div className="relative overflow-hidden rounded-2xl border border-border shadow-xl">
                <Image src={ASSETS.hero} alt={ASSETS.name} width={900} height={900} className="h-[420px] w-full object-cover img-zoom" priority />
              </div>
            </Reveal>
          </div>
        </section>

        <Marquee items={["Corte clássico", "Barba na navalha", "Combo Dom Corte", "Sobrancelha", "Pomada e finalização", "Atendimento sem fila"]} />

        <section className="mx-auto max-w-6xl px-4 py-16">
          <Reveal variant="up">
            <h2 className="font-display text-3xl font-semibold">Nossos serviços</h2>
            <p className="mt-2 text-fg-muted">Escolha o serviço, o barbeiro e o horário livre. O horário fica reservado só pra você.</p>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {services.length === 0 && (
              <Card className="md:col-span-3">
                <CardBody>
                  <p className="text-fg-muted">Nenhum serviço cadastrado ainda. O dono pode cadastrar em Painel do dono, Serviços.</p>
                </CardBody>
              </Card>
            )}
            {services.map((s, i) => (
              <Reveal key={s.id} variant="up" delay={i * 80}>
                <Card className="hover-lift h-full">
                  <CardBody>
                    <p className="text-xs uppercase tracking-wide text-accent">{s.categoria}</p>
                    <CardTitle className="mt-1">{s.nomeServico}</CardTitle>
                    <p className="mt-2 text-sm text-fg-muted">{s.descricao ?? "Serviço tradicional da casa."}</p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-fg-muted">{s.duracaoMinutos} min</span>
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
        </section>

        <section className="border-y border-border bg-surface/40">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
            <Reveal variant="left">
              <Image src={ASSETS.photos[0]} alt="Ambiente da barbearia" width={800} height={800} className="h-80 w-full rounded-2xl object-cover img-zoom" />
            </Reveal>
            <Reveal variant="right" delay={100}>
              <h2 className="font-display text-3xl font-semibold">Barbearia de bairro, agenda digital</h2>
              <p className="mt-3 text-fg-muted">
                Você escolhe o serviço, o barbeiro e o horário livre. O sistema bloqueia overbooking no servidor e ainda lembra você no WhatsApp 24h antes.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border p-4">
                  <p className="font-display text-2xl font-bold text-brand"><CountUp to={totalAppointments} /></p>
                  <p className="text-xs text-fg-muted">agendamentos registrados</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="font-display text-2xl font-bold text-brand"><CountUp to={barbers.length} /></p>
                  <p className="text-xs text-fg-muted">barbeiros ativos</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <Reveal variant="up">
            <h2 className="font-display text-3xl font-semibold">Nossos barbeiros</h2>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {barbers.length === 0 && (
              <Card className="md:col-span-4"><CardBody><p className="text-fg-muted">Nenhum barbeiro cadastrado ainda.</p></CardBody></Card>
            )}
            {barbers.map((b, i) => (
              <Reveal key={b.id} variant="scale" delay={i * 80}>
                <Card className="hover-lift h-full">
                  <CardBody>
                    {b.fotoPerfil ? (
                      <Image src={b.fotoPerfil} alt={b.nomeCompleto} width={200} height={200} className="h-24 w-24 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand/10 font-display text-2xl text-brand">
                        {b.nomeCompleto.charAt(0)}
                      </div>
                    )}
                    <CardTitle className="mt-3 text-base">{b.apelido ?? b.nomeCompleto}</CardTitle>
                    <p className="mt-1 text-xs text-fg-muted">{b.especialidades ?? "Cortes clássicos"}</p>
                  </CardBody>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <Reveal variant="up">
            <div className="rounded-2xl border border-border bg-surface p-8 text-center md:p-12">
              <h2 className="font-display text-3xl font-semibold">Pronto pra sentar na cadeira?</h2>
              <p className="mt-2 text-fg-muted">{ASSETS.slogan}</p>
              <Link href="/agendar" className="mt-6 inline-block"><Button variant="primary" size="lg">Agendar agora</Button></Link>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

/* brand-guard: header, hero art, prova social e rodapé garantidos pelo motor */
export default function BrandedHome(props: any) {
  const Body: any = LandingBody;
  return (
    <>
      
      <div className="relative isolate">
        
        <Body {...props} />
      </div>
      <SocialProof />
      
      
    </>
  );
}
