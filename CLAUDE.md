# Regras do projeto PitchYes

Site institucional em Next.js 16 servido pelo Cloudflare Workers (OpenNext).
Homologação: <https://pitchyes-site.matheus-arantes.workers.dev> — domínio definitivo ainda não ligado.

Leia antes de qualquer alteração no site:

- **[SEO.md](SEO.md)**: regras de SEO e indexação (Google e mecanismos de IA). O maior
  objetivo do projeto é ser encontrado — toda mudança de código ou conteúdo passa por lá.
- **[System/README.md](System/README.md)**: design system (tokens, componentes, marca e
  regras de animação). O visual sempre sai daqui; componente novo ganha referência no System.
- **[CHANGELOG.md](CHANGELOG.md)**: histórico das versões e pendências abertas.
- **[project/README.md](project/README.md)**: como o site funciona (páginas, blog, domínio, deploy).

## Onde ficam as coisas

| Preciso mexer em… | Arquivo |
|---|---|
| Mapa do site, menu, rodapé, sitemap | `project/src/lib/routes.ts` (fonte única) |
| Título, descrição, canonical, Open Graph, robots | `project/src/lib/seo.ts` (`pageMetadata()`) |
| Dados estruturados (JSON-LD) | `project/src/lib/seo.ts` + `<JsonLd graph={[...]} />` |
| Texto de uma página interna | `project/src/content/<pagina>.ts` |
| Como esse texto vira layout | `project/src/components/blocks/ContentPage.tsx` (`content/types.ts` lista os blocos) |
| Home | `project/src/components/home/` (textos em `home/content.ts`) |
| Campos que o editor visual mostra | `project/src/lib/content/schema/` |
| Quais páginas já têm editor de conteúdo | `project/src/lib/content/pages.ts` (internas: `src/content/registry.ts`) |
| Cabeçalho, rodapé, faixa de CTA | `project/src/components/layout/` |
| Setores atendidos (lista global, como a de clientes) | `project/src/content/sectors.ts`; painel: seção "Setores" (`/_site`). Bloco de cards com `source: "setores"` mostra a lista |
| Cases empilhados (vídeo/foto + texto) e case da home | Bloco `caseStories` / seção `caseHighlight`; componente `components/blocks/CaseStory.tsx` |
| Novidades datadas | Bloco `timeline` em `content/novidades.ts` (`sample: true` = conteúdo de modelo, fora do `/llms-full.txt`) |
| Hero: palavras do título + cards do player | `hero.titleWords` (texto + áudio); relógio único em `components/home/HeroSync.tsx` |
| Endereço, telefone, e-mail, redes sociais, selo Reclame Aqui | `project/src/lib/company.ts` (fonte única; alimenta o rodapé, o JSON-LD da Organization e o `/llms.txt`) |
| Domínio e regra de indexação | `project/src/lib/site.ts` (`SITE_URL`, `SITE_ENV`) |
| Menu do painel (seções e submenus) | `project/src/lib/admin/nav.ts` |
| PageSpeed no painel (chamada ao Google, relatório, textos em português) | `project/src/lib/admin/pagespeed/` (`guide.ts` traduz cada auditoria) |
| Blog (artigos, categorias, tags, autores) | Painel `/admin/blog`; código em `project/src/lib/blog.ts` e `project/src/lib/blog/` |
| Resumo do site para IAs | `project/src/app/llms.txt/route.ts` (texto completo: `llms-full.txt/route.ts`; afirmações ainda sem prova que ficam fora deles: `lib/content/claims.ts`) |
| JSON-LD das páginas internas | `project/src/lib/content/jsonld.ts` (`innerPageGraph`) |
| Landing pages (/conteudo/&lt;slug&gt;) | Painel `/admin/landing-pages`; modelo padrão em `project/src/content/landing/modelo.ts`; banco em `lib/landing-db.ts`; conteúdo em `lib/content/landing.ts`; página em `app/(lp)/conteudo/[slug]` |
| Nome do site, logo, favicon, Google Tag Manager | Painel `/admin/configuracoes`; código em `project/src/lib/settings.ts` (tipos: `site-settings.ts`) |
| Formulários: perfil comercial e eventos `lead`/`LigarAgora` do dataLayer | `project/src/lib/leads.ts` (`TEAM_OPTIONS`, `leadProfile`) e `lib/tracking.ts` (`pushLead`, `pushCallNow`) |
| Modal das landing pages (confirma telefone, número da IA, contagem) e página `/conteudo/obrigado` | `components/forms/PhoneConfirmDialog.tsx` (número em `lib/company.ts`, `aiCaller`); `app/(site)/conteudo/obrigado/` |
| Para onde vão os CTAs: comercial → `/conteudo/cadastro`, contato → `/contato`, vagas → LinkedIn | `project/src/lib/routes.ts` (`TALK_TO_AI_HREF`, `CAREERS_HREF`, `THANK_YOU_HREF`) |
| Cores, tipografia, espaçamento, motion | `project/src/styles/tokens/` (espelham `System/tokens/`) |

