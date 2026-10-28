import type { Block, PageContent } from "@/content/types";
import type { Field, ListSpec, PageSchema, SectionSpec } from "./types";

// Schema das páginas internas, GERADO a partir dos blocos de cada página: o mesmo editor
// visual da home serve para qualquer página feita com ContentPage, sem formulário à mão.
// Ponteiros: campos do topo na raiz ("h1", "cta.label"); blocos em "blocos.b<n>".

const KIND_LABEL: Record<Block["kind"], string> = {
  prose: "Texto",
  features: "Cards",
  steps: "Etapas",
  stats: "Números",
  checklist: "Checklist",
  cases: "Cases",
  caseStories: "Cases",
  timeline: "Novidades",
  useCases: "Casos de uso",
  logos: "Logos",
  pricing: "Planos",
  table: "Tabela",
  contact: "Formulário de contato",
  faq: "Perguntas frequentes",
  image: "Imagem",
  links: "Links",
  heroForm: "Topo com formulário",
  video: "Vídeo",
  funnel: "Funil de resultados",
  testimonials: "Depoimentos",
  ctaFinal: "Chamada final",
};

/** Nome do tipo de bloco, para a gaveta e a paleta de "Adicionar bloco". */
export function kindLabel(kind: Block["kind"]): string {
  return KIND_LABEL[kind];
}

const f = (pointer: string, label: string, type: Field["type"], extra: Partial<Field> = {}): Field => ({ pointer, label, type, ...extra });
const titleField = f("title", "Título (H2)", "texto", { max: 80 });
const leadField = f("lead", "Linha de apoio", "multilinha", { optional: true, max: 260 });
const eyebrowField = f("eyebrow", "Rótulo acima do título", "texto", { optional: true, max: 40 });

function list(pointer: string, label: string, titleKey: string, fields: Field[], template: Record<string, unknown>, extra: Partial<ListSpec> = {}): ListSpec {
  return { pointer, label, titleField: titleKey, fields, template, min: 1, ...extra };
}

const statsList = (pointer: string) =>
  list(pointer, "Números", "label", [f("value", "Número", "texto", { max: 16, help: "Só número com fonte (SEO.md §1.5)." }), f("label", "Legenda", "texto", { max: 80 })], { value: "0", label: "Legenda" }, { min: 0 });

/**
 * Gaveta de um bloco. `prefix` é onde ele mora na sobreposição ("blocos.b3" nas páginas
 * internas, "blocos.<chave>" nas landing pages); `label`, o nome na lista de seções.
 */
