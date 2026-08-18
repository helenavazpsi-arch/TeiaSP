import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { zonaDoPonto } from "@/lib/geo/poligonos";

/**
 * Endereço → coordenada, pelo Nominatim (OpenStreetMap).
 *
 * Isso rodava no navegador de cada visitante, sem identificação. A política de
 * uso do Nominatim exige um User-Agent que identifique a aplicação e no máximo
 * uma consulta por segundo — do jeito antigo, um pico de acessos podia render
 * bloqueio do serviço inteiro para o site. Agora sai do servidor, com
 * identificação, fila e cache.
 */

/** Caixa do município de São Paulo. */
const CAIXA_SP = "-46.8263,-23.3566,-46.3651,-24.0081";

const IDENTIFICACAO =
  process.env.NOMINATIM_USER_AGENT ??
  "TeiaSP/1.0 (guia colaborativo de dispositivos; https://teiasp.com.br)";

export interface Coordenada {
  lat: number;
  lng: number;
  bairro: string;
}

/**
 * Uma consulta por vez, com pelo menos 1,1s entre elas.
 * A fila é por instância — o suficiente para o volume do site e para a
 * auditoria em lote do painel, que é o único uso realmente sequencial.
 */
let ultimaConsulta = 0;
let fila: Promise<unknown> = Promise.resolve();

function enfileirar<T>(tarefa: () => Promise<T>): Promise<T> {
  const proxima = fila.then(async () => {
    const espera = 1100 - (Date.now() - ultimaConsulta);
    if (espera > 0) await new Promise((r) => setTimeout(r, espera));
    ultimaConsulta = Date.now();
    return tarefa();
  });
  // a fila não pode parar por causa de uma falha isolada
  fila = proxima.catch(() => undefined);
  return proxima;
}

/**
 * Variações do endereço, da mais completa para a mais simples — mesma
 * estratégia em cascata do site atual.
 */
function variacoes(endereco: string): string[] {
  const limpar = (s: string) => s.replace(/\s+/g, " ").trim();
  const base = limpar(endereco);
  const semCep = limpar(base.replace(/,?\s*\d{5}-?\d{3}\s*/g, " "));
  const partes = base.split(",").map(limpar).filter(Boolean);

  const tentativas = [base];
  if (semCep !== base) tentativas.push(semCep);
  if (partes.length > 2) tentativas.push(partes.slice(0, 2).join(", "));
  if (partes.length > 1) tentativas.push(partes[0]);

  return tentativas.filter((t, i) => t && tentativas.indexOf(t) === i);
}

interface RespostaNominatim {
  lat: string;
  lon: string;
  address?: Record<string, string>;
}

export async function geocodificar(endereco: string): Promise<Coordenada | null> {
  "use cache";
  cacheTag(`geocode:${endereco}`);
  cacheLife("max");

  for (const tentativa of variacoes(endereco)) {
    const comCidade = /s[ãa]o paulo/i.test(tentativa) ? tentativa : `${tentativa}, São Paulo`;
    const consulta = /brasil|brazil/i.test(comCidade) ? comCidade : `${comCidade}, Brasil`;

    const url =
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(consulta)}` +
      `&format=json&limit=5&countrycodes=br&addressdetails=1&viewbox=${CAIXA_SP}&bounded=1`;

    try {
      const resposta = await enfileirar(() =>
        fetch(url, {
          headers: { "User-Agent": IDENTIFICACAO, "Accept-Language": "pt-BR" },
        }),
      );
      if (!resposta.ok) continue;

      const candidatos = (await resposta.json()) as RespostaNominatim[];

      for (const candidato of candidatos) {
        const lat = Number.parseFloat(candidato.lat);
        const lng = Number.parseFloat(candidato.lon);

        // só vale o que cai dentro de alguma zona, ou seja, dentro do município
        if (!zonaDoPonto(lat, lng)) continue;

        const dados = candidato.address ?? {};
        return {
          lat,
          lng,
          bairro:
            dados.suburb || dados.city_district || dados.neighbourhood || dados.quarter || "",
        };
      }
    } catch {
      // rede instável ou resposta inesperada: tenta a próxima variação
    }
  }

  return null;
}
