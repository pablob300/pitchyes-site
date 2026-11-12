# SEO e indexação: regras do projeto PitchYes

**Leia este arquivo antes de qualquer alteração no site.** O objetivo do projeto é ser
encontrado: no Google e também nos mecanismos de resposta por IA (ChatGPT, Gemini,
Perplexity, Claude, Copilot). Toda mudança de código ou de conteúdo passa por estas regras.

Estado atual e histórico das versões: [CHANGELOG.md](CHANGELOG.md).

---

## 1. Regras invioláveis

1. **O conteúdo tem que existir no HTML do servidor.** Nada de texto que só aparece depois
   de JavaScript, clique ou rolagem. Os robôs leem o HTML; o que não está nele não existe.
   - As animações de entrada usam **opacidade**, nunca `visibility: hidden` nem
     `display: none`, que retiram o texto do conteúdo lido (isso já custou 651 palavras
     invisíveis na home uma vez).
2. **Uma página, um assunto, um `<h1>`.** Hierarquia `h1 → h2 → h3` sem pular níveis.
3. **Toda página precisa de título, descrição e canonical próprios**, gerados por
   `pageMetadata()` (`project/src/lib/seo.ts`). Nunca escreva `metadata` na mão numa página.
4. **Página sem conteúdo real nasce `noindex`** (`placeholder: true` em `lib/routes.ts`) e
   fica fora do sitemap. Página vazia indexada derruba a avaliação do site inteiro.
5. **Nada de afirmação sem fonte.** Números (latência, volume de ligações, idiomas) e
   certificações precisam de validação antes de publicar. Texto errado citado por uma IA
   vira um problema difícil de desfazer.
6. **Link interno é texto descritivo.** Nunca "clique aqui", nunca link sem texto.
7. **Toda imagem precisa de `alt` com texto** — inclusive as decorativas. `alt=""` não
   passa mais: some do leitor de tela e do buscador. Logo de cliente leva o nome da empresa
   ("Logo da Sittax"); foto e capa levam o que a imagem mostra. A auditoria (seção 8) recusa
   página com imagem sem `alt` ou com `alt` vazio.
8. **URL nova é para sempre.** Defina o endereço em `lib/routes.ts` pensando no longo prazo;
   se precisar mudar depois, crie um redirecionamento 301.

## 2. Checklist para cada página nova ou alterada

- [ ] Entrada em `project/src/lib/routes.ts` com `title`, `description`, `placeholder` e `updated` (data da revisão do conteúdo, alimenta o `<lastmod>` do sitemap).
- [ ] Metadados via `pageMetadata({ title, description, path })`.
- [ ] **Título**: até ~60 caracteres, começa pelo termo que a pessoa busca, sem repetir "PitchYes" (o sufixo é automático).
- [ ] **Descrição**: 120–160 caracteres, com a proposta de valor e uma razão para clicar.
- [ ] Dados estruturados via `<JsonLd graph={[...]} />`: `WebPage` sempre, mais `BreadcrumbList` em páginas internas, `FAQPage` quando houver perguntas, `Article` nos posts do blog.
- [ ] Um `<h1>` igual ao assunto da página, e subtítulos que respondam às dúvidas reais.
- [ ] Pelo menos 2–3 links internos para páginas relacionadas, com texto descritivo.
- [ ] Conteúdo com substância: para páginas comerciais, mire 600+ palavras reais; páginas com 2 frases não competem.
- [ ] Ao publicar conteúdo de verdade: `placeholder: false` (isso a coloca no sitemap e libera a indexação).
- [ ] Atualize `/llms.txt` (`project/src/app/llms.txt/route.ts`) quando mudarem fatos, números ou a lista de páginas.
- [ ] Depois de publicar, rode `node scripts/seo-audit.mjs` (seção 8) — ela confere todos os itens acima no site online.

## 3. Mecanismos de IA (ChatGPT, Gemini, Perplexity, Claude)

- `/llms.txt` é o resumo oficial do site para modelos: o que a empresa faz, os fatos citáveis
  e o mapa de páginas. **Mantenha sincronizado com o site.** Divergência gera citação errada.
  `/llms-full.txt` traz o texto completo das páginas comerciais, gerado do conteúdo publicado.
  Afirmação ainda sem comprovação fica fora dos dois (`lib/content/claims.ts`); a auditoria confere.
- `robots.txt` (`project/src/app/robots.ts`) libera explicitamente os robôs de IA
  (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, CCBot e outros).
  Remover um nome dessa lista é uma decisão de negócio, não de código.
- Escreva em blocos que possam ser citados: pergunta como subtítulo, resposta objetiva no
  primeiro parágrafo, número com contexto. As IAs citam trechos curtos e autocontidos.
- Dados estruturados são a forma mais confiável de uma IA entender fatos: use `FAQPage`,
  `Organization`, `Product`/`Service`, `Article`.

## 4. Desempenho (afeta posição e conversão)

Orçamento por página, medido no site publicado:

| Métrica | Meta | Como está (home, 2026-09-19) |
|---|---|---|
| LCP | < 2,5s | ~1,3s |
| CLS | < 0,1 | 0 |
| TTFB | < 800ms | ~0,5–0,9s |
| Peso total | < 400 KB | ~39 KB |