export function blockSection(block: Block, prefix: string, label: string): SectionSpec {
  const base = { key: prefix, label, scope: "pagina" as const, prefix };
  const p = (pointer: string) => `${prefix}.${pointer}`;

  switch (block.kind) {
    case "prose":
      return {
        ...base,
        fields: [eyebrowField, { ...titleField, optional: true }, f("paragraphs", "Parágrafos", "linhas")],
      };
    case "features":
      if (block.source === "setores") {
        return { ...base, fields: [eyebrowField, titleField, leadField], note: "Os cards são a lista de setores do site: edite em “Setores”, no fim desta gaveta. Publicar ali muda todas as páginas que mostram os setores." };
      }
      return {
        ...base,
        fields: [eyebrowField, titleField, leadField],
        lists: [
          list(p("items"), "Cards", "title", [f("title", "Título", "texto", { max: 60 }), f("text", "Texto", "multilinha", { max: 240 }), f("href", "Link (opcional)", "texto", { optional: true, help: "Caminho do site, ex.: /solucoes/ativo" })], { title: "Novo card", text: "Texto do card." }),
        ],
      };
    case "steps":
      return {
        ...base,
        fields: [titleField, leadField],
        lists: [list(p("steps"), "Etapas", "title", [f("label", "Rótulo", "texto", { max: 20 }), f("title", "Título", "texto", { max: 40 }), f("text", "Texto", "multilinha", { max: 200 })], { label: "Dia 01", title: "Nova etapa", text: "Descrição." })],
      };
    case "stats":
      return {
        ...base,
        fields: [
          { ...titleField, optional: true },
          leadField,
          f("bars", "Mostrar como barras de 0 a 100%, dentro de um box", "booleano", {
            help: "Cada número precisa ser um percentual, como 92%.",
          }),
        ],
        lists: [list(p("items"), "Números", "label", [f("value", "Número", "texto", { max: 16, help: "Só número com fonte (SEO.md §1.5)." }), f("label", "Legenda", "texto", { max: 80 })], { value: "0", label: "Legenda" })],
      };
    case "checklist":
      return { ...base, fields: [titleField, leadField, f("items", "Itens", "linhas")] };
    case "cases":
      return {
        ...base,
        fields: [titleField, leadField],
        lists: [
          list(
            p("items"),
            "Cases",
            "company",
            [
              f("company", "Empresa", "texto", { max: 40 }),
              f("sector", "Setor", "texto", { max: 30 }),
              f("headline", "Resultado em uma frase", "texto", { max: 120 }),
              f("quote", "Depoimento", "multilinha", { optional: true, max: 280 }),
              f("person", "Quem disse", "texto", { optional: true, max: 60 }),
              f("pending", "Case completo ainda em produção", "booleano"),
            ],
            { company: "Empresa", sector: "Setor", headline: "O que mudou." },
          ),
        ],
      };
    case "useCases":
      return {
        ...base,
        fields: [titleField],
        lists: [list(p("items"), "Casos", "title", [f("title", "Título", "texto", { max: 40 }), f("text", "Texto", "multilinha", { max: 120 })], { title: "Novo caso", text: "O que o agente resolve." })],
      };
    case "timeline":
      return {
        ...base,
        fields: [
          titleField,
          leadField,
          f("sample", "Conteúdo de modelo (ainda não real)", "booleano", { help: "Ligado, as novidades ficam fora do /llms-full.txt. Desligue quando as datas e os textos forem reais." }),
        ],
        lists: [
          list(
            p("items"),
            "Novidades",
            "title",
            [f("date", "Data", "data"), f("title", "Título", "texto", { max: 80 }), f("text", "Resumo", "multilinha", { max: 280 })],
            { date: "2026-01-01", title: "Nova novidade", text: "O que mudou e para quem." },
          ),
        ],
        note: "Os cards aparecem sempre da data mais recente para a mais antiga, qualquer que seja a ordem da lista.",
      };
    case "caseStories":
      return {
        ...base,
        fields: [{ ...titleField, optional: true }, leadField],
        lists: [
          list(
            p("items"),
            "Cases",
            "title",
            [
              eyebrowField,
              f("title", "Título", "texto", { max: 90 }),
              f("paragraphs", "Parágrafos", "linhas"),
              f("videoId", "Vídeo do YouTube (opcional)", "texto", { optional: true, help: "Cole o link do vídeo horizontal. Vazio = usa a foto, se houver." }),
              f("image", "Foto (opcional)", "imagem", { optional: true, aspect: 16 / 9, help: "Imagem 16:9, usada quando não há vídeo. Sem vídeo e sem foto, o texto ocupa a largura toda." }),
              f("alt", "Descrição do vídeo ou da foto", "texto", { optional: true, max: 140, help: "O que a imagem mostra (SEO.md §1.7). Obrigatório quando há vídeo ou foto." }),
            ],
            { title: "Novo case", paragraphs: ["Contexto, o que foi automatizado e o que mudou."] },
          ),
        ],
        note: "Cada case aparece num container com borda, um embaixo do outro, na ordem da lista.",
      };
    case "logos":
      if (block.source === "proprio") {
        return {
          ...base,
          fields: [titleField, leadField],
          lists: [
            list(
              p("items"),
              "Logos",
              "name",
              [
                f("name", "Nome da empresa", "texto", { max: 40, help: "Vira o texto alternativo: “Logo da <empresa>”." }),
                f("logo", "Logo", "imagem", { help: "PNG ou WebP com fundo transparente." }),
              ],
              { name: "Empresa", logo: "/brand/pitchyes-symbol.svg", width: 120, height: 40 },
            ),
          ],
        };
      }
      return {
        ...base,
        fields: [titleField, leadField, f("moreLabel", "Texto do último box", "texto", { optional: true, max: 40, help: "Vazio = “+400 empresas no Brasil”." })],
        note: "Os logos ficam na seção “Clientes (logos)”, no fim desta gaveta — a mesma lista da home.",
      };
    case "pricing":
      return {
        ...base,
        fields: [titleField, leadField, f("note", "Nota abaixo dos planos", "multilinha", { optional: true, max: 300 })],
        lists: [
          list(
            p("plans"),
            "Planos",
            "name",
            [
              f("name", "Nome", "texto", { max: 24 }),
              f("audience", "Para quem", "texto", { max: 40 }),
              f("price", "Preço", "texto", { max: 16 }),
              f("priceUnit", "Unidade do preço", "texto", { optional: true, max: 16, help: "Ex.: /mês, /100 min" }),
              f("fee", "Linha abaixo do preço", "texto", { max: 90 }),
              f("features", "Itens do plano", "linhas"),
              f("cta.label", "Texto do botão", "texto", { max: 30 }),
              f("cta.href", "Link do botão", "texto", { help: "Caminho do site, ex.: /conteudo/cadastro" }),
              f("highlight", "Plano em destaque", "booleano"),
            ],
            { name: "Novo plano", audience: "Para quem", price: "R$ 0", fee: "Descrição", features: ["Item"], cta: { label: "Falar com vendas", href: "/conteudo/cadastro" } },
          ),
        ],
      };
    case "table":
      return {
        ...base,
        fields: [
          titleField,
          leadField,
          f("columns", "Colunas", "linhas", { help: "Na ordem da tabela." }),
          f("rowHeader", "Cabeçalho da primeira coluna", "texto", { optional: true, max: 30, help: "Vazio = “Recurso”." }),
          f("compare", "Tabela comparativa", "booleano", { help: "Destaca a primeira coluna; “Sim” e “Não” viram ícones e [rótulo](https://…) vira link externo." }),
        ],
        lists: [list(p("groups"), "Grupos da tabela", "title", [f("title", "Nome do grupo", "texto", { optional: true, max: 60, help: "Vazio = sem linha de grupo." }), f("rows", "Linhas", "tabela")], { title: "Novo grupo", rows: [{ label: "Item", values: ["—", "—", "—"] }] })],
        note: "Cada linha precisa ter um valor por coluna.",
      };
    case "contact":
      return {
        ...base,
        fields: [
          titleField,
          f("submitLabel", "Texto do botão de envio", "texto", { max: 40 }),
          f("benefits", "Benefícios (ao lado do formulário)", "linhas", { optional: true }),
          f("highlight.title", "Destaque: título", "texto", { optional: true, max: 60 }),
          f("highlight.text", "Destaque: texto", "multilinha", { optional: true, max: 280 }),
        ],
        lists: [list(p("channels"), "Canais de contato", "label", [f("label", "Canal", "texto", { max: 30 }), f("value", "Valor", "texto", { max: 120 }), f("hint", "Observação", "texto", { optional: true, max: 80 }), f("href", "Link (tel:, mailto:, https://)", "texto", { optional: true })], { label: "Canal", value: "Valor" })],
        note: "Os campos do formulário em si ficam no código (lib/leads.ts).",
      };
    case "faq":
      return {
        ...base,
        fields: [titleField],
        lists: [list(p("items"), "Perguntas", "q", [f("q", "Pergunta", "texto", { max: 120 }), f("a", "Resposta", "multilinha", { max: 600, help: "Resposta objetiva no começo: é o trecho que o Google e as IAs citam." })], { q: "Nova pergunta?", a: "Resposta." })],
      };
    case "image":
      return { ...base, fields: [f("src", "Imagem", "imagem"), f("alt", "Texto alternativo", "texto", { max: 140, help: "Descreva o que a imagem mostra (SEO.md §1.7)." }), f("caption", "Legenda", "texto", { optional: true, max: 140 })] };
    case "links":
      return {
        ...base,
        fields: [titleField, leadField],
        lists: [list(p("items"), "Links", "title", [f("title", "Título", "texto", { max: 50 }), f("text", "Texto", "multilinha", { max: 160 }), f("href", "Link", "texto", { help: "Caminho do site, ex.: /planos" })], { title: "Página", text: "Por que visitar.", href: "/" })],
      };
    case "heroForm":
      return {
        ...base,
        fields: [
          eyebrowField,
          f("title", "Título principal (H1)", "texto", { max: 90, help: "Um por página, com o assunto dela (SEO.md §1.2)." }),
          f("lead", "Linha de apoio", "multilinha", { max: 320 }),
          f("bullets", "Marcadores", "linhas"),
          f("proof", "Linha de prova", "texto", { optional: true, max: 90, help: "Ex.: “20Mi+ ligações · 400+ empresas”. Só número com fonte." }),
          f("formTitle", "Título do formulário", "texto", { max: 60 }),
          f("submitLabel", "Texto do botão de envio", "texto", { max: 30 }),
          f("formNote", "Linha abaixo do botão", "texto", { optional: true, max: 90 }),
        ],
        note: "Os campos do formulário ficam no código (lib/leads.ts, formulário “landing”) e alimentam a Central de leads.",
        lockedReason: "O topo carrega o único título principal (h1) e o formulário da página.",
      };
    case "video":
      return {
        ...base,
        fields: [
          eyebrowField,
          titleField,
          leadField,
          f("videoId", "Vídeo do YouTube", "texto", { help: "Cole o link do vídeo ou só o id (ex.: BkdjBEooc1o)." }),
          f("alt", "Descrição da capa", "texto", { max: 120, help: "O que o vídeo mostra (texto alternativo da capa)." }),
          f("poster", "Capa (opcional)", "imagem", { optional: true, aspect: 16 / 9, help: "Imagem 16:9. Vazio = a capa do próprio YouTube." }),
          f("stepsTitle", "Título da lista ao lado", "texto", { optional: true, max: 40 }),
          f("steps", "Itens da lista", "linhas", { optional: true }),
          f("quote", "Depoimento", "multilinha", { optional: true, max: 280 }),
          f("person", "Quem disse", "texto", { optional: true, max: 60 }),
        ],
        lists: [statsList(p("stats"))],
      };
    case "funnel":
      return {
        ...base,
        fields: [eyebrowField, titleField, leadField, f("note", "Aviso abaixo do funil", "multilinha", { optional: true, max: 500 })],
        lists: [
          list(
            p("steps"),
            "Etapas do funil",
            "label",
            [f("value", "Número", "texto", { max: 12 }), f("percent", "Percentual", "texto", { max: 8 }), f("label", "Etapa", "texto", { max: 40 })],
            { value: "0", percent: "0%", label: "Etapa" },
          ),
        ],
      };
    case "testimonials":
      return {
        ...base,
        fields: [eyebrowField, titleField, leadField],
        lists: [
          statsList(p("stats")),
          list(
            p("items"),
            "Depoimentos",
            "name",
            [
              f("quote", "Depoimento", "multilinha", { max: 400 }),
              f("name", "Nome", "texto", { max: 50 }),
              f("role", "Cargo", "texto", { max: 50 }),
              f("company", "Empresa", "texto", { max: 50 }),
            ],
            { quote: "Depoimento.", name: "Nome", role: "Cargo", company: "Empresa" },
          ),
        ],
      };
    case "ctaFinal":
      return { ...base, fields: [titleField, leadField, f("items", "Marcadores", "linhas"), f("button", "Texto do botão", "texto", { max: 30 })] };
  }
}

