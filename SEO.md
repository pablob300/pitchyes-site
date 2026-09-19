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
7. **Imagem sem `alt` não entra**, exceto quando é puramente decorativa (aí `alt=""`).
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

## 3. Mecanismos de IA (ChatGPT, Gemini, Perplexity, Claude)

- `/llms.txt` é o resumo oficial do site para modelos: o que a empresa faz, os fatos citáveis
  e o mapa de páginas. **Mantenha sincronizado com o site.** Divergência gera citação errada.
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
- `/sitemap.xml` é um índice: `sitemap-paginas.xml` (site) e `sitemap-blog.xml` (WordPress).
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

Scripts de auditoria usados nas revisões (rodam contra o site publicado, via Chrome headless):
metadados, dados estruturados, hierarquia de títulos, links, Core Web Vitals. Ao fazer uma
mudança grande, rode a auditoria antes e depois e registre o resultado no CHANGELOG.
