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

  // Normaliza quebras de parágrafo/linha em newlines para detectar padrões de lista
  texto = texto.replace(/<\/p>/gi, "\n");
  texto = texto.replace(/<br\s*\/?>/gi, "\n");
  texto = texto.replace(/<\/(div)>/gi, "\n");

  // Processa linhas para detectar padrão de lista (linhas com ":")
  const linhas = texto.split("\n");
  let i = 0;
  const resultado: string[] = [];

  while (i < linhas.length) {
    const linha = linhas[i];
    const temColon = linha.includes(":");
    const linhaValida = linha.trim().length > 0;

    // Detecta itens de lista: linhas contíguas que têm ":"
    if (temColon && linhaValida && linha.trim().length > 2) {
      const itens: string[] = [];

      // Coleta todas as linhas contíguas com colons
      while (i < linhas.length &&
             linhas[i].includes(":") &&
             linhas[i].trim().length > 2) {
        itens.push(linhas[i]);
        i++;
      }

      // Se temos 3+ itens contígues com colons, embrulha em <ul><li>
      // (Ignora se há 1-2 itens - provavelmente é introdução ou metadados isolados)
      if (itens.length >= 3) {
        resultado.push(`<ul>${itens.map((item) => `<li>${item}</li>`).join("")}</ul>`);
      } else {
        resultado.push(...itens);
      }
    } else {
      resultado.push(linha);
      i++;
    }
  }
  texto = resultado.join("\n");

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
