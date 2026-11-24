import { prisma } from "@/lib/prisma";
import { addMinutes } from "@/lib/format";

export type Slot = { hora: string; horaFim: string; livre: boolean };

export async function getSlots(barberId: string, serviceId: string, dateISOStr: string): Promise<Slot[]> {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return [];

  const settings = (await prisma.businessSettings.findFirst()) ?? {
    horarioAbertura: "09:00",
    horarioFechamento: "19:00",
    intervaloSlotMinutos: 30,
    diasFuncionamento: "1,2,3,4,5,6",
  };

  const date = new Date(`${dateISOStr}T12:00:00`);
  const weekday = date.getDay();
  const dias = settings.diasFuncionamento.split(",").map((d) => Number(d.trim()));
  if (!dias.includes(weekday)) return [];

  const [oh, om] = settings.horarioAbertura.split(":").map(Number);
  const [ch, cm] = settings.horarioFechamento.split(":").map(Number);
  const startMin = oh * 60 + om;
  const endMin = ch * 60 + cm;
  const step = settings.intervaloSlotMinutos || 30;
  const dur = service.duracaoMinutos;

  const dayStart = new Date(`${dateISOStr}T00:00:00`);
  const dayEnd = new Date(`${dateISOStr}T23:59:59`);

  const [appointments, blocks] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        barberId,
        dataAgendamento: { gte: dayStart, lte: dayEnd },
        status: { in: ["confirmado", "reagendado"] },
      },
      select: { horaInicio: true, horaFim: true },
    }),
    prisma.scheduleBlock.findMany({
      where: { barberId, dataBloqueio: { gte: dayStart, lte: dayEnd } },
      select: { horaInicio: true, horaFim: true },
    }),
  ]);

  const toMin = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
  };

  const busy: Array<[number, number]> = [
    ...appointments.map((a) => [toMin(a.horaInicio), toMin(a.horaFim)] as [number, number]),
    ...blocks.map((b) => [toMin(b.horaInicio), toMin(b.horaFim)] as [number, number]),
  ];

  const slots: Slot[] = [];
  for (let t = startMin; t + dur <= endMin; t += step) {
    const fim = t + dur;
    const overlap = busy.some(([bs, be]) => t < be && fim > bs);
    const hh = String(Math.floor(t / 60)).padStart(2, "0");
    const mm = String(t % 60).padStart(2, "0");
    const hora = `${hh}:${mm}`;
    slots.push({ hora, horaFim: addMinutes(hora, dur), livre: !overlap });
  }
  return slots;
}
