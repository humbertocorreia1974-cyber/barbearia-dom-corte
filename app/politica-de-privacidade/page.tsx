import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import ASSETS from '@/lib/assets';
import { ShieldCheck, Lock, Eye, Trash2, Mail, MapPin, FileText, Cookie, UserCheck, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Politica de Privacidade | Barbearia Dom Corte',
  description:
    'Como a Barbearia Dom Corte coleta, usa, armazena e protege seus dados pessoais em conformidade com a LGPD (Lei 13.709/2018).',
  openGraph: {
    title: 'Politica de Privacidade | Barbearia Dom Corte',
    description:
      'Transparencia total sobre o tratamento dos seus dados na Barbearia Dom Corte, em Volta Redonda.',
    type: 'website',
  },
};

const SECOES = [
  {
    id: 'quem-somos',
    titulo: '1. Quem trata seus dados',
    icone: UserCheck,
    paragrafos: [
      'A Barbearia Dom Corte, com atendimento presencial em Volta Redonda (RJ), e a controladora dos dados pessoais coletados por meio deste aplicativo de agendamento.',
      'Para qualquer assunto relacionado a privacidade, o encarregado de dados (DPO) pode ser acionado pelo e-mail de contato informado no rodape desta pagina.',
    ],
  },
  {
    id: 'dados-coletados',
    titulo: '2. Quais dados coletamos',
    icone: Eye,
    paragrafos: [
      'Dados de identificacao: nome completo, e-mail, telefone celular e senha (armazenada apenas em formato de hash criptografico, nunca em texto puro).',
      'Dados de agendamento: servico escolhido, barbeiro, data e horario, valor, observacoes que voce optar por informar e historico de atendimentos.',
      'Dados de fidelidade: pontos acumulados, nivel de fidelidade e movimentacoes vinculadas aos seus atendimentos.',
      'Dados de navegacao: endereco IP, tipo de dispositivo e paginas acessadas, coletados por meio de cookies essenciais e de analise.',
    ],
  },
  {
    id: 'finalidades',
    titulo: '3. Para que usamos seus dados',
    icone: FileText,
    paragrafos: [
      'Executar o contrato de prestacao de servico de barbearia: reservar horario, confirmar atendimento, emitir comprovantes e gerenciar a agenda do barbeiro.',
      'Enviar lembretes do agendamento por WhatsApp e notificacoes no aplicativo, 24 horas antes do horario reservado.',
      'Gerenciar o programa de fidelidade (10 cortes geram 1 gratuito), calculando pontos e resgates.',
      'Cumprir obrigacoes legais e regulatorias, inclusive fiscais e de defesa do consumidor.',
      'Melhorar a experiencia do app por meio de metricas agregadas e anonimas de uso.',
    ],
  },
  {
    id: 'base-legal',
    titulo: '4. Base legal (LGPD)',
    icone: ShieldCheck,
    paragrafos: [
      'Execucao de contrato (art. 7, V): para viabilizar o agendamento, o atendimento e o programa de fidelidade.',
      'Consentimento (art. 7, I): para envio de comunicacoes de marketing e lembretes por WhatsApp, que voce pode revogar a qualquer momento.',
      'Cumprimento de obrigacao legal (art. 7, II): para guarda de registros fiscais e de defesa do consumidor.',
      'Legitimo interesse (art. 7, IX): para seguranca da plataforma e prevencao a fraudes em agendamentos.',
    ],
  },
  {
    id: 'compartilhamento',
    titulo: '5. Com quem compartilhamos',
    icone: Lock,
    paragrafos: [
      'Provedores de infraestrutura em nuvem (hospedagem do banco de dados e do site), que atuam como operadores e seguem contratos de confidencialidade.',
      'Plataforma de mensageria WhatsApp Business (Meta), exclusivamente para envio dos lembretes e confirmacoes que voce autorizou.',
      'Autoridades publicas, quando houver requisicao legal expressa e fundamentada.',
      'Nao vendemos, alugamos nem cedemos seus dados pessoais a terceiros para fins publicitarios.',
    ],
  },
  {
    id: 'retencao',
    titulo: '6. Por quanto tempo guardamos',
    icone: Clock,
    paragrafos: [
      'Dados de conta e agendamentos: enquanto sua conta estiver ativa e, apos exclusao, pelo prazo de 5 anos para cumprimento de obrigacoes fiscais e de defesa em processos.',
      'Registros de acesso (IP, data e hora): minimo de 6 meses, conforme o Marco Civil da Internet (Lei 12.965/2014).',
      'Dados de marketing: ate a revogacao do consentimento.',
      'Apos os prazos, os dados sao eliminados ou anonimizados de forma irreversivel.',
    ],
  },
  {
    id: 'direitos',
    titulo: '7. Seus direitos como titular',
    icone: Trash2,
    paragrafos: [
      'Confirmacao da existencia de tratamento e acesso aos dados.',
      'Correcao de dados incompletos, inexatos ou desatualizados.',
      'Anonimizacao, bloqueio ou eliminacao de dados desnecessarios ou excessivos.',
      'Portabilidade dos dados a outro fornecedor, mediante requisicao expressa.',
      'Eliminacao dos dados tratados com base no consentimento.',
      'Informacao sobre compartilhamentos e sobre a possibilidade de nao fornecer consentimento, com as consequencias.',
      'Revogacao do consentimento a qualquer momento, sem prejuizo do servico essencial.',
      'Para exercer qualquer direito, envie um e-mail ao encarregado. Responderemos em ate 15 dias corridos.',
    ],
  },
  {
    id: 'cookies',
    titulo: '8. Cookies e tecnologias similares',
    icone: Cookie,
    paragrafos: [
      'Cookies essenciais: mantem sua sessao autenticada e o carrinho de agendamento. Sem eles o app nao funciona.',
      'Cookies de desempenho: medem, de forma agregada e anonima, quais telas sao mais usadas, para melhorarmos a experiencia.',
      'Voce pode gerenciar cookies pelo banner exibido no primeiro acesso ou pelas configuracoes do seu navegador. Bloquear os essenciais impede o login.',
    ],
  },
  {
    id: 'seguranca',
    titulo: '9. Como protegemos seus dados',
    icone: ShieldCheck,
    paragrafos: [
      'Trafego criptografado via HTTPS (TLS 1.2 ou superior) em todas as paginas e chamadas de API.',
      'Senhas armazenadas com hash bcrypt e nunca recuperaveis em texto puro.',
      'Controle de acesso por papel (cliente, barbeiro, administrador), com verificacao de sessao em cada rota sensivel.',
      'Backups periodicos e monitoramento de acessos suspeitos.',
      'Em caso de incidente de seguranca relevante, comunicaremos voce e a ANPD nos prazos legais.',
    ],
  },
  {
    id: 'menores',
    titulo: '10. Criancas e adolescentes',
    icone: UserCheck,
    paragrafos: [
      'O app e destinado a maiores de 18 anos. Menores de idade so podem ser cadastrados por responsavel legal, que assume a responsabilidade pelo agendamento e pelo pagamento.',
    ],
  },
  {
    id: 'alteracoes',
    titulo: '11. Alteracoes desta politica',
    icone: FileText,
    paragrafos: [
      'Podemos atualizar esta politica para refletir mudancas na legislacao ou nos servicos. A data da ultima atualizacao aparece no topo da pagina.',
      'Alteracoes materiais serao comunicadas por e-mail ou notificacao no app com antecedencia minima de 15 dias.',
    ],
  },
];

