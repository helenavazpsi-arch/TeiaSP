import { describe, expect, it } from "vitest";
import { paragrafos, resumir, sanitizar, semHTML } from "./texto";

describe("sanitizar", () => {
  it("mantém as marcações permitidas", () => {
    expect(sanitizar("texto <b>negrito</b> e <i>itálico</i>")).toBe(
      "texto <b>negrito</b> e <i>itálico</i>",
    );
    expect(sanitizar("<strong>forte</strong> <em>ênfase</em> <u>sublinhado</u>")).toBe(
      "<strong>forte</strong> <em>ênfase</em> <u>sublinhado</u>",
    );
  });

  it("descarta atributos das tags permitidas", () => {
    expect(sanitizar('<b style="color:red" onclick="roubar()">oi</b>')).toBe("<b>oi</b>");
  });

  it("neutraliza script", () => {
    const saida = sanitizar('<script>alert("xss")</script>');
    expect(saida).not.toContain("<script");
    expect(saida).toBe("&lt;script&gt;alert(\"xss\")&lt;/script&gt;");
  });

  it("neutraliza img com onerror", () => {
    const saida = sanitizar('<img src=x onerror="alert(1)">');
    expect(saida).not.toContain("<img");
    expect(saida).not.toMatch(/<[a-z]/i);
  });

  it("neutraliza link e iframe", () => {
    expect(sanitizar('<a href="javascript:alert(1)">clique</a>')).not.toContain("<a");
    expect(sanitizar("<iframe src=//mal.example></iframe>")).not.toContain("<iframe");
  });

  it("não deixa reconstruir tag proibida por aninhamento", () => {
    // "<scr<b></b>ipt>" não pode virar "<script>" depois da limpeza
    expect(sanitizar("<scr<b></b>ipt>alert(1)</script>")).not.toContain("<script");
  });

  it("continua seguro quando a remoção de bloco junta pedaços", () => {
    // paragrafos() remove <p>; o que sobra ainda passa por sanitizar()
    expect(paragrafos("<scr<p>ipt>alert(1)</script>").join("")).not.toContain("<script");
  });

  it("escapa o & solto sem quebrar entidade", () => {
    expect(sanitizar("saúde & assistência")).toBe("saúde &amp; assistência");
  });
});

describe("paragrafos", () => {
  it("quebra por <p>, <div> e <br>", () => {
    expect(paragrafos("<p>um</p><p>dois</p>")).toEqual(["um", "dois"]);
    expect(paragrafos("um<br>dois")).toEqual(["um", "dois"]);
  });

  it("aceita texto puro com quebras de linha", () => {
    expect(paragrafos("primeira\n\nsegunda")).toEqual(["primeira", "segunda"]);
  });

  it("descarta linhas vazias e sobras de marcação", () => {
    expect(paragrafos("<p></p><p>conteúdo</p><div>  </div>")).toEqual(["conteúdo"]);
  });

  it("preserva formatação dentro do parágrafo", () => {
    expect(paragrafos("<p>o <b>CAPS</b> atende</p>")).toEqual(["o <b>CAPS</b> atende"]);
  });
});

describe("semHTML", () => {
  it("tira marcação e normaliza espaço", () => {
    expect(semHTML("<p>oi</p>  <p>tudo   bem</p>")).toBe("oi tudo bem");
  });

  it("converte entidades comuns", () => {
    expect(semHTML("caf&eacute; &amp; leite")).toBe("caf&eacute; & leite");
    expect(semHTML("a &lt; b")).toBe("a < b");
  });
});

describe("resumir", () => {
  it("devolve o texto inteiro quando cabe", () => {
    expect(resumir("curto")).toBe("curto");
  });

  it("corta em limite de palavra e marca reticências", () => {
    const longo = "palavra ".repeat(60);
    const saida = resumir(longo, 50);
    expect(saida.length).toBeLessThanOrEqual(51);
    expect(saida.endsWith("…")).toBe(true);
    expect(saida).not.toMatch(/pala…$/);
  });
});
