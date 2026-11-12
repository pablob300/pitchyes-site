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

O site responde em `https://pitchyes.com.br`, ligado como Custom Domain no `wrangler.jsonc`
(`routes`, com `www.pitchyes.com.br` redirecionando em 301 pelo `next.config.ts`). A zona
`pitchyes.com.br` fica na mesma conta do Matheus e também abriga os outros serviços da empresa
(`api`, `app` e outros), então **mexa só nos registros do domínio raiz e do `www`**.

- **Endereço público:** `DEFAULT_SITE_URL` em `src/lib/site.ts`, que a variável `SITE_URL` pode
  sobrepor (por exemplo, num ambiente de teste).
- **Indexação:** liberada quando `SITE_ENV=production` **e** o endereço não é `*.workers.dev`.
  O `SITE_ENV` vem do `vars` do `wrangler.jsonc`, e o `scripts/cf.mjs` o repassa também ao build:
  sem isso, as páginas estáticas saíam com `noindex` mesmo no domínio.
- **workers.dev:** continua ligado (`workers_dev: true`) para acesso técnico, com
  `X-Robots-Tag: noindex, nofollow` (`next.config.ts`).
- **Deploy:** `npm run deploy` roda `scripts/cf.mjs`, que fixa a conta pelo `account_id` do
  `wrangler.jsonc`. O build é local; não há build no painel da Cloudflare.

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

## Painel: Análise › Search Console e aviso automático de indexação

`/admin/analise/search-console` lista todas as URLs dos três sitemaps com o status no Google
(Inspeção de URL), o último rastreamento e a última alteração do site. **Verde** = indexada e
rastreada depois da última alteração; **vermelho** = rastreamento anterior à alteração ou fora do
índice (com o motivo do Google); **cinza** = ainda não verificada. Código em
`src/lib/admin/search-console/`; tabelas `site_changes`, `gsc_inspections`, `gsc_pings` e
`gsc_route_dates` (migração `0010`).

- **Rotina automática:** publicar conteúdo, salvar metadados, salvar ou apagar artigo e mudar uma
  landing page chamam `recordChange()` (`changes.ts`). Ela grava a mudança e, em segundo plano,
  reenvia ao Google **só o sitemap daquela URL** e avisa o **IndexNow** (Bing, Yandex, Seznam, Naver;
  o índice do Bing alimenta ChatGPT Search e Copilot). O mesmo sitemap não é reenviado duas vezes
  em 60 s. Mudança no código: `npm run deploy` termina com `scripts/search-console-ping.mjs`, que
  compara o `updated` de `routes.ts` com o deploy anterior e avisa o que mudou.
- **"Indexar agora":** o Google não tem API para pedir indexação de página comum (a Indexing API é só
  para vagas e transmissões ao vivo). O botão reenvia o sitemap, avisa o IndexNow e abre a página na
  Inspeção de URL do Search Console, onde "Solicitar indexação" faz o pedido manual.
- **Cota:** Inspeção de URL = 2.000 por dia e 600 por minuto por propriedade.
- **Configuração (uma vez):**
  1. Google Cloud (mesmo projeto do PageSpeed): ative a **Google Search Console API**; em *IAM › Contas
     de serviço* crie uma conta e baixe uma chave **JSON**.
  2. Search Console › propriedade `https://pitchyes.com.br/` › Configurações › Usuários e permissões:
     adicione o e-mail da conta de serviço (`…@….iam.gserviceaccount.com`) como **Proprietário**.
  3. `npx wrangler secret put GSC_SERVICE_ACCOUNT_JSON` e cole o JSON inteiro. (A chave de API do Google
     não serve aqui: o Search Console exige um usuário da propriedade.)
  4. Já gravados: `INDEXNOW_KEY` (publicada em `/indexnow-key.txt`) e `DEPLOY_PING_TOKEN` (também no
     `.dev.vars` local, lido pelo script de deploy). `GSC_SITE_URL` troca a propriedade, se precisar.
  5. Bing Webmaster Tools: importe o site pelo Search Console.
