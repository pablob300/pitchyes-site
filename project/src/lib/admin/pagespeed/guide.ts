import type { CategoryId } from "./types";

// Tradução do Lighthouse para o projeto: o que cada auditoria significa em português
// e onde mexer *neste* site (Next.js 16 + OpenNext no Cloudflare, CSS Modules, GSAP).
// O Google devolve tudo em inglês; auditoria que não estiver aqui aparece com o texto
// original e a orientação genérica da categoria.
//
// Para acrescentar uma auditoria: use o id que aparece no relatório ("id: ...").

export type AuditGuide = {
  /** Título em português, escrito como a tarefa a fazer. */
  title: string;
  /** O que fazer neste projeto: arquivos, componentes, regra a seguir. */
  action: string;
};

export const CATEGORY_LABEL: Record<CategoryId, string> = {
  performance: "Desempenho",
  accessibility: "Acessibilidade",
  "best-practices": "Boas práticas",
  seo: "SEO",
};

export const GROUP_LABEL: Record<string, string> = {
  metrics: "Métricas",
  insights: "Oportunidades",
  diagnostics: "Diagnóstico",
  "a11y-color-contrast": "Contraste",
  "a11y-names-labels": "Nomes e rótulos",
  "a11y-navigation": "Navegação",
  "a11y-aria": "ARIA",
  "a11y-language": "Idioma",
  "a11y-tables-lists": "Tabelas e listas",
  "a11y-audio-video": "Áudio e vídeo",
  "a11y-best-practices": "Boas práticas de acessibilidade",
  "best-practices-trust-safety": "Confiança e segurança",
  "best-practices-ux": "Experiência do usuário",
  "best-practices-browser-compat": "Compatibilidade",
  "best-practices-general": "Geral",
  "seo-crawl": "Rastreamento e indexação",
  "seo-content": "Conteúdo",
  "seo-mobile": "Celular",
};

const FALLBACK: Record<CategoryId, string> = {
  performance:
    "Abra a mesma URL no Chrome DevTools (aba Lighthouse ou Performance) para ver a cadeia completa; corrija no componente que gera o recurso listado e meça de novo depois do deploy.",
  accessibility:
    "Corrija no componente que gera o elemento listado (o seletor aponta o módulo CSS, ex. `Hero-module__…` → `components/home/Hero.tsx`). Toda mudança visual sai dos tokens de `System/`.",
  "best-practices":
    "Confira o console e a aba Issues do Chrome DevTools na página publicada; cabeçalhos de segurança ficam em `project/public/_headers`.",
  seo: "Siga o checklist do `SEO.md` §2: metadados via `pageMetadata()` em `lib/seo.ts`, rota registrada em `lib/routes.ts` e conteúdo no HTML do servidor.",
};

const ARIA =
  "Confira os atributos `aria-*`/`role` no componente apontado pelo seletor. Na dúvida, prefira o elemento HTML nativo (`<button>`, `<nav>`, `<dialog>`) a recriá-lo com ARIA.";

