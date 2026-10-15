"use client";

import { MapPin, Plus, Search, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { AREAS } from "@/lib/areas";
import { casaTexto, normalizar } from "@/lib/busca";
import type { Marcador } from "@/lib/dados/mapa";
import { distritoDoPonto, distritosNoTexto, DISTRITOS } from "@/lib/geo/poligonos";

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

type TipoBusca = "nome" | "bairro" | "rua";
type BoundsZoom = { latMin: number; latMax: number; lngMin: number; lngMax: number } | null;

function obterBoundsDistrito(nomesDistritos: string[]): BoundsZoom {
  if (nomesDistritos.length === 0) return null;

  let latMin = Infinity, latMax = -Infinity, lngMin = Infinity, lngMax = -Infinity;

  for (const nome of nomesDistritos) {
    const aneis = DISTRITOS[nome as keyof typeof DISTRITOS];
    if (!aneis) continue;

    for (const anel of aneis) {
      for (const [lng, lat] of anel) {
        latMin = Math.min(latMin, lat);
        latMax = Math.max(latMax, lat);
        lngMin = Math.min(lngMin, lng);
        lngMax = Math.max(lngMax, lng);
      }
    }
  }

  return latMin === Infinity ? null : { latMin, latMax, lngMin, lngMax };
}

export function PainelMapa({
  marcadores,
  zonas,
}: {
  marcadores: Marcador[];
  zonas: string[];
}) {
  const parametros = useSearchParams();
  const pathname = usePathname();
  const pathnameAnterior = useRef("/mapa");

  /**
   * "Ver as unidades no mapa", na página do dispositivo, chega como ?busca=
   * — o filtro já nasce preenchido, sem efeito depois da montagem.
   */
  const [busca, setBusca] = useState(() => parametros.get("busca") ?? "");
  const [areaSelecionada, setAreaSelecionada] = useState("");
  const [zona, setZona] = useState("");
  const [tipoBusca, setTipoBusca] = useState<TipoBusca>("nome");

  // atualiza busca quando o query param muda
  useEffect(() => {
    setBusca(parametros.get("busca") ?? "");
  }, [parametros]);

  // limpa filtros quando sai da aba do mapa
  useEffect(() => {
    if (pathnameAnterior.current === "/mapa" && pathname !== "/mapa") {
      setBusca("");
      setAreaSelecionada("");
      setZona("");
    }
    pathnameAnterior.current = pathname;
  }, [pathname]);

  const buscaAdiada = useDeferredValue(busca);
  const [boundsZoom, setBoundsZoom] = useState<BoundsZoom>(null);

  const filtrados = useMemo(() => {
    const termos = normalizar(buscaAdiada)
      .split(" ")
      .filter((palavra) => palavra.length > 2);

    // Por bairro e rua, não filtra — apenas retorna todos os marcadores
    if (tipoBusca === "bairro" || tipoBusca === "rua") {
      return marcadores.filter((m) => {
        if (areaSelecionada && m.area !== areaSelecionada) return false;
        if (zona && m.zona !== zona) return false;
        return true;
      });
    }

    // Por nome: filtra normalmente
    return marcadores.filter((m) => {
      if (areaSelecionada && m.area !== areaSelecionada) return false;
      if (zona && m.zona !== zona) return false;

      if (termos.length) {
        const alvo = normalizar(`${m.sigla} ${m.nome}`);
        if (!termos.every((termo) => casaTexto(alvo, termo))) return false;
      }
      return true;
    });
  }, [marcadores, buscaAdiada, areaSelecionada, zona, tipoBusca]);

  // Calcula o zoom bounds em um efeito separado
  useEffect(() => {
    const termos = normalizar(buscaAdiada)
      .split(" ")
      .filter((palavra) => palavra.length > 2);

    if (tipoBusca === "bairro" && termos.length > 0) {
      const distritos = distritosNoTexto(buscaAdiada);
      setBoundsZoom(obterBoundsDistrito(distritos));
    } else if (tipoBusca === "rua" && termos.length > 0) {
      const comEndereco = marcadores.filter((m) => {
        const alvo = normalizar(m.endereco);
        return termos.every((termo) => casaTexto(alvo, termo));
      });

      if (comEndereco.length > 0) {
        const bounds = comEndereco.reduce(
          (acc, m) => ({
            latMin: Math.min(acc.latMin, m.lat),
            latMax: Math.max(acc.latMax, m.lat),
            lngMin: Math.min(acc.lngMin, m.lng),
            lngMax: Math.max(acc.lngMax, m.lng),
          }),
          {
            latMin: comEndereco[0].lat,
            latMax: comEndereco[0].lat,
            lngMin: comEndereco[0].lng,
            lngMax: comEndereco[0].lng,
          },
        );
        setBoundsZoom(bounds);
      } else {
        setBoundsZoom(null);
      }
    } else {
      setBoundsZoom(null);
    }
  }, [buscaAdiada, tipoBusca, marcadores]);

  const temFiltro = Boolean(busca || areaSelecionada || zona);

  return (
    <>
      <div className="mb-4 rounded-teia-lg border-2 border-marca-400 bg-sur-2 p-4">
        <p className="mb-3 text-xs font-semibold text-tx-2 uppercase tracking-wide">
          O que você quer buscar?
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => setTipoBusca("nome")}
            className={`flex-1 sm:flex-initial rounded-teia px-3 py-2 text-sm font-medium transition-all ${
              tipoBusca === "nome"
                ? "bg-marca-600 text-white shadow-sm"
                : "border border-black/15 bg-sur text-tx-2 hover:border-marca-300 hover:text-tx"
            }`}
          >
            Nome/Sigla
          </button>
          <button
            onClick={() => setTipoBusca("bairro")}
            className={`flex-1 sm:flex-initial rounded-teia px-3 py-2 text-sm font-medium transition-all ${
              tipoBusca === "bairro"
                ? "bg-marca-600 text-white shadow-sm"
                : "border border-black/15 bg-sur text-tx-2 hover:border-marca-300 hover:text-tx"
            }`}
          >
            Bairro
          </button>
          <button
            onClick={() => setTipoBusca("rua")}
            className={`flex-1 sm:flex-initial rounded-teia px-3 py-2 text-sm font-medium transition-all ${
              tipoBusca === "rua"
                ? "bg-marca-600 text-white shadow-sm"
                : "border border-black/15 bg-sur text-tx-2 hover:border-marca-300 hover:text-tx"
            }`}
          >
            Rua/Endereço
          </button>
        </div>

        <div className="relative mt-4">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tx-3"
            aria-hidden
          />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={
              tipoBusca === "nome"
                ? "Digite o nome ou sigla..."
                : tipoBusca === "bairro"
                  ? "Digite o nome do bairro..."
                  : "Digite o nome da rua..."
            }
            aria-label="Buscar no mapa"
            className="w-full rounded-teia border-2 border-marca-400 bg-white py-2.5 pr-3 pl-9 text-sm placeholder:text-tx-3 focus:outline-none"
          />
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">

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
        <MapaView marcadores={filtrados} boundsZoom={boundsZoom} />
      </div>

      <div className="mt-4 rounded-teia bg-marca-50 p-4">
        <p className="mb-3 text-xs font-semibold text-tx-2 uppercase tracking-wide">
          Legenda das áreas
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {AREAS.map(({ chave, cor }) => (
            <div key={chave} className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: cor }}
                aria-hidden
              />
              <span className="text-[12px] text-tx-2">{chave}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
