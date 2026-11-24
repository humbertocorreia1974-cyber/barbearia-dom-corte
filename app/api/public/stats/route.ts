import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
  const __session = await getServerSession(authOptions as any);
  if (!(__session as any)?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const [barbeirosAtivos, servicosAtivos, agendamentosConcluidos] = await Promise.all([
      prisma.barber.count({ where: { ativo: true } }),
      prisma.service.count({ where: { ativo: true } }),
      prisma.appointment.count({ where: { status: 'atendido' } }),
    ]);

    return NextResponse.json({
      barbeirosAtivos,
      servicosAtivos,
      agendamentosConcluidos,
    });
  } catch {
    return NextResponse.json(
      { barbeirosAtivos: 0, servicosAtivos: 0, agendamentosConcluidos: 0 },
      { status: 200 }
    );
  }

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/public/stats/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
