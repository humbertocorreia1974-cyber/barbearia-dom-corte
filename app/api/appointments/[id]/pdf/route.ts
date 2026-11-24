import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pdfDocument, renderPdf, esc } from '@/lib/pdf';

export const dynamic = 'force-dynamic';

function fmtData(d: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

function fmtValor(v: unknown) {
  const n = typeof v === 'number' ? v : Number(v ?? 0);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Não autenticado', { status: 401 });
  }

  const a = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      service: { select: { nomeServico: true, duracaoMinutos: true } },
      barber: { select: { nomeCompleto: true, apelido: true } },
      client: { select: { name: true, email: true } },
    },
  });

  if (!a) return new Response('Agendamento não encontrado', { status: 404 });
  if (a.clientId !== session.user.id) {
    return new Response('Sem permissão', { status: 403 });
  }

  const barbeiro = a.barber.apelido || a.barber.nomeCompleto;
  const corpo = `
    <h2>Comprovante de agendamento</h2>
    <table>
      <tr><td><strong>Cliente</strong></td><td>${esc(a.client.name)}</td></tr>
      <tr><td><strong>E-mail</strong></td><td>${esc(a.client.email)}</td></tr>
      <tr><td><strong>Serviço</strong></td><td>${esc(a.service.nomeServico)}</td></tr>
      <tr><td><strong>Duração</strong></td><td>${esc(String(a.service.duracaoMinutos))} min</td></tr>
      <tr><td><strong>Barbeiro</strong></td><td>${esc(barbeiro)}</td></tr>
      <tr><td><strong>Data</strong></td><td>${esc(fmtData(new Date(a.dataAgendamento)))}</td></tr>
      <tr><td><strong>Horário</strong></td><td>${esc(a.horaInicio)} às ${esc(a.horaFim)}</td></tr>
      <tr><td><strong>Status</strong></td><td>${esc(a.status)}</td></tr>
      <tr><td><strong>Valor</strong></td><td>${esc(fmtValor(a.valorTotal))}</td></tr>
    </table>
    <p>Barbearia Dom Corte · Volta Redonda · Seu corte, seu barbeiro, seu horário no Dom Corte.</p>
  `;

  const html = pdfDocument('Comprovante de agendamento', corpo, '#8B5E34');
  return renderPdf(html, `agendamento-${a.id.slice(0, 8)}.pdf`);

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/appointments/[id]/pdf/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
