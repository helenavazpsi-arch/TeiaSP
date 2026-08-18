"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { HelpCircle, Info, Lock, MapPin, Menu, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SECOES } from "@/data/conteudo";
import { cn } from "@/lib/utils";

const ICONES = { busca: Search, mapa: MapPin, sugerir: Plus, admin: Lock } as const;

/**
 * Menu lateral do canto do cabeçalho.
 *
 * O caminho atual é lido na hora de abrir, não por `usePathname`: o menu só
 * existe depois de um clique, e assim o cabeçalho continua sendo HTML
 * estático puro — com Cache Components, um hook de rota aqui obrigaria a
 * página inteira a esperar pelo cliente.
 */
export function MenuLateral() {
  const [aberto, setAberto] = useState(false);
  const [caminho, setCaminho] = useState<string | null>(null);

  function aoAbrir(valor: boolean) {
    if (valor) setCaminho(window.location.pathname);
    setAberto(valor);
  }

  return (
    <Dialog.Root open={aberto} onOpenChange={aoAbrir}>
      <Dialog.Trigger
        aria-label="Abrir menu"
        className="shrink-0 rounded-teia border border-black/10 bg-sur/80 p-2.5 text-tx-2 transition-colors hover:bg-sur hover:text-tx"
      >
        <Menu size={22} />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed top-0 right-0 z-50 flex h-full w-[min(20rem,85vw)] flex-col bg-sur shadow-2xl">
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
            <Dialog.Title className="font-display text-base font-bold">Menu</Dialog.Title>
            <Dialog.Close
              aria-label="Fechar menu"
              className="rounded-full p-1.5 text-tx-3 transition-colors hover:bg-sur-2 hover:text-tx"
            >
              <X size={18} />
            </Dialog.Close>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            <Link
              href="/#sobre"
              onClick={() => setAberto(false)}
              className="flex items-start gap-3 rounded-teia px-3 py-3 text-left transition-colors hover:bg-sur-2"
            >
              <Info size={20} className="mt-0.5 shrink-0 text-marca-600" />
              <span className="min-w-0">
                <span className="block text-sm font-medium">Sobre o projeto</span>
                <span className="block text-xs text-tx-3">
                  A Teia Invisível que Possibilita o Cuidado
                </span>
              </span>
            </Link>

            {SECOES.map((secao) => {
              const Icone = ICONES[secao.icone];
              const ativo = caminho
                ? secao.href === "/"
                  ? caminho === "/"
                  : caminho.startsWith(secao.href)
                : false;

              return (
                <Link
                  key={secao.href}
                  href={secao.href}
                  onClick={() => setAberto(false)}
                  aria-current={ativo ? "page" : undefined}
                  className={cn(
                    "flex items-start gap-3 rounded-teia px-3 py-3 transition-colors hover:bg-sur-2",
                    ativo && "bg-marca-50",
                  )}
                >
                  <Icone
                    size={20}
                    className={cn("mt-0.5 shrink-0", ativo ? "text-marca-700" : "text-marca-600")}
                  />
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block text-sm font-medium",
                        ativo && "text-marca-800",
                      )}
                    >
                      {secao.rotulo}
                    </span>
                    <span className="block text-xs text-tx-3">{secao.descricao}</span>
                  </span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setAberto(false);
                window.dispatchEvent(new CustomEvent("teiasp:tour"));
              }}
              className="flex w-full items-start gap-3 rounded-teia px-3 py-3 text-left transition-colors hover:bg-sur-2"
            >
              <HelpCircle size={20} className="mt-0.5 shrink-0 text-marca-600" />
              <span className="min-w-0">
                <span className="block text-sm font-medium">Como usar o site</span>
                <span className="block text-xs text-tx-3">Rever o tour de boas-vindas</span>
              </span>
            </button>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
