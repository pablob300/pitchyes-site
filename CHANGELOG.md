# Changelog: site PitchYes

Histórico do site institucional da PitchYes (Next.js 16 no Cloudflare Workers).
Ambiente de homologação: https://pitchyes-site.borges-filho.workers.dev

Cada entrada traz o commit e a versão publicada no Cloudflare (`Version ID`, visível em
Workers & Pages → `pitchyes-site` → Deployments).

---

## 2026-10-25: Nova meta description da home

Commit `b6af186` · Cloudflare `ccd1e058`

- Descrição da home (152 caracteres): "IA de voz que atende, qualifica, agenda, transfere e liga para
  clínicas, imobiliárias, concessionárias, seguradoras, faculdades, corretoras e franquias."
  Trocada no padrão do código (`SITE_DESCRIPTION`, que também abre o `/llms.txt` e o manifest)
  e no `page_meta` do banco, que é o que o painel mostra e o site serve.

Auditoria no ar: 16/16 páginas sem problemas.

---

## 2026-10-25: Novos textos, menu com Planos e endereço novo

Commit `e7e5498` · Cloudflare `43768a0a`

- **Menu:** Soluções · Clientes · Planos · Integrações · Blog · Contato (sem o submenu Recursos;
  Novidades segue no rodapé). **Preços virou Planos:** `/precos` → `/planos` com 301
  (`next.config.ts`), título "Planos e preços"; a linha de `page_meta` do banco foi movida junto.
- **Home:** título "IA de voz para:" com as palavras Clínicas, Imobiliárias, Concessionárias,
  Seguradoras, Faculdades, Corretoras, Franquias e Telecomunicação; linha de apoio "Atende,
  qualifica, agenda, transfere e liga."; "Toda ligação importa." com texto novo; latência
  PitchYes 800 ms × mercado 1.620 ms; "Clientes reais. Resultados reais." com texto novo; faixa
  final "Sua IA de voz sob medida para sua empresa." O banco só sobrescreve depoimentos e FAQ
  da home, então tudo isso saiu do código; o editor mostra os novos textos como padrão.
- **Soluções:** título e texto novos; "Três frentes, com agentes inteligentes." em 3 colunas
  (Ligação Ativa, Receptiva e Operacional — esta ainda sem página própria).
- **Clientes:** título e texto novos; botão "Conheça quem já usa a PitchYes" desce até a parede
  de logos (`#clientes`; bloco de conteúdo agora aceita `id`); "O que essas operações têm em
  comum." reescrito.
- **Endereço:** Av. T-7, 371 - 20º andar - St. Oeste, Goiânia - GO, 74140-110, agora em
  `company.address.full` e lido por rodapé, JSON-LD, /contato, /privacidade, /sobre e /llms.txt.
- `/llms.txt` com os novos segmentos e ligações operacionais; datas de revisão das 7 páginas
  em `routes.ts` e `page_meta`.
- **Rotina nova no `CLAUDE.md`:** todo conteúdo criado, alterado ou apagado passa pela
  checagem do Page Editor (sobreposição no D1, schema e `max` dos campos, `page_meta`, 301, datas).

Auditoria no ar: 16/16 páginas sem problemas; `/` e `/planos` estáticas; zero `data-edit`.

**Pendências:** TODO(produto) os cards do player seguem Saúde,
Seguros, Finanças, Imóveis e Atendimento; TODO(conteúdo) "resolução de 100% dos chamados na
primeira tentativa" (Soluções) precisa de fonte antes do domínio definitivo (SEO.md §1.5).

---

## 2026-10-25: Plano de ação do PageSpeed aplicado na home

Commit `4e2d52a` · Cloudflare `3b91fcad`

Medido pela API do PageSpeed (8 rodadas, 4 mobile e 4 desktop) contra a análise da manhã:

| | Antes (mobile · desktop) | Depois (mobile · desktop) |
|---|---|---|
| Desempenho | 96 · 97 | 96–100 (típico 99) · 98–100 (típico 99) |
| Acessibilidade | 97 · 97 | 100 · 100 (8 de 8 rodadas) |
| Boas práticas | 100 · 100 | 100 · 100 |
| SEO | 69 · 69 | 69 · 69 (`noindex` proposital da homologação) |
| LCP | 2,5 s · 531 ms | 1,4–2,0 s · 350–500 ms |
| Speed Index | 3,5 s · 1,7 s | 2,8–3,5 s · 0,9–1,5 s |

- **Topo da home pintado de cara.** Título, texto e botão do hero saíram do `data-reveal`: o
  `<h1>` é o LCP e esperava ~2 s o GSAP hidratar. O player ao lado e as seções abaixo
  continuam com a revelação. Exceção registrada no `System/README.md` (Motion).
- **Contraste.** `--color-text-muted` 50% → 62% e `--color-text-dim` 55% → 66% de opacidade
  (5,1:1 no branco, 5,0:1 no creme). Botão sólido usa o novo `--color-accent-primary-strong`
  (`#6961d1`, texto branco a 5,0:1, antes 4,0:1); o violeta da marca segue nos demais usos.
  Tokens idênticos em `System/tokens` e `project/src/styles/tokens`; referências do System atualizadas.
- **Palavras que rolam** ficam opacas enquanto deslizam (o recorte da linha as esconde): o
  validador pegava a palavra no meio do fade e acusava contraste 1,06:1.
- **Cache.** `/brand`, `/images`, `/logos` e `/audio` com 1 ano e `immutable`. Isso também
  resolve `/_next/image`, que o OpenNext só entrega com cache quando a origem é `immutable`
  (antes saía sem `Cache-Control`). **Regra nova:** arquivo alterado ganha nome novo.
- **Nome acessível.** Cards do player sem `aria-label` (nome vem do texto visível + ação
  oculta); selo do Reclame Aqui com "Verificada por" no rótulo.
- **Imagens:** tamanho 320 em `images.imageSizes` (miniaturas dos depoimentos no desktop).
  **JS:** `browserslist` moderno no `package.json`.
- **Testado e descartado:** `experimental.inlineCss`. Repete o CSS dentro dos dados do React,
  a home foi de 23 KB para 71 KB (gzip) e a nota caiu (98 contra 99). Anotado no `next.config.ts`.

Auditoria no ar: 16/16 páginas sem problemas; `/` estática; zero `data-edit`.

**Pendências:** ainda aparecem "JavaScript não usado" (é o React e o GSAP, carregados em toda
página), "JavaScript antigo" (vem do próprio Next, o `browserslist` não removeu) e "CSS que
bloqueia a renderização" (~19 KB); juntos valem ~1 ponto e exigem mudança maior.

---

## 2026-10-25: "copy in raw" no plano de ação do PageSpeed

Commit `7079f32` · Cloudflare `e229e6c8`

- Botão discreto **copy in raw** ao lado de "Plano de ação" no relatório do PageSpeed. Copia
  em texto puro (sem Markdown) só as melhorias pendentes, sem o que já passa nem o que é
  esperado na homologação, escritas como instruções para o desenvolvedor ou a IA que vai
  ajustar o código: objetivo e notas atuais, regras do projeto a seguir, cada correção com o
  que fazer e onde está o problema, e como validar no fim (`tsc`, lint, deploy, auditoria,
  nova análise). Gerado por `toRawInstructions()` em `lib/admin/pagespeed/report.ts`.
- No build, o D1 respondeu com erro interno ao ler metadados de `/sobre`; o código caiu no
  padrão e a revalidação de 1 minuto corrige.

---

## 2026-10-25: Painel ganha Análise › PageSpeed

