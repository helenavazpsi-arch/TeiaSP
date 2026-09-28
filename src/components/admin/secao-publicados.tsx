"use client";

import { AlertTriangle, Copy, ExternalLink, MapPin, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
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
import { DialogoDispositivo } from "@/components/admin/dialogo-dispositivo";
import { BadgeArea } from "@/components/ui/badge-area";
import { normalizar } from "@/lib/busca";
import { converterEmPonto, moverParaLixeira, salvarServico } from "@/lib/firebase/moderacao";
import { paraSlug } from "@/lib/slug";
import { semHTML } from "@/lib/texto";
import type { Servico } from "@/lib/tipos";

export function SecaoPublicados({
  servicos,
  carregando,
  busca,
}: {
  servicos: Servico[];
  carregando: boolean;
  busca: string;
}) {
  const [editando, setEditando] = useState<Servico | null>(null);
  const [excluindo, setExcluindo] = useState<Servico | null>(null);
  const [convertendo, setConvertendo] = useState<Servico | null>(null);

  /** siglas repetidas: o mesmo aviso que o painel atual mostra */
  const repetidas = useMemo(() => {
    const contagem = new Map<string, number>();
    for (const s of servicos) {
      const chave = normalizar(s.sigla);
      if (chave) contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
    }
    return new Set([...contagem].filter(([, n]) => n > 1).map(([chave]) => chave));
  }, [servicos]);

  const lista = filtrar(
    servicos,
    busca,
    (s) => `${s.sigla ?? ""} ${s.nome ?? ""} ${semHTML(s.desc)}`,
  )
    .slice()
    .sort(porNome);

  if (carregando) return <Carregando />;
  if (!lista.length) return <Vazio>Nenhum dispositivo encontrado.</Vazio>;

  return (
    <>
      {repetidas.size > 0 && (
        <p className="mb-3 flex items-center gap-2 rounded-teia bg-alerta-bg px-3 py-2 text-[12px] text-alerta">
          <AlertTriangle size={14} className="shrink-0" />
          {repetidas.size} {repetidas.size === 1 ? "sigla aparece" : "siglas aparecem"} em mais
          de um dispositivo. Vale conferir se são serviços diferentes mesmo.
        </p>
      )}

      <p className="mb-2 text-xs text-tx-3">{lista.length} dispositivos</p>

      <Caixa>
        {lista.map((servico) => {
          const temCoordenada = Number.isFinite(servico.lat) && Number.isFinite(servico.lng);

          return (
            <Linha key={servico.id}>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <BadgeArea chave={servico.area} comIcone={false} />
                <span className="text-[13px] font-semibold text-tx">{servico.sigla}</span>
                <span className="truncate text-[12px] text-tx-2">{servico.nome}</span>

                {repetidas.has(normalizar(servico.sigla)) && (
                  <Selo tom="alerta">
                    <Copy size={11} />
                    Sigla repetida
                  </Selo>
                )}
                {temCoordenada && (
                  <Selo tom="erro">
                    <MapPin size={11} />
                    Cadastrado como endereço
                  </Selo>
                )}
              </div>

              <div className="flex shrink-0 gap-1.5">
                <Link
                  href={`/dispositivo/${paraSlug(servico.sigla) || servico.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 rounded-teia border border-black/10 px-2.5 py-1.5 text-xs font-medium text-tx transition-colors hover:bg-sur-2"
                  title="Ver no site"
                >
                  <ExternalLink size={14} />
                </Link>

                {temCoordenada && (
                  <BotaoAcao
                    onClick={() => setConvertendo(servico)}
                    titulo="Mover para os pontos do mapa"
                  >
                    <MapPin size={14} />
                  </BotaoAcao>
                )}

                <BotaoAcao onClick={() => setEditando(servico)} titulo="Editar">
                  <Pencil size={14} />
                </BotaoAcao>

                <BotaoAcao tom="erro" onClick={() => setExcluindo(servico)} titulo="Excluir">
                  <Trash2 size={14} />
                </BotaoAcao>
              </div>
            </Linha>
          );
        })}
      </Caixa>

      {editando && (
        <DialogoDispositivo
          servico={editando}
          titulo="Editar dispositivo publicado"
          rotuloSalvar="Salvar alterações"
          aoFechar={() => setEditando(null)}
          aoSalvar={(campos) => salvarServico(editando.id, campos)}
        />
      )}

      <Confirmar
        aberto={excluindo !== null}
        aoFechar={() => setExcluindo(null)}
        titulo="Mover para a lixeira?"
        descricao={`"${excluindo?.nome || excluindo?.sigla}" sai do site imediatamente, mas fica guardado na lixeira e pode ser restaurado depois.`}
        rotuloConfirmar="Mover para a lixeira"
        perigo
        aoConfirmar={async () => {
          if (excluindo) await moverParaLixeira("servicos", { ...excluindo });
        }}
      />

      <Confirmar
        aberto={convertendo !== null}
        aoFechar={() => setConvertendo(null)}
        titulo="Transformar em ponto do mapa?"
        descricao={`"${convertendo?.sigla}" deixa a lista de dispositivos e passa a existir apenas como unidade no mapa. A descrição não é preservada.`}
        rotuloConfirmar="Transformar em ponto"
        aoConfirmar={async () => {
          if (convertendo) await converterEmPonto(convertendo);
        }}
      />
    </>
  );
}
