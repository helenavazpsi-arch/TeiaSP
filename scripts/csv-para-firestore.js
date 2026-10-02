#!/usr/bin/env node

/**
 * Converte CSV com coordenadas → JSON para importar no Firestore.
 *
 * Uso:
 *   node scripts/csv-para-firestore.js scripts/conselhos-tutelares-PREENCHER.csv
 *
 * Antes, preencha as colunas 'lat' e 'lng' no CSV usando Google Maps.
 * Exemplo: abra Google Maps, pesquisa o endereço, clica em coordenadas na tela.
 */

const fs = require("fs");
const path = require("path");
const csv = require("csv-parse/sync");
const admin = require("firebase-admin");

// Inicializa Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

function parseCSV(caminhoArquivo) {
  const conteudo = fs.readFileSync(caminhoArquivo, "utf-8");

  // Parse CSV manualmente para evitar dependência extra
  const linhas = conteudo.trim().split("\n");
  const cabecalho = linhas[0]
    .split(",")
    .map((h) => h.trim().toLowerCase());

  const dados = [];

  for (let i = 1; i < linhas.length; i++) {
    // Parse CSV com suporte a quoted strings
    const valores = [];
    let coluna = "";
    let emCotacao = false;

    for (let j = 0; j < linhas[i].length; j++) {
      const char = linhas[i][j];

      if (char === '"') {
        emCotacao = !emCotacao;
      } else if (char === "," && !emCotacao) {
        valores.push(coluna.trim().replace(/^"|"$/g, ""));
        coluna = "";
      } else {
        coluna += char;
      }
    }
    valores.push(coluna.trim().replace(/^"|"$/g, ""));

    const linha = {};
    for (let j = 0; j < cabecalho.length; j++) {
      linha[cabecalho[j]] = valores[j] || "";
    }

    if (linha.sigla) dados.push(linha);
  }

  return dados;
}

async function importarBatch(caminhoArquivo) {
  console.log(`\n📥 Importando de ${caminhoArquivo}...\n`);

  if (!fs.existsSync(caminhoArquivo)) {
    console.error(`❌ Arquivo não encontrado: ${caminhoArquivo}`);
    process.exit(1);
  }

  const dados = parseCSV(caminhoArquivo);

  if (!Array.isArray(dados) || dados.length === 0) {
    console.error("❌ Arquivo vazio ou inválido");
    process.exit(1);
  }

  // Valida se todos têm coordenadas
  const semCoordenadas = dados.filter((d) => !d.lat || !d.lng);
  if (semCoordenadas.length > 0) {
    console.error(
      `❌ ${semCoordenadas.length} linhas sem lat/lng preenchidas:`
    );
    semCoordenadas.forEach((d) => console.error(`   - ${d.sigla}`));
    console.error("\nPreencha as coordenadas no CSV antes de importar.\n");
    process.exit(1);
  }

  console.log(`📊 ${dados.length} pontos para importar\n`);

  const batch = db.batch();
  let contador = 0;

  for (const linha of dados) {
    const lat = parseFloat(linha.lat);
    const lng = parseFloat(linha.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      console.warn(`⚠️  Pulando ${linha.sigla} (coordenadas inválidas)`);
      continue;
    }

    const id = linha.sigla.toLowerCase().replace(/\s+/g, "-");
    const docRef = db.collection("pontos").doc(id);

    batch.set(docRef, {
      sigla: linha.sigla || undefined,
      nome: linha.nome || undefined,
      area: linha.area || undefined,
      endereco: linha.endereco || undefined,
      telefone: linha.telefone || undefined,
      lat,
      lng,
      data: new Date().toLocaleDateString("pt-BR"),
    });

    contador++;

    if (contador % 500 === 0) {
      await batch.commit();
      console.log(`✅ ${contador} pontos importados`);
    }
  }

  if (contador % 500 !== 0) {
    await batch.commit();
    console.log(`✅ ${contador} pontos importados`);
  }

  console.log(`\n🎉 Importação concluída! ${contador} pontos adicionados.\n`);
}

const caminhoArquivo = process.argv[2];
if (!caminhoArquivo) {
  console.error("Uso: node scripts/csv-para-firestore.js <arquivo.csv>");
  process.exit(1);
}

importarBatch(caminhoArquivo).catch((err) => {
  console.error("❌ Erro:", err.message);
  process.exit(1);
});
