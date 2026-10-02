# Importação em Lote de Pontos

## O que são esses scripts?

Workflow automatizado para adicionar endereços novos no mapa (coleção `pontos` do Firestore) sem need de estar clicando em formulários. Assim como você fazia antes pelo arquivo do computador.

## Estrutura de dados

Um **ponto** no mapa precisa de:

```json
{
  "sigla": "CT Centro",
  "nome": "Conselho Tutelar Centro",
  "area": "assistencia-social",
  "endereco": "R. Sete de Abril, 165 - Centro, São Paulo, SP 01043-020",
  "telefone": "(11) 3397-8900",
  "lat": -23.5505,
  "lng": -46.6333,
  "data": "01/10/2026"
}
```

Os campos obrigatórios para o mapa são `lat` e `lng` (coordenadas). O resto vai melhorando conforme tem informação.

## Passo a passo

### 1️⃣ Preparar os dados com coordenadas

Abra o arquivo `scripts/conselhos-tutelares-PREENCHER.csv` em um editor de texto ou planilha.

Você vai ver colunas:
- `sigla` ✅ já preenchido
- `nome` ✅ já preenchido  
- `endereco` ✅ já preenchido
- `telefone` ✅ já preenchido
- `area` ✅ já preenchido
- `lat` ❌ **vazio — preencha!**
- `lng` ❌ **vazio — preencha!**

### 2️⃣ Preencher coordenadas (lat/lng)

**Método rápido via Google Maps:**

1. Abre [Google Maps](https://maps.google.com)
2. Pesquisa o endereço (ex: "R. Sete de Abril, 165, Centro, São Paulo")
3. Clica no marker (pino) no mapa
4. Embaixo vai aparecer as coordenadas (ex: `-23.5505, -46.6333`)
5. Copia latitude e longitude, cola no CSV

Exemplo:
```
CT Centro,Conselho Tutelar Centro,assistencia-social,"R. Sete de Abril, 165 - Centro...",,(11) 3397-8900,-23.5505,-46.6333
```

**Alternativa: rodar geocodificação localmente**

Se tiver Python/Node instalado na sua máquina:

```bash
# Na sua máquina local (não aqui no cloud)
cd seu-projeto-teiasp
node scripts/importar-conselhos.js
```

Isso vai gerar `conselhos-tutelares-pronto.json` com as coordenadas já preenchidas, que você coloca de volta no repositório.

### 3️⃣ Importar no Firestore

Depois que o CSV tiver lat/lng preenchidos:

```bash
node scripts/csv-para-firestore.js scripts/conselhos-tutelares-PREENCHER.csv
```

Isso vai:
- Conectar ao Firestore usando as credenciais locais
- Validar que todos têm coordenadas
- Adicionar cada ponto na coleção `pontos`
- Invalidar o cache do site para refletir as mudanças

O site atualizará automaticamente, sem need de aprovação manual.

## Credenciais

O script de Firestore precisa de:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/caminho/para/sua/chave-firebase.json"
export FIREBASE_PROJECT_ID="seu-project-id"
```

Ou configure no `.env.local`:

```
GOOGLE_APPLICATION_CREDENTIALS=/Users/seu-usuario/.firebase/teiasp-key.json
FIREBASE_PROJECT_ID=teiasp-prod
```

## Troubleshooting

### "Fetch failed" ou erro de rede na geocodificação

- Verifica se você está conectado à internet
- Nominatim às vezes fica sobrecarregado — tenta novamente em 5 minutos

### Alguns endereços não geocodificaram

Nominatim é bom mas às vezes não acha endereço com número da rua errado. Opções:

1. **Editar no arquivo** antes de rodar `npm run geocode` novamente
2. **Geocodificar manualmente**: Abre Google Maps, acha o lugar, copia lat/lng
3. **Deixar como pendente**: Importa sem lat/lng, depois adiciona coordenadas manualmente no painel

### Erro de permissão no Firestore

- Checa se as credenciais estão corretas
- Verifica as regras do Firestore (`firestore.rules`) — seu acesso precisa incluir escrita em `pontos`

### Quer só testar sem importar?

Edita `scripts/firestore-batch-import.js` linha ~60 e troca `batch.set()` por um `console.log()`:

```javascript
console.log(`  ${ponto.sigla} -> [${ponto.lat}, ${ponto.lng}]`);
// batch.set(...) // comentado
```

Assim imprime tudo sem salvar.

## Referências

- Estrutura: `src/lib/tipos.ts` (interface `Ponto`)
- Áreas válidas: `src/lib/areas.ts`
- Geocodificação: `src/lib/geocode.ts` (a mesma lógica)
- Dados do mapa: `src/lib/dados/pontos.ts`
