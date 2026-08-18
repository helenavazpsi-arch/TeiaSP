"use client";

import { Check, Copy, MapPin, Pencil, UserCheck, X } from "lucide-react";
import { useState } from "react";
import { BotaoAcao, Carregando, Selo, Vazio, filtrar } from "@/components/admin/comuns";
import { Confirmar } from "@/components/admin/confirmar";
import { DialogoDispositivo } from "@/components/admin/dialogo-dispositivo";
import { BadgeArea } from "@/components/ui/badge-area";
import { normalizar } from "@/lib/busca";
import { aprovar, aprovarComEdicao, rejeitar } from "@/lib/firebase/moderacao";
import { useColecao } from "@/lib/firebase/tempo-real";
import type { Pendente, Servico } from "@/lib/tipos";
import { semHTML } from "@/lib/texto";

export function SecaoPendentes({
  pendentes,
  carregando,
  busca,
}: {
  pendentes: Pendente[];
  carregando: boolean;
  busca: string;
}) {
  /** só para avisar de sigla repetida — a lista já publicada */
  const { itens: publicados } = useColecao<Servico>("servicos");
  const siglasPublicadas = new Set(publicados.map((s) => normalizar(s.sigla)).filter(Boolean));

  const [editando, setEditando] = useState<Pendente | null>(null);
  const [rejeitando, setRejeitando] = useState<Pendente | null>(null);

  const lista = filtrar(
    pendentes,
    busca,
    (p) => `${p.sigla ?? ""} ${p.nome ?? ""} ${semHTML((p as Servico).desc)}`,
  );

  if (carregando) return <Carregando />;
  if (!lista.length) {
    return (
      <Vazio>
        {pendentes.length
          ? "Nenhuma sugestão corresponde ao filtro."
          : "Nenhuma sugestão pendente. A fila está limpa."}
      </Vazio>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {lista.map((pendente) => {
          const ehPonto = pendente.tipo === "ponto";
          const servico = pendente as Servico;
          const repetida = !ehPonto && siglasPublicadas.has(normalizar(pendente.sigla));

          return (
            <article
              key={pendente.id}
              className="rounded-teia-lg border border-black/10 bg-sur p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display text-[15px] font-bold text-tx">
                    {pendente.nome || pendente.sigla}
                  </h3>
                  {pendente.nome && pendente.sigla && (
                    <p className="text-xs text-tx-2">{pendente.sigla}</p>
                  )}
                </div>
                {pendente.data && (
                  <span className="text-[11px] text-tx-3">{pendente.data}</span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {ehPonto ? (
                  <Selo tom="info">
                    <MapPin size={11} />
                    Ponto no mapa
                  </Selo>
                ) : (
                  <Selo tom="alerta">Sugestão de dispositivo</Selo>
                )}
                <BadgeArea chave={pendente.area} />
                {repetida && (
                  <Selo tom="alerta">
                    <Copy size={11} />
                    Já existe um dispositivo com essa sigla
                  </Selo>
                )}
                {pendente.enviadoPorAdmin && (
                  <Selo tom="ok">
                    <UserCheck size={11} />
                    Enviado pela equipe ({pendente.enviadoPorEmail})
                  </Selo>
                )}
              </div>

              {!ehPonto && servico.desc && (
                <p className="mt-2.5 line-clamp-4 text-[13px] leading-relaxed text-tx-2">
                  {semHTML(servico.desc)}
                </p>
              )}

              <dl className="mt-2.5 space-y-0.5 text-[12px] text-tx-2">
                {servico.publico && (
                  <div>
                    <dt className="inline font-medium">Público: </dt>
                    <dd className="inline">{servico.publico}</dd>
                  </div>
                )}
                {pendente.endereco && (
                  <div>
                    <dt className="inline font-medium">Endereço: </dt>
                    <dd className="inline">{pendente.endereco}</dd>
                  </div>
                )}
                {pendente.telefone && (
                  <div>
                    <dt className="inline font-medium">Telefone: </dt>
                    <dd className="inline">{pendente.telefone}</dd>
                  </div>
                )}
                {ehPonto && pendente.lat && (
                  <div className="text-tx-3">
                    <dt className="inline">Coordenada: </dt>
                    <dd className="inline">
                      {pendente.lat.toFixed(5)}, {pendente.lng?.toFixed(5)}
                    </dd>
                  </div>
                )}
                {servico.autor && (
                  <div className="text-tx-3">
                    <dt className="inline">Enviado por: </dt>
                    <dd className="inline">{servico.autor}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-3.5 flex flex-wrap gap-2">
                <BotaoAcao tom="ok" onClick={() => void aprovar(pendente)}>
                  <Check size={14} />
                  Aprovar
                </BotaoAcao>

                {!ehPonto && (
                  <BotaoAcao onClick={() => setEditando(pendente)}>
                    <Pencil size={14} />
                    Editar e aprovar
                  </BotaoAcao>
                )}

                <BotaoAcao tom="erro" onClick={() => setRejeitando(pendente)}>
                  <X size={14} />
                  Rejeitar
                </BotaoAcao>
              </div>
            </article>
          );
        })}
      </div>

      {editando && (
        <DialogoDispositivo
          servico={editando as Servico}
          titulo="Revisar e aprovar sugestão"
          rotuloSalvar="Aprovar e publicar"
          aoFechar={() => setEditando(null)}
          aoSalvar={async (campos) => {
            await aprovarComEdicao(editando.id, {
              ...campos,
              data: editando.data ?? "",
              autor: (editando as Servico).autor ?? "",
            });
          }}
        />
      )}

      <Confirmar
        aberto={rejeitando !== null}
        aoFechar={() => setRejeitando(null)}
        titulo="Rejeitar esta sugestão?"
        descricao={`"${rejeitando?.nome || rejeitando?.sigla}" será descartada. Diferente da exclusão de um item publicado, isto não passa pela lixeira e não dá para desfazer.`}
        rotuloConfirmar="Rejeitar"
        perigo
        aoConfirmar={async () => {
          if (rejeitando) await rejeitar(rejeitando.id);
        }}
      />
    </>
  );
}
