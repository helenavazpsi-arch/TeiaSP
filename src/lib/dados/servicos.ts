import { collection, getDocs } from "firebase/firestore";
import { cacheLife, cacheTag } from "next/cache";
import { SEM_UNIDADES_NO_MAPA } from "@/data/sem-unidades-no-mapa";
import { normalizar, textoBuscavel } from "@/lib/busca";
import { db } from "@/lib/firebase/publico";
import { resolverSlugs } from "@/lib/slug";
import { resumir, semHTML } from "@/lib/texto";
import { corrigirArea, corrigirNome, corrigirPublico, corrigirTags } from "@/lib/sanitizar-servicos";
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

  return servicos.map((s) => {
    const nomeCorrigido = corrigirNome(s.nome);
    const publicoCorrigido = corrigirPublico(s.publico);
    const tagsCorrigidas = corrigirTags(s.tags);
    const areaCorrigida = corrigirArea(nomeCorrigido, s.area);

    return {
      id: s.id,
      slug: s.slug,
      sigla: s.sigla ?? "",
      nome: nomeCorrigido,
      area: areaCorrigida ?? "",
      publico: publicoCorrigido,
      territorio: s.territorio ?? "",
      tags: tagsCorrigidas,
      resumo: resumir(s.desc ?? ""),
      busca: normalizar(
        textoBuscavel([s.sigla, nomeCorrigido, semHTML(s.desc), tagsCorrigidas, publicoCorrigido, s.funcao]),
      ),
      temMapa: !semUnidadesNoMapa(s.sigla, nomeCorrigido),
    };
  });
}

/**
 * Data do cadastro mais recente, para o rodapé.
 *
 * Os documentos guardam `data` como texto pt-BR ("dd/mm/aaaa"), então a
 * conversão é manual. Substitui a constante `DATA_ATU` que era digitada à mão
 * no site antigo e vivia desatualizada.
 */
export async function dataUltimaAtualizacao(): Promise<string | undefined> {
  "use cache";
  cacheLife("hours");

  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, "0");
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const ano = hoje.getFullYear();
  return `${dia}/${mes}/${ano}`;
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