Commit `9e56810` · Cloudflare `517aaf62`

- **Menu do painel com submenu.** `lib/admin/nav.ts` aceita seções com `children`; "Análise"
  abre com "PageSpeed", e "SEO" entra depois como mais um filho.
- **PageSpeed Insights no painel** (`/admin/analise/pagespeed`): escolhe-se uma página do site e
  o servidor roda mobile e desktop em paralelo (15–40 s). A chave fica no segredo do Worker
  `PAGESPEED_API_KEY`, nunca no navegador nem no Git; a rota recusa URL de outro domínio e
  limita 30 análises por hora por usuário. Cada análise fica registrada na auditoria do painel.
- **Relatório:** 4 notas por estratégia com a variação desde a análise anterior, métricas de
  laboratório contra as metas do Google, dados reais do CrUX quando houver e um **plano de ação
  ordenado por impacto**: prioridade, pontos estimados, o que fazer neste projeto, por que
  importa e os arquivos/elementos afetados. Sai também em Markdown ("Copiar relatório" / ".md").
- **Português:** o Google ignora o idioma pedido e devolve o Lighthouse em inglês; títulos e
  orientações de ~100 auditorias estão em `lib/admin/pagespeed/guide.ts`. Sem IA: nada é inventado.
- **Banco:** tabela `pagespeed_runs` (migração `0007`). As migrações anteriores foram aplicadas
  direto e o D1 não tem o histórico delas, então `wrangler d1 migrations apply` falha na 0003;
  a 0007 foi aplicada com `wrangler d1 execute --file`.

Primeira análise da home (homologação): mobile 96 · 97 · 100 · 69, desktop 97 · 97 · 100 · 69
(desempenho, acessibilidade, boas práticas, SEO; o SEO perde pelo `noindex` proposital).
Auditoria (`seo-audit.mjs`) no ar: 16/16 páginas sem problemas; `/` continua estática, zero
`data-edit` no HTML público.

**Pendências:** restringir a chave no Google Cloud à PageSpeed Insights API (ela foi colada no
chat; se possível, gerar uma nova); itens do plano da home: CSS que bloqueia a renderização,
JavaScript não usado e antigo, contraste do botão violeta (4,0:1) e dos textos cinza do rodapé.

---

## 2026-09-29: Rastreamento bloqueado de novo no endereço de homologação

Commit `7d8f865` · Cloudflare `b3e8f3b1`

Testes do Search Console encerrados. Desfaz a liberação temporária de 21/09:

- **`/robots.txt` voltou a `Disallow: /`** e as 16 páginas voltaram a `noindex, nofollow`;
  o `/llms.txt` voltou a avisar que é homologação.
- **A chave saiu do código**: `ROBOTS_MODE` e `isTestCrawlMode()` foram removidos. Indexação
  agora depende só de `SITE_ENV=production` num domínio que não seja `workers.dev`.
- No build, o D1 respondeu com erro interno da Cloudflare ao ler o Page Editor de `/contato`
  e `/clientes/cases`; o código caiu no padrão e a revalidação de 1 minuto corrigiu as duas.

Auditoria no ar: 16/16 páginas sem problemas.

---

## 2026-09-29: Cores da marca, player em anel, título animado e rodapé institucional

Commits `73bf238`, `3e57f07`, `1eb0680` · Cloudflare `cb2a6e12`

- **Cores da marca no design system.** O dourado e o laranja eram da bland.ai. Viraram
  `--color-accent-primary` (violeta `#776eed`) e `--color-accent-secondary` (menta
  `#54cfa8`), trocados no site, no painel, no e-mail de senha e em todo o `System/`.
  O menta dá só 1,9:1 sobre branco, então texto em destaque usa `--color-accent-secondary-ink`
  (`#178060`); erro de formulário passou a usar `--color-danger`.
- **Botão violeta com texto branco e borda branca de 1px**, que destaca o botão nos fundos
  escuros (faixa de CTA antes do rodapé). O contraste do texto fica em 4,0:1.
- **Player do topo virou um anel 3D de cards** "Ouça nosso agente de…" (Saúde, Seguros,
  Finanças, Imóveis, Atendimento): o card da frente toca o MP3; setas, pontos, arrastar/deslizar,
  trackpad e teclado giram o anel. O círculo é "metal líquido" nas cores da marca (GSAP,
  só `transform`/`opacity`), acelera enquanto toca e para fora da tela.
- **Título com palavras que rolam**: parte fixa em preto e, na linha de baixo, em cor,
  saúde → seguros → serviços financeiros → e muito mais (2s cada, a última 5s, troca de
  0,5s). As quatro palavras estão no HTML do servidor; no celular a linha encolhe via `cqi`
  para caber inteira, sem mudar de altura. Editáveis em "Palavras do título".
- **Latência:** a barra da média do mercado ficou vermelho suave (`--color-negative`,
  `#e0675b`), e as duas barras voltaram a ter texto escuro.
- **Rodapé:** endereço, telefone, e-mail e CNPJ; redes do site oficial (LinkedIn,
  Instagram `@pitchyesai`, YouTube, TikTok, Facebook) e o selo "Verificada por Reclame
  Aqui" com a arte oficial hospedada aqui (sem o script deles). Links externos abrem em
  aba nova. Os dados moram em `lib/company.ts`, que também alimenta o JSON-LD da
  Organization (`sameAs`, `contactPoint`, endereço) e o `/llms.txt`.

Auditoria (`seo-audit.mjs`) no ar: 16/16 páginas sem problemas; a home agora declara
Organization com PostalAddress e ContactPoint. Home continua estática com revalidação de
1 minuto e com zero `data-edit` no HTML público.

**Pendências:** TODO(produto) confirmar os setores dos cards (o antigo "PitchYes" virou
"Atendimento") e trocar os cinco MP3, que ainda são a mesma locução; confirmar qual
Instagram é o oficial (o JSON-LD do site atual aponta `@pitchyes`, o rodapé `@pitchyesai`).

---

## 2026-09-23: Editor visual de conteúdo — página inicial

Commits `e8039ba`, `168b125`, `600a999`, `0ff7797`, `087ffd0`, `197f3f6` · Cloudflare `41117c6d`

- **"Editar Conteúdo" saiu do "em construção"**, na página inicial. O botão abre a página
  de verdade dentro de um iframe: clicar em qualquer texto ou imagem abre a gaveta daquele
  bloco à direita, com os campos dele. Salvar grava um **rascunho que só o painel enxerga**;
  **PUBLICAR** manda para o ar e o site mostra na hora, sem deploy.
- **Histórico** discreto ao lado do Publicar: data, hora e nome de quem publicou, com
  "restaurar" trazendo a versão de volta **para o rascunho** — voltar atrás continua passando
  pelo botão Publicar.
- **Listas viraram conteúdo de verdade**: dá para adicionar, remover e reordenar Shorts do
  YouTube (colar o endereço preenche o código do vídeo), perguntas da FAQ, casos de uso,
  etapas da implantação, certificações e logos de clientes.
- **Seções podem ser reordenadas e ocultadas.** Ocultar **remove a seção do HTML**, nunca
  a esconde por CSS — `display:none` tira o texto do que o robô lê. O topo é fixo: é onde
  mora o único `<h1>` da página.
- **Parágrafos aceitam `**negrito**`, `*itálico*` e `[texto](/caminho)`**, guardados nessa
  sintaxe e convertidos em elementos na renderização. Não existe HTML vindo do painel em
  lugar nenhum, então não há o que sanitizar. O JSON-LD recebe o texto sem as marcas.
