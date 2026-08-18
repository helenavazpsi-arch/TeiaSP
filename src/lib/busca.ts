/**
 * Normalização e casamento de texto da busca.
 * Portado de `normBusca` e `matchTexto` (legacy/index.html:1284).
 */

/**
 * Minúsculas, sem acento e sem pontuação — "Saúde Mental" e "saude mental"
 * passam a ser a mesma coisa.
 *
 * Cuidado ao mexer: remover pontuação também apaga o apóstrofo, e foi
 * justamente isso que fez "Rua Sant'Ana" (Zona Sul) casar com o bairro
 * Santana (Zona Norte) no site antigo. Por isso o filtro de zona do mapa
 * decide pela coordenada e nunca por texto.
 */
export function normalizar(texto: string | null | undefined): string {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "");
}

/** Casa o termo no início de qualquer palavra do texto. */
export function casaTexto(texto: string | null | undefined, termo: string): boolean {
  if (!termo) return true;
  const escapado = termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escapado}`).test(normalizar(texto));
}

/** Junta os campos pesquisáveis de um dispositivo num texto só. */
export function textoBuscavel(campos: Array<string | string[] | undefined>): string {
  return campos
    .map((campo) => (Array.isArray(campo) ? campo.join(" ") : campo || ""))
    .join(" ");
}
