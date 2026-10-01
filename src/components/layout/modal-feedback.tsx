"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { MessageCircle, X } from "lucide-react";
import { FormularioMensagem } from "@/components/sugerir/formulario-mensagem";

export function ModalFeedback() {
  const [aberto, setAberto] = useState(false);

  return (
    <Dialog.Root open={aberto} onOpenChange={setAberto}>
      <Dialog.Trigger asChild>
        <button
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-marca-700 text-white shadow-lg transition-all hover:bg-marca-800 hover:scale-110"
          title="Enviar feedback"
          aria-label="Enviar feedback para os desenvolvedores"
        >
          <MessageCircle size={24} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-[9999]" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-[10000] w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-teia-lg bg-sur p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="flex items-start justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-tx">
              Enviar feedback
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-teia p-1 hover:bg-sur-2 transition-colors">
                <X size={20} className="text-tx-2" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="mb-4 text-sm text-tx-2">
            Nos ajude a melhorar o site. Envie suas sugestões, dúvidas ou feedback.
          </Dialog.Description>

          <div onClick={() => setAberto(false)}>
            <FormularioMensagem />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
