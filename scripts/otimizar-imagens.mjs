/**
 * Gera as variantes AVIF/WebP das artes de fundo.
 *
 * Os fundos são aplicados por CSS (background-image), onde o next/image não
 * alcança — por isso as variantes são geradas uma vez e versionadas em
 * public/img. As fontes .jpg vieram do base64 embutido no site antigo.
 *
 *   node scripts/otimizar-imagens.mjs
 */
import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

const DIR = "public/img";

/**
 * Qualidade baixa de propósito: são texturas de aquarela, sem detalhe fino a
 * preservar. As larguras nunca passam da resolução da fonte — o base64 do
 * site antigo já vinha em 1400x1966 (desktop), 412x915 (mobile) e 600x845
 * (header), e ampliar só geraria arquivo maior sem ganho nenhum.
 */
const TAREFAS = [
  { fonte: "bg-desktop.jpg", saida: "bg-desktop", larguras: [1000, 1400], qualidade: 55 },
  { fonte: "bg-mobile.jpg", saida: "bg-mobile", larguras: [412], qualidade: 60 },
  { fonte: "header-bg.jpg", saida: "header-bg", larguras: [600], qualidade: 62 },
];

async function kb(arquivo) {
  return ((await stat(arquivo)).size / 1024).toFixed(1);
}

await mkdir(DIR, { recursive: true });

for (const { fonte, saida, larguras, qualidade } of TAREFAS) {
  const origem = path.join(DIR, fonte);
  console.log(`\n${fonte} (${await kb(origem)} KB)`);

  for (const largura of larguras) {
    for (const formato of ["avif", "webp"]) {
      const destino = path.join(DIR, `${saida}-${largura}.${formato}`);
      const img = sharp(origem).resize({ width: largura, withoutEnlargement: true });
      await (formato === "avif"
        ? img.avif({ quality: qualidade, effort: 6 })
        : img.webp({ quality: qualidade + 5 })
      ).toFile(destino);
      console.log(`  → ${path.basename(destino).padEnd(24)} ${await kb(destino)} KB`);
    }
  }
}

console.log("\nPronto.");