**Página nova com conteúdo real:** crie `project/src/app/<caminho>/page.tsx` (tem prioridade
sobre o coringa `app/[...slug]`), escreva o texto em `src/content/`, e marque `placeholder: false`
em `routes.ts` — só assim ela entra no sitemap e na indexação.

## Editor visual de conteúdo

A home e as 15 páginas internas são editáveis no painel (`/admin/paginas` → "Editar Conteúdo").
Três regras que economizam depuração:

- **O arquivo de conteúdo (`content.ts` da home, `src/content/<pagina>.ts`) deixa de mandar
  sozinho depois da primeira publicação daquela página.** O que o
  site mostra é o padrão do código fundido com a sobreposição do D1: objeto mescla por
  chave, **lista substitui inteira**. Ou seja, uma FAQ nova acrescentada no código **não
  aparece** se alguém já editou a lista pelo painel — use o "voltar ao padrão" da gaveta.
- **Nada que o site público importe pode ler cookie, cabeçalho ou sessão.** Uma leitura
  dessas tira a página do cache estático e passa a custar um render por visita. Leitura de
  sessão só sob `/admin` e `/editor`. O portão é a saída do `next build`: `/` precisa
  continuar aparecendo como estática com revalidação, nunca como dinâmica.
- **Modo editor só acrescenta atributo, nunca elemento.** Nada de `{editable && <div/>}`
  dentro de um componente de seção — os contornos e as alças moram no painel, por cima do
  iframe. Confira com `curl -s <home> | grep -c data-edit`: tem que dar zero.

Páginas internas (feitas com `ContentPage`): o editor sai sozinho dos blocos. Página interna nova
entra no editor com uma linha em `src/content/registry.ts` e a rota lendo
`getInnerPageContent(path)` (`lib/content/inner.ts`); a gaveta é gerada por `schema/inner.ts`.
A edição é bloco a bloco (`blocos.b<n>`, pela posição no arquivo): **mudar a ordem ou apagar um
bloco no código desalinha as edições já publicadas daquela página** — confira a página no painel
depois. A estrutura (quais blocos, a ordem, o tipo) continua no código; o painel edita texto,
listas, planos, tabela e imagens. A lista de clientes (logo + nome) é global (`/_site`,
seção "Clientes (logos)"): aparece na gaveta da home e na de `/clientes`, e publicar em
qualquer uma muda as duas. Página com layout próprio: schema em `lib/content/schema/`,
`edit()` nos componentes e o caminho em `lib/content/pages.ts`.

### Landing pages, configurações e formulários

- **Landing page guarda o documento inteiro no banco** (`page_content`, caminho `/_lp/<id>`), não
  uma sobreposição: "Criar página" copia o modelo de `content/landing/modelo.ts`, e mudar o
  modelo depois só afeta as páginas novas. Os blocos têm chave estável (`blocos.<chave>`), então
  o editor adiciona, remove e reordena sem desalinhar nada. A página precisa de exatamente um
  "Topo com formulário" visível (é o `h1` e o `#formulario`).
- **Landing page não tem link para o resto do site**: menu de âncoras (`menuLabel` dos blocos) e
  botões para `#formulario` (`cta`). Só a Política de Privacidade abre, em outra aba.
- **Salvar em Configurações revalida o site inteiro.** No plano gratuito do Workers isso derruba
  com 500/503 por alguns minutos as páginas que ainda não se remontaram; evite salvar à toa.
- **Destino dos botões:** "Fale com nossa IA", demonstração, orçamento e "Falar com vendas" levam à
  landing page `/conteudo/cadastro` (desligá-la no painel quebra esses botões); quem quer falar com
  a empresa vai para `/contato`; vagas, para o LinkedIn. Dentro das landing pages vale a regra delas
  (tudo leva ao `#formulario`).
