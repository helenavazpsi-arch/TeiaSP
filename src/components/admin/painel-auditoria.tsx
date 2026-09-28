"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Layers,
  Loader2,
  MapPinOff,
  RefreshCw,
  Save,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { recalcularCoordenada } from "@/acoes/auditoria";
import { BotaoAcao, Selo } from "@/components/admin/comuns";
import { BadgeArea } from "@/components/ui/badge-area";
import { salvarPonto } from "@/lib/firebase/moderacao";
import type { Auditoria, PontoSuspeito, Suspeita } from "@/lib/dados/auditoria";
import { cn } from "@/lib/utils";

const GRUPOS: Array<{
  id: Suspeita;
  rotulo: string;
  icone: typeof MapPinOff;
  explicacao: string;
}> = [
  {
    id: "fora",
    rotulo: "Fora da cidade",
    icone: MapPinOff,
    explicacao:
      "A coordenada cai fora dos limites do município. Costuma ser endereço lido como sendo de outra cidade da região.",
  },
  {
    id: "pilha",
    rotulo: "Empilhadas",
    icone: Layers,
    explicacao:
      "Cinco ou mais unidades no mesmo ponto exato — sinal de que o endereço não foi localizado e todas caíram no centro do bairro.",
  },
  {
    id: "divergente",
    rotulo: "Bairro divergente",
    icone: TriangleAlert,
    explicacao:
      "O distrito citado no endereço é diferente do distrito onde o pino caiu.",
  },
  {
    id: "sem",
    rotulo: "Sem coordenada",
    icone: MapPinOff,
    explicacao: "O ponto não tem posição gravada e não aparece no mapa.",
  },
];

type EstadoLinha = {
  situacao: "parado" | "consultando" | "achou" | "falhou" | "salvo";
  lat?: number;
  lng?: number;
  bairro?: string;
  distrito?: string | null;
  mensagem?: string;
};

