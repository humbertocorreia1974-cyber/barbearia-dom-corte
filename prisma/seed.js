const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const senha = bcrypt.hashSync('Demo@1234', 10);

function d(offsetDays) {
  const dt = new Date();
  dt.setDate(dt.getDate() + offsetDays);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
function ymd(dt) {
  return dt.toISOString().slice(0, 10);
}
function hhmm(h, m) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

async function main() {
  // ===== USERS =====
  try {
    const usersData = [
      { email: 'admin@demo.app', name: 'Administrador Dom Corte', role: 'admin', phone: '(11) 99999-0001' },
      { email: 'barbeiro@demo.app', name: 'Rafael Souza', role: 'barbeiro', phone: '(11) 99999-0002' },
      { email: 'jogador@demo.app', name: 'Cliente Demo', role: 'user', phone: '(11) 99999-0003' },
      { email: 'joao.silva@demo.app', name: 'João Silva', role: 'user', phone: '(11) 98888-1001' },
      { email: 'pedro.alves@demo.app', name: 'Pedro Alves', role: 'user', phone: '(11) 98888-1002' },
      { email: 'lucas.martins@demo.app', name: 'Lucas Martins', role: 'user', phone: '(11) 98888-1003' },
      { email: 'carlos.pereira@demo.app', name: 'Carlos Pereira', role: 'user', phone: '(11) 98888-1004' },
      { email: 'bruno.costa@demo.app', name: 'Bruno Costa', role: 'user', phone: '(11) 98888-1005' },
    ];
    for (const u of usersData) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: { ...u, passwordHash: senha, termsAcceptedAt: new Date() },
      });
    }
  } catch (e) { console.warn('[seed] pulou User:', e.message); }

  // ===== BARBERS =====
  try {
    const barbeiroUser = await prisma.user.findUnique({ where: { email: 'barbeiro@demo.app' } });
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@demo.app' } });
    if (barbeiroUser) {
      await prisma.barber.upsert({
        where: { userId: barbeiroUser.id },
        update: {},
        create: {
          userId: barbeiroUser.id,
          nomeCompleto: 'Rafael Souza',
          apelido: 'Rafa',
          emailContato: 'rafael@barbeariadomcorte.com.br',
          telefoneCelular: '(11) 99999-0002',
          especialidades: 'Corte clássico, Barba, Degradê',
          bio: 'Barbeiro há 12 anos, especialista em cortes clássicos e barba desenhada.',
          ativo: true,
        },
      });
    }
    if (adminUser) {
      await prisma.barber.upsert({
        where: { userId: adminUser.id },
        update: {},
        create: {
          userId: adminUser.id,
          nomeCompleto: 'Marcos Andrade',
          apelido: 'Marcão',
          emailContato: 'marcos@barbeariadomcorte.com.br',
          telefoneCelular: '(11) 99999-0001',
          especialidades: 'Combo, Sobrancelha, Navalhado',
          bio: 'Dono da Dom Corte, 20 anos de tesoura na mão.',
          ativo: true,
        },
      });
    }
  } catch (e) { console.warn('[seed] pulou Barber:', e.message); }

  // ===== SERVICES =====
  try {
    const servicesData = [
      { nomeServico: 'Corte Clássico', descricao: 'Corte na tesoura com acabamento na navalha.', duracaoMinutos: 30, preco: 55.0, categoria: 'corte' },
      { nomeServico: 'Degradê Navalhado', descricao: 'Degradê com transição suave e navalhado.', duracaoMinutos: 45, preco: 70.0, categoria: 'corte' },
      { nomeServico: 'Barba Terapia', descricao: 'Toalha quente, óleo e barba desenhada.', duracaoMinutos: 30, preco: 45.0, categoria: 'barba' },
      { nomeServico: 'Combo Corte + Barba', descricao: 'Corte completo com barba desenhada.', duracaoMinutos: 60, preco: 100.0, categoria: 'combo' },
      { nomeServico: 'Sobrancelha na Navalha', descricao: 'Design de sobrancelha masculina.', duracaoMinutos: 15, preco: 25.0, categoria: 'sobrancelha' },
      { nomeServico: 'Pigmentação de Barba', descricao: 'Preenchimento de falhas na barba.', duracaoMinutos: 40, preco: 80.0, categoria: 'outro' },
    ];
    const n = await prisma.service.count();
    if (n === 0) await prisma.service.createMany({ data: servicesData });
  } catch (e) { console.warn('[seed] pulou Service:', e.message); }

  // ===== BUSINESS SETTINGS =====
  try {
    const n = await prisma.businessSettings.count();
    if (n === 0) {
      await prisma.businessSettings.create({
        data: {
          nomeNegocio: 'Barbearia Dom Corte',
          telefone: '(11) 3456-7890',
          endereco: 'Rua Augusta, 1200 - Consolação, São Paulo - SP',
          horarioAbertura: '09:00',
          horarioFechamento: '19:00',
          diasFuncionamento: '1,2,3,4,5,6',
          intervaloSlotMinutos: 30,
          whatsappLembreteAtivo: true,
        },
      });
    }
  } catch (e) { console.warn('[seed] pulou BusinessSettings:', e.message); }

  // ===== APPOINTMENTS =====
  try {
    const barbers = await prisma.barber.findMany();
    const services = await prisma.service.findMany();
    const clients = await prisma.user.findMany({ where: { role: 'user' } });
    if (barbers.length && services.length && clients.length) {
      const statuses = ['atendido', 'atendido', 'atendido', 'confirmado', 'confirmado', 'cancelado', 'no_show'];
      const canais = ['web', 'whatsapp', 'balcao'];
      const plan = [];
      for (let i = 0; i < 14; i++) {
        const barber = barbers[i % barbers.length];
        const service = services[i % services.length];
        const client = clients[i % clients.length];
        const offset = i < 7 ? -(i + 1) : (i - 6);
        const data = d(offset);
        const hora = 9 + (i % 8);
        const horaInicio = hhmm(hora, 0);
        const horaFim = hhmm(hora + Math.ceil(service.duracaoMinutos / 60), 0);
        const status = statuses[i % statuses.length];
        plan.push({
          clientId: client.id,
          barberId: barber.id,
          serviceId: service.id,
          dataAgendamento: data,
          horaInicio,
          horaFim,
          status,
          valorTotal: service.preco,
          compareceu: status === 'atendido' ? true : status === 'no_show' ? false : null,
          canalOrigem: canais[i % canais.length],
          slotKey: `${barber.id}|${ymd(data)}|${horaInicio}`,
          observacoes: i % 4 === 0 ? 'Cliente pediu atenção no acabamento.' : null,
        });
      }
      for (const a of plan) {
        await prisma.appointment.upsert({ where: { slotKey: a.slotKey }, update: {}, create: a });
      }
    }
  } catch (e) { console.warn('[seed] pulou Appointment:', e.message); }

  // ===== SCHEDULE BLOCKS =====
  try {
    const barbers = await prisma.barber.findMany();
    const n = await prisma.scheduleBlock.count();
    if (n === 0 && barbers.length) {
      const blocks = [];
      for (let i = 0; i < 4; i++) {
        const barber = barbers[i % barbers.length];
        blocks.push({
          barberId: barber.id,
          dataBloqueio: d(i + 1),
          horaInicio: i % 2 === 0 ? '12:00' : '15:00',
          horaFim: i % 2 === 0 ? '13:00' : '16:00',
          motivo: i % 2 === 0 ? 'almoco' : 'outro',
          descricao: i % 2 === 0 ? 'Almoço' : 'Compromisso pessoal',
          recorrente: i % 2 === 0,
        });
      }
      await prisma.scheduleBlock.createMany({ data: blocks });
    }
  } catch (e) { console.warn('[seed] pulou ScheduleBlock:', e.message); }

  // ===== REVIEWS =====
  try {
    const atendidos = await prisma.appointment.findMany({ where: { status: 'atendido' }, take: 5 });
    const n = await prisma.review.count();
    if (n === 0 && atendidos.length) {
      const comentarios = [
        'Atendimento impecável, corte perfeito!',
        'Ambiente top, barbeiro muito atencioso.',
        'Melhor barbearia da região, recomendo demais.',
        'Sempre saio satisfeito, equipe nota 10.',
        'Barba desenhada com capricho, voltarei sempre.',
      ];
      const destaques = ['Pontualidade', 'Ambiente', 'Atendimento', 'Acabamento', 'Preço justo'];
      for (let i = 0; i < atendidos.length; i++) {
        const a = atendidos[i];
        await prisma.review.create({
          data: {
            appointmentId: a.id,
            barberId: a.barberId,
            serviceId: a.serviceId,
            authorId: a.clientId,
            notaAtendimento: 5 - (i % 2),
            comentario: comentarios[i % comentarios.length],
            destaquePositivo: destaques[i % destaques.length],
            recomenda: true,
          },
        });
      }
    }
  } catch (e) { console.warn('[seed] pulou Review:', e.message); }

  // ===== LOYALTY =====
  try {
    const clients = await prisma.user.findMany({ where: { role: 'user' } });
    const n = await prisma.loyaltyAccount.count();
    if (n === 0 && clients.length) {
      const niveis = ['bronze', 'prata', 'ouro'];
      for (let i = 0; i < clients.length; i++) {
        const c = clients[i];
        const acc = await prisma.loyaltyAccount.create({
          data: {
            userId: c.id,
            nomeCliente: c.name || 'Cliente',
            emailCliente: c.email,
            telefoneCliente: c.phone || '(11) 90000-0000',
            saldoPontos: 50 + i * 30,
            nivelFidelidade: niveis[i % niveis.length],
            ativo: true,
          },
        });
        await prisma.loyaltyTransaction.create({
          data: {
            accountId: acc.id,
            tipoMovimento: 'ganho',
            quantidadePontos: 50 + i * 30,
            descricao: 'Pontos de boas-vindas',
            saldoAposMovimento: 50 + i * 30,
          },
        });
      }
    }
  } catch (e) { console.warn('[seed] pulou LoyaltyAccount:', e.message); }

  // ===== NOTIFICATIONS =====
  try {
    const users = await prisma.user.findMany({ where: { role: 'user' }, take: 4 });
    const n = await prisma.notification.count();
    if (n === 0 && users.length) {
      const tipos = ['confirmacao', 'lembrete', 'avaliacao', 'sistema'];
      const titulos = ['Agendamento confirmado', 'Lembrete de horário', 'Avalie seu atendimento', 'Bem-vindo à Dom Corte'];
      for (let i = 0; i < users.length; i++) {
        await prisma.notification.create({
          data: {
            userId: users[i].id,
            titulo: titulos[i % titulos.length],
            mensagem: 'Mensagem de demonstração da Barbearia Dom Corte.',
            tipoNotificacao: tipos[i % tipos.length],
            canalEnvio: i % 2 === 0 ? 'in_app' : 'whatsapp',
            horaEnvio: hhmm(9 + i, 0),
            lida: i % 2 === 0,
          },
        });
      }
    }
  } catch (e) { console.warn('[seed] pulou Notification:', e.message); }
}

main().then(()=>prisma.$disconnect()).catch(async(e)=>{console.error('[seed] ERRO:',e.message);await prisma.$disconnect();process.exitCode = 0;});