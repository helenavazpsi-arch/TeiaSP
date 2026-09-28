/**
 * Classificação geográfica por polígono — zonas e distritos de São Paulo.
 *
 * Portado de legacy/index.html (`pontoEmPoligono`, `zonaDoPonto`,
 * `distritoDoPonto`). Os polígonos vêm de src/data/*.json, extraídos das
 * constantes ZONAS_GEO e DISTRITOS que ficavam embutidas no HTML.
 *
 * Diferença relevante em relação ao original: lá havia um cache de
 * coordenadas (`_zCache`) porque a classificação rodava no navegador a cada
 * troca de filtro, sobre ~3.900 pontos. Aqui isso acontece no servidor, uma
 * vez por revalidação, e o resultado já viaja pronto para o cliente — as
 * caixas envolventes bastam.
 */

import distritosBrutos from "@/data/distritos.json";
import zonasBrutas from "@/data/zonas.json";
import { normalizar } from "@/lib/busca";

/** Vértice no formato do arquivo de origem: [longitude, latitude]. */
export type Vertice = [number, number];
export type Anel = Vertice[];
export type Regioes = Record<string, Anel[]>;

/** [minLng, minLat, maxLng, maxLat] */
type Caixa = [number, number, number, number];

export const ZONAS = zonasBrutas as unknown as Regioes;
export const DISTRITOS = distritosBrutos as unknown as Regioes;

export const NOMES_ZONAS = Object.keys(ZONAS);

/**
 * Ray casting. `anel` guarda [lng, lat], por isso x é longitude e y latitude.
 */
export function pontoEmPoligono(lat: number, lng: number, anel: Anel): boolean {
  let dentro = false;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const [xi, yi] = anel[i];
    const [xj, yj] = anel[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      dentro = !dentro;
    }
  }
  return dentro;
}

/** Caixas envolventes: descartam quase todos os testes sem percorrer o polígono. */
function caixas(regioes: Regioes): Record<string, Caixa> {
  const saida: Record<string, Caixa> = {};
  for (const [nome, aneis] of Object.entries(regioes)) {
    const caixa: Caixa = [Infinity, Infinity, -Infinity, -Infinity];
    for (const anel of aneis) {
      for (const [x, y] of anel) {
        if (x < caixa[0]) caixa[0] = x;
        if (y < caixa[1]) caixa[1] = y;
        if (x > caixa[2]) caixa[2] = x;
        if (y > caixa[3]) caixa[3] = y;
      }
    }
    saida[nome] = caixa;
  }
  return saida;
}

const CAIXAS_ZONAS = caixas(ZONAS);
const CAIXAS_DISTRITOS = caixas(DISTRITOS);

function regiaoDoPonto(
  lat: number,
  lng: number,
  regioes: Regioes,
  caixasRegioes: Record<string, Caixa>,
): string | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  for (const [nome, aneis] of Object.entries(regioes)) {
    const [minLng, minLat, maxLng, maxLat] = caixasRegioes[nome];
    if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) continue;
    for (const anel of aneis) {
      if (pontoEmPoligono(lat, lng, anel)) return nome;
    }
  }
  return null;
}

/**
 * A zona de uma coordenada, ou null se cair fora do município.
 * É também o teste de "está em São Paulo?" usado ao validar endereços.
 */
export function zonaDoPonto(lat: number, lng: number): string | null {
  return regiaoDoPonto(lat, lng, ZONAS, CAIXAS_ZONAS);
}

export function distritoDoPonto(lat: number, lng: number): string | null {
  return regiaoDoPonto(lat, lng, DISTRITOS, CAIXAS_DISTRITOS);
}

const DISTRITOS_NORMALIZADOS: ReadonlyArray<readonly [string, string]> = Object.keys(
  DISTRITOS,
).map((nome) => [nome, normalizar(nome)] as const);

/** Distritos citados no texto de um endereço, como palavra inteira. */
export function distritosNoTexto(texto: string): string[] {
  const alvo = normalizar(texto);
  if (!alvo) return [];

  return DISTRITOS_NORMALIZADOS.filter(([, normalizado]) => {
    if (normalizado.length < 4) return false;
    const escapado = normalizado.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${escapado}([^a-z0-9]|$)`).test(alvo);
  }).map(([nome]) => nome);
}
