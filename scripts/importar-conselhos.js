#!/usr/bin/env node

/**
 * Script para geocodificar e preparar os dados dos Conselhos Tutelares.
 *
 * Uso:
 *   node scripts/importar-conselhos.js
 *
 * Isso vai gerar um arquivo `scripts/conselhos-tutelares-pronto.json`
 * com as coordenadas e tudo pronto para importar no Firestore.
 */

const fs = require("fs");
const path = require("path");

// Mesma lógica de geocodificação do projeto
const CAIXA_SP = "-46.8263,-23.3566,-46.3651,-24.0081";
const IDENTIFICACAO = "TeiaSP/1.0 (guia colaborativo de dispositivos; https://teiasp.com.br)";

// Simulamos o zonaDoPonto apenas verificando se está dentro de SP
function estaEmSaoPaulo(lat, lng) {
  // Limites do município (aproximados)
  return lat >= -23.546 && lat <= -23.394 && lng >= -46.734 && lng <= -46.362;
}

function variacoes(endereco) {
  const limpar = (s) => s.replace(/\s+/g, " ").trim();
  const base = limpar(endereco);
  const semCep = limpar(base.replace(/,?\s*\d{5}-?\d{3}\s*/g, " "));
  const partes = base.split(",").map(limpar).filter(Boolean);

  const tentativas = [base];
  if (semCep !== base) tentativas.push(semCep);
  if (partes.length > 2) tentativas.push(partes.slice(0, 2).join(", "));
  if (partes.length > 1) tentativas.push(partes[0]);

  return tentativas.filter((t, i) => t && tentativas.indexOf(t) === i);
}

let ultimaConsulta = 0;

async function esperarIntervalo() {
  const espera = 1100 - (Date.now() - ultimaConsulta);
  if (espera > 0) await new Promise((r) => setTimeout(r, espera));
  ultimaConsulta = Date.now();
}

async function geocodificar(endereco) {
  for (const tentativa of variacoes(endereco)) {
    const comCidade = /s[ãa]o paulo/i.test(tentativa) ? tentativa : `${tentativa}, São Paulo`;
    const consulta = /brasil|brazil/i.test(comCidade) ? comCidade : `${comCidade}, Brasil`;

    const url =
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(consulta)}` +
      `&format=json&limit=5&countrycodes=br&addressdetails=1&viewbox=${CAIXA_SP}&bounded=1`;

    try {
      await esperarIntervalo();

      const resposta = await fetch(url, {
        headers: {
          "User-Agent": IDENTIFICACAO,
          "Accept-Language": "pt-BR"
        },
      });

      if (!resposta.ok) {
        console.error(`  ❌ HTTP ${resposta.status} para "${tentativa}"`);
        continue;
      }

      const candidatos = await resposta.json();

      for (const candidato of candidatos) {
        const lat = parseFloat(candidato.lat);
        const lng = parseFloat(candidato.lon);

        if (!estaEmSaoPaulo(lat, lng)) continue;

        const dados = candidato.address ?? {};
        return {
          lat,
          lng,
          bairro: dados.suburb || dados.city_district || dados.neighbourhood || dados.quarter || "",
        };
      }
    } catch (err) {
      console.error(`  ⚠️  Erro ao geocodificar "${tentativa}":`, err.message);
    }
  }

  return null;
}

async function main() {
  console.log("🗺️  Geocodificando Conselhos Tutelares...\n");

  const caminhoEntrada = path.join(__dirname, "conselhos-tutelares.json");
  const dados = JSON.parse(fs.readFileSync(caminhoEntrada, "utf-8"));

  const resultado = [];
  let sucesso = 0;
  let falha = 0;

  for (let i = 0; i < dados.length; i++) {
    const item = dados[i];
    process.stdout.write(`[${i + 1}/${dados.length}] ${item.sigla}... `);

    const coordenada = await geocodificar(item.endereco);

    if (coordenada) {
      resultado.push({
        sigla: item.sigla,
        nome: item.nome,
        area: item.area,
        endereco: item.endereco,
        telefone: item.telefone,
        lat: coordenada.lat,
        lng: coordenada.lng,
        bairro: coordenada.bairro,
        data: new Date().toLocaleDateString("pt-BR"),
      });
      console.log(`✅ ${coordenada.lat.toFixed(4)}, ${coordenada.lng.toFixed(4)}`);
      sucesso++;
    } else {
      console.log(`❌ Não encontrado`);
      falha++;
    }
  }

  const caminhoSaida = path.join(__dirname, "conselhos-tutelares-pronto.json");
  fs.writeFileSync(caminhoSaida, JSON.stringify(resultado, null, 2), "utf-8");

  console.log(`\n✨ Pronto! ${caminhoSaida}`);
  console.log(`   ✅ ${sucesso} geocodificados`);
  console.log(`   ❌ ${falha} não encontrados\n`);

  if (falha > 0) {
    console.log("Os que falharam podem ser editados manualmente no arquivo de saída.");
    console.log("Basta adicionar 'lat' e 'lng' com valores como: -23.5505, -46.6333\n");
  }

  console.log("Próximo passo: importar no Firestore usando o script de batch import.");
}

main().catch(console.error);