- **O `/llms.txt` parou de poder divergir**: latência, total de ligações, certificações e
  prazo de implantação passaram a sair do conteúdo publicado. A prosa e o que não existe
  como campo (CNPJ, endereço, planos) continuam escritos à mão.
- **Selo "Editada" e "voltar ao padrão do código" por bloco.** Assim que uma seção ganha
  texto editado pelo painel, ela para de receber melhorias escritas no código — o selo
  avisa e o botão desfaz, devolvendo o bloco ao arquivo de conteúdo.
- **A faixa de CTA e a parede de logos** são conteúdo do site inteiro (`/_site`): editá-las
  muda todas as páginas, e a gaveta avisa isso. Os logos também alimentam `/clientes`.

**Como funciona por dentro.** O conteúdo publicado mora no D1 (`page_content`,
`page_content_versions`, migração `0006`) como **sobreposição esparsa**: o padrão continua
nos arquivos de código, e o banco só guarda o que alguém mudou — objeto mescla por chave,
lista substitui inteira. Toda fusão é conferida contra o formato, e **seção inválida volta
sozinha ao padrão do código**, sem derrubar a página.

A pré-visualização do rascunho é uma rota nova, `/editor`, **dinâmica e protegida**
(entrou no matcher do `proxy.ts` e no `robots.txt` no mesmo commit — fora deles seria uma
URL pública servindo conteúdo não publicado). Ela renderiza **os mesmos componentes** do
site, então o editor mostra o site, e não uma imitação. A home pública continua estática
com revalidação de 1 minuto: ela nunca lê cookie, que é o que a tiraria do cache.

**Sem custo para quem visita.** O modo editor só acrescenta ATRIBUTO (`data-edit`), nunca
elemento — o HTML público tem zero ocorrências dele. O markup renderizado da home saiu
**byte a byte idêntico** ao de antes da refatoração (53.654 bytes), e o peso total variou
+0,12%, porque o texto saiu do bundle JavaScript e entrou no payload do servidor.

**Três correções que apareceram no caminho:** `/api/admin/midia` não conferia a origem do
pedido, como todo o resto do painel faz; a auditoria gravava `usuario.editado` para
qualquer coisa, o que deixava a trilha ilegível; e o cache de `/midia` era de uma semana,
sendo que a chave carrega um UUID e nunca devolve outra imagem.

**Testado no ar:** `/editor` e `/admin/paginas/editar` deslogados redirecionam para o
login, a API responde 401 sem sessão, `/editor` está no `Disallow` do robots.txt e responde
com `frame-ancestors 'self'`, a auditoria de SEO passa em 16/16 páginas, e a home publicada
tem 1.148 palavras, `FAQPage`, `VideoObject` e zero `data-edit`.

## 2026-09-22: Painel — seção Newsletter, separada dos leads

Commit `638163b` · Cloudflare `5acc13fa`

- **Novo menu "Newsletter"** na barra lateral, logo abaixo de "Central de leads"
  (`/admin/newsletter`): a lista de quem assinou pelo rodapé do site, com **e-mail, data e hora**
  de cada cadastro, no fuso de Brasília.
- **Filtro por período** na URL, paginação de 50 em 50 e **exportação em CSV** do que estiver
  filtrado — sem filtro, a lista inteira. O botão diz qual dos dois vai acontecer.
- **As assinaturas saíram da Central de leads.** Elas gravavam na mesma tabela `leads` e
  apareciam misturadas com os contatos do comercial. Agora têm tabela própria
  (`newsletter`, migração `0005_newsletter.sql`), e os registros antigos foram movidos: a
  Central de leads não mostra mais nenhum, nem na listagem, nem na contagem, nem na exportação,
  e "Newsletter" sumiu do filtro por formulário de lá.
- **Cada formulário declara onde grava** (`storage: "leads" | "newsletter"` em `lib/leads.ts`),
  então a rota pública `/api/leads` continua sendo a porta única de entrada de qualquer
  formulário do site — quem decide o destino é a definição do formulário, não um `if` espalhado.
- **E-mail é único**: assinar duas vezes não cria linha nova nem devolve erro para quem assinou;
  a data que fica é a da primeira vez.

**Testado no ar:** uma assinatura nova entrou, a repetição não duplicou (2 assinaturas, não 3),
e-mail inválido devolve 422 com a mensagem do campo, `leads` ficou com zero registros de
newsletter, e tanto `/admin/newsletter` quanto a exportação exigem sessão.

## 2026-09-21: Texto alternativo em todas as imagens

Commit `8605839` · Cloudflare `90e1866d`

- **As 73 imagens do site passaram a ter `alt` com texto.** Antes quatro lugares usavam
  `alt=""`: a parede de logos de /clientes, a cópia decorativa da faixa de logos da home, as
  capas dos depoimentos em vídeo e a prévia da imagem social no painel.
- **Logo de cliente leva o nome da empresa** ("Logo da Sittax"); capa de depoimento descreve o
  vídeo ("Depoimento em vídeo da Paybem sobre a PitchYes").
- **A regra mudou no `SEO.md` (item 7)**: `alt=""` não passa mais, nem em imagem decorativa —
  ele some do leitor de tela e do buscador. **A auditoria passou a recusar** página com imagem
  sem `alt` ou com `alt` vazio, então a regra se mantém sozinha daqui para frente.

**Conferido no ar:** 73 imagens, nenhuma sem `alt` e nenhuma com `alt` vazio. Auditoria: 16/16.

## 2026-09-21: Rastreamento liberado no endereço de homologação (TEMPORÁRIO)

Commit `5dd2db5` · Cloudflare `5228f3aa`

A pedido do time, para testar Search Console e os robôs de IA antes do domínio definitivo.

- **`/robots.txt` passou a liberar tudo**, bloqueando só `/admin` e `/api`, e a publicar o
  endereço do sitemap. As páginas perderam o `noindex`: as 16 servem `index, follow`.
- **Controlado por uma variável**, `ROBOTS_MODE` (`teste` libera; qualquer outro valor volta ao
  padrão, que bloqueia tudo fora do domínio definitivo). Trocar no painel da Cloudflare vale na
  hora, sem deploy — ver o aviso em `src/lib/site.ts`.
- **A área interna segue fechada**: `/admin` continua exigindo sessão, com `noindex` no cabeçalho
  da resposta, e está no `Disallow`.

**Risco assumido, registrado aqui de propósito:** um endereço `workers.dev` no índice do Google
depois compete com `pitchyes.com.br` e dá trabalho para remover (ver SEO.md §6). Revertido em 29/09/2026 (ver a entrada daquele dia).

## 2026-09-21: Page Editor preenchido, com cartão social de cada página

Commit `010b29d` · Cloudflare `eb98ff31`

- **Os campos do editor abrem preenchidos** com o que está valendo no site: título,
  descrição, título e descrição para redes (iguais aos da busca, até serem mudados) e texto
  alternativo da imagem (o título da página). Antes abriam vazios, com o padrão só como sugestão.
- **A edição entra na página no mesmo instante** (`revalidatePath` ao salvar), em vez de esperar
  a revalidação de um minuto.
- **Prévia da imagem em tamanho grande**, na largura da gaveta, que também ficou mais larga.
- **Cada uma das 16 páginas ganhou o próprio cartão de compartilhamento**: um print da primeira
  dobra, em 1200×630, gerado da página publicada e guardado em `/midia/social/*.webp`
  (18 a 45 KB). Antes todas dividiam a mesma imagem padrão.

