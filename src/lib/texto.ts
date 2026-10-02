/**
 * Tratamento do texto das descrições.
 *
 * O campo `desc` guarda HTML simples produzido pelo editor do painel
 * (negrito, itálico, parágrafos). Aqui ele é limpo para dois usos: o resumo
 * do cartão e o texto que alimenta a busca.
 */

/** Remove marcação e normaliza espaços. */
export function semHTML(html: string | undefined | null): string {
  return (html || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li)>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#3[49];/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Trecho curto para o cartão, cortado em limite de palavra. */
export function resumir(texto: string, limite = 190): string {
  const limpo = semHTML(texto);
  if (limpo.length <= limite) return limpo;

  const corte = limpo.slice(0, limite);
  const ultimoEspaco = corte.lastIndexOf(" ");
  return `${(ultimoEspaco > limite * 0.6 ? corte.slice(0, ultimoEspaco) : corte).trimEnd()}…`;
}

function escapar(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Deixa passar só negrito, itálico, sublinhado e listas.
 *
 * A estratégia é escapar o texto inteiro primeiro e só então devolver as tags
 * da lista branca — o contrário (tentar remover o que é perigoso) é o caminho
 * clássico para deixar algo escapar. Atributos são descartados sempre, então
 * não há como injetar `onerror`, `href` ou `style`.
 *
 * Isso precisa acontecer no servidor: o campo `desc` pode ter vindo de uma
 * sugestão pública e ser aprovada sem edição. O site antigo só sanitizava no
 * navegador de quem estava no painel.
 */
export function sanitizar(html: string): string {
  return escapar(html)
    .replace(
      /&lt;(\/?)(b|strong|i|em|u|ul|ol|li)(?:\s[^&]*?)?\/?&gt;/gi,
      (_, barra: string, tag: string) => `<${barra}${tag.toLowerCase()}>`,
    )
    // Restaura entidades HTML comuns escapadas
    .replace(/&amp;nbsp;/g, "&nbsp;")
    .replace(/&amp;quot;/g, "&quot;")
    .replace(/&amp;#(\d+);/g, "&#$1;");
}

/**
 * Divide a descrição em parágrafos já sanitizados, preservando a formatação
 * que a equipe aplicou no painel.
 */
export function paragrafos(desc: string | undefined | null): string[] {
  let texto = (desc || "");

  // Detecta e recupera listas (com </ul> orphaned OU plain text list patterns)
  const temUlOrphaned = texto.includes("</ul>");

  if (temUlOrphaned) {
    // Remove todos os </ul> orphaned
    texto = texto.replace(/<\/ul>/g, "");
  }

  // Remove tags <p> e <div> - converte fechamento em newline, depois remove abertura
  texto = texto.replace(/<\/p>/gi, "\n");
  texto = texto.replace(/<\/div>/gi, "\n");
  texto = texto.replace(/<(p|div)(\s[^>]*)>/g, "");

  // Normaliza breaks em newlines
  texto = texto.replace(/<br\s*\/?>/gi, "\n");

  // Divide por linhas e filtra vazias
  const linhas = texto.split("\n").filter((linha) => linha.trim().length > 0);
  texto = linhas.join("\n");

  // Remove newlines dentro de listas para manter a estrutura HTML intacta
  const semNewlinesDasListas = texto.replace(
    /(<(?:ul|ol)[\s\S]*?<\/(?:ul|ol)>)/gi,
    (match) => match.replace(/\n/g, " "),
  );

  return semNewlinesDasListas
    .replace(/<\/(p|div)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    // as tags de abertura de bloco somem: a quebra já virou \n acima.
    // O que sobrar de marcação passa por `sanitizar` e é escapado.
    // Preserva listas (<ul>, <ol>, <li>) para que apareçam com bullets.
    .replace(/<(p|div)(\s[^>]*)?>/gi, "")
    .split(/\n+/)
    .map((linha) => sanitizar(linha).trim())
    .filter((linha) => semHTML(linha).length > 0);
}
