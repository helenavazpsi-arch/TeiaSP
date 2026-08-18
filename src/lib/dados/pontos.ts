import { collection, getDocs } from "firebase/firestore";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/firebase/publico";
import { zonaDoPonto } from "@/lib/geo/poligonos";
import { COLECOES, type Ponto, type PontoNoMapa } from "@/lib/tipos";

export const TAG_PONTOS = "pontos";

/**
 * Os pontos do mapa, já classificados por zona.
 *
 * A classificação acontece aqui, no servidor, uma vez por revalidação. No site
 * antigo cada navegador refazia esse cálculo para os ~3.900 pontos a cada
 * mudança de filtro — era a origem do travamento no celular e o motivo do
 * cache de coordenadas que existia no código.
 *
 * Pontos sem coordenada válida ficam de fora: sem lat/lng não há o que
 * desenhar no mapa nem como afirmar a zona.
 */
export async function listarPontos(): Promise<PontoNoMapa[]> {
  "use cache";
  cacheTag(TAG_PONTOS);
  cacheLife("hours");

  const snap = await getDocs(collection(db(), COLECOES.pontos));

  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Ponto)
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
    .map((p) => ({ ...p, zona: zonaDoPonto(p.lat, p.lng) }));
}

/**
 * Versão enxuta para o mapa: só o que o marcador e o popup usam.
 * Corta o payload que vai ao navegador quase pela metade.
 */
export interface PontoLeve {
  id: string;
  sigla: string;
  nome: string;
  area: string;
  endereco: string;
  telefone: string;
  lat: number;
  lng: number;
  zona: string | null;
}

export async function listarPontosLeves(): Promise<PontoLeve[]> {
  const pontos = await listarPontos();
  return pontos.map((p) => ({
    id: p.id,
    sigla: p.sigla ?? "",
    nome: p.nome ?? "",
    area: p.area ?? "",
    endereco: p.endereco ?? "",
    telefone: p.telefone ?? "",
    lat: p.lat,
    lng: p.lng,
    zona: p.zona,
  }));
}
