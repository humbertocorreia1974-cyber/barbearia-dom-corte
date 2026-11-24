import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const url = new URL(request.url);
  const periodo = url.searchParams.get("periodo") === "semana" ? "semana" : "dia";

  const agora = new Date();
  const inicio = new Date(agora);
  inicio.setHours(0, 0, 0, 0);
  if (periodo === "semana") {
    inicio.setDate(inicio.getDate() - 6);
  }
  const fim = new Date(agora);
  fim.setHours(23, 59, 59, 999);

  const [agendamentos, barbeiros, settings] = await Promise.all([
    prisma.appointment.findMany({
      where: { dataAgendamento: { gte: inicio, lte: fim } },
      include: {
        barber: { select: { id: true, nomeCompleto: true, apelido: true } },
        service: { select: { nomeServico: true, duracaoMinutos: true } },
      },
    }),
    prisma.barber.findMany({
      where: { ativo: true },
      select: { id: true, nomeCompleto: true, apelido: true },
    }),
    prisma.businessSettings.findFirst(),
  ]);

  const faturamento = agendamentos
    .filter((a) => a.status === "atendido")
    .reduce((s, a) => s + Number(a.valorTotal), 0);

  const total = agendamentos.length;
  const atendidos = agendamentos.filter((a) => a.status === "atendido").length;
  const noShow = agendamentos.filter((a) => a.status === "no_show").length;
  const cancelados = agendamentos.filter((a) => a.status === "cancelado").length;

  const ab = settings?.horarioAbertura ?? "09:00";
  const fe = settings?.horarioFechamento ?? "19:00";
  const [h1, m1] = ab.split(":").map(Number);
  const [h2, m2] = fe.split(":").map(Number);
  const minutosDia = Math.max(0, h2 * 60 + m2 - (h1 * 60 + m1));
  const minutosDisponiveis =
    minutosDia * (periodo === "semana" ? 7 : 1) * Math.max(1, barbeiros.length);

  const minutosOcupados = agendamentos
    .filter((a) => a.status !== "cancelado")
    .reduce((s, a) => s + (a.service?.duracaoMinutos ?? 30), 0);

  const ocupacao =
    minutosDisponiveis > 0
      ? Math.min(100, (minutosOcupados / minutosDisponiveis) * 100)
      : 0;

  const rankingMap = new Map<
    string,
    { nome: string; total: number; receita: number }
  >();
  for (const a of agendamentos) {
    if (a.status !== "atendido") continue;
    const atual = rankingMap.get(a.barber.id) ?? {
      nome: a.barber.apelido || a.barber.nomeCompleto,
      total: 0,
      receita: 0,
    };
    atual.total += 1;
    atual.receita += Number(a.valorTotal);
    rankingMap.set(a.barber.id, atual);
  }
  const ranking = Array.from(rankingMap.values()).sort(
    (a, b) => b.receita - a.receita
  );

  return NextResponse.json({
    periodo,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
    faturamento,
    total,
    atendidos,
    noShow,
    cancelados,
    taxaNoShow: total > 0 ? (noShow / total) * 100 : 0,
    ocupacao,
    ranking,
  });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/admin/dashboard/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
