# Teia SP

Guia colaborativo de dispositivos de saúde, assistência social e serviços públicos da cidade de
São Paulo — [teiasp.com.br](https://teiasp.com.br).

Projeto idealizado e desenvolvido pelas psicólogas Helena Ricioli Vaz Gonçalves (CRP 06/229680) e
Bárbara Albertini Silva (CRP 06/213277). Logo e composição visual do cabeçalho: Lilla Cirenza
Lescher. Arte do corpo do site: [@mun_dopurpura](https://www.instagram.com/mun_dopurpura).

## Como rodar

```bash
npm install
npm run dev       # http://localhost:3000
```

Não é preciso configurar nada: as coleções públicas do Firestore são lidas direto, então o
ambiente local já sobe com os dados reais.

```bash
npm run build     # build de produção
npm test          # testes
npm run lint      # ESLint
```

## Como funciona

- **Next.js 16** (App Router, Cache Components) · **React 19** · **TypeScript** · **Tailwind 4**
- **Firebase**: Firestore como banco e Firebase Auth para a equipe
- **Leaflet + Supercluster** no mapa · **Tiptap** no editor do painel

As páginas públicas são renderizadas no servidor e revalidadas por tag: quando a equipe aprova ou
edita algo no painel, o cache cai e o site reflete a mudança em seguida. O painel usa Firestore em
tempo real.

### Estrutura

```
src/
  app/           rotas (público, /mapa, /sugerir, /admin)
  components/    interface, agrupada por área do site
  lib/
    dados/       leitura do Firestore com cache
    firebase/    sessão, tempo real e operações de moderação
    geo/         classificação por zona e distrito
  acoes/         Server Actions (sugestões, revalidação, auditoria)
  data/          polígonos de SP e textos institucionais
legacy/          a versão anterior do site, arquivo único, preservada
firestore.rules  regras de acesso ao banco
```

## Contribuindo com o conteúdo

Qualquer pessoa pode sugerir um dispositivo ou o endereço de uma unidade pelo próprio site, em
[/sugerir](https://teiasp.com.br/sugerir). Toda sugestão passa pela revisão da equipe antes de ser
publicada.
