import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { ReviewForm } from "./review-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Avaliar atendimento | Barbearia Dom Corte",
  description:
    "Conte como foi seu corte na Barbearia Dom Corte: nota, destaque e comentário ajudam o barbeiro e os próximos clientes.",
  openGraph: {
    title: "Avaliar atendimento | Barbearia Dom Corte",
    description:
      "Conte como foi seu corte na Barbearia Dom Corte: nota, destaque e comentário.",
  },
};

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/entrar?next=/avaliar/${params.id}`);
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      barber: { select: { id: true, nomeCompleto: true, apelido: true, fotoPerfil: true } },
      service: { select: { id: true, nomeServico: true, duracaoMinutos: true, preco: true } },
      review: { select: { id: true } },
    },
  });

  if (!appointment) notFound();
  if (appointment.clientId !== session.user.id) {
    redirect("/meus-agendamentos");
  }

  const jaAvaliado = Boolean(appointment.review);
  const podeAvaliar = appointment.status === "atendido" && !jaAvaliado;

  const dataFmt = new Date(appointment.dataAgendamento).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal variant="up">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Sua opinião</p>
          <h1 className="mt-2 font-display text-3xl text-fg sm:text-4xl">Avaliar atendimento</h1>
          <p className="mt-2 text-sm text-fg-muted">
            Um minuto do seu tempo ajuda o barbeiro a caprichar ainda mais no próximo corte.
          </p>
        </div>
      </Reveal>

      <Reveal variant="up" delay={80}>
        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-fg-muted">Serviço</p>
                <p className="font-display text-xl text-fg">{appointment.service.nomeServico}</p>
                <p className="mt-1 text-sm text-fg-muted">
                  com {appointment.barber.apelido || appointment.barber.nomeCompleto} em {dataFmt} às{" "}
                  {appointment.horaInicio}
                </p>
              </div>
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                {appointment.status === "atendido" ? "Atendido" : appointment.status}
              </span>
            </div>
          </CardBody>
        </Card>
      </Reveal>

      {jaAvaliado && (
        <Reveal variant="up" delay={120}>
          <Card>
            <CardTitle>Você já avaliou este atendimento</CardTitle>
            <CardBody>
              <p className="text-sm text-fg-muted">
                Obrigado pelo retorno. Cada avaliação fica registrada no seu histórico e aparece no
                perfil do barbeiro.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/meus-agendamentos">
                  <Button variant="primary">Ver meus agendamentos</Button>
                </Link>
                <Link href="/agendar">
                  <Button variant="ghost">Agendar novo horário</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </Reveal>
      )}

      {!jaAvaliado && !podeAvaliar && (
        <Reveal variant="up" delay={120}>
          <Card>
            <CardTitle>Ainda não é possível avaliar</CardTitle>
            <CardBody>
              <p className="text-sm text-fg-muted">
                A avaliação fica disponível depois que o barbeiro marca o atendimento como concluído.
                Se você já foi atendido e o status não mudou, fale com a recepção da barbearia.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/meus-agendamentos/${appointment.id}`}>
                  <Button variant="primary">Ver detalhes do agendamento</Button>
                </Link>
                <Link href="/meus-agendamentos">
                  <Button variant="ghost">Voltar</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </Reveal>
      )}

      {podeAvaliar && (
        <Reveal variant="up" delay={120}>
          <ReviewForm
            appointmentId={appointment.id}
            barberName={appointment.barber.apelido || appointment.barber.nomeCompleto}
            serviceName={appointment.service.nomeServico}
          />
        </Reveal>
      )}
    </main>
  );
}
