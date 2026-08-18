"use server";

import { updateTag } from "next/cache";
import { TAG_PONTOS } from "@/lib/dados/pontos";
import { TAG_SERVICOS } from "@/lib/dados/servicos";

/**
 * Derruba o cache das páginas públicas depois que a equipe altera conteúdo.
 *
 * A escrita em si acontece no navegador, com a conta da moderadora, e é o
 * Firestore que autoriza — mesmo caminho do site atual. O que faltava era
 * avisar o servidor: sem isso, a lista e o mapa só mudariam no próximo ciclo
 * de revalidação, e a equipe aprovaria algo sem ver o resultado no ar.
 */
export async function revalidarConteudo(): Promise<void> {
  updateTag(TAG_SERVICOS);
  updateTag(TAG_PONTOS);
}
