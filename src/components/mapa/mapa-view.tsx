"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import Supercluster from "supercluster";
import { area } from "@/lib/areas";
import type { Marcador } from "@/lib/dados/mapa";

/**
 * O mapa, controlando o Leaflet diretamente.
 *
 * Não usa os componentes do react-leaflet de propósito. O `MapContainer` dele
 * guarda a instância do mapa em estado e a destrói no cleanup do efeito — e o
 * Next 16 preserva o estado das rotas em `<Activity>` quando você navega para
 * fora. O resultado era: sair do mapa destruía os panes, voltar reaproveitava
 * o contexto morto, e a primeira camada a se anexar estourava com
 * "Cannot read properties of undefined (reading 'appendChild')".
 *
 * Aqui o mapa nasce e morre dentro do mesmo efeito, sem estado sobrevivente.
 * De quebra, os ~3.900 pinos deixam de ser componentes React: são formas
 * desenhadas em canvas, redesenhadas só quando a área visível muda.
 */

const CENTRO_SP: [number, number] = [-23.5505, -46.6333];
const ZOOM_INICIAL = 11;

interface Propriedades {
  marcador: Marcador;
}

export function MapaView({ marcadores }: { marcadores: Marcador[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const camadaRef = useRef<L.LayerGroup | null>(null);
  const indiceRef = useRef<Supercluster<Propriedades> | null>(null);

  // cria o mapa uma vez, destrói ao sair
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mapa = L.map(container, {
      preferCanvas: true,
      scrollWheelZoom: true,
      zoomControl: true,
    }).setView(CENTRO_SP, ZOOM_INICIAL);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(mapa);

    const camada = L.layerGroup().addTo(mapa);

    mapaRef.current = mapa;
    camadaRef.current = camada;

    const redesenhar = () => desenhar(mapa, camada, indiceRef.current);
    mapa.on("moveend", redesenhar);
    mapa.on("zoomend", redesenhar);

    // o tamanho real só é conhecido depois do layout
    const aoRedimensionar = () => mapa.invalidateSize();
    window.addEventListener("resize", aoRedimensionar);
    const inicial = setTimeout(() => mapa.invalidateSize(), 120);

    return () => {
      clearTimeout(inicial);
      window.removeEventListener("resize", aoRedimensionar);
      mapa.off("moveend", redesenhar);
      mapa.off("zoomend", redesenhar);
      mapa.remove();
      mapaRef.current = null;
      camadaRef.current = null;
    };
  }, []);

  // reindexa e redesenha quando os filtros mudam a lista
  useEffect(() => {
    const indice = new Supercluster<Propriedades>({ radius: 70, maxZoom: 17 });
    indice.load(
      marcadores.map((marcador) => ({
        type: "Feature" as const,
        properties: { marcador },
        geometry: { type: "Point" as const, coordinates: [marcador.lng, marcador.lat] },
      })),
    );
    indiceRef.current = indice;

    if (mapaRef.current && camadaRef.current) {
      desenhar(mapaRef.current, camadaRef.current, indice);
    }
  }, [marcadores]);

  return <div ref={containerRef} className="h-full w-full" />;
}

/** Desenha só o que cabe na área visível, agrupado pelo zoom atual. */
function desenhar(
  mapa: L.Map,
  camada: L.LayerGroup,
  indice: Supercluster<Propriedades> | null,
) {
  if (!indice) return;

  camada.clearLayers();

  const limites = mapa.getBounds();
  const grupos = indice.getClusters(
    [limites.getWest(), limites.getSouth(), limites.getEast(), limites.getNorth()],
    Math.round(mapa.getZoom()),
  );

  for (const item of grupos) {
    const [lng, lat] = item.geometry.coordinates;

    if ("cluster" in item.properties && item.properties.cluster) {
      const quantidade = item.properties.point_count as number;
      const idGrupo = item.properties.cluster_id as number;

      L.marker([lat, lng], { icon: iconeDeGrupo(quantidade) })
        .on("click", () => mapa.setView([lat, lng], indice.getClusterExpansionZoom(idGrupo)))
        .addTo(camada);
      continue;
    }

    const { marcador } = item.properties as Propriedades;

    L.circleMarker([lat, lng], {
      radius: 7,
      fillColor: area(marcador.area).cor,
      color: "#fff",
      weight: 2.5,
      fillOpacity: 1,
    })
      .bindPopup(conteudoDoPopup(marcador), { minWidth: 210 })
      .addTo(camada);
  }
}

/** Todo texto vindo do banco passa por aqui antes de virar HTML do popup. */
function esc(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function conteudoDoPopup(marcador: Marcador): string {
  const { badge } = area(marcador.area);
  const titulo = esc(marcador.sigla || marcador.nome);
  const partes = [`<p style="font-size:13px;font-weight:700;margin:0">${titulo}</p>`];

  if (marcador.nome && marcador.nome !== marcador.sigla) {
    partes.push(
      `<p style="font-size:11px;color:#52525b;margin:2px 0 0">${esc(marcador.nome)}</p>`,
    );
  }

  partes.push(
    `<span style="display:inline-block;margin-top:6px;padding:2px 8px;border-radius:999px;` +
      `font-size:10px;font-weight:600;background:${badge.bg};color:${badge.fg}">` +
      `${esc(marcador.area)}</span>`,
  );

  if (marcador.endereco) {
    partes.push(
      `<p style="font-size:11px;color:#52525b;margin:8px 0 0;line-height:1.4">${esc(marcador.endereco)}</p>`,
    );
  }
  if (marcador.telefone) {
    partes.push(
      `<p style="font-size:11px;color:#52525b;margin:4px 0 0">${esc(marcador.telefone)}</p>`,
    );
  }

  if (marcador.slug) {
    partes.push(
      `<a href="/dispositivo/${esc(marcador.slug)}" style="display:block;margin-top:10px;` +
        `padding:6px 10px;border-radius:6px;background:#3C3489;color:#fff;font-size:11px;` +
        `font-weight:600;text-align:center;text-decoration:none">Ver descrição</a>`,
    );
  }
  if (marcador.endereco) {
    partes.push(
      `<a href="https://www.google.com/maps/search/${encodeURIComponent(marcador.endereco)}" ` +
        `target="_blank" rel="noopener" style="display:block;margin-top:6px;padding:6px 10px;` +
        `border-radius:6px;background:#185FA5;color:#fff;font-size:11px;font-weight:600;` +
        `text-align:center;text-decoration:none">Como chegar</a>`,
    );
  }

  return `<div style="min-width:190px">${partes.join("")}</div>`;
}

/** Bolha com a contagem; cresce um pouco conforme o grupo. */
function iconeDeGrupo(quantidade: number) {
  const tamanho = quantidade < 10 ? 34 : quantidade < 100 ? 42 : quantidade < 1000 ? 50 : 58;
  const rotulo =
    quantidade < 1000 ? String(quantidade) : `${Math.floor(quantidade / 1000)}mil+`;

  return L.divIcon({
    html:
      `<div style="width:${tamanho}px;height:${tamanho}px;display:flex;align-items:center;` +
      `justify-content:center;border-radius:50%;background:rgba(83,74,183,0.92);` +
      `border:3px solid rgba(255,255,255,0.9);color:#fff;font-weight:700;` +
      `font-size:${quantidade < 1000 ? 13 : 11}px;box-shadow:0 2px 8px rgba(0,0,0,0.25)">` +
      `${rotulo}</div>`,
    className: "",
    iconSize: [tamanho, tamanho],
  });
}
