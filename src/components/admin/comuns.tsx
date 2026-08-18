"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { normalizar } from "@/lib/busca";
import { cn } from "@/lib/utils";

/** Peças repetidas nas seções do painel. */

export function Carregando() {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-tx-3">
      <Loader2 size={16} className="animate-spin" />
      Carregando…
    </div>
  );
}

export function Vazio({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-teia-lg border border-dashed border-black/12 px-4 py-10 text-center text-sm text-tx-3">
      {children}
    </p>
  );
}

export function Linha({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/8 px-3.5 py-3 last:border-0 hover:bg-sur-2/60">
      {children}
    </div>
  );
}

export function Caixa({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-teia-lg border border-black/10 bg-sur">
      {children}
    </div>
  );
}

export function Selo({
  children,
  tom = "neutro",
}: {
  children: ReactNode;
  tom?: "neutro" | "alerta" | "ok" | "info" | "erro";
}) {
  const tons = {
    neutro: "bg-sur-2 text-tx-2",
    alerta: "bg-alerta-bg text-alerta",
    ok: "bg-ok-bg text-ok",
    info: "bg-info-bg text-info",
    erro: "bg-erro-bg text-erro",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap",
        tons[tom],
      )}
    >
      {children}
    </span>
  );
}

export function BotaoAcao({
  children,
  onClick,
  tom = "neutro",
  titulo,
}: {
  children: ReactNode;
  onClick: () => void;
  tom?: "neutro" | "ok" | "erro" | "marca";
  titulo?: string;
}) {
  const tons = {
    neutro: "border-black/10 text-tx hover:bg-sur-2",
    ok: "border-transparent bg-ok text-white hover:opacity-90",
    erro: "border-transparent bg-erro text-white hover:opacity-90",
    marca: "border-transparent bg-marca-700 text-white hover:bg-marca-800",
  } as const;

  return (
    <button
      type="button"
      onClick={onClick}
      title={titulo}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-teia border px-2.5 py-1.5 text-xs font-medium transition-colors",
        tons[tom],
      )}
    >
      {children}
    </button>
  );
}

/** Filtro de texto das listas do painel. */
export function filtrar<T>(itens: T[], busca: string, campos: (item: T) => string): T[] {
  const termos = normalizar(busca)
    .split(" ")
    .filter((t) => t.length > 1);
  if (!termos.length) return itens;

  return itens.filter((item) => {
    const alvo = normalizar(campos(item));
    return termos.every((termo) => alvo.includes(termo));
  });
}

/** Ordena por nome, com acento e maiúscula tratados como no site atual. */
export function porNome<T extends { nome?: string; sigla?: string }>(a: T, b: T): number {
  return (a.nome || a.sigla || "").localeCompare(b.nome || b.sigla || "", "pt-BR", {
    sensitivity: "base",
    numeric: true,
  });
}
