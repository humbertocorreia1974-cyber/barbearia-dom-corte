import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function sendWhatsApp(to: string, body: string) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneId || !token) return { ok: false, reason: 'sem_credenciais' };
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body },
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, reason: 'fetch_falhou' };
  }
}

export async function GET(request: Request) {
  try {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization') ?? '';
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const settings = await prisma.businessSettings.findFirst();
  if (settings && !settings.whatsappLembreteAtivo) {
    return NextResponse.json({ ok: true, skipped: 'lembrete_desativado' });
  }

  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const alvo = new Date(ymd(amanha) + 'T00:00:00.000Z');

  const agendamentos = await prisma.appointment.findMany({
    where: { dataAgendamento: alvo, status: 'confirmado' },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      barber: { select: { nomeCompleto: true } },
      service: { select: { nomeServico: true } },
    },
  });

  let enviados = 0;
  let falhas = 0;

  for (const a of agendamentos) {
    const jaEnviado = await prisma.notification.findFirst({
      where: { appointmentId: a.id, tipoNotificacao: 'lembrete' },
    });
    if (jaEnviado) continue;

    const texto = `Olá ${a.client.name}, lembrete do seu horário na Barbearia Dom Corte amanhã às ${a.horaInicio} com ${a.barber.nomeCompleto} (${a.service.nomeServico}). Responda SIM para confirmar.`;

    if (a.client.phone) {
      const r = await sendWhatsApp(a.client.phone, texto);
      if (r.ok) enviados++;
      else falhas++;
    } else if (a.client.email) {
      try {
        await sendEmail({
          to: a.client.email,
          subject: 'Lembrete do seu horário no Dom Corte',
          html: `<p>${texto}</p>`,
        });
        enviados++;
      } catch {
        falhas++;
      }
    }

    await prisma.notification.create({
      data: {
        userId: a.client.id,
        appointmentId: a.id,
        titulo: 'Lembrete do seu horário',
        mensagem: texto,
        tipoNotificacao: 'lembrete',
        canalEnvio: a.client.phone ? 'whatsapp' : 'email',
        horaEnvio: new Date().toISOString().slice(11, 16),
      },
    });
  }

  return NextResponse.json({ ok: true, total: agendamentos.length, enviados, falhas });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/cron/lembretes/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
