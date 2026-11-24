export function brl(v: number | string | { toString(): string }): string {
  const n = typeof v === "number" ? v : Number(v.toString());
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function dateBR(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export function dateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addMinutes(hhmm: string, min: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + min;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function slotKey(barberId: string, dateISOStr: string, hora: string): string {
  return `${barberId}|${dateISOStr}|${hora}`;
}

export function statusLabel(s: string): string {
  const map: Record<string, string> = {
    confirmado: "Confirmado",
    cancelado: "Cancelado",
    atendido: "Atendido",
    no_show: "Não compareceu",
    reagendado: "Reagendado",
  };
  return map[s] ?? s;
}
