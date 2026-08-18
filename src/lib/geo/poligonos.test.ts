import { describe, expect, it } from "vitest";
import { distritoDoPonto, distritosNoTexto, zonaDoPonto } from "./poligonos";

/**
 * Coordenadas de lugares conhecidos, conferidas contra a geografia real da
 * cidade — não contra o que o código devolve. Se um destes quebrar, o suspeito
 * é o polígono, não o teste.
 */
const LUGARES = {
  pracaDaSe: { lat: -23.5505, lng: -46.6333, zona: "Centro" },
  ibirapuera: { lat: -23.5874, lng: -46.6576, zona: "Zona Sul" },
  santana: { lat: -23.5027, lng: -46.625, zona: "Zona Norte" },
  itaquera: { lat: -23.5405, lng: -46.456, zona: "Zona Leste" },
  butanta: { lat: -23.57, lng: -46.72, zona: "Zona Oeste" },
} as const;

/** Cidades vizinhas: não são São Paulo e precisam cair fora de tudo. */
const FORA_DO_MUNICIPIO = {
  guarulhos: { lat: -23.4628, lng: -46.5333 },
  osasco: { lat: -23.5324, lng: -46.7916 },
  santoAndre: { lat: -23.6639, lng: -46.5383 },
} as const;

describe("zonaDoPonto", () => {
  for (const [lugar, { lat, lng, zona }] of Object.entries(LUGARES)) {
    it(`classifica ${lugar} como ${zona}`, () => {
      expect(zonaDoPonto(lat, lng)).toBe(zona);
    });
  }

  for (const [cidade, { lat, lng }] of Object.entries(FORA_DO_MUNICIPIO)) {
    it(`devolve null para ${cidade}, fora do município`, () => {
      expect(zonaDoPonto(lat, lng)).toBeNull();
    });
  }

  it("devolve null para coordenada inválida", () => {
    expect(zonaDoPonto(NaN, -46.6)).toBeNull();
    expect(zonaDoPonto(Infinity, -46.6)).toBeNull();
  });
});

describe("distritoDoPonto", () => {
  it("acha o distrito da Praça da Sé", () => {
    expect(distritoDoPonto(LUGARES.pracaDaSe.lat, LUGARES.pracaDaSe.lng)).toBe("SE");
  });

  it("acha o distrito de Itaquera", () => {
    expect(distritoDoPonto(LUGARES.itaquera.lat, LUGARES.itaquera.lng)).toBe("ITAQUERA");
  });

  it("devolve null fora do município", () => {
    const { lat, lng } = FORA_DO_MUNICIPIO.guarulhos;
    expect(distritoDoPonto(lat, lng)).toBeNull();
  });
});

describe("distritosNoTexto", () => {
  it("encontra o distrito citado no endereço", () => {
    expect(distritosNoTexto("Rua Augusta, 1500 - Consolação, São Paulo")).toContain(
      "CONSOLACAO",
    );
  });

  it("ignora nome de distrito colado em outra palavra", () => {
    expect(distritosNoTexto("Rua Consolacaozinha")).not.toContain("CONSOLACAO");
  });

  it("devolve lista vazia para texto sem distrito", () => {
    expect(distritosNoTexto("Rua das Flores, 123")).toEqual([]);
  });
});
