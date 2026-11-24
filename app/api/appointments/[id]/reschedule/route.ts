import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { dataAgendamento, horaInicio } = (body ?? {}) as {
    dataAgendamento?: string;
    horaInicio?: string;
  };

  if (!dataAgendamento || !horaInicio || !/^\d{2}:\d{2}$/.test(horaInicio)) {
    return NextResponse.json({ error: 'Informe data e horário válidos' }, { status: 400 });
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

  if (appointment.status === 'cancelado' || appointment.status === 'atendido') {
    return NextResponse.json({ error: 'Este agendamento não pode ser reagendado' }, { status: 400 });
  }

  const novaData = new Date(`${dataAgendamento}T00:00:00`);
  if (Number.isNaN(novaData.getTime())) {
    return NextResponse.json({ error: 'Data inválida' }, { status: 400 });
  }

  const horaFim = addMinutes(horaInicio, appointment.service.duracaoMinutos);
  const slotKey = `${appointment.barberId}|${dataAgendamento}|${horaInicio}`;

  const conflito = await prisma.appointment.findFirst({
    where: {
      slotKey,
      id: { not: appointment.id },
      status: { notIn: ['cancelado'] },
    },
  });

  if (conflito) {
    return NextResponse.json({ error: 'Horário já ocupado, escolha outro' }, { status: 409 });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.update({
        where: { id: appointment.id },
        data: {
          dataAgendamento: novaData,
          horaInicio,
          horaFim,
          slotKey,
          status: 'confirmado',
        },
      });

      await tx.notification.create({
        data: {
          userId: appointment.clientId,
          appointmentId: appointment.id,
          titulo: 'Agendamento reagendado',
          mensagem: `Novo horário: ${dataAgendamento} às ${horaInicio} com ${appointment.barber.nomeCompleto}.`,
          tipoNotificacao: 'confirmacao',
          canalEnvio: 'in_app',
          horaEnvio: new Date().toTimeString().slice(0, 5),
        },
      });

      return appt;
    });

    return NextResponse.json({ appointment: updated });
  } catch {
    return NextResponse.json({ error: 'Horário já ocupado, escolha outro' }, { status: 409 });
  }

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/appointments/[id]/reschedule/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
