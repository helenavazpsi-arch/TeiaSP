# ⚡ Adicionar 47 Conselhos Tutelares no Mapa — Guia Rápido

## 🎯 O que você precisa fazer

1. **Preencher coordenadas** no arquivo `scripts/conselhos-tutelares-PREENCHER.csv`
2. **Rodar um script** para importar no Firestore
3. **Pronto!** Site atualiza automaticamente

## 📋 Como Preencher as Coordenadas

### Opção A: Manual (rápido) — Google Maps

```
🔗 Abra: https://maps.google.com
🔍 Pesquisa: "R. Sete de Abril, 165, Centro, São Paulo"
📍 Clica no marker (pino)
📋 Copia: latitude, longitude (ex: -23.5505, -46.6333)
📝 Cola no CSV nas colunas lat, lng
```

Leva ~1-2 minutos por endereço, ou você pode colar vários de uma vez.

### Opção B: Automático (na sua máquina local)

Se quiser geocodificação automática, rode na sua máquina (não funciona no cloud):

```bash
cd seu-projeto-teiasp
node scripts/importar-conselhos.js
```

Isso gera `conselhos-tutelares-pronto.json` que você coloca no CSV.

## 🚀 Importar no Firestore

Depois que o CSV tiver latitudes e longitudes preenchidas:

```bash
npm run csv-import scripts/conselhos-tutelares-PREENCHER.csv
```

**Pronto!** O site atualiza sozinho.

## 📄 O que está pronto para você

```
scripts/
  ├─ conselhos-tutelares-PREENCHER.csv    ← Preencha as colunas lat/lng
  ├─ conselhos-tutelares.json             ← Dados sem coordenadas
  ├─ csv-para-firestore.js                ← Script para importar
  ├─ importar-conselhos.js                ← Geocodificação (local)
  ├─ firestore-batch-import.js            ← Batch import JSON (alternativa)
  └─ IMPORTAR.md                          ← Documentação completa
```

## 🔐 Credenciais Firestore

Configure antes de rodar o import:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/caminho/para/sua/chave-firebase.json"
export FIREBASE_PROJECT_ID="seu-project-id"
```

Ou adicione ao `.env.local`:
```
GOOGLE_APPLICATION_CREDENTIALS=/Users/seu-usuario/.firebase/teiasp-key.json
FIREBASE_PROJECT_ID=teiasp-prod
```

## ✅ Checklist

- [ ] Abra `scripts/conselhos-tutelares-PREENCHER.csv`
- [ ] Preencha lat/lng para os 47 endereços (Google Maps)
- [ ] Configure credenciais do Firebase
- [ ] Rode: `npm run csv-import scripts/conselhos-tutelares-PREENCHER.csv`
- [ ] Acesse o site e veja os novos pontos no mapa 🎉

## 🆘 Problemas?

**"Arquivo CSV vazio" ou "sem lat/lng"**
→ Verifique se preencheu todas as linhas no CSV

**"Erro de permissão Firestore"**
→ Checa se as credenciais estão corretas e se têm permissão de escrita em `pontos`

**"Coordenadas inválidas"**
→ Google Maps retorna: `-23.5505,-46.6333` — certifique-se que é um número

Mais detalhes: veja `scripts/IMPORTAR.md`
