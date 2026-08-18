# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

Teia SP (teiasp.com.br) — guia colaborativo de dispositivos de saúde, assistência social e
serviços públicos da cidade de São Paulo, mantido por duas psicólogas.

"Dispositivo" é o vocabulário do campo, não da tecnologia: um serviço, equipamento, programa ou
benefício da rede de cuidado. Alguns têm endereço (CAPS, CRAS, UBS), outros não (BPC, Bolsa
Família, SUS). Daí a separação central do modelo de dados: **dispositivo** responde "o que é isso",
**ponto** responde "onde tem".

## Comandos

```bash
npm run dev       # desenvolvimento em http://localhost:3000
npm run build     # build de produção (o que valida tipos e prerender)
npm test          # Vitest — funções puras de geografia, busca, texto e auditoria
npm run lint      # ESLint
npm run imagens   # regera as variantes AVIF/WebP das artes de fundo em public/img
npx vitest run src/lib/texto.test.ts    # um arquivo de teste só
```

O Firestore de produção é lido diretamente em desenvolvimento (leitura pública em `servicos` e
`pontos`), então `npm run dev` já mostra os dados reais sem nenhuma credencial.

## Estado da migração

O site era um único `index.html` de 1 MB com HTML, CSS, JS ES5, seis imagens em base64 e os
polígonos de São Paulo no mesmo arquivo. Ele está preservado em `legacy/index.html` — vale como
referência de comportamento quando houver dúvida sobre o que o site fazia.

A reescrita em Next.js está nas fases 0 a 6; falta a fase 7 (deploy no Firebase App Hosting e
cutover do domínio). O plano completo está em `/Users/dotnova/.claude/plans/sleepy-wiggling-moonbeam.md`.

## Arquitetura

### Dados

O Firestore é o mesmo do site antigo e **não foi migrado** — os nomes de campo continuam em
português. Coleções: `servicos` (~197), `pontos` (~3.914), `pendentes`, `lixeira`, `mensagens`.

- **Páginas públicas**: lidas no servidor com `use cache` + `cacheTag` (`src/lib/dados/`), o modelo
  de Cache Components do Next 16. A moderação chama `revalidarConteudo()` (`src/acoes/revalidar.ts`)
  para derrubar a tag e o site refletir a mudança na hora.
- **Painel**: `onSnapshot` em tempo real (`src/lib/firebase/tempo-real.ts`), e só nas coleções da
  aba aberta. No site antigo todo visitante abria cinco escutas, incluindo a de 3.914 pontos.
- **Escrita**: sugestões do público passam por Server Actions com zod (`src/acoes/sugestoes.ts`);
  as ações da equipe saem do navegador autenticado (`src/lib/firebase/moderacao.ts`). Quem autoriza,
  nos dois casos, são as regras em `firestore.rules`.

### Rotas

| Rota | O que era antes |
|---|---|
| `/` | aba Buscar |
| `/dispositivo/[slug]` + `@modal/(.)dispositivo/[slug]` | modal sem URL própria |
| `/mapa` | aba Mapa |
| `/sugerir` | aba Sugestões |
| `/admin`, `/admin/auditoria` | aba Área restrita e o modal de auditoria |

O slug vem da sigla (`src/lib/slug.ts`); em caso de sigla repetida, quem tem o menor id fica com o
slug limpo, para não trocar o endereço de um link já compartilhado.

### Armadilhas conhecidas

Estas custaram caro para descobrir — leia antes de mexer nas áreas correspondentes.

1. **Leaflet e `<Activity>`**. Com `cacheComponents: true`, o Next mantém rotas montadas em modo
   oculto ao navegar: efeitos são limpos, estado sobrevive. O `MapContainer` do react-leaflet
   destrói o mapa no cleanup mas guarda a instância morta em estado — voltar ao mapa estourava
   `Cannot read properties of undefined (reading 'appendChild')`. Por isso `src/components/mapa/mapa-view.tsx`
   controla o Leaflet direto, criando e destruindo dentro do mesmo efeito. Não reintroduza
   react-leaflet.
2. **Zona pela coordenada, nunca pelo texto**. `normalizar()` remove apóstrofo, então "Rua
   Sant'Ana" (Zona Sul) casa com o bairro Santana (Zona Norte). O filtro de zona usa
   `zonaDoPonto()` e ponto final. Há teste cobrindo isso.
3. **`usePathname` e prerender**. Com Cache Components, ler a rota atual durante o prerender bloqueia
   a página. `src/components/layout/navegacao-base.tsx` tem o visual sem hooks; `navegacao.tsx`
   só acrescenta o destaque, dentro de `<Suspense>`.
4. **Sanitização no servidor**. `desc` pode ter vindo de sugestão pública e ser aprovada sem edição.
   `sanitizar()` (`src/lib/texto.ts`) escapa tudo e devolve só negrito/itálico/sublinhado — nunca
   troque por uma limpeza que tente remover o que é perigoso.
5. **Ações por id, nunca por índice**. Os botões do painel antigo passavam a posição na lista
   (`aprovar(3)`) e agiam no documento errado quando a lista mudava ao vivo.

### Geografia

`src/data/zonas.json` (5 zonas) e `distritos.json` (96 distritos) foram extraídos do HTML antigo.
`src/lib/geo/poligonos.ts` faz ray casting com caixas envolventes. A classificação roda no
servidor, uma vez por revalidação — no site antigo cada navegador refazia isso para 3.914 pontos a
cada mudança de filtro.

O geocoding (`src/lib/geocode.ts`) é server-only, com `User-Agent` identificando a aplicação e fila
de 1 req/s, como a política do Nominatim exige. Antes rodava no navegador de cada visitante.

## Convenções

- Código, nomes e comentários em português — inclusive nomes de função e variável.
- Cores e áreas temáticas: `src/lib/areas.ts` é a fonte única (chave gravada no Firestore, slug,
  cor do pino, par de cores do badge, ícone). No site antigo eram três objetos paralelos mais uma
  dúzia de classes CSS.
- Textos institucionais (créditos, "Sobre o projeto", contatos) em `src/data/conteudo.ts`.
- Tailwind 4 com tokens em `src/app/globals.css`; as cores da marca vieram do site atual.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
