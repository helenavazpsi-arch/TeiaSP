#!/usr/bin/env node

/**
 * Script para importar os Conselhos Tutelares no Firestore (batch).
 *
 * Uso:
 *   npm run firestore-batch scripts/conselhos-tutelares-pronto.json
 *
 * Isso vai adicionar todos os pontos diretamente na coleção `pontos`.
 * Requer credenciais do Firebase (GOOGLE_APPLICATION_CREDENTIALS).
 */

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

// Inicializa Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function importarBatch(caminhoArquivo) {
  console.log(`\n📥 Importando de ${caminhoArquivo}...\n`);

  if (!fs.existsSync(caminhoArquivo)) {
    console.error(`❌ Arquivo não encontrado: ${caminhoArquivo}`);
    process.exit(1);
  }

  const dados = JSON.parse(fs.readFileSync(caminhoArquivo, "utf-8"));

  if (!Array.isArray(dados) || dados.length === 0) {
    console.error("❌ Arquivo vazio ou inválido");
    process.exit(1);
  }

  console.log(`📊 ${dados.length} pontos para importar\n`);

  const batch = db.batch();
  let contador = 0;

  for (const ponto of dados) {
    // Validação básica
    if (!ponto.lat || !ponto.lng) {
      console.warn(`⚠️  Pulando ${ponto.sigla} (sem coordenadas válidas)`);
      continue;
    }

    // Cria um ID baseado na sigla ou gera um novo
    const id = ponto.sigla.toLowerCase().replace(/\s+/g, "-");

    const docRef = db.collection("pontos").doc(id);

    // Remove campos auxiliares antes de salvar
    const {
      bairro, // auxilia na geocodificação, não precisa no Firestore
      ...dadosLimpos
    } = ponto;

    batch.set(docRef, {
      ...dadosLimpos,
      lat: parseFloat(ponto.lat),
      lng: parseFloat(ponto.lng),
      // Garante que há data se não houver
      data: ponto.data || new Date().toLocaleDateString("pt-BR"),
    });

    contador++;

    // Firestore permite até 500 operações por batch
    if (contador % 500 === 0) {
      await batch.commit();
      console.log(`✅ ${contador} pontos importados`);

      // Inicia um novo batch
      batch = db.batch();
    }
  }

  // Importa o restante
  if (contador % 500 !== 0) {
    await batch.commit();
    console.log(`✅ ${contador} pontos importados`);
  }

  console.log(`\n🎉 Importação concluída! ${contador} pontos adicionados.\n`);

  // Invalida o cache para refletir as mudanças
  console.log("🔄 Invalidando cache...");
  const response = await fetch(`http://localhost:3000/api/revalidar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tag: "pontos" }),
  }).catch(() => null);

  if (response?.ok) {
    console.log("✅ Cache invalidado com sucesso\n");
  } else {
    console.log("💡 Cache será invalidado automaticamente em breve (or run: npm run dev)\n");
  }
}

const caminhoArquivo = process.argv[2];
if (!caminhoArquivo) {
  console.error("Uso: node scripts/firestore-batch-import.js <arquivo.json>");
  process.exit(1);
}

importarBatch(caminhoArquivo).catch((err) => {
  console.error("❌ Erro:", err.message);
  process.exit(1);
});
