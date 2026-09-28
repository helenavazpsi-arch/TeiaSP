import "server-only";

/**
 * Freio simples de envios por IP.
 *
 * O site atual não tem nenhum: qualquer script pode encher a fila de
 * moderação, e a equipe é quem paga o preço, revisando lixo. Isto não é uma
 * defesa contra ataque coordenado (a contagem vive na memória da instância),
 * mas resolve o caso comum de formulário disparado em série.
 */

const JANELA_MS = 10 * 60 * 1000;
const MAXIMO_POR_JANELA = 5;

const historico = new Map<string, number[]>();

export function podeEnviar(chave: string): boolean {
  const agora = Date.now();
  const recentes = (historico.get(chave) ?? []).filter((t) => agora - t < JANELA_MS);

  if (recentes.length >= MAXIMO_POR_JANELA) {
    historico.set(chave, recentes);
    return false;
  }

  recentes.push(agora);
  historico.set(chave, recentes);

  // limpeza preguiçosa: sem isso o Map cresce para sempre
  if (historico.size > 5000) {
    for (const [ip, marcas] of historico) {
      if (marcas.every((t) => agora - t >= JANELA_MS)) historico.delete(ip);
    }
  }

  return true;
}