**Uma armadilha encontrada no caminho.** A primeira carga usou o título de `routes.ts`, que é o
nome curto do menu ("Preços"), enquanto a página serve o título de SEO do arquivo de conteúdo
("Preços e planos") — e a home não leva sufixo, porque o título dela já é o nome do site. Isso
teria trocado o título de várias páginas no ar. Corrigido antes de qualquer página mudar:

- `src/lib/page-defaults.ts` passou a ser a fonte única do "padrão de cada página", lendo os
  mesmos arquivos de conteúdo que as páginas usam. É o que o Page Editor mostra como padrão e o
  que "Restaurar padrão" devolve.
- `pageMetadata()` trata a home como título absoluto, sem o sufixo "| PitchYes".
- A marca "Editada" na lista só aparece quando o texto difere do padrão — a carga inicial de
  imagens e rótulos sociais não marca as páginas como alteradas.

**Conferido no ar:** os 16 títulos continuam exatamente como estavam, e as 16 páginas já servem
`og:image` própria. Auditoria: 16/16 páginas sem problemas.

## 2026-09-21: Painel — Page Editor e menu reorganizado

Commit `c224a42` · Cloudflare `d9168157`

**Menu lateral em dois grupos.** "Page Editor" fica no topo, logo abaixo da marca (é o
trabalho do dia a dia); "Central de leads" e "Usuários" encostam na base, acima do bloco do
usuário. O registro `lib/admin/nav.ts` ganhou o campo `group` — seção nova do CMS continua
custando uma linha.

**Page Editor (`/admin/paginas`)**

- Lista todas as páginas do site **em ordem alfabética pelo endereço**, com **campo de busca**
  (sem acento: "solucoes" acha "/solucoes"). O blog fica de fora — é servido pelo WordPress
  headless e os metadados de lá são editados lá.
- Cada linha traz o endereço, o nome da página, o título e a descrição em vigor, e marca quando
  a página foi editada aqui ou está fora do índice.
- **Editar Meta** (ícone de código) abre a gaveta à direita, no mesmo formato da ficha de lead:
  título com contador de 60, descrição com faixa de 120–160, **prévia do resultado de busca**,
  imagem de compartilhamento com upload, texto alternativo, título e descrição próprios para
  redes sociais, chave de `noindex` e data da última revisão (que vira o `<lastmod>` do sitemap).
- **Editar Conteúdo** (ícone de blocos) aparece desabilitado, com aviso de que chega adiante.
- **Campo em branco significa "usar o padrão do código"**: a gaveta mostra o valor padrão como
  sugestão e tem "Restaurar padrão", que apaga a sobreposição.

**Como a edição chega ao site**

- Nova tabela `page_meta` (migração `0004_page_meta.sql`) guarda **apenas o que foi alterado**.
  `lib/routes.ts` e os arquivos de conteúdo seguem sendo o padrão.
- As páginas passaram a ler essa sobreposição em `pageMetadataWithOverrides()` e a se reconstruir
  a cada minuto (`revalidate = 60`), então a mudança aparece **sem novo deploy**. Se o banco não
  responder — inclusive durante o build, quando não existe binding —, a página usa o padrão e
  nada quebra.
- O `sitemap-paginas.xml` respeita a data revisada e tira do sitemap a página marcada como noindex.
- **Imagens de compartilhamento** vão para um R2 novo (`pitchyes-site-midia`, binding `MEDIA_BUCKET`)
  e são servidas em `/midia/*` com cache de 7 dias. O upload aceita só JPG, PNG e WebP, até 3 MB,
  conferindo **a assinatura dos primeiros bytes** e não só o tipo declarado — extensão mente.
  A imagem precisa ser do próprio site: apontar para outro domínio entregaria o compartilhamento
  a quem hospeda o arquivo.

**Testado no ar:** gravei uma sobreposição de título e descrição em `/carreiras` direto no banco,
esperei a revalidação e o HTML publicado passou a servir o texto novo; apagando a linha, a página
voltou ao padrão do código. TTFB entre 0,38s e 1,03s (orçamento: < 800ms; a primeira visita após a
revalidação é a mais lenta). Auditoria: 16/16 páginas sem problemas. `/api/admin/paginas` e
`/api/admin/midia` sem sessão devolvem 401.

**Pendência:** a busca por texto passou a usar uma função única (`lib/fold.ts`), usada pela
gravação de leads, pela consulta e pelo filtro do Page Editor.

## 2026-09-21: Painel — passo 4: Central de leads com filtros, busca e CSV

Commit `7caff84` · Cloudflare `e0206409`

- **Filtro por formulário e por período** e **busca por nome, e-mail ou empresa**, com
  **paginação de 50 em 50** no lugar do limite fixo de 200.
- **Os filtros vivem na URL** (`?formulario=contato&de=2026-09-01&busca=maria`), então a tela
  continua sendo renderizada no servidor e um filtro vira um link que dá para salvar ou mandar
  para alguém.
- **Busca sem acento**: o `LIKE` do SQLite não dobra acentuação — procurar "jose" não acharia
  "José". A coluna `search_text` (migração `0003_leads_busca.sql`) guarda nome, e-mail e empresa
  já sem acento e em minúsculas, e a mesma função dobra o termo procurado. Testado no ar.
- **Exportar CSV** respeitando o filtro atual, com uma coluna por campo que apareceu nos leads.
  Abre certo no Excel brasileiro (BOM UTF-8 e ponto e vírgula) e **neutraliza injeção de fórmula**:
  valor começando com `=`, `+`, `-` ou `@` recebe apóstrofo, senão um lead com nome
  `=HYPERLINK(...)` viraria um clique perigoso na máquina de quem abrisse a planilha.
  A exportação fica registrada na auditoria, com quantidade e filtro — é dado pessoal saindo do painel.
- **A newsletter do rodapé passou a gravar lead** (formulário "newsletter"), com campo isca e
  tempo mínimo de preenchimento contra robô. Agora **todo formulário do site alimenta o painel**,
  e a lista ganhou as colunas Empresa e Formulário.

**Testado no ar:** a newsletter gravou; um lead com nome acentuado é encontrado pela busca sem
acento; `/api/admin/leads/exportar` sem sessão devolve 401; e o escape do CSV neutraliza a fórmula.

## 2026-09-21: Painel — passo 3: Usuários

Commit `9801d04` · Cloudflare `4612ba19`

- **Nova seção Usuários** (`/admin/usuarios`): quem tem acesso, com nome, e-mail, papel,
  situação, último acesso e quantos aparelhos reconhecidos.
- **Convidar por e-mail**: o usuário nasce **sem senha** e recebe um convite de 7 dias para
  criar a dele. Ninguém define senha para outra pessoa — nem o superadmin.
- **Editar** nome, papel e situação. **Suspender derruba as sessões na hora.** Quem ainda não
  aceitou o convite tem o botão "Reenviar convite".
- **Remover** pede confirmação e explica que aparelhos e sessões caem junto.
- **Proteções do superadmin em três camadas**: a interface desabilita, a API recusa (403) e o
  **banco aborta por gatilho** — testado com `DELETE` e `UPDATE` direto no SQL, os dois
  recusados com "superadmin nao pode ser removido / rebaixado nem suspenso".
- Ninguém remove a própria conta nem altera o próprio papel ou situação: seria o caminho mais
  curto para se trancar do lado de fora.
- **Primitivos novos do painel**, pensados para as próximas telas do CMS: `Dialog` (com foco
  preso, Escape e devolução do foco), `Field` (rótulo, erro e `aria-invalid`) e `PageHeader`.

