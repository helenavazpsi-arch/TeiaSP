"use client";

import { Check, Mail, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  BotaoAcao,
  Carregando,
  Selo,
  Vazio,
  filtrar,
} from "@/components/admin/comuns";
import { Confirmar } from "@/components/admin/confirmar";
import { excluirMensagem, marcarMensagemLida } from "@/lib/firebase/moderacao";
import type { Mensagem } from "@/lib/tipos";
import { cn } from "@/lib/utils";

export function SecaoMensagens({
  mensagens,
  carregando,
  busca,
}: {
  mensagens: Mensagem[];
  carregando: boolean;
  busca: string;
}) {
  const [excluindo, setExcluindo] = useState<Mensagem | null>(null);

  /** não lidas primeiro, que é o que a equipe precisa ver */
  const lista = filtrar(
    mensagens,
    busca,
    (m) => `${m.nome ?? ""} ${m.contato ?? ""} ${m.mensagem}`,
  )
    .slice()
    .sort((a, b) => Number(a.lida ?? false) - Number(b.lida ?? false));

  if (carregando) return <Carregando />;
  if (!lista.length) return <Vazio>Nenhuma mensagem.</Vazio>;

  return (
    <>
      <div className="space-y-2.5">
        {lista.map((mensagem) => (
          <article
            key={mensagem.id}
            className={cn(
              "rounded-teia-lg border p-4",
              mensagem.lida ? "border-black/10 bg-sur" : "border-alerta/25 bg-alerta-bg/40",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-tx">
                  {mensagem.nome || "Anônimo"}
                  {!mensagem.lida && (
                    <span className="ml-2">
                      <Selo tom="alerta">Nova</Selo>
                    </span>
                  )}
                </p>
                {mensagem.contato && (
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-tx-2">
                    <Mail size={11} />
                    {mensagem.contato}
                  </p>
                )}
              </div>
              {mensagem.data && (
                <span className="text-[11px] text-tx-3">{mensagem.data}</span>
              )}
            </div>

            <p className="mt-2 text-[13px] leading-relaxed whitespace-pre-wrap text-tx-2">
              {mensagem.mensagem}
            </p>

            <div className="mt-3 flex gap-2">
              {!mensagem.lida && (
                <BotaoAcao onClick={() => void marcarMensagemLida(mensagem.id)}>
                  <Check size={14} />
                  Marcar como lida
                </BotaoAcao>
              )}
              {mensagem.contato?.includes("@") && (
                <a
                  href={`mailto:${mensagem.contato}`}
                  className="inline-flex items-center gap-1.5 rounded-teia border border-black/10 px-2.5 py-1.5 text-xs font-medium text-tx transition-colors hover:bg-sur-2"
                >
                  <Mail size={14} />
                  Responder
                </a>
              )}
              <BotaoAcao tom="erro" onClick={() => setExcluindo(mensagem)}>
                <Trash2 size={14} />
                Excluir
              </BotaoAcao>
            </div>
          </article>
        ))}
      </div>

      <Confirmar
        aberto={excluindo !== null}
        aoFechar={() => setExcluindo(null)}
        titulo="Excluir esta mensagem?"
        descricao="A mensagem some de vez — mensagens não vão para a lixeira."
        rotuloConfirmar="Excluir"
        perigo
        aoConfirmar={async () => {
          if (excluindo) await excluirMensagem(excluindo.id);
        }}
      />
    </>
  );
}
