import { collection, getDocs } from "firebase/firestore";
import { cacheLife, cacheTag } from "next/cache";
import { SEM_UNIDADES_NO_MAPA } from "@/data/sem-unidades-no-mapa";
import { normalizar, textoBuscavel } from "@/lib/busca";
import { db } from "@/lib/firebase/publico";
import { resolverSlugs } from "@/lib/slug";
import { resumir, semHTML } from "@/lib/texto";
import { COLECOES, type Servico } from "@/lib/tipos";

export const TAG_SERVICOS = "servicos";

const SIGLAS_SEM_MAPA = new Set(SEM_UNIDADES_NO_MAPA.map(normalizar));

/** Programas e benefícios não têm endereço próprio — não oferecem ver no mapa. */
function semUnidadesNoMapa(sigla?: string, nome?: string): boolean {
  return SIGLAS_SEM_MAPA.has(normalizar(sigla)) || SIGLAS_SEM_MAPA.has(normalizar(nome));
}

export type ServicoComSlug = Servico & { slug: string };

/**
 * Todos os dispositivos publicados, já com slug resolvido.
 *
 * São ~200 documentos: buscar a coleção inteira uma vez e filtrar em memória
 * sai mais barato do que montar consultas por filtro no Firestore, e é o que
 * permite a busca por texto livre continuar instantânea.
 *
 * O cache é invalidado pela moderação (aprovar, editar, excluir) via
 * `updateTag(TAG_SERVICOS)`; o prazo de horas é só a rede de segurança.
 */
export async function listarServicos(): Promise<ServicoComSlug[]> {
  "use cache";
  cacheTag(TAG_SERVICOS);
  cacheLife("hours");

  const snap = await getDocs(collection(db(), COLECOES.servicos));
  const servicos = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Servico);

  return resolverSlugs(servicos).sort((a, b) =>
    (a.nome || a.sigla || "").localeCompare(b.nome || b.sigla || "", "pt-BR", {
      sensitivity: "base",
      numeric: true,
    }),
  );
}

/**
 * O que a listagem manda para o navegador.
 *
 * A descrição completa fica fora de propósito: são ~200 documentos com textos
 * longos, e mandar tudo encheria o payload da primeira tela. O que vai é o
 * resumo do cartão mais `busca`, um índice já normalizado que sustenta a
 * pesquisa por texto livre sem ida ao servidor.
 */
export interface ServicoResumo {
  id: string;
  slug: string;
  sigla: string;
  nome: string;
  area: string;
  publico: string;
  territorio: string;
  tags: string[];
  resumo: string;
  busca: string;
  temMapa: boolean;
}

export async function listarServicosResumo(): Promise<ServicoResumo[]> {
  const servicos = await listarServicos();

  return servicos.map((s) => ({
    id: s.id,
    slug: s.slug,
    sigla: s.sigla ?? "",
    nome: s.nome ?? "",
    area: s.area ?? "",
    publico: s.publico ?? "",
    territorio: s.territorio ?? "",
    tags: s.tags ?? [],
    resumo: resumir(s.desc ?? ""),
    busca: normalizar(
      textoBuscavel([s.sigla, s.nome, semHTML(s.desc), s.tags, s.publico, s.funcao]),
    ),
    temMapa: !semUnidadesNoMapa(s.sigla, s.nome),
  }));
}

/**
 * Data do cadastro mais recente, para o rodapé.
 *
 * Os documentos guardam `data` como texto pt-BR ("dd/mm/aaaa"), então a
 * conversão é manual. Substitui a constante `DATA_ATU` que era digitada à mão
 * no site antigo e vivia desatualizada.
 */
export async function dataUltimaAtualizacao(): Promise<string | undefined> {
  const servicos = await listarServicos();

  let maisRecente: { data: Date; texto: string } | undefined;
  for (const { data } of servicos) {
    if (!data) continue;
    const [dia, mes, ano] = data.split("/").map(Number);
    if (!dia || !mes || !ano) continue;
    const quando = new Date(ano, mes - 1, dia);
    if (Number.isNaN(quando.getTime())) continue;
    if (!maisRecente || quando > maisRecente.data) maisRecente = { data: quando, texto: data };
  }
  return maisRecente?.texto;
}

/** Busca por slug, com o id como alternativa para links antigos. */
export async function buscarServico(
  slugOuId: string,
): Promise<(ServicoComSlug & { temMapa: boolean }) | null> {
  const servicos = await listarServicos();
  const achado =
    servicos.find((s) => s.slug === slugOuId) ?? servicos.find((s) => s.id === slugOuId);

  if (!achado) return null;
  return { ...achado, temMapa: !semUnidadesNoMapa(achado.sigla, achado.nome) };
}
