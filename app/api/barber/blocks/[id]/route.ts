import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  if (session.user.role !== 'barbeiro' && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }

  const block = await prisma.scheduleBlock.findUnique({
    where: { id: params.id },
    select: { id: true, barberId: true, barber: { select: { userId: true } } },
  });
  if (!block) return NextResponse.json({ error: 'Bloqueio não encontrado' }, { status: 404 });

  const isOwner = block.barber.userId === session.user.id;
  if (!isOwner && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Sem permissão para este bloqueio' }, { status: 403 });
  }

  await prisma.scheduleBlock.delete({ where: { id: block.id } });
  return NextResponse.json({ ok: true });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/barber/blocks/[id]/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
