# Changelog: site PitchYes

Histórico do site institucional da PitchYes (Next.js 16 no Cloudflare Workers).
Ambiente de homologação: https://pitchyes-site.borges-filho.workers.dev

Cada entrada traz o commit e a versão publicada no Cloudflare (`Version ID`, visível em
Workers & Pages → `pitchyes-site` → Deployments).

---

## 2026-09-19: Auditoria de SEO e indexação

Commit `{HASH}` · Cloudflare `b539c76d`

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
