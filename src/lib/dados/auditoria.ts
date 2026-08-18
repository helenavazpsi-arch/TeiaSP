import { listarPontos } from "@/lib/dados/pontos";
import { distritoDoPonto, distritosNoTexto } from "@/lib/geo/poligonos";
import type { PontoNoMapa } from "@/lib/tipos";

/**
 * Procura coordenadas suspeitas entre os pontos do mapa.
 *
 * Mesmos quatro grupos da ferramenta que existe hoje no painel. A conta roda
 * no servidor: são ~3.900 pontos cruzados com 96 polígonos de distrito, e
 * fazer isso no navegador da moderadora era o que tornava a auditoria lenta.
 */

export type Suspeita = "fora" | "pilha" | "sem" | "divergente";

export interface PontoSuspeito {
  id: string;
  sigla: string;
  nome: string;
  area: string;
  endereco: string;
  lat: number | null;
  lng: number | null;
  grupo: Suspeita;
  /** distrito onde a coordenada caiu */
  distritoDaCoordenada: string | null;
  /** distritos citados no texto do endereço */
  distritosDoEndereco: string[];
  /** quantos pontos dividem exatamente esta coordenada */
  repetidos?: number;
  coordConferida: boolean;
}

export interface Auditoria {
  total: number;
  suspeitos: PontoSuspeito[];
  contagem: Record<Suspeita, number>;
}

export async function auditarCoordenadas(): Promise<Auditoria> {
  return classificar(await listarPontos());
}

/** A regra de classificação, separada da busca para poder ser testada. */
export function classificar(pontos: PontoNoMapa[]): Auditoria {
  // quantas unidades caem exatamente na mesma coordenada
  const ocupacao = new Map<string, number>();
  for (const p of pontos) {
    const chave = `${p.lat},${p.lng}`;
    ocupacao.set(chave, (ocupacao.get(chave) ?? 0) + 1);
  }

  const suspeitos: PontoSuspeito[] = [];

  for (const ponto of pontos) {
    const temCoordenada = Number.isFinite(ponto.lat) && Number.isFinite(ponto.lng);
    const distritoCoord = temCoordenada ? distritoDoPonto(ponto.lat, ponto.lng) : null;
    const distritosTexto = distritosNoTexto(ponto.endereco ?? "");
    const repetidos = ocupacao.get(`${ponto.lat},${ponto.lng}`) ?? 1;

    let grupo: Suspeita | null = null;

    if (!temCoordenada) {
      grupo = "sem";
    } else if (!ponto.zona) {
      // fora de todas as zonas = fora do município
      grupo = "fora";
    } else if (repetidos >= 5) {
      /**
       * Muitas unidades na mesma coordenada normalmente significa que o
       * geocoder desistiu do endereço e devolveu o centro do bairro ou da
       * cidade para todas.
       */
      grupo = "pilha";
    } else if (
      distritosTexto.length > 0 &&
      distritoCoord &&
      !distritosTexto.includes(distritoCoord)
    ) {
      grupo = "divergente";
    }

    if (!grupo) continue;

    suspeitos.push({
      id: ponto.id,
      sigla: ponto.sigla ?? "",
      nome: ponto.nome ?? "",
      area: ponto.area ?? "",
      endereco: ponto.endereco ?? "",
      lat: temCoordenada ? ponto.lat : null,
      lng: temCoordenada ? ponto.lng : null,
      grupo,
      distritoDaCoordenada: distritoCoord,
      distritosDoEndereco: distritosTexto,
      repetidos: repetidos > 1 ? repetidos : undefined,
      coordConferida: Boolean(ponto.coordConferida),
    });
  }

  const contagem: Record<Suspeita, number> = {
    fora: 0,
    pilha: 0,
    sem: 0,
    divergente: 0,
  };
  for (const s of suspeitos) contagem[s.grupo] += 1;

  return { total: pontos.length, suspeitos, contagem };
}