**Testado no ar:** `/api/admin/usuarios` sem sessão devolve 401 no GET, no POST e no DELETE;
`/admin/usuarios` sem sessão redireciona para a tela de entrar.

## 2026-09-21: Painel — passo 2: moldura com menu lateral

Commit `27d5375` · Cloudflare `f60e8ded`

- **Menu lateral claro** (branco com borda, item ativo em negrito e marca dourada à esquerda),
  conteúdo sobre o fundo bege do site. Mesmos tokens de cor, tipografia e espaçamento das
  páginas públicas — o painel não inventa visual próprio.
- **Rodapé do menu com o usuário logado**: nome, e-mail, selo de superadmin e as ações
  "Sair" e "Sair de todos os aparelhos".
- **Registro de navegação** (`src/lib/admin/nav.ts`): a lista do menu vive num arquivo só.
  Uma seção nova do CMS é uma entrada ali mais uma pasta em `app/admin/(painel)/` — é isso
  que faz Páginas, Blog e Mídia custarem pouco mais adiante.
- **Central de leads dentro da moldura**, com o cabeçalho padrão (`PageHeader`) no lugar do
  cabeçalho solto que a página tinha.
- **Em celular** o menu vira uma barra no topo, com os itens em linha.
- Nenhum elemento do painel usa `data-reveal`: o `globals.css` esconde esses elementos até o
  GSAP liberar, e o painel não tem essa orquestração.

## 2026-09-21: Painel — passo 1: acesso por e-mail, senha e código

Commit `0f1c780` · Cloudflare `fce1c565`

Primeiro passo do painel administrativo (plano completo aprovado: acesso, moldura, usuários,
central de leads, minha conta e auditoria). A senha única de antes saiu.

- **Entrar com e-mail e senha** em `/admin/entrar`. Aparelho novo recebe um **código de 6 dígitos
  por e-mail** antes de liberar; aparelho já reconhecido entra direto e a sessão dura **7 dias**,
  renovada em uso. A confiança do aparelho dura 180 dias — se fosse igual à sessão, seria um
  código por semana.
- **Aparelho** é o cookie `py_dispositivo` (nenhum navegador expõe identificador de máquina, e
  impressão digital de navegador é frágil e invasiva). Janela anônima, outro navegador ou cookie
  apagado contam como aparelho novo. Se o cookie aparecer em outro navegador, o código é pedido
  de novo.
- **Primeiro acesso e "esqueci minha senha"** por link enviado ao e-mail (`/admin/recuperar`),
  com resposta sempre igual, exista ou não a conta — a tela não pode virar detector de e-mails.
- **Superadmins** `pablo@b300.com.br` e `pablodavi@gmail.com` criados pela migração, sem senha
  no repositório, protegidos por código **e** por gatilho no banco contra exclusão ou rebaixamento.
- **Banco** (`migrations/0002_admin.sql`): usuários, aparelhos, sessões, códigos, limite de
  tentativas e trilha de auditoria. Senha em PBKDF2-SHA256; token de sessão, de aparelho e código
  guardados só como HMAC, com o segredo fora do banco.
- **Limite de tentativas em D1**: 8 senhas erradas por e-mail a cada 15 minutos, 5 tentativas por
  código, 1 reenvio por minuto.
- **Cabeçalhos de segurança do painel passaram para o `proxy.ts`**: `public/_headers` só vale para
  arquivo estático e nunca alcançava `/admin`. Agora toda resposta leva `no-store`, `noindex`,
  `X-Frame-Options: DENY` e `frame-ancestors 'none'`.

**Duas descobertas de plataforma, resolvidas:**

