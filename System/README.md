# Design System — clonado de bland.ai

Biblioteca de referência visual extraída diretamente do CSS computado de **bland.ai** (home, `/pricing`, `/product`, `/solutions`, `/blog`, `docs.bland.ai` — setembro/2026). Serve como base para o design visual do nosso próprio site, que terá estrutura de páginas e navegação diferentes — aqui vivem só os **tokens e componentes**, não o conteúdo/estrutura do site final.

Abra `style-guide.html` no navegador para ver tudo catalogado em uma página só.

## Estrutura

```
System/
├── style-guide.html          ← catálogo visual central, comece por aqui
├── tokens/                   ← variáveis CSS (cores, tipografia, espaçamento, motion)
│   ├── colors.css
│   ├── typography.css        ← inclui os @font-face da Söhne local
│   ├── spacing.css
│   ├── motion.css
│   └── tokens.css            ← importa os 4 acima, é o único arquivo que precisa linkar
├── brand/                     ← logo oficial (escura, branca e símbolo)
├── textures/                  ← fundos: cta-fundo-pitchyes (faixa final) e a textura antiga com o script que a gera
├── components/                ← cada componente é um .html standalone (abre sozinho no navegador)
├── fonts/sohne/               ← pesos da Söhne (Test) usados, copiados de /sohne-font-family
└── reference-screenshots/     ← screenshots reais das páginas, só para consulta (não redistribuir)
```

## Como consumir isso no site final

- Se o site final for HTML/CSS puro ou qualquer framework: importe `tokens/tokens.css` e reaproveite as classes/CSS dos arquivos em `components/` como ponto de partida — ajuste o HTML para a estrutura de conteúdo real do wireframe.
- Se for Next.js/React (provável, dado o setup Vercel do projeto): os tokens em `tokens/*.css` podem ser importados como CSS global; cada `components/*.html` documenta o CSS de referência para virar um componente React equivalente quando o wireframe chegar.

## Decisões tomadas

**Fonte — Söhne (Klim Type Foundry).** O bland.ai usa a stack `soehne, soehneAux, Söhne, Inter, system-ui`. Você já forneceu a família completa "TestSöhne" em `/sohne-font-family` (raiz do projeto) — os pesos usados no site (Buch=400, Kräftig=500, Halbfett=600, Dreiviertelfett=700, + Extraleicht/Leicht/Fett/Extrafett e itálicos) foram copiados para `System/fonts/sohne/` e carregados via `@font-face` em `tokens/typography.css`. É uma fonte de teste/trial da Klim — para uso comercial em produção, confirmar a licença completa antes do lançamento do site.

**Componentes em HTML/CSS puro**, sem framework — mais fácil de portar depois para qualquer stack (Next.js incluído) quando a estrutura de páginas do site final for definida.

**Sem assets proprietários da Bland.** Cores, tipografia, espaçamento e o CSS/estrutura dos componentes foram clonados fielmente (são parâmetros de design, não conteúdo autoral). Fotos, logos de clientes e ilustrações reais da Bland **não** foram copiados — os componentes usam placeholders (iniciais, formas, gradientes) no lugar. Os screenshots em `reference-screenshots/` existem só como referência visual interna de consulta, não devem ser publicados no site final.

## Marca

`brand/` guarda a logo oficial (origem: `docs/pitchyes-logo-*.svg`, com o texto em branco):

- `pitchyes-logo.svg`: texto em `#151515`, para fundos claros (header e footer do site)
- `pitchyes-logo-white.svg`: original, para fundos escuros
- `pitchyes-symbol.svg`: só o símbolo, usado como favicon (`project/src/app/icon.svg`)
- `favicon.ico` (16–256px) e `pitchyes-symbol-256.png`: símbolo em bitmap, fundo transparente (`project/src/app/favicon.ico`)

As mesmas cópias ficam em `project/public/brand/`. No site, use o componente `Logo` (`project/src/components/Logo.tsx`).

## Motion (animações)

