"use client";

import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  BotaoAcao,
  Caixa,
  Carregando,
  Linha,
  Selo,
  Vazio,
  filtrar,
  porNome,
} from "@/components/admin/comuns";
import { Confirmar } from "@/components/admin/confirmar";
import { DialogoPonto } from "@/components/admin/dialogo-ponto";
import { BadgeArea } from "@/components/ui/badge-area";
import { moverParaLixeira, salvarPonto } from "@/lib/firebase/moderacao";
import type { Ponto } from "@/lib/tipos";

export function SecaoPontos({
  pontos,
  carregando,
  busca,
}: {
  pontos: Ponto[];
  carregando: boolean;
  busca: string;
}) {
  const [editando, setEditando] = useState<Ponto | null>(null);
  const [excluindo, setExcluindo] = useState<Ponto | null>(null);
  const [limite, setLimite] = useState(200);

  const lista = filtrar(
    pontos,
    busca,
    (p) => `${p.sigla ?? ""} ${p.nome ?? ""} ${p.endereco ?? ""}`,
  )
    .slice()
    .sort(porNome);

  if (carregando) return <Carregando />;
  if (!lista.length) return <Vazio>Nenhum ponto encontrado.</Vazio>;

  const visiveis = lista.slice(0, limite);

  return (
    <>
      <p className="mb-2 text-xs text-tx-3">
        {lista.length.toLocaleString("pt-BR")} pontos
        {lista.length > visiveis.length && ` — mostrando os ${visiveis.length} primeiros`}
      </p>

      <Caixa>
        {visiveis.map((ponto) => (
          <Linha key={ponto.id}>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <BadgeArea chave={ponto.area} comIcone={false} />
              <span className="text-[13px] font-semibold text-tx">{ponto.sigla}</span>
              <span className="truncate text-[12px] text-tx-2">{ponto.endereco}</span>
              {ponto.coordConferida && (
                <Selo tom="ok">
                  <CheckCircle2 size={11} />
                  Coordenada conferida
                </Selo>
              )}
            </div>

            <div className="flex shrink-0 gap-1.5">
              <BotaoAcao onClick={() => setEditando(ponto)} titulo="Editar">
                <Pencil size={14} />
              </BotaoAcao>
              <BotaoAcao tom="erro" onClick={() => setExcluindo(ponto)} titulo="Excluir">
                <Trash2 size={14} />
              </BotaoAcao>
            </div>
          </Linha>
        ))}
      </Caixa>

      {lista.length > visiveis.length && (
        <button
          type="button"
          onClick={() => setLimite((atual) => atual + 200)}
          className="mt-3 w-full rounded-teia border border-black/10 bg-sur py-2 text-sm font-medium text-tx transition-colors hover:bg-sur-2"
        >
          Mostrar mais 200
        </button>
      )}

      {editando && (
        <DialogoPonto
          ponto={editando}
          aoFechar={() => setEditando(null)}
          aoSalvar={(campos) => salvarPonto(editando.id, campos)}
        />
      )}

      <Confirmar
        aberto={excluindo !== null}
        aoFechar={() => setExcluindo(null)}
        titulo="Mover este ponto para a lixeira?"
        descricao={`"${excluindo?.sigla}" — ${excluindo?.endereco} sai do mapa, mas fica guardado na lixeira e pode ser restaurado.`}
        rotuloConfirmar="Mover para a lixeira"
        perigo
        aoConfirmar={async () => {
          if (excluindo) await moverParaLixeira("pontos", { ...excluindo });
        }}
      />
    </>
  );
}
