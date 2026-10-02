/**
 * Correções automáticas de dados dos cards.
 * Aplica normalizações e correções conhecidas aos dados do Firestore.
 */

const CORRECOES_NOME: Record<string, string> = {
  // Typos em nomes
  "Centro do Conhecimento da Assistência Socia": "Centro do Conhecimento da Assistência Social",
  "Sistema Único de Assitência": "Sistema Único de Assistência Social",
  "Gestão Autônomo da Medicação": "Gestão Autônoma da Medicação",
};

const CORRECOES_PUBLICO: Record<string, string> = {
  // Públicos com formato incorreto
  "LGBTQIAPN+": "População LGBTQIAPN+",
  "Outro": "", // Remover público inválido
  "Usuários de substâncias": "Pessoas usuárias de substâncias", // Linguagem inclusiva
};

const CORRECOES_TAGS: Record<string, string> = {
  "seviço emergencial": "serviço emergencial",
  "prevenção de doençaa": "prevenção de doença",
  "direito a a moradia": "direito à moradia",
  "dirieto ao trabalho": "direto ao trabalho",
};

/**
 * Normaliza um valor de público, convertendo variações conhecidas
 * para o formato correto usado nos filtros.
 */
export function corrigirPublico(publico: string | undefined | null): string {
  if (!publico) return "";

  const corrigido = CORRECOES_PUBLICO[publico];
  if (corrigido !== undefined) return corrigido;

  return publico;
}

/**
 * Corrige typos e erros conhecidos em um nome de serviço.
 */
export function corrigirNome(nome: string | undefined | null): string {
  if (!nome) return "";

  return CORRECOES_NOME[nome] || nome;
}

/**
 * Normaliza tags, corrigindo typos e removendo "situação de rua"
 * em favor de "pessoas em situação de calçada".
 */
export function corrigirTags(tags: string[] | undefined | null): string[] {
  if (!tags) return [];

  return tags
    .map(tag => {
      // Corrigir typos conhecidos
      if (tag in CORRECOES_TAGS) {
        return CORRECOES_TAGS[tag];
      }

      // Padronizar "situação de rua" para "pessoas em situação de calçada"
      if (tag.toLowerCase().includes("situação de rua")) {
        return "pessoas em situação de calçada";
      }

      return tag;
    })
    .filter((tag, idx, arr) => tag && arr.indexOf(tag) === idx); // Remove duplicatas e vazios
}

/**
 * Corrige área em maiúsculas indevidas (ex: "Jurídica" → "Jurídico").
 */
export function corrigirArea(nome: string | undefined, area: string | undefined): string {
  if (!area || !nome) return area || "";

  // Departamento Jurídica XI de Agosto
  if (nome.includes("Departamento") && area === "Jurídica") {
    return "Jurídico";
  }

  return area;
}
