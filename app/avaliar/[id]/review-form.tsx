"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  appointmentId: string;
  barberName: string;
  serviceName: string;
};

const DESTAQUES = [
  "Pontualidade",
  "Atendimento",
  "Ambiente",
  "Resultado final",
  "Preço justo",
];

export function ReviewForm({ appointmentId, barberName, serviceName }: Props) {
  const router = useRouter();
  const [nota, setNota] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [destaque, setDestaque] = useState<string>("");
  const [recomenda, setRecomenda] = useState<boolean | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (nota < 1 || nota > 5) {
      setErro("Escolha uma nota de 1 a 5 estrelas.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          notaAtendimento: nota,
          comentario: comentario.trim() || null,
          destaquePositivo: destaque || null,
          recomenda: recomenda,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data?.error || "Não foi possível enviar sua avaliação. Tente novamente.");
        setEnviando(false);
        return;
      }
      router.push("/meus-agendamentos?status=1");
      router.refresh();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  const notaLabel = ["", "Muito ruim", "Ruim", "Ok", "Muito bom", "Excelente"][nota] || "";

  return (
    <Card>
      <CardTitle>Avaliar {barberName}</CardTitle>
      <CardBody>
        <p className="mb-6 text-sm text-fg-muted">
          Serviço: <span className="text-fg">{serviceName}</span>
        </p>

        <form onSubmit={enviar} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-fg">
              Nota do atendimento
            </label>
            <div className="flex items-center gap-2" role="radiogroup" aria-label="Nota de 1 a 5">
              {[1, 2, 3, 4, 5].map((n) => {
                const ativo = (hover || nota) >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={nota === n}
                    aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setNota(n)}
                    className="rounded-md p-1 transition-transform duration-150 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill={ativo ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className={ativo ? "text-accent" : "text-fg-muted"}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.5a.56.56 0 0 1 1.04 0l2.13 5.11 5.52.44c.5.04.7.66.32.98l-4.2 3.6 1.28 5.38c.12.49-.42.87-.85.61L12 16.77l-4.72 2.85c-.43.26-.97-.12-.85-.61l1.28-5.38-4.2-3.6c-.38-.32-.18-.94.32-.98l5.52-.44 2.13-5.11Z"
                      />
                    </svg>
                  </button>
                );
              })}
              {nota > 0 && (
                <span className="ml-2 text-sm text-fg-muted">{notaLabel}</span>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-fg">
              O que se destacou? (opcional)
            </label>
            <div className="flex flex-wrap gap-2">
              {DESTAQUES.map((d) => {
                const sel = destaque === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDestaque(sel ? "" : d)}
                    className={
                      "rounded-full border px-3 py-1 text-xs transition-colors duration-150 " +
                      (sel
                        ? "border-brand bg-brand text-brand-fg"
                        : "border-border bg-surface text-fg-muted hover:bg-brand/5 hover:text-fg")
                    }
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="comentario" className="mb-2 block text-sm font-medium text-fg">
              Comentário (opcional)
            </label>
            <textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Conte como foi o atendimento, o ambiente, o resultado do corte."
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
            />
            <p className="mt-1 text-right text-xs text-fg-muted">{comentario.length}/500</p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-fg">Você recomendaria o Dom Corte?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRecomenda(true)}
                className={
                  "rounded-lg border px-4 py-2 text-sm transition-colors duration-150 " +
                  (recomenda === true
                    ? "border-brand bg-brand text-brand-fg"
                    : "border-border bg-surface text-fg-muted hover:bg-brand/5")
                }
              >
                Sim, recomendo
              </button>
              <button
                type="button"
                onClick={() => setRecomenda(false)}
                className={
                  "rounded-lg border px-4 py-2 text-sm transition-colors duration-150 " +
                  (recomenda === false
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border bg-surface text-fg-muted hover:bg-accent/5")
                }
              >
                Não recomendaria
              </button>
            </div>
          </div>

          {erro && (
            <div className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">
              {erro}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="primary" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar avaliação"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/meus-agendamentos")}
              disabled={enviando}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
