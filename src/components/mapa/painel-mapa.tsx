"use client";

import { MapPin, Plus, Search, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { AREAS } from "@/lib/areas";
import { normalizar } from "@/lib/busca";
import type { Marcador } from "@/lib/dados/mapa";

/** Leaflet mexe em `window` na importação: só carrega no navegador. */
const MapaView = dynamic(
  () => import("@/components/mapa/mapa-view").then((m) => m.MapaView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-sur-2">
        <p className="text-sm text-tx-3">Carregando o mapa…</p>
      </div>
    ),
  },
);

export function PainelMapa({
  marcadores,
  zonas,
}: {
  marcadores: Marcador[];
  zonas: string[];
}) {
  const parametros = useSearchParams();

  /**
   * "Ver as unidades no mapa", na página do dispositivo, chega como ?busca=
   * — o filtro já nasce preenchido, sem efeito depois da montagem.
   */
  const [busca, setBusca] = useState(() => parametros.get("busca") ?? "");
  const [areaSelecionada, setAreaSelecionada] = useState("");
  const [zona, setZona] = useState("");

  const buscaAdiada = useDeferredValue(busca);

  const filtrados = useMemo(() => {
    const termos = normalizar(buscaAdiada)
      .split(" ")
      .filter((palavra) => palavra.length > 2);

    return marcadores.filter((m) => {
      if (areaSelecionada && m.area !== areaSelecionada) return false;
      /**
       * A zona sai da coordenada, nunca do texto do endereço. Foi assim que o
       * site atual resolveu o caso "Rua Sant'Ana" (Zona Sul) casando com o
       * bairro Santana (Zona Norte).
       */
      if (zona && m.zona !== zona) return false;
      if (termos.length) {
        const alvo = normalizar(`${m.sigla} ${m.nome} ${m.endereco}`);
        if (!termos.every((termo) => alvo.includes(termo))) return false;
      }
      return true;
    });
  }, [marcadores, buscaAdiada, areaSelecionada, zona]);

  const temFiltro = Boolean(busca || areaSelecionada || zona);

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tx-3"
            aria-hidden
          />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por bairro, rua ou nome da unidade..."
            aria-label="Buscar no mapa"
            className="w-full rounded-teia border border-black/10 bg-sur py-2 pr-3 pl-9 text-sm placeholder:text-tx-3 focus:border-marca-400 focus:outline-none"
          />
        </div>

        <select
          value={areaSelecionada}
          onChange={(e) => setAreaSelecionada(e.target.value)}
          aria-label="Filtrar por área"
          className="rounded-teia border border-black/10 bg-sur px-3 py-2 text-sm text-tx-2 focus:border-marca-400 focus:outline-none"
        >
          <option value="">Todas as áreas</option>
          {AREAS.map(({ chave }) => (
            <option key={chave} value={chave}>
              {chave}
            </option>
          ))}
        </select>

        <select
          value={zona}
          onChange={(e) => setZona(e.target.value)}
          aria-label="Filtrar por zona"
          className="rounded-teia border border-black/10 bg-sur px-3 py-2 text-sm text-tx-2 focus:border-marca-400 focus:outline-none"
        >
          <option value="">Todas as zonas</option>
          {zonas.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>

        <Link
          href="/sugerir?tipo=ponto"
          className="inline-flex items-center gap-1.5 rounded-teia bg-marca-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-marca-800"
        >
          <Plus size={16} />
          Adicionar ponto
        </Link>
      </div>

      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs text-tx-2" aria-live="polite">
          <MapPin size={13} className="text-tx-3" />
          <strong className="text-tx">{filtrados.length.toLocaleString("pt-BR")}</strong>
          {filtrados.length === 1 ? " unidade" : " unidades"}
          {temFiltro && ` de ${marcadores.length.toLocaleString("pt-BR")}`}
        </p>

        {temFiltro && (
          <button
            type="button"
            onClick={() => {
              setBusca("");
              setAreaSelecionada("");
              setZona("");
            }}
            className="inline-flex items-center gap-1 rounded-teia px-2 py-1 text-xs font-medium text-marca-700 transition-colors hover:bg-marca-50"
          >
            <X size={13} />
            Limpar filtros
          </button>
        )}
      </div>

      <div className="h-[68vh] min-h-[420px] overflow-hidden rounded-teia-lg border border-black/10">
        <MapaView marcadores={filtrados} />
      </div>
    </>
  );
}
