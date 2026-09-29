import type { PageSchema } from "./types";

// Campos editáveis da página inicial.
//
// A ordem das seções aqui é a ordem em que elas aparecem na lista do editor. Cada campo
// aponta para o mesmo lugar que o `data-edit` do componente, e é isso que liga o clique
// na página ao formulário da gaveta.

export const homeSchema: PageSchema = {
  path: "/",
  label: "Página inicial",
  sections: [
    {
      key: "hero",
      label: "Topo",
      scope: "pagina",
      prefix: "hero",
      lockedReason: "O topo carrega o único título principal (h1) da página.",
      fields: [
        {
          pointer: "titleBefore",
          label: "Título — início",
          type: "texto",
          help: "O h1 é montado em três pedaços. Cuide dos espaços nas pontas.",
        },
        { pointer: "titleAccent", label: "Título — trecho em destaque", type: "texto" },
        { pointer: "titleAfter", label: "Título — fim", type: "texto" },
        { pointer: "lead", label: "Linha de apoio", type: "paragrafo", max: 180 },
        { pointer: "cta", label: "Botão", type: "texto", max: 30 },
        { pointer: "stat.value", label: "Número em destaque", type: "texto" },
        { pointer: "stat.label", label: "Legenda do número", type: "texto" },
        { pointer: "widget.eyebrow", label: "Rótulo dos cards", type: "texto", max: 30, help: "Vem antes do nome de cada agente: “Ouça nosso agente de” + “Saúde”." },
        { pointer: "widget.hint", label: "Dica abaixo dos cards", type: "texto", max: 60 },
      ],
      lists: [
        {
          pointer: "hero.widget.agents",
          label: "Cards de agente",
          titleField: "name",
          min: 1,
          template: { name: "Novo agente", audio: "/audio/agente-pitchyes.mp3" },
          fields: [
            { pointer: "name", label: "Nome (completa o rótulo)", type: "texto", max: 20 },
            {
              pointer: "audio",
              label: "Arquivo de áudio",
              type: "texto",
              help: "Caminho do MP3 em /public/audio. O envio de áudio ainda não passa pelo painel.",
            },
          ],
        },
      ],
    },
    {
      key: "clientLogos",
      label: "Faixa de logos",
      scope: "pagina",
      prefix: "clientLogos",
      note: "Os logos em si são conteúdo do site inteiro: edite-os em “Parede de logos”.",
      fields: [{ pointer: "title", label: "Título", type: "texto", max: 60 }],
    },
    {
      key: "platform",
      label: "Plataforma",
      scope: "pagina",
      prefix: "platform",
      fields: [
        { pointer: "eyebrow", label: "Rótulo", type: "texto", max: 24 },
        { pointer: "title", label: "Título", type: "texto", max: 60 },
        { pointer: "lead", label: "Linha de apoio", type: "paragrafo", max: 200 },
      ],
      lists: [
        {
          pointer: "platform.pillars",
          label: "Pilastras",
          titleField: "title",
          fixed: true,
          help: "São seis, e cada uma tem a própria ilustração desenhada em código. O texto é editável; adicionar ou remover exige desenvolvimento.",
          template: {},
          fields: [
            { pointer: "eyebrow", label: "Rótulo", type: "texto", max: 24 },
            { pointer: "title", label: "Título", type: "texto", max: 60 },
            { pointer: "text", label: "Texto", type: "paragrafo", max: 160 },
          ],
        },
      ],
    },
    {
      key: "latency",
      label: "Latência",
      scope: "pagina",
      prefix: "latency",
      fields: [
        { pointer: "title", label: "Título", type: "texto", max: 80 },
        { pointer: "unit", label: "Unidade", type: "texto", max: 6 },
      ],
      lists: [
        {
          pointer: "latency.rows",
          label: "Barras",
          titleField: "label",
          min: 1,
          template: { label: "Nova barra", value: 500, duration: 2, highlight: false },
          help: "A largura de cada barra é proporcional ao maior valor da lista.",
          fields: [
            { pointer: "label", label: "Nome", type: "texto" },
            {
              pointer: "value",
              label: "Valor",
              type: "numero",
              help: "Em milissegundos. Número com fonte: este dado também vai para o /llms.txt.",
            },
            {
              pointer: "duration",
              label: "Segundos da animação",
              type: "numero",
              help: "Quanto tempo o número leva para subir de zero até o valor.",
            },
            { pointer: "highlight", label: "Barra em destaque", type: "booleano" },
          ],
        },
      ],
    },
    {
      key: "testimonials",
      label: "Depoimentos em vídeo",
      scope: "pagina",
      prefix: "testimonials",
      fields: [
        { pointer: "eyebrow", label: "Rótulo", type: "texto", max: 24 },
        { pointer: "title", label: "Título", type: "texto", max: 60 },
        { pointer: "lead", label: "Linha de apoio", type: "paragrafo", max: 220 },
      ],
      lists: [
        {
          pointer: "testimonials.items",
          label: "Vídeos",
          titleField: "company",
          min: 1,
          template: {
            company: "Nova empresa",
            videoId: "",
            thumb: "",
            seconds: 60,
            published: new Date().toISOString().slice(0, 10),
          },
          help: "Cole o endereço do Short do YouTube e o código do vídeo é preenchido sozinho. A capa continua sendo enviada à mão: o YouTube só entrega imagem 16:9, e aqui a capa é 9:16.",
          fields: [
            {
              pointer: "company",
              label: "Empresa",
              type: "texto",
              help: "Vira o texto alternativo da capa e o nome do vídeo nos dados estruturados.",
            },
            {
              pointer: "videoId",
              label: "Código do vídeo",
              type: "texto",
              help: "Aceita o endereço completo do YouTube.",
            },
            {
              pointer: "thumb",
              label: "Capa (9:16)",
              type: "imagem",
              aspect: 9 / 16,
              help: "Um quadro do próprio vídeo, servido pelo site — é o que segura o tempo de carregamento.",
            },
            {
              pointer: "seconds",
              label: "Duração (segundos)",
              type: "numero",
              help: "Vai para os dados estruturados do vídeo: número errado vira citação errada.",
            },
            { pointer: "published", label: "Publicado em", type: "data" },
            { pointer: "person", label: "Quem fala", type: "texto", optional: true },
            { pointer: "role", label: "Cargo", type: "texto", optional: true },
            { pointer: "headline", label: "Frase de abertura", type: "texto", optional: true },
            { pointer: "quote", label: "Citação", type: "paragrafo", optional: true },
          ],
        },
      ],
    },
    {
      key: "rollout",
      label: "Implantação",
      scope: "pagina",
      prefix: "rollout",
      fields: [{ pointer: "title", label: "Título", type: "texto", max: 80 }],
      lists: [
        {
          pointer: "rollout.steps",
          label: "Etapas",
          titleField: "title",
          min: 1,
          template: { day: "Dia 00", title: "Nova etapa", text: "" },
          fields: [
            { pointer: "day", label: "Dia", type: "texto", max: 20 },
            { pointer: "title", label: "Título", type: "texto", max: 30 },
            { pointer: "text", label: "Texto", type: "paragrafo", max: 120 },
            { pointer: "live", label: "Marcar como “ao vivo”", type: "booleano", optional: true },
          ],
        },
      ],
    },
    {
      key: "security",
      label: "Segurança",
      scope: "pagina",
      prefix: "security",
      note: "Certificação é afirmação com consequência jurídica: confirme com o time antes de publicar.",
      fields: [
        { pointer: "title", label: "Título", type: "texto", max: 70 },
        { pointer: "lead", label: "Linha de apoio", type: "paragrafo", max: 260 },
        { pointer: "cta", label: "Botão", type: "texto", max: 40 },
      ],
      lists: [
        {
          pointer: "security.items",
          label: "Certificações e controles",
          titleField: "name",
          min: 1,
          template: {
            status: "Auditado",
            name: "Nova certificação",
            detail: "",
            controlTitle: "Novo controle",
            controlText: "",
          },
          help: "Cada item é uma coluna: a certificação em cima, o controle embaixo.",
          fields: [
            { pointer: "status", label: "Situação", type: "texto", max: 16 },
            { pointer: "name", label: "Certificação", type: "texto", max: 16 },
            { pointer: "detail", label: "Detalhe", type: "texto", max: 16 },
            { pointer: "controlTitle", label: "Controle — título", type: "texto", max: 30 },
            { pointer: "controlText", label: "Controle — texto", type: "paragrafo", max: 140 },
          ],
        },
      ],
    },
    {
      key: "useCases",
      label: "Casos de uso",
      scope: "pagina",
      prefix: "useCases",
      fields: [{ pointer: "title", label: "Título", type: "texto", max: 60 }],
      lists: [
        {
          pointer: "useCases.items",
          label: "Casos",
          titleField: "title",
          min: 1,
          template: { title: "Novo caso", text: "" },
          fields: [
            { pointer: "title", label: "Título", type: "texto", max: 40 },
            { pointer: "text", label: "Texto", type: "paragrafo", max: 120 },
          ],
        },
      ],
    },
    {
      key: "faq",
      label: "Perguntas frequentes",
      scope: "pagina",
      prefix: "faq",
      note: "Estas perguntas também viram dados estruturados (FAQPage) — é por aqui que uma IA cita a PitchYes.",
      fields: [{ pointer: "title", label: "Título", type: "texto", max: 40 }],
      lists: [
        {
          pointer: "faq.items",
          label: "Perguntas",
          titleField: "q",
          min: 1,
          template: { q: "Nova pergunta?", a: "" },
          fields: [
            { pointer: "q", label: "Pergunta", type: "texto", max: 90 },
            {
              pointer: "a",
              label: "Resposta",
              type: "paragrafo",
              help: "Responda na primeira frase: é o trecho que os mecanismos de resposta citam.",
            },
          ],
        },
      ],
    },
    {
      key: "finalCta",
      label: "Faixa de CTA",
      scope: "site",
      prefix: "finalCta",
      note: "Aparece em TODAS as páginas do site. Publicar aqui republica o site inteiro.",
      fields: [
        { pointer: "title", label: "Título", type: "texto", max: 60 },
        { pointer: "cta", label: "Botão", type: "texto", max: 30 },
      ],
    },
    {
      key: "clients",
      label: "Parede de logos",
      scope: "site",
      prefix: "",
      note: "Os mesmos logos aparecem na home e na página /clientes.",
      fields: [],
      lists: [
        {
          pointer: "clients",
          label: "Clientes",
          titleField: "name",
          min: 1,
          template: { name: "Nova empresa", logo: "", width: 260, height: 48 },
          help: "O nome da empresa vira o texto alternativo do logo — sem nome, o logo fica invisível para leitor de tela e buscador.",
          fields: [
            { pointer: "name", label: "Empresa", type: "texto" },
            { pointer: "logo", label: "Logo", type: "imagem" },
            { pointer: "width", label: "Largura", type: "numero" },
            { pointer: "height", label: "Altura", type: "numero" },
          ],
        },
      ],
    },
  ],
};