- **Cadastro na landing page:** o envio abre um modal que confirma o telefone **antes** de gravar o
  lead; depois do "Sim" grava e dispara `lead`, pede para salvar o número da IA nos contatos e, no
  "Já salvei o contato" (liberado 5 s depois de copiar), dispara `LigarAgora` e leva a
  `/conteudo/obrigado` (noindex, fora do sitemap; "obrigado" é slug reservado).
- **Perfil comercial:** os formulários que perguntam o tamanho do time usam `TEAM_OPTIONS`.
  "Sem time comercial" e "1 vendedor" gravam o lead com a etiqueta "Sem perfil" e **não** disparam
  os eventos `lead` e `LigarAgora`; as outras faixas, "Perfil comercial" e disparam. O evento só sai depois que o
  servidor aceita o envio.

### Rotina: todo conteúdo criado, alterado ou apagado passa pelo Page Editor

Antes de publicar qualquer mudança de texto, seção, lista ou página, confira:

1. **O banco manda?** Leia o que está publicado: `page_content` (home `/` e conteúdo global
   `/_site`) e `page_meta` (título, descrição e data de todas as páginas):
   `npx wrangler d1 execute pitchyes-leads --remote --command "SELECT path, status, data FROM page_content"`.
   Se a chave mudada estiver sobrescrita lá, o código sozinho não muda o site: atualize a
   sobreposição (pelo painel, ou SQL guardando versão em `page_content_versions`) ou avise quem edita.
2. **O editor enxerga?** Campo novo na home ou no `_site` precisa de entrada no schema
   (`lib/content/schema/home.ts`) e de `edit()` no componente; texto maior que o `max` do
   campo não cabe no painel — ajuste o limite junto. Campo apagado sai do schema também.
3. **Página nova, renomeada ou apagada:** `lib/routes.ts`, `lib/page-defaults.ts` (padrão da
   gaveta de metadados), linha de `page_meta` (mover o `path` quando a URL muda, apagar quando
   a página some) e redirecionamento 301 em `next.config.ts`.
4. **Data de revisão:** `updated` em `routes.ts` **e** em `page_meta` (a do banco vence no sitemap).
5. Depois do deploy, abra `/admin/paginas` e a gaveta/editor da página mudada e confira que
   ela mostra o texto novo.

## Fluxo de trabalho

**"Publicar" sempre significa o ciclo inteiro:** commit, push e deploy (com os passos abaixo).
Nunca só um deles.

1. Alterar o código em `project/`, usando os tokens e componentes de `System/`.
2. Conferir tipos e lint: `cd project && npx tsc --noEmit && npm run lint`.
3. Publicar (`npm run deploy`, já roda o build) e **testar no ambiente online**, não só localmente.
4. Rodar a auditoria contra o site publicado: `node scripts/seo-audit.mjs` (ver [SEO.md §8](SEO.md)).
5. Registrar a versão no `CHANGELOG.md` (commit + `Version ID` da Cloudflare, que o deploy imprime).
6. Commit e push.

## Convenções que economizam tempo

- **Texto do site em português**; comentários e nomes de código em inglês, como já está.
- **Conteúdo é dado, não JSX.** Prefira um bloco novo em `content/types.ts` a uma página com
  layout próprio — assim a revisão de texto acontece em um arquivo só.
- **Pendência de conteúdo vira `TODO(área)`** no arquivo de conteúdo (`comercial`, `jurídico`,
  `produto`, `contato`, `empresa`) e entra na lista de pendências do `CHANGELOG.md`.
  Número sem fonte não é publicado (SEO.md §1.5).
- **Ao mudar texto de uma página**, atualize o campo `updated` dela em `routes.ts` (vira `<lastmod>`)
  e, se mudou um fato ou número, o `/llms.txt`.
- **Animação:** só GSAP, só `transform`/`opacity`, revelação por opacidade.
  Nunca `visibility: hidden` nem `display: none` — some texto do HTML lido pelos robôs.
- **Commits**: uma frase no imperativo descrevendo o efeito ("Center the main menu…"). O hash
  do commit e o Version ID entram no `CHANGELOG.md` logo depois, em um commit "Changelog: …".

@SEO.md