export const AUDIT_GUIDE: Record<string, AuditGuide> = {
  // ── Desempenho: métricas ───────────────────────────────────────────────────────
  "first-contentful-paint": {
    title: "Primeiro conteúdo na tela (FCP) lento",
    action:
      "Reduza o que bloqueia a primeira pintura: CSS crítico pequeno, fonte com `display: swap` (`app/fonts.ts`) e HTML servido do cache. A página deve continuar estática no `next build` — leitura de cookie/cabeçalho a torna dinâmica e piora o FCP.",
  },
  "largest-contentful-paint": {
    title: "Maior elemento da tela (LCP) demora a aparecer",
    action:
      "Identifique o elemento LCP (veja \"Detalhamento do LCP\"). Se for imagem: `next/image` com `priority`, WebP/AVIF e `sizes` corretos. Se for texto: garanta que não começa com `opacity: 0` esperando o GSAP — o elemento LCP não deve depender de animação de entrada.",
  },
  "total-blocking-time": {
    title: "Tempo de bloqueio da thread principal (TBT) alto",
    action:
      "Divida o JavaScript que roda no carregamento: componentes `\"use client\"` só onde há interação, animações GSAP registradas depois da primeira pintura e `ScrollTrigger` apenas nas seções que usam. Veja \"Tempo de execução do JavaScript\" para os arquivos culpados.",
  },
  "cumulative-layout-shift": {
    title: "Layout pula enquanto carrega (CLS)",
    action:
      "Declare `width`/`height` em toda imagem e vídeo, reserve altura para blocos que entram depois (players, carrosséis) e anime só `transform`/`opacity` — nunca `top`, `height` ou `margin`.",
  },
  "speed-index": {
    title: "Conteúdo visível aparece devagar (Speed Index)",
    action:
      "O Speed Index mede quão rápido a primeira tela se completa. Revelações em cascata (`data-reveal`) atrasam esse número: na primeira dobra, use durações curtas e sem atraso inicial, e confira os itens de \"Requisições que bloqueiam a renderização\".",
  },
  interactive: {
    title: "Página demora a ficar interativa",
    action: "Mesmas ações do TBT: menos JavaScript no carregamento e hidratação só nos componentes interativos.",
  },

  // ── Desempenho: oportunidades (insights) ───────────────────────────────────────
  "render-blocking-insight": {
    title: "Requisições que bloqueiam a renderização",
    action:
      "Os arquivos listados (normalmente os CSS de `/_next/static/chunks/`) seguram a primeira pintura. Reduza o CSS global (`app/globals.css` e tokens), mova estilos de seções abaixo da dobra para os módulos dos próprios componentes e evite importar CSS de componentes que a página não usa. Não ligue `experimental.inlineCss`: testado em 25/10/2026, ele repete o CSS no HTML e a nota caiu (ver `next.config.ts`).",
  },
  "cache-insight": {
    title: "Aumentar o tempo de cache dos arquivos estáticos",
    action:
      "`/brand/*`, `/images/*`, `/logos/*` e `/audio/*` já saem com 1 ano e `immutable` (`project/public/_headers`), o que também dá cache longo às versões de `/_next/image`. Se aparecer arquivo aqui, ele está fora dessas pastas: mova-o para uma delas ou acrescente a regra no `_headers`. Arquivo alterado ganha nome novo (ex. `logo-v2.svg`).",
  },
  "cls-culprits-insight": {
    title: "Elementos que causam deslocamento de layout",
    action:
      "Os elementos listados mudam de posição depois de aparecer. Reserve o espaço deles no CSS (altura mínima, `aspect-ratio`) e confira se alguma animação GSAP mexe em propriedades de layout em vez de `transform`.",
  },
  "document-latency-insight": {
    title: "Resposta do HTML demora (TTFB)",
    action:
      "A página deve sair do cache estático/ISR do OpenNext. Confira no `next build` se a rota aparece como estática (○) e não como dinâmica (ƒ); leitura de cookie, cabeçalho ou sessão fora de `/admin` faz a página renderizar a cada visita.",
  },
  "dom-size-insight": {
    title: "HTML com elementos demais (DOM grande)",
    action:
      "Simplifique a marcação das seções listadas: menos `<div>` de embrulho, listas longas paginadas e SVGs repetidos virando um `<symbol>` reutilizado. Não esconda conteúdo com `display: none` para resolver isso (SEO.md §1).",
  },
  "duplicated-javascript-insight": {
    title: "JavaScript duplicado entre pacotes",
    action:
      "O mesmo módulo foi empacotado mais de uma vez. Importe o GSAP só por `src/lib/gsap.ts` (registro único dos plugins) e evite versões diferentes da mesma biblioteca no `package-lock.json`.",
  },
  "font-display-insight": {
    title: "Texto invisível enquanto a fonte carrega",
    action: "Use `display: \"swap\"` na fonte em `src/app/fonts.ts` e mantenha só os pesos realmente usados.",
  },
  "forced-reflow-insight": {
    title: "Cálculo de layout forçado pelo JavaScript",
    action:
      "Algum script lê medidas (`offsetHeight`, `getBoundingClientRect`) logo depois de alterar estilos. No GSAP, agrupe leituras antes das escritas e prefira `gsap.set`/`quickSetter`; em loops de animação, nunca leia layout a cada quadro.",
  },
  "image-delivery-insight": {
    title: "Melhorar a entrega das imagens",
    action:
      "Converta as imagens listadas para WebP/AVIF, sirva no tamanho exibido (atributo `sizes` do `next/image`) e comprima. Imagens de `public/images` não passam pelo otimizador: exporte já no tamanho certo.",
  },
  "inp-breakdown-insight": {
    title: "Resposta lenta a cliques e toques (INP)",
    action:
      "Os manipuladores de evento listados demoram a responder. Tire trabalho pesado do clique (deixe para `requestIdleCallback`/`setTimeout`), evite re-render de árvores grandes no React e anime só `transform`/`opacity`.",
  },
  "lcp-breakdown-insight": {
    title: "Detalhamento do LCP",
    action:
      "Mostra em que fase o LCP gasta tempo: TTFB (servidor), atraso de carregamento (o recurso foi descoberto tarde), duração do download ou atraso de renderização (CSS/JS ou animação segurando o elemento). Ataque a maior fatia.",
  },
  "lcp-discovery-insight": {
    title: "Imagem principal descoberta tarde",
    action:
      "A imagem do LCP precisa estar no HTML inicial com prioridade: `next/image` com `priority` (ou `fetchPriority=\"high\"`), sem `loading=\"lazy\"` e sem ser fundo CSS carregado depois.",
  },
  "legacy-javascript-insight": {
    title: "JavaScript antigo (polyfills desnecessários)",
    action:
      "Defina um `browserslist` moderno no `package.json` (ex. `\"defaults and fully supports es6-module\"`) para o Next parar de transpilar e incluir polyfills que navegadores atuais não precisam.",
  },
  "network-dependency-tree-insight": {
    title: "Cadeia de requisições críticas longa",
    action:
      "Os recursos encadeados atrasam a primeira pintura. Diminua o número de CSS/JS iniciais e, se houver origem externa (fonte, vídeo, analytics), acrescente `<link rel=\"preconnect\">` no `app/layout.tsx`.",
  },
  "third-parties-insight": {
    title: "Código de terceiros pesando no carregamento",
    action:
      "Scripts externos listados (vídeo, analytics, widgets) devem carregar depois da interação ou com `next/script` `strategy=\"lazyOnload\"`. Vídeo incorporado: mostre uma capa e só carregue o player no clique.",
  },
  "viewport-insight": {
    title: "Viewport não otimizada para celular",
    action: "Confira o `export const viewport` em `app/layout.tsx`: `width=device-width, initial-scale=1`, sem bloquear o zoom.",
  },

  // ── Desempenho: diagnóstico ────────────────────────────────────────────────────
  "unminified-css": {
    title: "CSS sem minificação",
    action: "O build de produção já minifica; arquivo listado provavelmente vem de `public/`. Minifique-o ou mova para um módulo CSS importado.",
  },
  "unminified-javascript": {
    title: "JavaScript sem minificação",
    action: "Arquivo listado não passa pelo build do Next (provavelmente em `public/` ou de terceiros). Use a versão `.min.js` ou importe pelo bundler.",
  },
  "unused-css-rules": {
    title: "CSS que a página não usa",
    action:
      "Regras globais em `app/globals.css` e nos tokens valem para todas as páginas. Leve estilos específicos para o `.module.css` do componente e apague classes que não são mais usadas.",
  },
  "unused-javascript": {
    title: "JavaScript baixado e não usado",
    action:
      "Os pacotes listados carregam código que a página não executa. Carregue componentes pesados com `next/dynamic` (players, carrosséis, formulários abaixo da dobra), importe só os plugins do GSAP que a página usa e confira se algum `\"use client\"` está alto demais na árvore, puxando filhos que poderiam ser de servidor.",
  },
  "total-byte-weight": {
    title: "Página pesada demais",
    action: "O orçamento do projeto é 400 KB por página (SEO.md §4). Veja quais imagens, vídeos e scripts somam mais e comprima ou adie o carregamento.",
  },
  "bootup-time": {
    title: "Tempo de execução do JavaScript alto",
    action: "Os scripts listados gastam CPU no carregamento. Adie a inicialização de animações e widgets para quando a seção entrar na tela (ScrollTrigger/IntersectionObserver).",
  },
  "mainthread-work-breakdown": {
    title: "Trabalho demais na thread principal",
    action: "Some os tempos por tipo (script, estilo, layout, pintura) e ataque o maior: script → menos JS; estilo/layout → menos DOM e menos CSS global.",
  },
  "long-tasks": {
    title: "Tarefas longas na thread principal",
    action: "Cada tarefa acima de 50 ms trava a página. Quebre inicializações pesadas em partes (`await` entre etapas, `requestIdleCallback`).",
  },
  "non-composited-animations": {
    title: "Animações que não rodam na GPU",
    action: "Regra do projeto: GSAP animando só `transform` e `opacity`. Troque animações de `width`, `height`, `top`, `left`, `box-shadow` ou `filter` nos elementos listados.",
  },
  "unsized-images": {
    title: "Imagens sem largura e altura declaradas",
    action: "Declare `width` e `height` (ou use `next/image`, que exige) nas imagens listadas para o navegador reservar o espaço.",
  },
  "user-timings": {
    title: "Marcações de User Timing",
    action: "Apenas informativo: marcações `performance.mark()` encontradas na página.",
  },

  // ── Acessibilidade ─────────────────────────────────────────────────────────────
  "color-contrast": {
    title: "Contraste insuficiente entre texto e fundo",
    action:
      "O detalhe de cada item mostra a razão encontrada e a exigida (4,5:1 para texto normal, 3:1 para texto grande). Ajuste a cor nos tokens de `System/tokens/` e em `src/styles/tokens/colors.css` — nunca uma cor solta no componente. Ex.: texto branco sobre o violeta `#776eed` dá 4,0:1; escureça o fundo do botão ou aumente o texto para 18,66px em negrito.",
  },
  "label-content-name-mismatch": {
    title: "Texto visível diferente do nome acessível",
    action:
      "O `aria-label` do elemento precisa conter o texto que aparece na tela (quem usa comando de voz fala o texto visível). Ex.: card \"Ouça nosso agente de Saúde\" com `aria-label=\"Ouvir o agente de Saúde\"` — comece o rótulo pelo texto visível ou remova o `aria-label`.",
  },
  "image-alt": {
    title: "Imagens sem texto alternativo",
    action: "Toda imagem precisa de `alt` com texto (SEO.md §1.7) — logo de cliente leva \"Logo da <empresa>\".",
  },
  "button-name": {
    title: "Botões sem nome acessível",
    action: "Botão só com ícone precisa de `aria-label` (ou texto visualmente oculto com a classe utilitária do projeto).",
  },
  "link-name": {
    title: "Links sem texto",
    action: "Link só com ícone/imagem precisa de `aria-label` ou `alt` na imagem. Texto descritivo, nunca \"clique aqui\" (SEO.md §1.6).",
  },
  "heading-order": {
    title: "Títulos pulando níveis",
    action: "Hierarquia `h1 → h2 → h3` sem saltos (SEO.md §1.2). Se o tamanho visual não bate, mude a classe, não o nível do título.",
  },
  "html-has-lang": { title: "`<html>` sem idioma", action: "Confira `<html lang=\"pt-BR\">` em `app/layout.tsx`." },
  "html-lang-valid": { title: "Idioma do `<html>` inválido", action: "Use `pt-BR` em `app/layout.tsx`." },
  "valid-lang": { title: "Atributo `lang` inválido", action: "Corrija o `lang` do elemento listado para um código válido (ex. `en`, `pt-BR`)." },
  "document-title": {
    title: "Página sem `<title>`",
    action: "Metadados sempre via `pageMetadata()` em `lib/seo.ts` — nunca `metadata` escrito na mão (SEO.md §1.3).",
  },
  label: {
    title: "Campos de formulário sem rótulo",
    action: "Cada campo precisa de `<label htmlFor>` ligado ao `id` (os formulários do site saem de `lib/leads.ts`).",
  },
  "select-name": { title: "Seleção sem rótulo", action: "Ligue o `<select>` a um `<label>` pelo `id`." },
  "target-size": {
    title: "Áreas de toque pequenas ou coladas",
    action: "Alvos de toque com pelo menos 24×24 px e espaço entre eles; aumente o `padding` dos links e botões listados (pontos de carrossel, ícones de redes sociais).",
  },
  "meta-viewport": {
    title: "Zoom bloqueado no celular",
    action: "Remova `user-scalable=no` e `maximum-scale` menor que 5 do `viewport` em `app/layout.tsx`.",
  },
  "landmark-one-main": { title: "Página sem `<main>`", action: "Cada página precisa de um único `<main>` (o layout público já tem; confira layouts próprios)." },
  bypass: { title: "Sem atalho para o conteúdo", action: "Mantenha o link \"Pular para o conteúdo\" apontando para `#conteudo` e um `<main>` na página." },
  "skip-link": { title: "Link \"pular para o conteúdo\" não focável", action: "O alvo do link precisa existir (`id=\"conteudo\"`) e o link não pode ter `display: none`." },
  tabindex: { title: "`tabindex` maior que zero", action: "Use só `tabindex=\"0\"` ou `-1`; valores positivos bagunçam a ordem do teclado." },
  list: { title: "Listas com filhos inválidos", action: "`<ul>`/`<ol>` só podem ter `<li>` como filhos diretos." },
  listitem: { title: "`<li>` fora de lista", action: "Envolva os `<li>` listados em `<ul>` ou `<ol>`." },
  "definition-list": { title: "`<dl>` mal estruturada", action: "Dentro de `<dl>`, só pares `<dt>`/`<dd>` (ou `<div>` envolvendo o par)." },
  dlitem: { title: "`<dt>`/`<dd>` fora de `<dl>`", action: "Envolva os itens em `<dl>`." },
  "link-in-text-block": {
    title: "Link no meio do texto só se distingue pela cor",
    action: "Links dentro de parágrafos precisam de sublinhado (ou outro sinal além da cor).",
  },
  "frame-title": { title: "`<iframe>` sem título", action: "Dê `title` descritivo ao `<iframe>` (ex. vídeo do YouTube dos depoimentos)." },
  "video-caption": { title: "Vídeo sem legenda", action: "Acrescente `<track kind=\"captions\">` aos vídeos próprios." },
  "duplicate-id-aria": { title: "IDs repetidos usados por ARIA", action: "Gere ids únicos com `useId()` em componentes repetidos." },
  "aria-hidden-focus": {
    title: "Elemento escondido do leitor de tela ainda recebe foco",
    action: "Em slides fora da tela com `aria-hidden=\"true\"`, coloque também `tabindex=\"-1\"` nos botões e links internos (ou use `inert`).",
  },
  "aria-allowed-attr": { title: "Atributo ARIA não permitido para o papel", action: ARIA },
  "aria-allowed-role": { title: "Papel ARIA incompatível com o elemento", action: ARIA },
  "aria-command-name": { title: "Botão, link ou item de menu sem nome", action: ARIA },
  "aria-conditional-attr": { title: "Atributo ARIA usado fora do contexto", action: ARIA },
  "aria-deprecated-role": { title: "Papel ARIA obsoleto", action: ARIA },
  "aria-dialog-name": { title: "Diálogo sem nome acessível", action: "Dê `aria-labelledby` apontando para o título do diálogo." },
  "aria-hidden-body": { title: "`aria-hidden` no `<body>`", action: "Remova `aria-hidden` do `<body>` (algum modal está deixando ele para trás ao fechar)." },
  "aria-input-field-name": { title: "Campo ARIA sem nome", action: ARIA },
  "aria-prohibited-attr": { title: "Atributo ARIA proibido no elemento", action: ARIA },
  "aria-required-attr": { title: "Papel ARIA sem atributo obrigatório", action: ARIA },
  "aria-required-children": { title: "Papel ARIA sem os filhos obrigatórios", action: ARIA },
  "aria-required-parent": { title: "Papel ARIA fora do pai obrigatório", action: ARIA },
  "aria-roles": { title: "Papel ARIA inválido", action: ARIA },
  "aria-toggle-field-name": { title: "Interruptor ARIA sem nome", action: ARIA },
  "aria-valid-attr": { title: "Atributo ARIA com nome errado", action: ARIA },
  "aria-valid-attr-value": { title: "Atributo ARIA com valor inválido", action: ARIA },
  "presentation-role-conflict": { title: "Elemento decorativo com conflito de papel", action: ARIA },
  "svg-img-alt": { title: "SVG com `role=\"img\"` sem texto", action: "Dê `aria-label` ou `<title>` ao SVG listado." },
  "empty-heading": { title: "Título vazio", action: "Remova o título vazio ou coloque texto nele (pode ser conteúdo do editor que ficou em branco)." },
  "identical-links-same-purpose": { title: "Links iguais com destinos diferentes", action: "Links com o mesmo texto devem levar ao mesmo lugar; diferencie o texto." },
  "image-redundant-alt": { title: "`alt` repete o texto ao lado", action: "Descreva a imagem em vez de repetir a legenda." },
  "autocomplete-valid": { title: "`autocomplete` inválido", action: "Use os valores padrão (`name`, `email`, `tel`, `organization`) nos campos do formulário." },

  // ── Boas práticas ──────────────────────────────────────────────────────────────
  "is-on-https": { title: "Recursos carregados sem HTTPS", action: "Troque `http://` por `https://` nos recursos listados." },
  "redirects-http": { title: "HTTP não redireciona para HTTPS", action: "Ative \"Always Use HTTPS\" no domínio na Cloudflare." },
  "errors-in-console": {
    title: "Erros no console do navegador",
    action: "Abra a página publicada com o DevTools aberto e corrija cada erro listado (recurso 404, erro de hidratação, script quebrado).",
  },
  "inspector-issues": { title: "Problemas na aba Issues do DevTools", action: "Abra a aba Issues do Chrome DevTools na página publicada e corrija os itens listados." },
  deprecations: { title: "Uso de APIs obsoletas do navegador", action: "Substitua as APIs listadas (normalmente vêm de biblioteca de terceiros; atualize-a)." },
  "third-party-cookies": { title: "Cookies de terceiros", action: "Os domínios listados gravam cookies de terceiros; carregue-os só após consentimento ou troque por versão sem cookies (ex. `youtube-nocookie.com`)." },
  "image-aspect-ratio": { title: "Imagem exibida com proporção errada", action: "Corrija `width`/`height` ou use `object-fit: cover` nas imagens listadas." },
  "image-size-responsive": { title: "Imagem com resolução baixa para a tela", action: "Sirva versão maior (2×) para telas de alta densidade ou use `next/image` com `sizes`." },
  "paste-preventing-inputs": { title: "Campo impede colar texto", action: "Remova o bloqueio de `paste` do campo listado." },
  doctype: { title: "Página sem `<!DOCTYPE html>`", action: "O Next gera o doctype; confira se alguma rota devolve HTML montado na mão." },
  charset: { title: "Codificação não declarada", action: "O Next declara `utf-8`; confira rotas que devolvem HTML na mão." },
  "geolocation-on-start": { title: "Pede localização ao abrir a página", action: "Peça permissão só depois de uma ação da pessoa." },
  "notification-on-start": { title: "Pede notificações ao abrir a página", action: "Peça permissão só depois de uma ação da pessoa." },
  "valid-source-maps": { title: "Source maps inválidos", action: "Informativo para depuração; pode ser ignorado se não publicamos source maps." },

  // ── SEO ────────────────────────────────────────────────────────────────────────
  "is-crawlable": {
    title: "Página bloqueada para indexação",
    action:
      "No endereço de homologação (workers.dev) isso é proposital: `noindex` e `robots.txt` bloqueiam os robôs até o domínio definitivo (SEO.md §6). No domínio definitivo, confira `SITE_ENV`/`SITE_URL` e se a página está com `placeholder: false` em `lib/routes.ts`.",
  },
  "meta-description": { title: "Página sem meta description", action: "Descrição de 120–160 caracteres via `pageMetadata()` e a entrada da página em `lib/routes.ts`." },
  "http-status-code": { title: "Página não responde 200", action: "Confira se a rota existe em `lib/routes.ts`/`app/` e se não há redirecionamento quebrado." },
  "link-text": { title: "Links com texto genérico", action: "Troque \"saiba mais\"/\"clique aqui\" por texto que descreva o destino (SEO.md §1.6)." },
  "crawlable-anchors": { title: "Links que o robô não segue", action: "Todo link precisa de `href` real (use `<Link href>`); nada de `href=\"#\"` com `onClick` para navegar." },
  "robots-txt": { title: "`robots.txt` inválido", action: "Gerado por `app/robots.ts`; confira a sintaxe das regras." },
  hreflang: { title: "`hreflang` inválido", action: "Só declare `hreflang` quando houver versões em outros idiomas." },
  canonical: { title: "Canonical inválido", action: "O canonical sai de `pageMetadata({ path })`; confira se o `path` da página está certo e aponta para o domínio definitivo." },
  "structured-data": { title: "Dados estruturados com erro", action: "Valide o JSON-LD da página no Rich Results Test; o grafo sai de `lib/seo.ts` + `<JsonLd>`." },
};

export function guideFor(id: string): AuditGuide | undefined {
  return AUDIT_GUIDE[id];
}

export function fallbackAction(category: CategoryId): string {
  return FALLBACK[category];
}
