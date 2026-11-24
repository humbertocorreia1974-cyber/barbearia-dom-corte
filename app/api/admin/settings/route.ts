import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: 'unauthorized' as const, status: 401 };
  if (session.user.role !== 'admin') return { error: 'forbidden' as const, status: 403 };
  return { session };
}

async function getOrCreateSettings() {
  const existing = await prisma.businessSettings.findFirst();
  if (existing) return existing;
  return prisma.businessSettings.create({ data: {} });
}

export async function GET() {
  try {
  const guard = await requireAdmin();
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const settings = await getOrCreateSettings();
  return NextResponse.json({ settings });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/admin/settings/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}

export async function PUT(request: Request) {
  try {
  const guard = await requireAdmin();
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'json_invalido' }, { status: 400 });
  }

  const nomeNegocio = String(body?.nomeNegocio ?? '').trim();
  if (!nomeNegocio) return NextResponse.json({ error: 'nome_obrigatorio' }, { status: 400 });

  const horarioAbertura = String(body?.horarioAbertura ?? '09:00');
  const horarioFechamento = String(body?.horarioFechamento ?? '19:00');
  const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!hhmm.test(horarioAbertura) || !hhmm.test(horarioFechamento)) {
    return NextResponse.json({ error: 'horario_invalido' }, { status: 400 });
  }
  if (horarioAbertura >= horarioFechamento) {
    return NextResponse.json({ error: 'abertura_maior_que_fechamento' }, { status: 400 });
  }

  const diasArr: number[] = Array.isArray(body?.diasFuncionamento)
    ? body.diasFuncionamento.map((d: any) => Number(d)).filter((d: number) => d >= 0 && d <= 6)
    : [];
  const diasFuncionamento = Array.from(new Set(diasArr)).sort().join(',');

  const intervaloSlotMinutos = Math.min(120, Math.max(10, Number(body?.intervaloSlotMinutos) || 30));

  const current = await getOrCreateSettings();
  const updated = await prisma.businessSettings.update({
    where: { id: current.id },
    data: {
      nomeNegocio,
      telefone: body?.telefone ? String(body.telefone).trim() : null,
      endereco: body?.endereco ? String(body.endereco).trim() : null,
      horarioAbertura,
      horarioFechamento,
      diasFuncionamento,
      intervaloSlotMinutos,
      whatsappLembreteAtivo: Boolean(body?.whatsappLembreteAtivo),
    },
  });

  return NextResponse.json({ settings: updated });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/admin/settings/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
