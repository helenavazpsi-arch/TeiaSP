"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ModalContext } from "@/components/guia/modal-context";

/**
 * Casca do dispositivo quando ele é aberto a partir da listagem: o conteúdo
 * vem por cima, sem perder a rolagem nem os filtros de quem estava buscando.
 * Fechar volta para a lista; recarregar a página cai na versão de página
 * inteira, com a mesma URL.
 */
export function ModalDispositivo({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(true);

  const fecharModal = () => {
    setAberto(false);
    router.back();
  };

  return (
    <ModalContext.Provider value={{ fecharModal }}>
      <Dialog.Root open={aberto} onOpenChange={(novoEstado) => {
        setAberto(novoEstado);
        if (!novoEstado) router.back();
      }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[10000] bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 z-[10001] max-h-[88vh] w-[min(42rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-teia-lg bg-sur shadow-2xl"
        >
          {/* o <h1> do conteúdo serve de título acessível do diálogo */}
          <Dialog.Title className="sr-only">Detalhes do dispositivo</Dialog.Title>

          <Dialog.Close
            aria-label="Fechar"
            className="absolute top-4 right-4 z-10 rounded-full bg-sur/90 p-1.5 text-tx-3 shadow-sm transition-colors hover:bg-sur-2 hover:text-tx"
          >
            <X size={18} />
          </Dialog.Close>

          {children}
        </Dialog.Content>
      </Dialog.Portal>
      </Dialog.Root>
    </ModalContext.Provider>
  );
}
