import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardBody, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { ContactForm } from './contact-form';
import { MapSection } from './map-section';
import ASSETS from '@/lib/assets';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contato e localizacao | Barbearia Dom Corte',
  description:
    'Fale com a Barbearia Dom Corte em Volta Redonda: endereco, horarios de funcionamento, WhatsApp e formulario de contato direto.',
  openGraph: {
    title: 'Contato e localizacao | Barbearia Dom Corte',
    description:
      'Endereco, horarios e canais de contato da Barbearia Dom Corte em Volta Redonda.',
    type: 'website',
  },
};

const DIAS = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

function parseDias(raw: string): Set<number> {
  const set = new Set<number>();
  raw.split(',').forEach((p) => {
    const n = Number(p.trim());
    if (Number.isInteger(n) && n >= 0 && n <= 6) set.add(n);
  });
  return set;
}

function onlyDigits(s: string): string {
  return s.replace(/\D/g, '');
}

export default async function ContatoPage() {
  const [settings, session] = await Promise.all([
    prisma.businessSettings.findFirst(),
    getServerSession(authOptions),
  ]);

  const nomeNegocio = settings?.nomeNegocio || 'Barbearia Dom Corte';
  const telefone = settings?.telefone || '';
  const endereco = settings?.endereco || 'Volta Redonda, RJ';
  const abertura = settings?.horarioAbertura || '09:00';
  const fechamento = settings?.horarioFechamento || '19:00';
  const diasAtivos = parseDias(settings?.diasFuncionamento || '1,2,3,4,5,6');

  const wppDigits = onlyDigits(telefone);
  const whatsappHref = wppDigits
    ? `https://wa.me/${wppDigits.startsWith('55') ? wppDigits : `55${wppDigits}`}?text=${encodeURIComponent(
        'Ola, vim pelo site da Barbearia Dom Corte e gostaria de tirar uma duvida.'
      )}`
    : null;

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;

  return (
    <main className="bg-bg">
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <p className="text-sm font-medium uppercase tracking-wider text-brand">Fale com a gente</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-fg sm:text-5xl">
            Contato e localizacao
          </h1>
          <p className="mt-3 max-w-2xl text-fg-muted">
            {ASSETS.slogan}. Estamos em Volta Redonda, prontos para te atender. Escolha o canal que
            preferir: WhatsApp, telefone, e-mail ou o formulario abaixo.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Reveal variant="up" delay={0}>
            <Card className="h-full hover-lift">
              <CardBody>
                <CardTitle>Endereco</CardTitle>
                <p className="mt-2 text-sm text-fg-muted">{endereco}</p>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-brand underline-offset-2 hover:underline"
                >
                  Abrir no Google Maps
                </a>
              </CardBody>
            </Card>
          </Reveal>

          <Reveal variant="up" delay={80}>
            <Card className="h-full hover-lift">
              <CardBody>
                <CardTitle>Telefone e WhatsApp</CardTitle>
                <p className="mt-2 text-sm text-fg-muted">
                  {telefone || 'Telefone ainda nao cadastrado.'}
                </p>
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-brand underline-offset-2 hover:underline"
                  >
                    Conversar no WhatsApp
                  </a>
                )}
              </CardBody>
            </Card>
          </Reveal>

          <Reveal variant="up" delay={160}>
            <Card className="h-full hover-lift">
              <CardBody>
                <CardTitle>Horario de funcionamento</CardTitle>
                <ul className="mt-2 space-y-1 text-sm text-fg-muted">
                  {DIAS.map((dia, idx) => (
                    <li key={dia} className="flex justify-between gap-3">
                      <span>{dia}</span>
                      <span className={diasAtivos.has(idx) ? 'text-fg' : 'text-fg-muted/70'}>
                        {diasAtivos.has(idx) ? `${abertura} as ${fechamento}` : 'Fechado'}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <h2 className="font-display text-2xl font-semibold text-fg">Onde estamos</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Mapa com base no endereco cadastrado nas configuracoes do negocio.
          </p>
        </Reveal>
        <div className="mt-4">
          <MapSection endereco={endereco} nomeNegocio={nomeNegocio} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <Reveal variant="left" className="lg:col-span-3">
            <Card>
              <CardBody>
                <CardTitle>Envie uma mensagem</CardTitle>
                <p className="mb-4 mt-1 text-sm text-fg-muted">
                  Preencha os campos e a equipe responde em ate 1 dia util. Para marcar horario,
                  use o agendamento online.
                </p>
                <ContactForm
                  nomeInicial={session?.user?.name ?? ''}
                  emailInicial={session?.user?.email ?? ''}
                />
              </CardBody>
            </Card>
          </Reveal>

          <Reveal variant="right" delay={120} className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="font-display text-lg font-semibold text-fg">Prefere marcar agora?</h3>
              <p className="mt-2 text-sm text-fg-muted">
                Escolha servico, barbeiro e horario livre em poucos cliques. O horario fica
                reservado so pra voce.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link href="/agendar">
                  <Button className="w-full hover-lift">Agendar horario</Button>
                </Link>
                <Link href="/servicos">
                  <Button variant="secondary" className="w-full hover-lift">
                    Ver servicos e precos
                  </Button>
                </Link>
              </div>
              <hr className="my-5 border-border" />
              <h3 className="font-display text-lg font-semibold text-fg">Outros canais</h3>
              <ul className="mt-2 space-y-2 text-sm text-fg-muted">
                <li>
                  <span className="font-medium text-fg">E-mail: </span>
                  contato@domcorte.app
                </li>
                <li>
                  <span className="font-medium text-fg">Endereco: </span>
                  {endereco}
                </li>
                <li>
                  <span className="font-medium text-fg">Atendimento: </span>
                  {abertura} as {fechamento}
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-border bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-fg-muted sm:px-6 lg:px-8">
          <p className="font-display text-base text-fg">{nomeNegocio}</p>
          <p className="mt-1">{ASSETS.slogan}</p>
          <div className="mt-3 flex flex-wrap gap-4">
            <Link href="/termos" className="hover:text-fg">
              Termos de uso
            </Link>
            <Link href="/politica-de-privacidade" className="hover:text-fg">
              Politica de privacidade
            </Link>
            <Link href="/servicos" className="hover:text-fg">
              Servicos
            </Link>
            <Link href="/agendar" className="hover:text-fg">
              Agendar
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
