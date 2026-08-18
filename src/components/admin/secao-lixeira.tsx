"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  BotaoAcao,
  Caixa,
  Carregando,
  Linha,
  Selo,
  Vazio,
  filtrar,
} from "@/components/admin/comuns";
import { Confirmar } from "@/components/admin/confirmar";
import { BadgeArea } from "@/components/ui/badge-area";
import { excluirDaLixeira, restaurarDaLixeira } from "@/lib/firebase/moderacao";
import type { ItemLixeira } from "@/lib/tipos";

export function SecaoLixeira({
  itens,
  carregando,
  busca,
}: {
  itens: ItemLixeira[];
  carregando: boolean;
  busca: string;
}) {
  const [apagando, setApagando] = useState<ItemLixeira | null>(null);

  const lista = filtrar(
    itens,
    busca,
    (i) => `${i.sigla ?? ""} ${i.nome ?? ""} ${i.endereco ?? ""}`,
  );

  if (carregando) return <Carregando />;
  if (!lista.length) return <Vazio>A lixeira está vazia.</Vazio>;

  return (
    <>
      <p className="mb-2 text-xs text-tx-3">
        {lista.length} {lista.length === 1 ? "item guardado" : "itens guardados"} — restaure
        ou apague de vez.
      </p>

      <Caixa>
        {lista.map((item) => (
          <Linha key={item.id}>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Selo>{item._origColecao === "pontos" ? "Ponto do mapa" : "Dispositivo"}</Selo>
              <BadgeArea chave={item.area} comIcone={false} />
              <span className="text-[13px] font-semibold text-tx">{item.sigla}</span>
              <span className="truncate text-[12px] text-tx-2">{item.nome}</span>
              {item._excluidoEm && (
                <span className="text-[11px] text-tx-3">excluído em {item._excluidoEm}</span>
              )}
            </div>

            <div className="flex shrink-0 gap-1.5">
              <BotaoAcao tom="ok" onClick={() => void restaurarDaLixeira(item)}>
                <RotateCcw size={14} />
                Restaurar
              </BotaoAcao>
              <BotaoAcao tom="erro" onClick={() => setApagando(item)} titulo="Apagar de vez">
                <Trash2 size={14} />
              </BotaoAcao>
            </div>
          </Linha>
        ))}
      </Caixa>

      <Confirmar
        aberto={apagando !== null}
        aoFechar={() => setApagando(null)}
        titulo="Apagar definitivamente?"
        descricao={`"${apagando?.nome || apagando?.sigla}" será removido para sempre. Esta é a única ação do painel que não tem volta.`}
        rotuloConfirmar="Apagar de vez"
        perigo
        aoConfirmar={async () => {
          if (apagando) await excluirDaLixeira(apagando.id);
        }}
      />
    </>
  );
}
