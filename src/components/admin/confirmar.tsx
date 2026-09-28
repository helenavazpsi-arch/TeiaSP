"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Confirmação de ação destrutiva.
 *
 * Substitui os `confirm()` do navegador, que no site atual apareciam sem
 * contexto ("Remover este ponto?") e não diziam o que estava prestes a sumir.
 * Aqui o nome do item aparece na pergunta.
 */
export function Confirmar({
  aberto,
  aoFechar,
  aoConfirmar,
  titulo,
  descricao,
  rotuloConfirmar = "Confirmar",
  perigo = false,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoConfirmar: () => Promise<void> | void;
  titulo: string;
  descricao: string;
  rotuloConfirmar?: string;
  perigo?: boolean;
}) {
  const [processando, setProcessando] = useState(false);

  async function confirmar() {
    setProcessando(true);
    try {
      await aoConfirmar();
      aoFechar();
    } finally {
      setProcessando(false);
    }
  }

  return (
    <Dialog.Root open={aberto} onOpenChange={(v) => !v && !processando && aoFechar()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-teia-lg bg-sur p-6 shadow-xl">
          <div className="flex items-start gap-3">
            {perigo && (
              <span className="mt-0.5 shrink-0 rounded-full bg-erro-bg p-2 text-erro">
                <AlertTriangle size={18} />
              </span>
            )}
            <div className="min-w-0">
              <Dialog.Title className="font-display text-base font-bold text-tx">
                {titulo}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm leading-relaxed text-tx-2">
                {descricao}
              </Dialog.Description>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={aoFechar}
              disabled={processando}
              className="rounded-teia border border-black/10 px-4 py-2 text-sm font-medium text-tx transition-colors hover:bg-sur-2 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmar}
              disabled={processando}
              className={cn(
                "inline-flex items-center gap-2 rounded-teia px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-70",
                perigo ? "bg-erro hover:bg-erro/90" : "bg-marca-700 hover:bg-marca-800",
              )}
            >
              {processando && <Loader2 size={15} className="animate-spin" />}
              {rotuloConfirmar}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