- O Workers **recusa PBKDF2 acima de 100.000 iterações** ("iteration counts above 100000 are not
  supported"), abaixo do recomendado hoje. A senha passou a usar **3 rodadas encadeadas de 100.000**
  (a saída de uma alimenta a seguinte), com rodadas e iterações gravadas junto do hash para poder
  aumentar depois sem invalidar senha nenhuma.
- O domínio `pitchyes.com.br` está cadastrado na Resend mas com **DNS não verificado**, e o
  remetente de teste só entrega para o dono da conta. Como `bmidias.b300.com.br` já está verificado,
  os e-mails do painel saem provisoriamente de `nao-responda@bmidias.b300.com.br` e chegam a
  qualquer caixa. Trocar para `nao-responda@pitchyes.com.br` será mudar uma variável.

**Testado no ar:** `/admin/leads` sem sessão redireciona para `/admin/entrar`; `/api/admin/*` sem
sessão devolve 401; POST de outra origem devolve 403; senha errada e e-mail inexistente devolvem a
mesma mensagem, ambos gastando o mesmo tempo de verificação; os dois links de definição de senha
foram entregues (`entregue: true` na auditoria).

## 2026-09-21: Depoimentos em vídeo (Shorts do YouTube)

Commit `ce45828` · Cloudflare `1ce3cd07`

- **Os cinco depoimentos do canal da PitchYes entraram no carrossel da home**: Paybem,
  Top Master, Grupo TGPM, Mais Vida e Sittax, no formato vertical (9:16) dos Shorts.
  Os cards de espera com gradiente saíram.
- **Play sem custo para a página**: o card mostra a capa do próprio vídeo, servida pelo site
  (`/images/depoimentos/*.webp`, extraídas do vídeo e convertidas para WebP, 16 a 45 KB cada,
  com carregamento adiado). Só quando a pessoa clica é que o iframe do **youtube-nocookie**
  entra na página — antes disso, nenhum pedido vai para o YouTube.
- **Legenda e link acompanham o vídeo ativo**, com o texto "Ver o depoimento da <empresa> no
  YouTube" (link descritivo, como manda o SEO.md).
- **Dados estruturados `VideoObject`** para cada depoimento (`videoSchema()` em `lib/seo.ts`),
  com nome, descrição, capa, data de publicação e duração reais, lidas do YouTube.
- **TODO(conteúdo)**: nome e cargo de quem fala em cada vídeo, além da frase de destaque —
  hoje o card mostra só a empresa. Os campos já existem em `content.ts`.

**Auditoria:** 16/16 páginas sem problemas.

## 2026-09-21: Amostras de voz no widget da home

Commit `8f89b73` · Cloudflare `f260504e`

- **"Fale com um agente" virou "Ouça nossos agentes".** O círculo laranja passou a ser o
  play/pause de uma amostra de voz: o círculo branco deu lugar a um **ícone de play**, e durante
  a reprodução ele vira **pause**, para a pessoa parar com um segundo clique.
- **Um áudio por setor** (PitchYes, Saúde, Seguros, Financeiro e Imobiliário). Trocar de aba
  interrompe o que estava tocando e começa do zero.
- **A linha de status mostra o tempo** ("Tocando · 0:12 de 1:14", "Pausado · …") e volta ao texto
  de convite quando o áudio termina.
- **Peso da página não mudou**: `preload="none"` — o MP3 só é baixado quando a pessoa dá play.
  Os arquivos têm cache de 7 dias (`public/_headers`).
- **Os cinco arquivos em `project/public/audio/` são a MESMA locução de exemplo**
  (`docs/locucao-padrao-001.mp3`), só para montar a estrutura. **Substituir pela amostra real de
  cada setor**, mantendo o nome do arquivo — a lista fica em `src/components/home/content.ts`.
- Referência atualizada em `System/components/agent-widget.html`, com os dois estados.

**Auditoria:** 16/16 páginas sem problemas.

## 2026-09-20: Logos dos clientes em faixa deslizante e em grade

Commit `326b522` · Cloudflare `e2b56b15`

- **Home:** a lista de clientes virou uma **faixa deslizante em toda a largura da tela**, só com
  as marcas. O movimento é contínuo (GSAP, animando apenas `transform`), pausa quando o ponteiro
  entra e não acontece para quem pede menos movimento no sistema — nesse caso vira uma faixa
  rolável. O HTML já traz as duas cópias da lista, então os nomes das empresas continuam no
  conteúdo lido pelos robôs (a segunda cópia é decorativa, com `alt` vazio).
- **/clientes:** a grade continua igual, mas cada célula ganhou a **logo acima do nome**.
- **Regra de marca:** logo de cliente sempre entra em tons de cinza e ganha cor ao passar o mouse
  (`grayscale(1)` → `grayscale(0)`), documentada em `System/components/logo-wall.html`.
- **Imagens de marcação**: os 12 arquivos em `project/public/logos/` são SVGs gerados por código,
  só para validar o comportamento. **Substituir pelos arquivos reais das marcas** — mesmo nome de
  arquivo e proporção parecida; a lista fica em `src/content/clients.ts`, hoje a fonte única usada
  pela home e por /clientes.

## 2026-09-20: Formulário de contato, painel de leads e nova página Sobre

Commit `1225a8d` · Cloudflare `8b9529f3`

**Contato**

- **A página /contato virou um formulário**, com os mesmos campos e os canais oficiais da
  página de contato do pitchyes.com.br: nome, e-mail corporativo, empresa, telefone, tamanho
  da empresa, interesse principal, faturamento mensal, tamanho do time de vendas, data
  preferida para a demonstração e o desafio atual.
- **Canais ao lado do formulário**: telefone +55 (11) 5196-9381 (Seg-Sex, 8h às 20h),
  comercial@pitchyes.com.br (resposta em até 2 horas), o endereço da sede e o atendimento
  por WhatsApp — mais o card com os números divulgados pela empresa (400+ empresas, 94% de
  taxa de sucesso, 3x mais leads qualificados).
- **Validação nos dois lados** (`src/lib/leads.ts`, o mesmo arquivo roda no navegador e no
  servidor): nome com no mínimo 3 caracteres e só letras, e-mail com formato válido,
  telefone brasileiro (DDD de 11 a 99, celular com 9 na frente), opção válida nos campos de
  seleção e data que não esteja no passado. O telefone ganha máscara enquanto se digita.

**Leads**

- **Nova rota `/api/leads`** recebe qualquer formulário do site, revalida tudo no servidor e
  grava o envio. O encaminhamento para CRM ou e-mail entra nessa rota depois, sem mexer no front.
- **Banco D1 `pitchyes-leads`** (binding `LEADS_DB`, schema em `project/migrations/`). Cada
  registro guarda data, formulário, nome, e-mail, telefone, empresa e o JSON com todos os campos —
  campo novo no formulário não exige migração.
- **Painel `/admin/leads`**: tabela com data, horário, nome e e-mail (fuso de Brasília); ao clicar
  na linha, abre uma ficha à direita com todos os campos preenchidos e um atalho para responder
  por e-mail.
- **A área interna exige senha** (autenticação básica em `src/proxy.ts`, segredo `ADMIN_PASSWORD`
  no Worker). Sem o segredo, a área fica fechada. São dados pessoais de leads: `/admin` e `/api`
  também entraram no `Disallow` do robots.txt e a página é `noindex`.
- **O site público ganhou um grupo de rotas `(site)`**: cabeçalho, faixa de CTA e rodapé passaram
  para o layout desse grupo, então `/admin` renderiza sem a moldura do site.

**Sobre**

- **Página /sobre reescrita** como institucional de empresa de tecnologia: a fila de conversas que
  não acontecem, as quatro frentes (contato, vendas, suporte e atendimento), por que voz e não
  mais um chat, como uma operação entra no ar em quatro etapas, os compromissos assumidos e um
  FAQ com o que é a empresa, quem usa e onde fica. Passou de 414 para 996 palavras.
- A assinatura "Fale com todos. Converse com cada um." é a própria linha da PitchYes.
- **`/llms.txt`** ganhou os dados da empresa (CNPJ, sede, canais) e os números divulgados.

**Auditoria depois das mudanças:** 16/16 páginas sem problemas, 9.869 palavras (média de 617).

## 2026-09-20: Política de Privacidade com o texto oficial

Commit `259e004` · Cloudflare `7a844731`

- **A página /privacidade passou a usar o texto oficial** já publicado em
  <https://www.pitchyes.com.br/privacidade> (última atualização declarada: janeiro de 2025),
  no lugar do rascunho que estava no ar. As 10 seções foram mantidas na mesma ordem e com a
  mesma redação; só a forma mudou, para os blocos do site (prosa e listas).
- **Dados da empresa agora no site:** CNPJ 58.177.364/0001-21, sede na Rua 11, 250, 13º andar -
  Setor Central, Goiânia (GO) - 74015-170, e-mail privacidade@pitchyes.com.br e
  telefone +55 (11) 5196-9381.
- O texto é do jurídico: o arquivo (`src/content/privacidade.ts`) traz o aviso de que qualquer
  mudança precisa sair de lá e valer para os dois sites. Continuam pendentes a razão social
  completa e o canal do encarregado (DPO), que não constam do texto oficial.

**Auditoria depois da mudança:** 16/16 páginas sem problemas; /privacidade com 528 palavras.

## 2026-09-20: Auditoria versionada e instruções de trabalho

Commit `1295653` · Cloudflare `eebdf4d6`

- **Auditoria de SEO virou script no repositório** (`project/scripts/seo-audit.mjs`, Node puro,
  sem dependências). Lê o `sitemap-paginas.xml` do site publicado e confere, página a página,
  título, descrição, canonical, `robots`, `og:image`, `<h1>` único, saltos de hierarquia,
  `WebPage`/`BreadcrumbList` no JSON-LD, imagem sem `alt` e contagem de palavras. Antes cada
  revisão reescrevia a checagem do zero. Sai com código 1 quando encontra problema; em
  `*.workers.dev` o `noindex` é esperado e não conta como erro.
- **Descrição de `/privacidade` corrigida**: tinha 117 caracteres, fora da faixa de 120–160
  exigida pelo SEO.md. Passou para 144. Era a única página com problema na auditoria.
- **`CLAUDE.md` reescrito** com o mapa de "onde mexer em cada coisa" (routes, seo, content,
  blocos, tokens), o caminho para criar uma página nova e as convenções do projeto.
- **`SEO.md`**: a seção 8 passou a descrever o script real e como rodá-lo, e ganhou uma
  seção 9 com os cinco erros que já aconteceram neste site, para não se repetirem.

**Auditoria depois das mudanças:** 16/16 páginas sem problemas, 9.055 palavras (média de 566).

## 2026-09-19: Conteúdo das 15 páginas internas

Commit `2fd514c` · Cloudflare `a0028be6`

- **15 páginas internas com conteúdo real**, escritas do zero em português a partir da estrutura observada no bland.ai e do posicionamento da PitchYes ("Soluções de IA de Voz para Automação de Vendas"): Soluções (hub, ativo, receptivo, por setor, por função), Clientes, Cases, Preços, Integrações, Novidades, Sobre, Carreiras, Contato, Privacidade e Termos. Nenhum texto foi copiado.
- **Preços** segue a mesma estrutura do bland.ai — três planos (Start, Build, Enterprise) e tabela comparativa em seis grupos — com valores em reais. **Os valores são de referência e precisam de validação comercial.**
- **Sistema de blocos** (`components/blocks/`) alimentado por arquivos de conteúdo (`src/content/`): herói, prosa, grade de recursos, etapas, números, checklist, cases, logos, planos, tabela, FAQ e links. O texto fica separado do código, fácil de revisar.
- **SEO de cada página**: título e descrição próprios, canonical, dados estruturados (`WebPage`, `BreadcrumbList`, `FAQPage` e `Service` nas páginas de solução) e pelo menos dois links internos.
- **Indexação liberada** para essas páginas (saíram de `placeholder`): o sitemap passou de 1 para 16 endereços. O blog continua fora até ser construído.
- **`/llms.txt`** passou a incluir os planos e os valores, uma das perguntas mais frequentes feitas a mecanismos de IA.

**Auditoria após as mudanças (16 páginas, no site publicado):** nenhum problema. Títulos de 18 a 46 caracteres, descrições de 117 a 155, um `<h1>` por página, 7.604 palavras no total (média de 475 por página), 2 a 4 blocos de dados estruturados por página.

**Pendências de conteúdo marcadas no código (`TODO`)**: valores dos planos, métricas e citações dos cases, lista de integrações nativas, dados da empresa em Sobre, canais de contato reais e revisão jurídica de Privacidade e Termos.

## 2026-09-19: Auditoria de SEO e indexação

Commit `da7fdd5` · Cloudflare `b539c76d`

Revisão completa do site do ponto de vista de indexação (Google e mecanismos de IA), com as correções aplicadas. Regras permanentes em [SEO.md](SEO.md).

**Corrigido**

- **Conteúdo invisível para robôs:** a animação de entrada usava `visibility: hidden`, o que retirava o texto do conteúdo lido. Só 135 das 786 palavras da home eram vistas. Passou a usar opacidade.
- **Título vazio:** um erro no novo gerador de metadados deixou a home sem `<title>` por uma versão. Corrigido e verificado em todas as páginas.
- **Imagem social ausente** em todas as páginas, e ausente nas internas mesmo depois de criada (rotas que declaram Open Graph não herdam a imagem padrão).

**Adicionado**

- **Imagem de compartilhamento** (1200×630, 84 KB) com a marca sobre a textura da faixa de CTA, mais `twitter:card` grande. É o que aparece ao compartilhar o link no WhatsApp, LinkedIn e afins.
- **`/llms.txt`**: resumo do site para mecanismos de IA, com os fatos citáveis e o mapa de páginas.
- **`robots.txt` com liberação explícita dos robôs de IA** (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, CCBot e outros), válida quando o site sair do workers.dev.
- **Dados estruturados em grafo único**, com as entidades ligadas: `Organization`, `WebSite`, `WebPage`, `FAQPage` e `BreadcrumbList` nas páginas internas.
- **Metadados centralizados** em `pageMetadata()` (`lib/seo.ts`): título, descrição, canonical, Open Graph e regra de indexação sempre consistentes.
- **`manifest.webmanifest`**, `theme-color` e título próprio na página 404.
- **Link "pular para o conteúdo"**, visível ao navegar por teclado.
- **`<lastmod>` no sitemap**, a partir do campo `updated` de cada página.
- **Cache longo** para `/brand/*` e `/images/*` (antes era revalidação a cada acesso) e cabeçalhos de segurança (HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`).

**Medido no site publicado:** LCP ~1,3s, CLS 0, ~39 KB por página.

## 2026-09-19: Menu centralizado e página ativa em negrito

Commit `2d4cdbe` · Cloudflare `04a050a1`

- **Menu no centro exato da página**, em desktop e tablet:
  - O header virou uma grade de três colunas: logo, menu e botão, com as laterais de mesma largura.
  - Antes, o centro do menu ficava 183px à esquerda do centro da tela em 1440px e 88px à esquerda em 1024px.
  - Medido online em 1440, 1280, 1024, 820 e 768px: centralizado em todas.
- **Tablet:** o menu completo agora aparece a partir de 768px (iPad em pé), com espaçamento um pouco menor entre os itens. O hambúrguer ficou só para celular (abaixo de 768px). Antes o limite era 900px.
- **Página ativa em negrito** (peso 700), no lugar do antigo peso 500, que quase não se distinguia:
  - Vale também para as páginas-filhas: "Soluções" em `/solucoes/ativo`, "Clientes" em `/clientes/cases`, "Blog" em `/blog/categorias`.
  - "Recursos" fica em negrito em Integrações e Novidades, assim como o item ativo dentro do submenu.
  - A largura do texto em negrito é reservada de antemão, então o menu não se desloca ao trocar de página. Ficou com 362px em todas as páginas.
- **Design system:** `navigation.html` atualizado com a grade centralizada e o estado ativo.

## 2026-09-19: Faixa "Fale com nossa IA" com fundo texturizado, em todas as páginas

Commit `143cda7` · Cloudflare `7e4a5afa` → `6ba8cde2`

- **Novo fundo da faixa antes do footer**, no mesmo tratamento da seção equivalente em vapi.ai/customers:
  - Fundo preto com uma textura verde de desfoque em movimento cobrindo a área toda.
  - Véu preto de 32% por cima, para dar contraste ao texto.
- **A textura é original**, gerada por código (`System/textures/make_cta_texture.py`) com a mesma faixa de tons e o mesmo ângulo de movimento da referência. A foto da Vapi não foi copiada, por ser de propriedade deles. Arquivo: `project/public/images/cta-texture.webp`, com 37 KB.
- **Conteúdo mantido** (textos e fontes). Dois ajustes de contraste obrigatórios sobre o fundo escuro:
  - O título passou a branco.
  - O botão passou a dourado, a cor de ação principal do design system.
- **Em todas as páginas:** a faixa saiu da home e foi para o layout, logo antes do footer. O componente foi para `components/layout/FinalCta.tsx`.
- **Correção nas animações de entrada:**
  - **Problema:** em saltos longos de rolagem (âncora, tecla End, voltar restaurando a posição), os blocos do fim da página ficavam invisíveis.
  - **Correção:** a detecção de "entrou na tela" passou do ScrollTrigger para o `IntersectionObserver` do navegador. A animação continua em GSAP, com os mesmos parâmetros.
  - **Verificado online** em desktop e celular.
- **Design system:** pasta `System/textures/` e referência `cta-band.html` atualizada.

## 2026-09-19: Seção de certificações no visual do bland.ai + FedRAMP

Commit `d0e9461` · Cloudflare `83cc49fa`

- **Visual da seção de segurança refeito** conforme a referência `docs/certificacoes-print.jpg`:
  - Título à esquerda e texto de apoio à direita.
  - Caixa com borda arredondada e 4 colunas separadas por divisórias.
  - Em cada coluna, um selo em escudo bege e, abaixo de uma linha, o controle de segurança correspondente, com título em caixa alta.
  - Fundo branco.
- **Novo selo FedRAMP** ("Certificado · 20x Class A"), como quarta coluna, abaixo de "Resposta a incidentes".
- **Celular:** grade 2×2. As divisórias são bordas das próprias colunas, para não aparecer um fundo cinza durante a animação de entrada.
- **Design system:** tokens `--color-badge` e `--color-badge-ink`, e o componente `security-compliance.html` atualizado.

## 2026-09-19: Páginas sempre abrem no topo

Commit `9038108` · Cloudflare `c521a002`

- **Problema:** ao clicar em links internos, a nova página às vezes abria rolada para baixo. Ao recarregar, ficava na posição antiga.
- **Causa:** no Next 16, a rolagem suave (`scroll-behavior: smooth`) deixou de ser desligada durante a troca de página. Com isso, o "voltar ao topo" era animado e acabava interrompido no meio.
- **Correção:**
  - `data-scroll-behavior="smooth"` no `<html>`, que é a opção oficial do Next 16 para desligar a rolagem suave durante a navegação.
  - Componente `ScrollReset`, que leva a página ao topo instantaneamente a cada navegação interna sem âncora.
  - Script no `<head>` (`lib/bootstrap.ts`) que impede o navegador de restaurar a posição antiga ao carregar ou recarregar.
  - Exceções: links com âncora (`#`) e os botões voltar/avançar do navegador mantêm a posição.
- **Verificado online** em desktop e celular: links do rodapé, logo do header, links do menu mobile e recarregar abrem no topo; voltar mantém a posição; o link com âncora rola até o destino.

## 2026-09-19: Menu mobile cortado

Commit `eaabfd8` · Cloudflare `5912eb74`

- **Problema:** no celular, o menu abria com só ~60px de altura e aparecia apenas "Soluções".
- **Causa:** o `backdrop-filter` (desfoque) do header fazia o painel `position: fixed` ser medido dentro do header, e não da tela.
- **Correção:**
  - O desfoque passou para uma camada `::before` do header, sem mudança visual.
  - O painel ocupa a tela toda (`100dvh` menos a altura do header).
  - A página por trás não rola enquanto o menu está aberto.

## 2026-09-19: Animações com GSAP

Commit `c6de2b0` · Cloudflare `4d886525` → `9ba7692c`

- **Instalação:** `gsap` 3.15 e `@gsap/react`, conforme https://gsap.com/docs/v3/Installation/. Os plugins são registrados num só lugar, `project/src/lib/gsap.ts`, que também guarda os parâmetros de movimento do site.
- **Latência:**
  - Valores: PitchYes 400ms e média do mercado 1.240ms. As barras são proporcionais aos valores.
  - Quando a seção aparece, barra e número crescem de zero: 1s para a PitchYes e 3s para o mercado.
  - O número muda de cor no ponto em que a barra passa por ele.
- **Entrada do conteúdo:**
  - Os blocos marcados com `data-reveal` entram com fade e um leve deslizar para cima, uma vez, em sequência nas grades.
  - Vale na home e nas páginas internas.
  - Não pisca antes de animar, tem fallback de 3s se o JavaScript falhar e respeita "reduzir movimento".
- **Ajuste fino:** o disparo passou para `top 95%` para os logos no fim da primeira tela não esperarem o scroll.
- **Design system:** nova seção "Motion" no README e referência `bar-comparison.html` animada.

## 2026-09-19: Favicon e versionamento de `docs/`

Commit `17bdb66` · Cloudflare `b34bfde2`

- `favicon.ico` (16 a 256px, fundo transparente) gerado só com o símbolo da marca, sem o nome. Resolve o 404 em `/favicon.ico`.
- `docs/` passou a ser versionada: wireframe da homepage (PDF) e SVG original da logo.

## 2026-09-18: Logo oficial

Commit `5e9ae9f` · Cloudflare `bc5acb3a`

- **Versões da logo:**
  - A logo recebida tinha o texto em branco. Foi criada a versão com texto `#151515` para fundos claros, usada no header e no footer.
  - A versão branca ficou guardada para fundos escuros.
  - Foi adicionado `viewBox` ao SVG, para a logo escalar corretamente.
- **Onde foi aplicada:**
  - Componente `Logo`: 28px no header (24px no celular) e 32px no footer.
  - Ícones: `icon.svg` e `apple-icon.png` feitos com o símbolo substituem o favicon padrão do Next.
  - Dados estruturados (JSON-LD `Organization`) passaram a incluir a logo.
- **Design system:** pasta `System/brand/` e seção "Marca" no style guide.

## 2026-09-18: Homepage, estrutura do site e páginas internas

Commit `e7fed4e` · Cloudflare `d286c868`

- **Homepage:** as 10 seções do wireframe (`docs/`):
  - hero com o widget "Fale com um agente" e logos de clientes
  - 6 pilares da plataforma, latência e vídeos de clientes
  - implantação em 7 dias, segurança e conformidade e casos de uso
  - FAQ e CTA final

  Os textos ficam em `project/src/components/home/content.ts`. As respostas do FAQ foram adaptadas do bland.ai, trocando para PitchYes.
- **Estrutura:**
  - Header fixo com dropdown de Recursos e menu mobile.
  - Footer em 6 colunas com newsletter.
  - `lib/routes.ts` é a fonte única de menu, rodapé, páginas e sitemap.
- **Páginas internas:**
  - As 17 páginas do menu e do rodapé são geradas por `app/[...slug]`, com header, footer e headline com o nome da página.
  - Ficam com `noindex` e fora do sitemap até receberem conteúdo.
- **SEO:**
  - `/sitemap.xml` é um índice que aponta para `sitemap-paginas.xml` e `sitemap-blog.xml`.
  - O blog (WordPress headless, em standby) já tem as URLs definidas: listagem paginada, artigos, categorias e tags.
  - JSON-LD de `Organization`, `WebSite` e `FAQPage`.
- **Design system:**
  - 9 componentes novos.
  - Navegação, footer e FAQ atualizados para a estrutura PitchYes.
  - Tokens novos de superfície escura e sombra.

## 2026-09-18: Domínio configurável

Commit `cdf046f`

- O domínio público vem da variável `SITE_URL`, definida no painel da Cloudflare. Sem ela, o site usa o endereço workers.dev.
- Buscadores só indexam em produção com domínio próprio. No workers.dev ficam bloqueados, via `robots.txt` e meta tags.
- `keep_vars: true` no `wrangler.jsonc` impede que o deploy apague as variáveis definidas no painel.

## 2026-09-18: Primeiro commit

Commit `c25ca10`

- Projeto Next.js com deploy no Cloudflare Workers via OpenNext e cache incremental em R2.
- Design system em `System/`: tokens, componentes e screenshots de referência.

---

## Pendências antes de ir para o domínio definitivo

- [ ] Validar com o jurídico as certificações (SOC 2, HIPAA, PCI DSS, FedRAMP) e a menção à LGPD.
- [ ] Revisar as respostas adaptadas do FAQ: prazo de implantação e "mais de 40 idiomas".
- [ ] Validar os valores dos planos na página de Preços (hoje são referência, não tabela aprovada).
- [ ] Publicar e-mail, telefone/WhatsApp e endereço na página de Contato.
- [ ] Confirmar a lista de integrações nativas.
- [ ] Revisão jurídica das páginas de Privacidade e Termos (hoje são rascunhos).
- [ ] Depoimentos: vídeos e citações de Guilherme Pacheco, Raphael Garcia e Claudio Riccioppo.
- [ ] Arquivos de logo (SVG) dos clientes, para substituir os nomes escritos.
- [ ] URLs do LinkedIn e do X no rodapé.
- [ ] Integrações: voz no widget "Fale com um agente" e cadastro da newsletter.
- [ ] Licença da fonte Söhne (hoje o site usa Inter temporariamente).
- [ ] Conteúdo das páginas internas, uma a uma.
- [ ] Blog: ligar a API do WordPress headless.
- [ ] Cadastrar no Google Search Console e no Bing Webmaster Tools e enviar o sitemap (após o domínio).
- [ ] Perfis sociais (LinkedIn, X) para o campo `sameAs` dos dados estruturados.
- [ ] Último passo: apontar `pitchyes.com.br` e definir `SITE_URL` (ver `project/README.md` e a seção 6 do `SEO.md`).