/** Campos que todo bloco de landing page tem: item do menu e botão para o formulário. */
export const landingBlockFields: Field[] = [
  f("menuLabel", "Item no menu do topo", "texto", { optional: true, max: 20, help: "Vazio = o bloco não aparece no menu." }),
  f("cta", "Botão abaixo do bloco", "texto", { optional: true, max: 40, help: "Leva ao formulário. Vazio = sem botão." }),
];

/** Gaveta da página interna: o topo (h1 etc.) e um bloco por seção do conteúdo. */
export function buildInnerSchema(path: string, label: string, content: PageContent): PageSchema {
  const top: SectionSpec = {
    key: "topo",
    label: "Topo",
    scope: "pagina",
    prefix: "",
    lockedReason: "O topo carrega o único título principal (h1) da página.",
    fields: [
      f("eyebrow", "Rótulo acima do título", "texto", { optional: true, max: 40 }),
      f("h1", "Título principal (H1)", "texto", { max: 90, help: "Um por página, com o assunto dela (SEO.md §1.2)." }),
      f("lead", "Linha de apoio", "multilinha", { max: 320 }),
      ...(content.cta ? [f("cta.label", "Texto do botão", "texto", { max: 40 })] : []),
    ],
    note: "Título e descrição para o Google ficam em “Editar Meta”, na lista de páginas.",
  };
  return {
    path,
    label,
    sections: [
      top,
      ...content.blocks.map((block, index) =>
        blockSection(block, `blocos.b${index}`, `${index + 1}. ${("title" in block && block.title) || KIND_LABEL[block.kind]}`),
      ),
    ],
  };
}
