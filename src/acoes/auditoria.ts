"use server";

import { geocodificar } from "@/lib/geocode";
import { distritoDoPonto } from "@/lib/geo/poligonos";

/**
 * Recalcula a coordenada de um endereço, para a auditoria do painel.
 *
 * Passa pela mesma fila do resto do geocoding, que respeita o limite de uma
 * consulta por segundo do Nominatim. No site atual esse laço rodava no
 * navegador da moderadora com um `setTimeout` de 1,1s entre chamadas — se a
 * aba fosse fechada no meio, o lote parava pela metade.
 */
export interface Recalculo {
  ok: boolean;
  lat?: number;
  lng?: number;
  bairro?: string;
  distrito?: string | null;
  mensagem?: string;
}

export async function recalcularCoordenada(endereco: string): Promise<Recalculo> {
  if (!endereco?.trim()) {
    return { ok: false, mensagem: "Sem endereço para consultar." };
  }

  const achado = await geocodificar(endereco);

  if (!achado) {
    return { ok: false, mensagem: "Não encontrado dentro de São Paulo." };
  }

  return {
    ok: true,
    lat: achado.lat,
    lng: achado.lng,
    bairro: achado.bairro,
    distrito: distritoDoPonto(achado.lat, achado.lng),
  };
}