export function PainelAuditoria({ auditoria }: { auditoria: Auditoria }) {
  const [grupo, setGrupo] = useState<Suspeita>("fora");
  const [estados, setEstados] = useState<Record<string, EstadoLinha>>({});
  const [rodandoLote, setRodandoLote] = useState(false);

  const daVez = auditoria.suspeitos.filter((p) => p.grupo === grupo);

  function atualizar(id: string, estado: EstadoLinha) {
    setEstados((atual) => ({ ...atual, [id]: estado }));
  }

  async function consultar(ponto: PontoSuspeito) {
    atualizar(ponto.id, { situacao: "consultando" });
    const resposta = await recalcularCoordenada(ponto.endereco);

    atualizar(
      ponto.id,
      resposta.ok
        ? {
            situacao: "achou",
            lat: resposta.lat,
            lng: resposta.lng,
            bairro: resposta.bairro,
            distrito: resposta.distrito,
          }
        : { situacao: "falhou", mensagem: resposta.mensagem },
    );
  }

  /** Consulta o grupo inteiro, um de cada vez — a fila é do servidor. */
  async function consultarLote() {
    setRodandoLote(true);
    try {
      for (const ponto of daVez) {
        if (estados[ponto.id]?.situacao === "salvo") continue;
        await consultar(ponto);
      }
    } finally {
      setRodandoLote(false);
    }
  }

  async function gravar(ponto: PontoSuspeito) {
    const estado = estados[ponto.id];
    if (estado?.situacao !== "achou" || estado.lat == null || estado.lng == null) return;

    atualizar(ponto.id, { ...estado, situacao: "consultando" });
    await salvarPonto(ponto.id, {
      lat: estado.lat,
      lng: estado.lng,
      coordConferida: true,
    });
    atualizar(ponto.id, { ...estado, situacao: "salvo" });
  }

  async function marcarConferido(ponto: PontoSuspeito) {
    await salvarPonto(ponto.id, { coordConferida: true });
    atualizar(ponto.id, { situacao: "salvo" });
  }

  const explicacao = GRUPOS.find((g) => g.id === grupo)?.explicacao;

  return (
    <main className="px-4 py-5">
      <Link
        href="/admin"
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-marca-700 hover:text-marca-900"
      >
        <ArrowLeft size={16} />
        Voltar ao painel
      </Link>

      <h1 className="font-display text-lg font-bold text-tx">Auditoria de coordenadas</h1>
      <p className="mt-1 text-sm text-tx-2">
        {auditoria.suspeitos.length} de {auditoria.total.toLocaleString("pt-BR")} pontos
        merecem conferência.
      </p>

      <div className="sem-barra -mx-4 mt-4 mb-3 flex gap-1.5 overflow-x-auto px-4">
        {GRUPOS.map(({ id, rotulo, icone: Icone }) => (
          <button
            key={id}
            type="button"
            onClick={() => setGrupo(id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-teia border px-3 py-2 text-sm font-medium transition-colors",
              grupo === id
                ? "border-marca-600 bg-marca-50 text-marca-800"
                : "border-black/10 bg-sur text-tx-2 hover:bg-sur-2",
            )}
          >
            <Icone size={15} />
            {rotulo}
            <span className="rounded-full bg-black/8 px-1.5 py-0.5 text-[10px] font-bold">
              {auditoria.contagem[id]}
            </span>
          </button>
        ))}
      </div>

      {explicacao && (
        <p className="mb-3 rounded-teia bg-info-bg px-3 py-2 text-[12px] text-info">
          {explicacao}
        </p>
      )}

      {daVez.length > 0 && grupo !== "sem" && (
        <button
          type="button"
          onClick={() => void consultarLote()}
          disabled={rodandoLote}
          className="mb-3 inline-flex items-center gap-2 rounded-teia bg-marca-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-marca-800 disabled:opacity-70"
        >
          {rodandoLote ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <RefreshCw size={15} />
          )}
          Recalcular os {daVez.length} endereços
        </button>
      )}

      {rodandoLote && (
        <p className="mb-3 text-[12px] text-tx-3">
          Uma consulta por segundo, como pede o serviço de mapas — {daVez.length} endereços
          levam cerca de {Math.ceil((daVez.length * 1.1) / 60)} min.
        </p>
      )}

      {daVez.length === 0 ? (
        <p className="rounded-teia-lg border border-dashed border-black/12 px-4 py-10 text-center text-sm text-tx-3">
          Nenhum ponto neste grupo.
        </p>
      ) : (
        <div className="space-y-2">
          {daVez.map((ponto) => {
            const estado = estados[ponto.id] ?? { situacao: "parado" as const };

            return (
              <article
                key={ponto.id}
                className="rounded-teia-lg border border-black/10 bg-sur p-3.5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <BadgeArea chave={ponto.area} comIcone={false} />
                  <span className="text-[13px] font-semibold text-tx">{ponto.sigla}</span>
                  {ponto.coordConferida && (
                    <Selo tom="ok">
                      <CheckCircle2 size={11} />
                      Já conferido
                    </Selo>
                  )}
                  {ponto.repetidos && <Selo tom="alerta">{ponto.repetidos} no mesmo ponto</Selo>}
                </div>

                <p className="mt-1.5 text-[12px] text-tx-2">{ponto.endereco || "—"}</p>

                <dl className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-tx-3">
                  {ponto.lat != null && (
                    <div>
                      <dt className="inline">Atual: </dt>
                      <dd className="inline">
                        {ponto.lat.toFixed(5)}, {ponto.lng?.toFixed(5)}
                      </dd>
                    </div>
                  )}
                  {ponto.distritoDaCoordenada && (
                    <div>
                      <dt className="inline">Pino em: </dt>
                      <dd className="inline">{ponto.distritoDaCoordenada}</dd>
                    </div>
                  )}
                  {ponto.distritosDoEndereco.length > 0 && (
                    <div>
                      <dt className="inline">Endereço diz: </dt>
                      <dd className="inline">{ponto.distritosDoEndereco.join(", ")}</dd>
                    </div>
                  )}
                </dl>

                {estado.situacao === "achou" && (
                  <p className="mt-2 rounded-teia bg-ok-bg px-2.5 py-1.5 text-[12px] text-ok">
                    Nova posição: {estado.lat?.toFixed(5)}, {estado.lng?.toFixed(5)}
                    {estado.distrito && ` — ${estado.distrito}`}
                    {estado.bairro && ` (${estado.bairro})`}
                  </p>
                )}
                {estado.situacao === "falhou" && (
                  <p className="mt-2 rounded-teia bg-erro-bg px-2.5 py-1.5 text-[12px] text-erro">
                    {estado.mensagem}
                  </p>
                )}
                {estado.situacao === "salvo" && (
                  <p className="mt-2 rounded-teia bg-ok-bg px-2.5 py-1.5 text-[12px] text-ok">
                    Coordenada gravada e marcada como conferida.
                  </p>
                )}

                <div className="mt-2.5 flex flex-wrap gap-2">
                  {ponto.endereco && estado.situacao !== "salvo" && (
                    <BotaoAcao onClick={() => void consultar(ponto)}>
                      {estado.situacao === "consultando" ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RefreshCw size={14} />
                      )}
                      Recalcular
                    </BotaoAcao>
                  )}

                  {estado.situacao === "achou" && (
                    <BotaoAcao tom="ok" onClick={() => void gravar(ponto)}>
                      <Save size={14} />
                      Gravar nova posição
                    </BotaoAcao>
                  )}

                  {!ponto.coordConferida && estado.situacao !== "salvo" && (
                    <BotaoAcao onClick={() => void marcarConferido(ponto)}>
                      <CheckCircle2 size={14} />
                      Está certo, marcar como conferido
                    </BotaoAcao>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