export default async function PoliticaDePrivacidadePage() {
  const settings = await prisma.businessSettings.findFirst();
  const nomeNegocio = settings?.nomeNegocio ?? 'Barbearia Dom Corte';
  const telefone = settings?.telefone ?? null;
  const endereco = settings?.endereco ?? 'Volta Redonda, RJ';
  const emailContato = 'privacidade@domcorte.com.br';
  const ultimaAtualizacao = '25 de agosto de 2026';

  return (
    <main className="min-h-screen bg-bg text-fg">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-accent/10" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal variant="up">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                <ShieldCheck className="h-6 w-6" aria-hidden />
              </span>
              <p className="text-sm font-medium uppercase tracking-wider text-brand">Privacidade e LGPD</p>
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Politica de Privacidade
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-fg-muted">
              Transparencia sobre como a {nomeNegocio} trata seus dados pessoais, em conformidade com a Lei Geral de
              Protecao de Dados (Lei 13.709/2018).
            </p>
            <p className="mt-2 text-sm text-fg-muted">Ultima atualizacao: {ultimaAtualizacao}</p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-surface p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-muted">Nesta pagina</p>
              <nav aria-label="Indice da politica">
                <ul className="space-y-1 text-sm">
                  {SECOES.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="block rounded-md px-2 py-1.5 text-fg-muted transition-colors duration-150 hover:bg-brand/10 hover:text-brand"
                      >
                        {s.titulo}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          <div className="space-y-6">
            {SECOES.map((secao, i) => {
              const Icone = secao.icone;
              return (
                <Reveal key={secao.id} variant="up" delay={i * 40}>
                  <section id={secao.id} className="scroll-mt-24">
                    <Card className="border-border">
                      <CardBody className="p-6">
                        <div className="mb-3 flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
                            <Icone className="h-5 w-5" aria-hidden />
                          </span>
                          <CardTitle className="font-display text-xl text-fg">{secao.titulo}</CardTitle>
                        </div>
                        <div className="space-y-3 text-sm leading-relaxed text-fg-muted">
                          {secao.paragrafos.map((p, idx) => (
                            <p key={idx}>{p}</p>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  </section>
                </Reveal>
              );
            })}

            <Reveal variant="up">
              <Card className="border-brand/30 bg-brand/5">
                <CardBody className="p-6">
                  <CardTitle className="font-display text-xl text-fg">Fale com o encarregado de dados</CardTitle>
                  <p className="mt-2 text-sm text-fg-muted">
                    Para exercer seus direitos, tirar duvidas ou reportar um incidente, entre em contato:
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-fg">
                    <li className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-brand" aria-hidden />
                      <a href={`mailto:${emailContato}`} className="underline-offset-4 hover:underline">
                        {emailContato}
                      </a>
                    </li>
                    {telefone && (
                      <li className="flex items-center gap-2">
                        <span className="text-brand" aria-hidden>•</span>
                        <span>Telefone: {telefone}</span>
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand" aria-hidden />
                      <span>{endereco}</span>
                    </li>
                  </ul>
                </CardBody>
              </Card>
            </Reveal>

            <Reveal variant="up">
              <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-display text-lg text-fg">Tambem leia os Termos de Uso</p>
                  <p className="text-sm text-fg-muted">
                    Regras de agendamento, cancelamento, reagendamento e programa de fidelidade.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href="/termos">
                    <Button variant="secondary" size="md">
                      Ver Termos
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="primary" size="md">
                      Voltar ao inicio
                    </Button>
                  </Link>
                </div>
              </div>
            </Reveal>

            <p className="pt-4 text-center text-xs text-fg-muted">
              {ASSETS.name} · {ASSETS.slogan}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
