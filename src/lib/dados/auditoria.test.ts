import { describe, expect, it } from "vitest";
import { classificar } from "./auditoria";
import type { PontoNoMapa } from "@/lib/tipos";

/** Coordenadas reais, para os polígonos decidirem de verdade. */
const SE = { lat: -23.5505, lng: -46.6333 }; // Praça da Sé, distrito SE
const ITAQUERA = { lat: -23.5405, lng: -46.456 };
const GUARULHOS = { lat: -23.4628, lng: -46.5333 }; // fora do município

function ponto(parcial: Partial<PontoNoMapa> & { id: string }): PontoNoMapa {
  return {
    sigla: "UNIDADE",
    nome: "",
    area: "Saúde",
    endereco: "",
    lat: SE.lat,
    lng: SE.lng,
    zona: "Centro",
    ...parcial,
  } as PontoNoMapa;
}

describe("classificar", () => {
  it("aponta ponto fora do município", () => {
    const { suspeitos, contagem } = classificar([
      ponto({ id: "a", ...GUARULHOS, zona: null }),
    ]);

    expect(contagem.fora).toBe(1);
    expect(suspeitos[0].grupo).toBe("fora");
  });

  it("aponta coordenadas empilhadas a partir de cinco unidades", () => {
    const empilhados = Array.from({ length: 5 }, (_, i) => ponto({ id: `p${i}` }));
    expect(classificar(empilhados).contagem.pilha).toBe(5);

    const poucos = Array.from({ length: 4 }, (_, i) => ponto({ id: `q${i}` }));
    expect(classificar(poucos).contagem.pilha).toBe(0);
  });

  it("aponta divergência entre o bairro do endereço e o pino", () => {
    const { suspeitos, contagem } = classificar([
      ponto({
        id: "div",
        ...ITAQUERA,
        zona: "Zona Leste",
        endereco: "Rua qualquer, 100 - Consolação",
      }),
    ]);

    expect(contagem.divergente).toBe(1);
    expect(suspeitos[0].distritoDaCoordenada).toBe("ITAQUERA");
    expect(suspeitos[0].distritosDoEndereco).toContain("CONSOLACAO");
  });

  it("não acusa divergência quando o endereço confere com o pino", () => {
    const { contagem } = classificar([
      ponto({ id: "ok", ...ITAQUERA, zona: "Zona Leste", endereco: "Av. Itaquera, 200" }),
    ]);

    expect(contagem.divergente).toBe(0);
  });

  it("não acusa nada quando o endereço não cita distrito", () => {
    const { suspeitos } = classificar([
      ponto({ id: "limpo", endereco: "Rua das Flores, 123" }),
    ]);

    expect(suspeitos).toHaveLength(0);
  });

  it("conta o total de pontos examinados", () => {
    const resultado = classificar([ponto({ id: "1" }), ponto({ id: "2" })]);
    expect(resultado.total).toBe(2);
  });
});
