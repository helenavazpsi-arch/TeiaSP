import { describe, expect, it } from "vitest";
import { casaTexto, normalizar, textoBuscavel } from "./busca";

describe("normalizar", () => {
  it("tira acento e caixa", () => {
    expect(normalizar("Saúde Mental")).toBe("saude mental");
    expect(normalizar("EDUCAÇÃO")).toBe("educacao");
  });

  it("remove pontuação", () => {
    expect(normalizar("Benefícios/Programas")).toBe("beneficiosprogramas");
    expect(normalizar("CAPS AD III - Lapa")).toBe("caps ad iii  lapa");
  });

  it("aceita nulo e indefinido", () => {
    expect(normalizar(null)).toBe("");
    expect(normalizar(undefined)).toBe("");
  });

  /**
   * Documenta a armadilha que derrubou o filtro de zona do site antigo: o
   * apóstrofo some, e "Sant'Ana" (Zona Sul) vira o mesmo texto que "Santana"
   * (Zona Norte). É por isso que a zona é decidida pela coordenada.
   */
  it("apaga o apóstrofo, igualando Sant'Ana e Santana", () => {
    expect(normalizar("Rua Sant'Ana")).toBe("rua santana");
    expect(normalizar("Santana")).toBe("santana");
  });
});

describe("casaTexto", () => {
  it("casa no início de qualquer palavra", () => {
    expect(casaTexto("Centro de Atenção Psicossocial", "aten")).toBe(true);
    expect(casaTexto("Centro de Atenção Psicossocial", "centro")).toBe(true);
  });

  it("não casa no meio da palavra", () => {
    expect(casaTexto("Psicossocial", "social")).toBe(false);
  });

  it("ignora acento do lado do texto", () => {
    expect(casaTexto("Educação Infantil", "educacao")).toBe(true);
  });

  it("termo vazio casa com tudo", () => {
    expect(casaTexto("qualquer coisa", "")).toBe(true);
  });

  it("não quebra com caractere especial de regex no termo", () => {
    expect(() => casaTexto("CAPS (adulto)", "(adulto")).not.toThrow();
  });
});

describe("textoBuscavel", () => {
  it("junta strings e listas", () => {
    expect(textoBuscavel(["CAPS", ["saude", "mental"], undefined])).toBe(
      "CAPS saude mental ",
    );
  });
});
