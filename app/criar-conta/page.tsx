import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { copy } from '@/content/copy';
import ASSETS from '@/lib/assets';
import { Reveal } from '@/components/motion/reveal';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { RegisterForm } from './register-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: copy.marketing.seoTitle || 'Criar conta | Barbearia Dom Corte',
  description:
    copy.marketing.seoDescription ||
    'Crie sua conta na Barbearia Dom Corte e agende seu corte em segundos, sem fila e sem telefone.',
  openGraph: {
    title: copy.marketing.seoTitle || 'Criar conta | Barbearia Dom Corte',
    description:
      copy.marketing.seoDescription ||
      'Crie sua conta na Barbearia Dom Corte e agende seu corte em segundos.',
    images: [ASSETS.hero],
    type: 'website',
  },
};

export default async function CriarContaPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect('/');
  }

  const bullets = copy.marketing.bullets ?? copy.marketing.featureBullets ?? [];

  return (
    <main className="min-h-screen bg-bg text-fg">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:items-center md:py-20">
        <Reveal variant="left">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-brand">
              <span className="h-2 w-2 rounded-full bg-accent" />
              {ASSETS.name}
            </span>
            <h1 className="font-display text-4xl leading-tight md:text-5xl">
              {copy.marketing.headline || copy.marketing.heroHeadline}
            </h1>
            <p className="text-fg-muted md:text-lg">
              {copy.marketing.subheadline || copy.marketing.heroSubheadline}
            </p>

            {bullets.length > 0 && (
              <ul className="space-y-3">
                {bullets.slice(0, 4).map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-fg-muted">
                    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ASSETS.hero}
                alt={`Ambiente da ${ASSETS.name}`}
                className="img-zoom h-56 w-full object-cover"
              />
            </div>
          </div>
        </Reveal>

        <Reveal variant="right" delay={120}>
          <Card className="p-6 md:p-8">
            <CardTitle className="font-display text-2xl">Criar sua conta</CardTitle>
            <CardBody className="mt-2 text-sm text-fg-muted">
              Leva menos de um minuto. Depois você já pode escolher serviço, barbeiro e horário.
            </CardBody>
            <div className="mt-6">
              <RegisterForm />
            </div>
            <p className="mt-6 text-center text-sm text-fg-muted">
              Já tem conta?{' '}
              <Link href="/login" className="font-medium text-brand hover:underline">
                Entrar
              </Link>
            </p>
          </Card>
        </Reveal>
      </section>

      <footer className="border-t border-border bg-surface/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-fg-muted">
          <span className="font-display text-base text-fg">{ASSETS.name}</span>
          <span>{ASSETS.slogan}</span>
        </div>
      </footer>
    </main>
  );
}
