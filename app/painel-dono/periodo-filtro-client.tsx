"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PeriodoFiltro({ atual }: { atual: "dia" | "semana" }) {
  const router = useRouter();
  const [valor, setValor] = useState<"dia" | "semana">(atual);

  function aplicar(p: "dia" | "semana") {
    setValor(p);
    router.push(`/painel-dono?periodo=${p}`);
  }

  return (
    <div className="inline-flex rounded-full border border-border bg-surface p-1">
      <button
        type="button"
        onClick={() => aplicar("dia")}
        className={
          "rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-150 " +
          (valor === "dia"
            ? "bg-brand text-brand-fg shadow-sm"
            : "text-fg-muted hover:bg-bg/60")
        }
      >
        Hoje
      </button>
      <button
        type="button"
        onClick={() => aplicar("semana")}
        className={
          "rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-150 " +
          (valor === "semana"
            ? "bg-brand text-brand-fg shadow-sm"
            : "text-fg-muted hover:bg-bg/60")
        }
      >
        Últimos 7 dias
      </button>
    </div>
  );
}
