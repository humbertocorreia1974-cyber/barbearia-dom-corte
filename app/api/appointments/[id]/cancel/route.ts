import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { barber: true, service: true },
  });

  if (!appointment) {
    return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
  }

  const isOwner = appointment.clientId === session.user.id;
  const isBarber = appointment.barber.userId === session.user.id;
  const isAdmin = session.user.role === 'admin';

  if (!isOwner && !isBarber && !isAdmin) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }

  if (appointment.status === 'cancelado') {
    return NextResponse.json({ error: 'Agendamento já cancelado' }, { status: 400 });
  }

  if (appointment.status === 'atendido') {
    return NextResponse.json({ error: 'Atendimento já realizado, não pode cancelar' }, { status: 400 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const appt = await tx.appointment.update({
      where: { id: appointment.id },
      data: { status: 'cancelado' },
    });

    await tx.notification.create({
      data: {
        userId: appointment.clientId,
        appointmentId: appointment.id,
        titulo: 'Agendamento cancelado',
        mensagem: `Seu horário de ${appointment.service.nomeServico} em ${appointment.dataAgendamento.toISOString().slice(0, 10)} às ${appointment.horaInicio} foi cancelado.`,
        tipoNotificacao: 'cancelamento',
        canalEnvio: 'in_app',
        horaEnvio: new Date().toTimeString().slice(0, 5),
      },
    });

    return appt;
  });

  return NextResponse.json({ appointment: updated });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/appointments/[id]/cancel/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
