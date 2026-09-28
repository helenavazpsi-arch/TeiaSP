"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Mail, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { EQUIPE, type Contato } from "@/data/conteudo";

/**
 * Os nomes das psicólogas no cabeçalho, cada um abrindo o cartão de contato.
 * No site antigo era um modal montado à mão com innerHTML; aqui é um diálogo
 * do Radix, que já trata foco, Esc e leitor de tela.
 */
export function BotoesEquipe() {
  const [aberto, setAberto] = useState<Contato | null>(null);

  return (
    <>
      {EQUIPE.map((pessoa, indice) => (
        <span key={pessoa.id}>
          {indice > 0 && <span className="text-tx-3"> e </span>}
          <button
            type="button"
            onClick={() => setAberto(pessoa)}
            className="rounded font-medium text-marca-700 underline decoration-marca-200 underline-offset-2 transition-colors hover:text-marca-900 hover:decoration-marca-600"
          >
            {pessoa.nome}
          </button>
        </span>
      ))}

      <Dialog.Root open={aberto !== null} onOpenChange={(v) => !v && setAberto(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-teia-lg bg-sur p-6 shadow-xl">
            {aberto && (
              <>
                <Dialog.Title className="pr-8 font-display text-lg font-bold text-tx">
                  {aberto.nome}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-tx-2">
                  {aberto.crp}
                </Dialog.Description>

                <div className="mt-5 space-y-2">
                  <a
                    href={`mailto:${aberto.email}`}
                    className="flex items-center gap-2.5 rounded-teia border border-black/10 px-3 py-2.5 text-sm text-tx transition-colors hover:bg-sur-2"
                  >
                    <Mail size={16} className="shrink-0 text-marca-600" />
                    <span className="truncate">{aberto.email}</span>
                  </a>
                  <a
                    href={`https://wa.me/${aberto.whatsapp}`}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-2.5 rounded-teia border border-black/10 px-3 py-2.5 text-sm text-tx transition-colors hover:bg-sur-2"
                  >
                    <MessageCircle size={16} className="shrink-0 text-marca-600" />
                    {aberto.whatsappFormatado}
                  </a>
                </div>

                <Dialog.Close
                  aria-label="Fechar"
                  className="absolute top-4 right-4 rounded-full p-1.5 text-tx-3 transition-colors hover:bg-sur-2 hover:text-tx"
                >
                  <X size={18} />
                </Dialog.Close>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
