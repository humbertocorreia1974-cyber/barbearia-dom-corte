import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const appointmentId = typeof body?.appointmentId === "string" ? body.appointmentId : "";
  const nota = Number(body?.notaAtendimento);
  const comentario =
    typeof body?.comentario === "string" && body.comentario.trim().length > 0
      ? body.comentario.trim().slice(0, 500)
      : null;
  const destaquePositivo =
    typeof body?.destaquePositivo === "string" && body.destaquePositivo.trim().length > 0
      ? body.destaquePositivo.trim().slice(0, 80)
      : null;
  const recomenda =
    typeof body?.recomenda === "boolean" ? body.recomenda : null;

  if (!appointmentId) {
    return NextResponse.json({ error: "Agendamento não informado." }, { status: 400 });
  }
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    return NextResponse.json({ error: "Nota deve ser entre 1 e 5." }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { review: { select: { id: true } } },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
  }
  if (appointment.clientId !== session.user.id) {
    return NextResponse.json({ error: "Sem permissão para avaliar este agendamento." }, { status: 403 });
  }
  if (appointment.status !== "atendido") {
    return NextResponse.json(
      { error: "Só é possível avaliar atendimentos concluídos." },
      { status: 409 }
    );
  }
  if (appointment.review) {
    return NextResponse.json({ error: "Este atendimento já foi avaliado." }, { status: 409 });
  }

  try {
    const review = await prisma.review.create({
      data: {
        appointmentId: appointment.id,
        barberId: appointment.barberId,
        serviceId: appointment.serviceId,
        authorId: session.user.id,
        notaAtendimento: nota,
        comentario,
        destaquePositivo,
        recomenda,
      },
      select: { id: true, notaAtendimento: true, dataAvaliacao: true },
    });

    await prisma.notification.create({
      data: {
        userId: appointment.clientId,
        appointmentId: appointment.id,
        titulo: "Avaliação registrada",
        mensagem: "Obrigado por avaliar seu atendimento na Barbearia Dom Corte.",
        tipoNotificacao: "avaliacao",
        canalEnvio: "in_app",
        horaEnvio: new Date().toISOString().slice(11, 16),
      },
    });

    return NextResponse.json({ ok: true, review }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Este atendimento já foi avaliado." }, { status: 409 });
    }
    return NextResponse.json({ error: "Erro ao salvar avaliação." }, { status: 500 });
  }

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/reviews/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