- Imagem nova: formato WebP/AVIF, dimensões declaradas (`width`/`height`), `priority` só na imagem principal da primeira tela.
- Toda animação usa GSAP e anima só `transform`/`opacity` (ver seção Motion no `System/README.md`).
- Estáticos de marca e imagens têm cache longo em `project/public/_headers`.

## 5. Estrutura do site

- `lib/routes.ts` é a fonte única: menu, rodapé, páginas e sitemap saem dele. Página que não
  está lá não existe para o site nem para o sitemap.
- `/sitemap.xml` é um índice: `sitemap-paginas.xml` (site), `sitemap-blog.xml` (blog, lido do D1) e
  `sitemap-conteudo.xml` (landing pages ativas e sem noindex, lidas do D1).
- Landing pages (`/conteudo/<slug>`) nascem do mesmo modelo: **várias indexadas com o mesmo texto
  são conteúdo duplicado** (§7). Antes de ligar uma cópia, troque o texto ou marque "Fora do
  Google" nas Configurações da página. Elas ficam fora do `/llms.txt` e do `/llms-full.txt`
  (texto de campanha, com números ainda sem fonte). Trocar o endereço gera redirecionamento
  permanente sozinho.
- Blog (próprio, no D1, editado em `/admin/blog`): o editor só publica sem erro no checklist de
  SEO (`lib/blog/checks.ts`) e gera `BlogPosting`, `Person` e `BreadcrumbList` sozinho.
- Blog: cada artigo precisa de `Article` (autor, data, imagem), canonical próprio e links para
  as páginas comerciais relacionadas. As URLs já estão definidas em `lib/blog.ts`.
- Página 404 responde 404 de verdade (não redirecione erro para a home).

## 6. Ao trocar para o domínio definitivo

1. `SITE_URL` no painel da Cloudflare (variável de execução **e** de build) — ver `project/README.md`.
2. Conferir que `/robots.txt` passou a liberar o acesso e aponta o sitemap.
3. Cadastrar o site no **Google Search Console** e no **Bing Webmaster Tools** e enviar `/sitemap.xml`.
4. Verificar a indexação dos primeiros dias e os erros de cobertura no Search Console.
5. Só então divulgar o endereço: backlinks para a URL errada são difíceis de recuperar.

## 7. O que não fazer

- Texto escondido, palavra-chave repetida artificialmente, conteúdo duplicado entre páginas.
- Conteúdo gerado em massa sem revisão humana: o Google trata como spam, e a IA cita o erro.
- Bloquear CSS ou JavaScript para robôs.
- Publicar página nova sem título e descrição próprios.
- Mudar URL sem redirecionamento.

## 8. Medição

A auditoria está versionada em `project/scripts/seo-audit.mjs` — Node puro, sem dependências.
Ela lê `/sitemap-paginas.xml` do site publicado e confere página a página: título, descrição,
canonical, `robots`, `og:image`, um único `<h1>`, saltos na hierarquia de títulos, `WebPage` e
`BreadcrumbList` no JSON-LD, imagem sem `alt` e contagem de palavras.

```bash
cd project
node scripts/seo-audit.mjs                       # ambiente de homologação (workers.dev)
node scripts/seo-audit.mjs https://pitchyes.com.br   # domínio definitivo
```

Sai com código 1 se alguma página tiver problema. Em `*.workers.dev` o `noindex` é esperado e
não conta como erro; no domínio definitivo, conta.

**Rode antes e depois de qualquer mudança grande** e registre o resultado no `CHANGELOG.md`.
Ela olha só o HTML do servidor — é exatamente o que o robô lê. Peso, LCP e CLS são medidos
no painel, em **Análise › PageSpeed** (`/admin/analise/pagespeed`): notas mobile e desktop do
Google, histórico por página e plano de ação do que corrigir. A indexação de cada URL fica em
**Análise › Search Console** (`/admin/analise/search-console`): verde = o Google rastreou depois da
última alteração; vermelho = rastreamento antigo ou fora do índice.

**Aviso automático:** toda URL criada, alterada ou apagada pelo painel (ou no deploy) reenvia o
sitemap dela ao Google e avisa o IndexNow (Bing e os buscadores de IA que usam o índice dele). O
`<lastmod>` do sitemap de páginas usa a mudança mais recente registrada: **não marque página como
alterada sem mudança real** — `lastmod` falso faz o Google desconfiar do sitemap inteiro.

## 9. Erros que já aconteceram neste site

Custaram tempo uma vez; a auditoria hoje pega cada um deles.

1. **Animação de entrada com `visibility: hidden`** — 651 das 786 palavras da home ficaram
   invisíveis para os robôs. Revelação é sempre por opacidade.
2. **`<title>` vazio na home** — `pageMetadata()` recebia `title: undefined` e apagava o título
   padrão do layout. Hoje o campo só é escrito quando existe.
3. **Imagem social ausente nas páginas internas** — uma rota que declara `openGraph` deixa de
   herdar `app/opengraph-image.jpg` do segmento raiz; a imagem precisa ser repetida (já está
   dentro de `pageMetadata()`).
4. **Descrição fora da faixa** (117 caracteres em `/privacidade`) — 120 a 160, sempre.
5. **Página placeholder indexada** — página sem conteúdo real nasce `placeholder: true`,
   fora do sitemap e `noindex`.
