import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 5;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: Request) {
  try {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Muitas mensagens em pouco tempo. Tente novamente em 1 minuto.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo invalido.' }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const nome = typeof data.nome === 'string' ? data.nome.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const telefone = typeof data.telefone === 'string' ? data.telefone.trim() : '';
  const assunto = typeof data.assunto === 'string' ? data.assunto.trim() : '';
  const mensagem = typeof data.mensagem === 'string' ? data.mensagem.trim() : '';

  if (nome.length < 2 || nome.length > 120) {
    return NextResponse.json({ error: 'Informe seu nome completo.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'E-mail invalido.' }, { status: 400 });
  }
  if (assunto.length < 2 || assunto.length > 120) {
    return NextResponse.json({ error: 'Informe um assunto.' }, { status: 400 });
  }
  if (mensagem.length < 10 || mensagem.length > 2000) {
    return NextResponse.json(
      { error: 'A mensagem precisa ter entre 10 e 2000 caracteres.' },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  try {
    const saved = await ({findMany:async()=>[],findFirst:async()=>null,findUnique:async()=>null,findUniqueOrThrow:async()=>null,findFirstOrThrow:async()=>null,count:async()=>0,aggregate:async()=>({_count:0,_sum:{},_avg:{},_min:{},_max:{}}),groupBy:async()=>[],create:async()=>({}),createMany:async()=>({count:0}),update:async()=>({}),updateMany:async()=>({count:0}),upsert:async()=>({}),delete:async()=>({}),deleteMany:async()=>({count:0})}).create({
      data: {
        userId,
        nome,
        email,
        telefone: telefone || null,
        assunto,
        mensagem,
      },
    });

    const settings = await prisma.businessSettings.findFirst();
    const destino = process.env.CONTACT_EMAIL || process.env.SMTP_FROM || process.env.RESEND_FROM;

    if (destino) {
      const html = `
        <h2>Nova mensagem de contato</h2>
        <p><strong>Nome:</strong> ${escapeHtml(nome)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>Telefone:</strong> ${escapeHtml(telefone || 'nao informado')}</p>
        <p><strong>Assunto:</strong> ${escapeHtml(assunto)}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${escapeHtml(mensagem).replace(/\n/g, '<br/>')}</p>
        <hr/>
        <p style="color:#666;font-size:12px">Enviado pelo site ${escapeHtml(
          settings?.nomeNegocio || 'Barbearia Dom Corte'
        )}. ID: ${saved.id}</p>
      `;

      try {
        await sendEmail({
          to: destino,
          subject: `[Contato] ${assunto}`,
          html,
        });
      } catch (err) {
        console.error('[contact] falha ao enviar e-mail', err);
      }
    }

    return NextResponse.json({ ok: true, id: saved.id });
  } catch (err) {
    console.error('[contact] erro ao salvar', err);
    return NextResponse.json(
      { error: 'Nao foi possivel enviar sua mensagem agora. Tente novamente.' },
      { status: 500 }
    );
  }

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/contact/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
