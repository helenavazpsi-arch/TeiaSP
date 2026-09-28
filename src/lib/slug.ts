/**
 * Slugs para as URLs de dispositivo (/dispositivo/caps-ad-iii-lapa).
 *
 * No site antigo não havia link por dispositivo — tudo era modal sobre a
 * mesma página. Como os documentos do Firestore não têm slug gravado, ele é
 * derivado da sigla, e a estabilidade importa: um link compartilhado no
 * WhatsApp não pode mudar de endereço porque outro dispositivo foi cadastrado
 * depois.
 */

export function paraSlug(texto: string | undefined | null): string {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

interface Slugavel {
  id: string;
  sigla?: string;
  nome?: string;
}

/**
 * Resolve os slugs de uma lista inteira, tratando as siglas repetidas que
 * existem no banco (o painel já sinaliza essas duplicatas).
 *
 * Em caso de colisão, quem tem o menor id fica com o slug limpo e os demais
 * recebem um sufixo do próprio id — assim o link de quem já estava publicado
 * continua valendo quando um homônimo aparece.
 */
export function resolverSlugs<T extends Slugavel>(itens: T[]): Array<T & { slug: string }> {
  const porBase = new Map<string, T[]>();

  for (const item of itens) {
    const base = paraSlug(item.sigla) || paraSlug(item.nome) || item.id.toLowerCase();
    const grupo = porBase.get(base);
    if (grupo) grupo.push(item);
    else porBase.set(base, [item]);
  }

  const saida: Array<T & { slug: string }> = [];
  for (const [base, grupo] of porBase) {
    if (grupo.length === 1) {
      saida.push({ ...grupo[0], slug: base });
      continue;
    }
    const ordenado = [...grupo].sort((a, b) => a.id.localeCompare(b.id));
    ordenado.forEach((item, indice) => {
      saida.push({
        ...item,
        slug: indice === 0 ? base : `${base}-${item.id.slice(0, 6).toLowerCase()}`,
      });
    });
  }
  return saida;
}
