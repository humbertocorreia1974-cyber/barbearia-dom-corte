import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function csvEscape(v: string | number | null | undefined) {
  const s = v === null || v === undefined ? '' : String(v);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const clientes = await prisma.user.findMany({
    where: { role: 'user' },
    orderBy: { name: 'asc' },
    select: {
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      loyaltyAccount: { select: { saldoPontos: true, nivelFidelidade: true } },
      appointmentsAsClient: { select: { status: true, valorTotal: true, dataAgendamento: true } },
    },
  });

  const linhas: string[] = [];
  linhas.push(['Nome', 'E-mail', 'Telefone', 'Nível', 'Pontos', 'Agendamentos', 'Total gasto (R$)', 'Última visita', 'Cliente desde'].join(';'));

  for (const c of clientes) {
    const atendidos = c.appointmentsAsClient.filter((a) => a.status === 'atendido');
    const total = atendidos.reduce((acc, a) => acc + Number(a.valorTotal ?? 0), 0);
    const ultima = atendidos.reduce<Date | null>((acc, a) => {
      const d = new Date(a.dataAgendamento);
      return !acc || d > acc ? d : acc;
    }, null);
    linhas.push(
      [
        csvEscape(c.name),
        csvEscape(c.email),
        csvEscape(c.phone ?? ''),
        csvEscape(c.loyaltyAccount?.nivelFidelidade ?? 'bronze'),
        csvEscape(c.loyaltyAccount?.saldoPontos ?? 0),
        csvEscape(c.appointmentsAsClient.length),
        csvEscape(total.toFixed(2).replace('.', ',')),
        csvEscape(ultima ? new Date(ultima).toLocaleDateString('pt-BR') : ''),
        csvEscape(new Date(c.createdAt).toLocaleDateString('pt-BR')),
      ].join(';')
    );
  }

  const csv = '\uFEFF' + linhas.join('\n');
  const filename = `clientes-dom-corte-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
    },
  });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/admin/clients/export/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
