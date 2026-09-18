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

As mesmas cópias ficam em `project/public/brand/`. No site, use o componente `Logo` (`project/src/components/Logo.tsx`).

## Tokens principais

| Token | Valor | Uso |
|---|---|---|
| `--color-text` | `#151515` | texto primário |
| `--color-accent-gold` | `#f9a900` | CTA principal ("Book a call") |
| `--color-accent-burnt` | `#d8441f` | destaque em headline, números de estatística |
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
| `agent-widget.html` | Hero: "Fale com um agente", pills de setor + orb | `home/AgentWidget.tsx` |
| `logo-wall.html` | Prova social: grade de logos (nomes tipográficos até chegarem os SVGs) | `home/ClientLogos.tsx` |
| `platform-mocks.html` | Mocks estruturais dentro dos feature cards | `home/Platform.tsx` |
| `bar-comparison.html` | Latência: barras proporcionais (variante do stat-comparison) | `home/Latency.tsx` |
| `timeline.html` | Implantação em dias, último passo em destaque | `home/Rollout.tsx` |
| `security-compliance.html` | Selos de certificação + controles | `home/Security.tsx` |
| `cards-use-case.html` | Grade compacta de casos de uso | `home/UseCases.tsx` |
| `cta-band.html` | Faixa de CTA final (pastel peach + botão escuro) | `home/FinalCta.tsx` |
| `page-headline.html` | Topo das páginas internas | `PageHeadline.tsx` |

`navigation.html`, `footer.html` e `accordion-faq.html` foram atualizados para a estrutura PitchYes (menu Soluções · Clientes · Preços · Recursos ▾ · Blog; rodapé em 6 colunas; FAQ com ícone +/− e uma resposta aberta por vez).

**Tokens adicionados (PitchYes):** `--color-text-inverse-muted`, `--color-bg-inverse-elevated`, `--color-border-inverse`, `--color-border-inverse-strong`, `--shadow-sm`, `--shadow-lg`.

**Regra de manutenção:** `System/tokens/*.css` e `project/src/styles/tokens/*.css` devem ficar idênticos (exceto o `@font-face`, que no site vem do `next/font`). Todo componente novo criado no site ganha um `.html` de referência aqui e uma entrada no `style-guide.html`.

`docs.bland.ai` usa um tema **escuro** separado (provavelmente Mintlify) — não foi replicado em componente próprio, só documentado em screenshot, por ser um sub-produto de menor prioridade.
