import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MOTIVOS = ['almoco', 'folga', 'feriado', 'outro'];
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

async function resolveBarberId(userId: string, role: string) {
  const barber = await prisma.barber.findUnique({ where: { userId }, select: { id: true } });
  if (barber) return barber.id;
  if (role === 'admin') {
    const first = await prisma.barber.findFirst({ where: { ativo: true }, select: { id: true } });
    return first?.id ?? null;
  }
  return null;
}

export async function GET() {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  if (session.user.role !== 'barbeiro' && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }
  const barberId = await resolveBarberId(session.user.id, session.user.role);
  if (!barberId) return NextResponse.json({ error: 'Perfil de barbeiro não encontrado' }, { status: 404 });

  const blocks = await prisma.scheduleBlock.findMany({
    where: { barberId },
    orderBy: [{ dataBloqueio: 'asc' }, { horaInicio: 'asc' }],
  });
  return NextResponse.json({ blocks });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/barber/blocks/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}

export async function POST(request: Request) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  if (session.user.role !== 'barbeiro' && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }
  const barberId = await resolveBarberId(session.user.id, session.user.role);
  if (!barberId) return NextResponse.json({ error: 'Perfil de barbeiro não encontrado' }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });

  const { data, horaInicio, horaFim, motivo, descricao, recorrente } = body as {
    data?: string;
    horaInicio?: string;
    horaFim?: string;
    motivo?: string;
    descricao?: string | null;
    recorrente?: boolean;
  };

  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return NextResponse.json({ error: 'Data inválida (use AAAA-MM-DD)' }, { status: 400 });
  }
  if (!horaInicio || !TIME_RE.test(horaInicio) || !horaFim || !TIME_RE.test(horaFim)) {
    return NextResponse.json({ error: 'Horários inválidos (use HH:mm)' }, { status: 400 });
  }
  if (horaFim <= horaInicio) {
    return NextResponse.json({ error: 'Hora final deve ser maior que a inicial' }, { status: 400 });
  }
  if (!motivo || !MOTIVOS.includes(motivo)) {
    return NextResponse.json({ error: 'Motivo inválido' }, { status: 400 });
  }

  const dataBloqueio = new Date(`${data}T00:00:00.000Z`);

  const conflito = await prisma.appointment.findFirst({
    where: {
      barberId,
      dataAgendamento: dataBloqueio,
      status: 'confirmado',
      horaInicio: { lt: horaFim },
      horaFim: { gt: horaInicio },
    },
    select: { id: true, horaInicio: true, horaFim: true },
  });
  if (conflito) {
    return NextResponse.json(
      { error: `Existe agendamento confirmado das ${conflito.horaInicio} às ${conflito.horaFim} nesse intervalo. Cancele ou reagende antes.` },
      { status: 409 },
    );
  }

  const block = await prisma.scheduleBlock.create({
    data: {
      barberId,
      dataBloqueio,
      horaInicio,
      horaFim,
      motivo,
      descricao: descricao || null,
      recorrente: Boolean(recorrente),
    },
  });

  return NextResponse.json({ block }, { status: 201 });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/barber/blocks/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
