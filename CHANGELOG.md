# Changelog: site PitchYes

Histórico do site institucional da PitchYes (Next.js 16 no Cloudflare Workers).
Ambiente de homologação: https://pitchyes-site.borges-filho.workers.dev

Cada entrada traz o commit e a versão publicada no Cloudflare (`Version ID`, visível em
Workers & Pages → `pitchyes-site` → Deployments).

---

## 2026-09-21: Rastreamento liberado no endereço de homologação (TEMPORÁRIO)

Commit `PENDENTE` · Cloudflare `5228f3aa`

A pedido do time, para testar Search Console e os robôs de IA antes do domínio definitivo.

- **`/robots.txt` passou a liberar tudo**, bloqueando só `/admin` e `/api`, e a publicar o
  endereço do sitemap. As páginas perderam o `noindex`: as 16 servem `index, follow`.
- **Controlado por uma variável**, `ROBOTS_MODE` (`teste` libera; qualquer outro valor volta ao
  padrão, que bloqueia tudo fora do domínio definitivo). Trocar no painel da Cloudflare vale na
  hora, sem deploy — ver o aviso em `src/lib/site.ts`.
- **A área interna segue fechada**: `/admin` continua exigindo sessão, com `noindex` no cabeçalho
  da resposta, e está no `Disallow`.

**Risco assumido, registrado aqui de propósito:** um endereço `workers.dev` no índice do Google
depois compete com `pitchyes.com.br` e dá trabalho para remover (ver SEO.md §6). **Voltar para
`ROBOTS_MODE=padrao` na próxima atualização do site.**

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