Toda animação do site usa **GSAP** (`gsap` + `@gsap/react`, instalação conforme https://gsap.com/docs/v3/Installation/). Plugins são registrados num só lugar: `project/src/lib/gsap.ts`, que também guarda os parâmetros abaixo (`motion`).

| Padrão | Como usar | Parâmetros |
|---|---|---|
| **Reveal** (fade + slide ao aparecer) | Adicione `data-reveal` ao elemento. Em grades, marque cada card: eles entram em sequência. | `y: 24 → 0`, opacidade `0 → 1`, `0.8s`, `power2.out`, stagger `0.08s`, dispara quando o elemento passa 5% acima da base da tela (IntersectionObserver, confiável em saltos de rolagem), uma vez |
| **Anel de cards** (player do hero) | Uma posição decimal (`pos`) que o GSAP interpola; cada quadro escreve `transform`/`opacity` nos cards. Arrastar move o anel com o dedo; ao soltar, encaixa no card mais próximo (um arremesso rápido leva até 2 cards) | `power3.out`, 0,55–0,9s; cards vizinhos a ±58% da largura, `rotateY` 32°, `z` −150px |
| **Palavras que rolam** (h1 do hero, `home/RotatingWords.tsx`) | Todas as palavras no HTML, empilhadas na mesma célula de grade; a atual sobe e sai enquanto a próxima entra de baixo. Linha de uma altura só (fonte encolhe via `cqi` no celular), então nada abaixo pula | cada uma 2s, a última 5s; troca 0,5s `power2.inOut`; com `prefers-reduced-motion` vira fade sem deslocamento |
| **Metal líquido** (orb) | Camadas de gradiente giram e ondulam em loop lento; pausa fora da tela | 14–18s por volta; tocando, `timeScale` 3 |
| **Contador + barra** (ex.: Latência) | `useGSAP` + timeline com ScrollTrigger; número e largura saem de 0 juntos | `power2.out`, dispara em `top 75%`, duração por item (PitchYes 1s, mercado 3s) |

Regras: animar só `transform`/`opacity` (e `width` em barras); nada de animação em loop chamativa; respeitar `prefers-reduced-motion` (conteúdo aparece direto, sem movimento); o HTML do servidor sempre traz o estado final (sem JS o conteúdo aparece normalmente — fallback de 3s). **Exceção: o topo da primeira tela não usa `data-reveal`** — título, texto e botão do hero aparecem já pintados, porque o `<h1>` é o LCP e esperar o GSAP hidratar custava ~2 s de LCP e Speed Index no celular. O resto (inclusive o player ao lado) continua com a revelação.

## Tokens principais

| Token | Valor | Uso |
|---|---|---|
| `--color-text` | `#151515` | texto primário |
| `--color-accent-primary` | `#776eed` | violeta da marca: CTA principal, foco, marcadores; texto e borda de 1px dos botões violeta são `--color-accent-primary-contrast` (branco) |
| `--color-accent-secondary` | `#54cfa8` | menta da marca: preenchimentos (barras, pontos, contornos). **Nunca como cor de texto** (1,9:1 no branco) |
| `--color-negative` | `#e0675b` | vermelho suave de comparação “problema” (barra do mercado na Latência); erro de formulário continua `--color-danger` |
| `--color-accent-secondary-ink` | `#178060` | menta escura: texto em destaque (trecho do h1, números, rótulos) |
| `--font-sans` | Söhne → Inter → system-ui | stack tipográfica completa |
| `--content-width` | `1280px` | largura máxima do conteúdo |
| `--margin` | `80px` | margem lateral desktop |
| `--nav-height` | `72px` | altura da navbar |
| `--radius-sm` / `--radius-md` | `6px` / `12px` | botões/inputs vs. cards |

## Componentes catalogados

Navegação (com dropdown), 3 variantes de botão, hero split, feature cards em grid, comparação estatística ("big number"), cards de pricing (3 tiers com fundo pastel) + tabela comparativa, filtro por pills, carrossel/slider de blog com indicador de progresso, accordion de FAQ, formulário de newsletter/busca, footer de 5 colunas.

**Testemunhos — 2 variantes:**
- `cards-testimonial.html`: 1 vídeo em destaque (formato horizontal) + citações em cards ao lado.
- `cards-testimonial-video-slider.html`: slider horizontal de vídeos **verticais** (9:16, estilo YouTube Shorts/Reels), com setas de navegação, legenda curta explicando o vídeo, e nome + empresa da pessoa sobrepostos no vídeo. Usa scroll-snap nativo (arrasta ou usa as setas) e dots de progresso sincronizados via JS.

**Componentes PitchYes** (criados para o site a partir de `docs/PitchYes — Wireframe Homepage (Desktop).pdf`, no mesmo padrão visual):

| Arquivo | Uso | Espelho React (`project/src/components/…`) |
|---|---|---|
| `agent-widget.html` | Hero: anel 3D de cards "Ouça nosso agente para…" (um card por palavra do h1), orb de metal líquido que toca o MP3 do card da frente. O card da frente acompanha a palavra que está no título (`HeroSync`); mouse sobre o player ou áudio tocando pausam a troca | `home/AgentWidget.tsx`, `home/HeroSync.tsx` |
| `logo-wall.html` | Prova social: grade de logos (nomes tipográficos até chegarem os SVGs). Todos os logos com a mesma altura (arquivo recortado rente ao desenho); a grade de clientes fecha com o box “+400 empresas no Brasil” | `home/ClientLogos.tsx`, `blocks/ContentPage.tsx` (`logos`) |
| `platform-mocks.html` | Mocks estruturais dentro dos feature cards | `home/Platform.tsx` |
| `bar-comparison.html` | Latência: barras proporcionais (variante do stat-comparison) | `home/Latency.tsx` |
| `timeline.html` | Implantação em dias, último passo em destaque | `home/Rollout.tsx` |
| `security-compliance.html` | Selos de certificação + controles | `home/Security.tsx` |
| `cards-use-case.html` | Grade compacta de casos de uso | `home/UseCases.tsx` |
| `case-story.html` | Cases empilhados: container com borda suave; vídeo do YouTube ou foto 16:9 à esquerda e texto à direita, ou só texto na largura toda | `blocks/CaseStory.tsx`, `home/CaseHighlight.tsx` |
| `news-cards.html` | Novidades: cards datados (data › título › resumo), do mais recente para o mais antigo | `blocks/ContentPage.tsx` (`timeline`) |
| `cta-band.html` | Faixa "Fale com nossa IA" antes do footer, **em todas as páginas**: fundo da marca (azul-marinho com os pontos violeta do logotipo, `textures/cta-fundo-pitchyes.svg`), título branco, botão violeta | `layout/FinalCta.tsx` |
| `page-headline.html` | Topo das páginas internas | `PageHeadline.tsx` |
| `blog.html` | Blog: listagens (blog, categoria, tag, autor) e card de artigo | `blog/BlogListing.tsx`, `blog/PostCard.tsx` |
| `blog-article.html` | Blog: página do artigo (sumário, blocos de CTA/FAQ do editor, faixa final, autor) | `blog/ArticleView.tsx` |
| `landing-page.html` | Landing page (/conteudo/&lt;slug&gt;): topo só com logo, âncoras e "Testar agora"; topo com formulário, tabela comparativa (coluna PitchYes em destaque, Sim/Não em ícones, links do Reclame Aqui), vídeo, casos de uso (mesma grade da home), depoimentos em texto, botão de chamada abaixo dos blocos e faixa final (mesmo fundo da `cta-band`) | `landing/LandingPage.tsx`, `blocks/ContentPage.tsx`, `blocks/VideoFacade.tsx` |

`navigation.html`, `footer.html` e `accordion-faq.html` foram atualizados para a estrutura PitchYes (menu Soluções · Clientes · Planos · Integrações · Blog · Contato, sem submenu desde 25/10/2026; rodapé em 6 colunas; FAQ com ícone +/− e uma resposta aberta por vez).

**Painel (`/admin`):** as telas internas não têm `.html` de referência, mas só usam tokens daqui. O PageSpeed (`project/src/components/admin/pagespeed/`) mapeia as faixas do Google para os tokens de estado: 90–100 `--color-positive`, 50–89 `--color-warning`, 0–49 `--color-danger` (com os `-bg` de cada um).

**Contraste (PageSpeed, 25/10/2026):** `--color-text-muted` foi de 50% para 62% de opacidade e `--color-text-dim` de 55% para 66% (mínimo de 4,5:1 sobre branco e creme). Botão sólido violeta usa `--color-accent-primary-strong` (`#6961d1`, texto branco a 5,0:1); o `--color-accent-primary` (`#776eed`) continua nos marcadores, barras e foco.

**Tokens adicionados (PitchYes):** `--color-text-inverse-muted`, `--color-bg-inverse-elevated`, `--color-border-inverse`, `--color-border-inverse-strong`, `--shadow-sm`, `--shadow-lg`, `--color-badge`, `--color-badge-ink` (selos de certificação).

**SEO:** mudanças de estrutura ou conteúdo seguem as regras de `../SEO.md` (conteúdo no HTML do servidor, hierarquia de títulos, animação por opacidade e nunca `visibility: hidden`).

**Regra de manutenção:** `System/tokens/*.css` e `project/src/styles/tokens/*.css` devem ficar idênticos (exceto o `@font-face`, que no site vem do `next/font`). Todo componente novo criado no site ganha um `.html` de referência aqui e uma entrada no `style-guide.html`.

`docs.bland.ai` usa um tema **escuro** separado (provavelmente Mintlify) — não foi replicado em componente próprio, só documentado em screenshot, por ser um sub-produto de menor prioridade.
