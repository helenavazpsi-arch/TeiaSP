import { normalizar } from "@/lib/busca";
import { listarPontos } from "@/lib/dados/pontos";
import { listarServicos } from "@/lib/dados/servicos";
import { zonaDoPonto } from "@/lib/geo/poligonos";

/**
 * O que o mapa desenha: os pontos da coleção `pontos` mais os dispositivos
 * que têm coordenada própria — mesma regra do site atual.
 *
 * Diferença: o vínculo entre um pino e a página do dispositivo é resolvido
 * aqui, no servidor. Antes o popup tinha um botão que refazia uma busca por
 * sigla no clique e às vezes não achava nada; agora o slug já vai junto.
 */
export interface Marcador {
  id: string;
  sigla: string;
  nome: string;
  area: string;
  endereco: string;
  telefone: string;
  lat: number;
  lng: number;
  zona: string | null;
  /** página do dispositivo correspondente, quando existe */
  slug: string | null;
}

/**
 * Moradia fica fora do mapa, como no site atual: são abrigos, repúblicas e
 * casas de acolhida, cujos endereços não são divulgados abertamente.
 */
const AREAS_FORA_DO_MAPA = new Set(["Moradia"]);

export async function listarMarcadores(): Promise<Marcador[]> {
  const [pontos, servicos] = await Promise.all([listarPontos(), listarServicos()]);

  const slugPorSigla = new Map<string, string>();
  for (const servico of servicos) {
    const chave = normalizar(servico.sigla);
    if (chave && !slugPorSigla.has(chave)) slugPorSigla.set(chave, servico.slug);
  }

  const daColecaoPontos: Marcador[] = pontos
    .filter((p) => !AREAS_FORA_DO_MAPA.has(p.area ?? ""))
    .map((p) => ({
      id: p.id,
      sigla: p.sigla ?? "",
      nome: p.nome ?? "",
      area: p.area ?? "",
      endereco: p.endereco ?? "",
      telefone: p.telefone ?? "",
      lat: p.lat,
      lng: p.lng,
      zona: p.zona,
      slug: slugPorSigla.get(normalizar(p.sigla)) ?? null,
    }));

  const dispositivosComEndereco: Marcador[] = servicos
    .filter(
      (s) =>
        Number.isFinite(s.lat) &&
        Number.isFinite(s.lng) &&
        !AREAS_FORA_DO_MAPA.has(s.area ?? ""),
    )
    .map((s) => ({
      id: s.id,
      sigla: s.sigla ?? "",
      nome: s.nome ?? "",
      area: s.area ?? "",
      endereco: s.endereco ?? "",
      telefone: s.telefone ?? "",
      lat: s.lat as number,
      lng: s.lng as number,
      zona: zonaDoPonto(s.lat as number, s.lng as number),
      slug: s.slug,
    }));

  return [...daColecaoPontos, ...dispositivosComEndereco];
}
