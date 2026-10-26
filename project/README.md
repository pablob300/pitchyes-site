# PitchYes — site

Next.js 16 servido pelo Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare), com cache incremental em R2.

```bash
npm run dev       # desenvolvimento local
npm run preview   # build OpenNext + runtime do Workers local (porta 8787)
npm run deploy    # build + deploy para produção
```

## Páginas

- `src/lib/routes.ts` é a fonte única do mapa do site: menu, rodapé, páginas internas e `sitemap-paginas.xml` saem dali.
- A home (`src/app/page.tsx`) segue o wireframe em `docs/`; os textos ficam em `src/components/home/content.ts`.
- Páginas ainda sem conteúdo são geradas por `src/app/[...slug]/page.tsx` (header, footer e headline com o nome da página, `noindex`, fora do sitemap).
  Para construir uma delas: crie `src/app/<caminho>/page.tsx` (tem prioridade sobre a rota coringa) e marque `placeholder: false` em `routes.ts`.
- Visual: sempre pelos tokens e componentes de `../System`. Componente novo aqui → `.html` de referência em `System/components` + entrada no `style-guide.html`.

## Blog

Blog próprio, sem WordPress: artigos, categorias, tags, autores, versões, mídia e 301 no D1
(`migrations/0008_blog.sql`), imagens no R2 (servidas em `/midia/blog/...`, com variantes `?w=`).
Editado no painel em **Blog › Novo Artigo / Artigos / Categorias / Tags** (editor visual + HTML).

- **URLs** (`src/lib/blog.ts`): `/blog`, `/blog/pagina/N`, `/blog/[slug]`, `/blog/categorias`,
  `/blog/categoria/[slug]`, `/blog/tag/[slug]`, `/blog/autor/[slug]` (todas paginadas) e o RSS em `/feed.xml`.
- **Código:** leitura pública em `src/lib/blog.ts`; painel em `src/lib/blog/admin.ts`; HTML dos
  artigos (sanitização, âncoras, imagens) em `src/lib/blog/html.ts`; metadados e schema em
  `src/lib/blog/schema.ts`; checklist de SEO (editor e API) em `src/lib/blog/checks.ts`.
- **SEO:** `BlogPosting` + `Person` + `BreadcrumbList` nos artigos, `CollectionPage` + `ItemList`
  nas listagens, `FAQPage` quando o artigo tem bloco de perguntas. Tag com menos de 5 artigos e
  páginas 2+ de tag/autor ficam `noindex, follow` e fora do sitemap.
- **Trocar o slug** de um artigo publicado (ou fundir/renomear categoria e tag) grava 301 sozinho.
- **Importação** do blog antigo: `node scripts/blog-import.mjs` (só relatório) e `--aplicar`
  (grava). Decisões editoriais em `scripts/blog-import/mapa.json`; links inseridos em `links.json`.
- O D1 tem `"remote": true` no `wrangler.jsonc`: o build pré-gera o blog com os dados reais
  (e o `next dev` local lê e grava no banco de produção).

`/sitemap.xml` é um índice que aponta para `sitemap-paginas.xml` e `sitemap-blog.xml`.

## Domínio

O domínio público vem da variável `SITE_URL` (ver `src/lib/site.ts`). Sem ela, o site usa
`https://pitchyes-site.borges-filho.workers.dev`.

A indexação por buscadores só é liberada quando `SITE_ENV=production` **e** o domínio não é
`*.workers.dev` — antes disso, `robots.txt` e as meta tags bloqueiam tudo.

Para trocar para o domínio definitivo (ex.: `pitchyes.com.br`):

1. Workers & Pages → `pitchyes-site` → **Settings → Domains & Routes** → adicionar Custom Domain.
2. **Settings → Variables and Secrets** → `SITE_URL = https://pitchyes.com.br` (vale na hora para `robots.txt`).
3. **Settings → Build → Variables** → mesma `SITE_URL`, e disparar um novo build (as meta tags e
   URLs canônicas das páginas estáticas são geradas no build).

`keep_vars: true` no `wrangler.jsonc` garante que o deploy não apague variáveis definidas no painel.

## Painel: Análise › PageSpeed

`/admin/analise/pagespeed` roda o [PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/get-started)
(mobile e desktop em paralelo) para qualquer página do próprio site, guarda o histórico no D1
(`pagespeed_runs`, migração `0007`) e monta um plano de ação em português, com o que mexer
neste projeto para cada auditoria. O relatório sai na tela e em Markdown ("Copiar relatório").

- **Chave:** segredo do Worker, nunca no código: `npx wrangler secret put PAGESPEED_API_KEY`.
  No Google Cloud, deixe a chave restrita à *PageSpeed Insights API*.
- **Só páginas do site:** a rota `POST /api/admin/pagespeed` recusa URL de outro domínio.
- **Textos:** o Google devolve o Lighthouse em inglês. Título e "o que fazer" de cada auditoria
  ficam em `src/lib/admin/pagespeed/guide.ts`; auditoria nova que aparecer sem tradução ganha
  uma entrada lá.
- **Menu:** `src/lib/admin/nav.ts` aceita seções com submenu (`children`); Análise › SEO entra
  como mais um filho de "Análise".
