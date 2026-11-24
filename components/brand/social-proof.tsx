/* brand-guard */
const QUOTES: { q: string; n: string; r: string }[] = [{"q":"Cheguei no horário e sentei direto na cadeira. Corte impecável, sem espera nenhuma.","n":"Rafael M.","r":"Cliente mensal"},{"q":"Barba com toalha quente que virou meu ritual de sexta. Ambiente de primeira.","n":"André L.","r":"Cliente há 2 anos"},{"q":"Agendei pelo celular em 30 segundos e o lembrete chegou na véspera. Zero dor de cabeça.","n":"Thiago S.","r":"Cliente"}];

/** Prova social. Depoimentos ILUSTRATIVOS — o dono substitui pelos reais. */
export default function SocialProof() {
  return (
    <section id="depoimentos" aria-labelledby="prova-titulo" className="border-t border-border/60 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand">Barbearia</p>
            <h2 id="prova-titulo" className="mt-2 text-3xl font-semibold sm:text-4xl">Quem já passou por aqui recomenda</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-fg-muted" aria-label="Avaliação média 4,9 de 5">
            <span className="text-lg tracking-widest text-brand" aria-hidden>★★★★★</span>
            <span><strong className="text-fg">4,9</strong> de média</span>
          </div>
        </div>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {QUOTES.map((t) => (
            <li key={t.n} className="rounded-2xl border border-border bg-surface/70 p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand/40">
              <p className="text-base leading-relaxed text-fg">“{t.q}”</p>
              <p className="mt-5 text-sm font-semibold text-fg">{t.n}</p>
              <p className="text-xs text-fg-muted">{t.r}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-fg-muted">Depoimentos ilustrativos — serão substituídos pelos relatos reais dos clientes.</p>
      </div>
    </section>
  );
}
