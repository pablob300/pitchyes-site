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
        fields: [{ ...titleField, optional: true }, leadField],
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
      return { ...base, fields: [titleField, leadField], note: "Os logos ficam na seção “Clientes (logos)”, no fim desta gaveta — a mesma lista da home." };
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
              f("cta.href", "Link do botão", "texto", { help: "Caminho do site, ex.: /contato" }),
              f("highlight", "Plano em destaque", "booleano"),
            ],
            { name: "Novo plano", audience: "Para quem", price: "R$ 0", fee: "Descrição", features: ["Item"], cta: { label: "Falar com vendas", href: "/contato" } },
          ),
        ],
      };
    case "table":
      return {
        ...base,
        fields: [titleField, leadField, f("columns", "Colunas (planos)", "linhas", { help: "Na ordem da tabela." })],
        lists: [list(p("groups"), "Grupos da tabela", "title", [f("title", "Nome do grupo", "texto", { max: 60 }), f("rows", "Linhas", "tabela")], { title: "Novo grupo", rows: [{ label: "Item", values: ["—", "—", "—"] }] })],
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
