import "server-only";
import { innerPageDefaults } from "@/content/registry";
import type { Block, PageContent } from "@/content/types";
import { getPageContentData, type ContentStatus } from "@/lib/page-content";
import { mergeContent, parseOverride } from "./merge";
import { getSiteContent } from "./resolve";

// Conteúdo das páginas internas: o texto do código (content/*.ts) com a sobreposição do
// editor visual por cima.
//
// A sobreposição tem o formato { eyebrow, h1, lead, cta: { label }, blocos: { b0: {...},
// b3: {...} } }. Cada bloco tem chave estável pela posição ("b3" é o 4º bloco do arquivo):
// o editor não aceita índice numérico em ponteiro, e chave por bloco faz a fusão ser bloco a
// bloco — editar o título do bloco 3 não congela os outros. Dentro de um bloco, valem as
// regras de merge.ts: objeto mescla por chave, LISTA SUBSTITUI INTEIRA.
//
// A estrutura (quais blocos existem, a ordem e o tipo de cada um) continua no código.

const blockKey = (index: number) => `b${index}`;

const text = (value: unknown): value is string => typeof value === "string" && value.trim() !== "";

/** Campos de texto que não podem ficar vazios, por tipo de bloco. */
const REQUIRED: Partial<Record<Block["kind"], string[]>> = {
  features: ["title"],
  steps: ["title"],
  checklist: ["title"],
  cases: ["title"],
  logos: ["title"],
  pricing: ["title"],
  table: ["title"],
  contact: ["title", "submitLabel"],
  faq: ["title"],
  links: ["title"],
  image: ["src", "alt"],
};

/** Listas de cada bloco que precisam ter itens (e itens com os campos de texto do molde). */
const LISTS: Partial<Record<Block["kind"], string[]>> = {
  prose: ["paragraphs"],
  features: ["items"],
  steps: ["steps"],
  stats: ["items"],
  checklist: ["items"],
  cases: ["items"],
  pricing: ["plans"],
  table: ["columns", "groups"],
  contact: ["channels"],
  faq: ["items"],
  links: ["items"],
};

/** O bloco editado ainda tem o formato que o componente espera? */
function validBlock(block: Block, fallback: Block): boolean {
  if (block.kind !== fallback.kind) return false;
  const record = block as unknown as Record<string, unknown>;
  const original = fallback as unknown as Record<string, unknown>;
  for (const key of REQUIRED[block.kind] ?? []) if (!text(record[key])) return false;
  for (const key of LISTS[block.kind] ?? []) {
    const list = record[key];
    if (!Array.isArray(list) || list.length === 0) return false;
    const template = (original[key] as unknown[] | undefined)?.[0];
    if (typeof template === "string") {
      if (!list.every(text)) return false;
    } else if (template && typeof template === "object") {
      // Campos de texto que o molde preenche são obrigatórios nos itens (título, pergunta…),
      // menos os que nascem opcionais no tipo (quote, person, hint, href, priceUnit…).
      const optional = new Set(["quote", "person", "hint", "href", "priceUnit", "text", "lead", "eyebrow"]);
      const required = Object.entries(template as Record<string, unknown>)
        .filter(([k, v]) => typeof v === "string" && v.trim() !== "" && !optional.has(k))
        .map(([k]) => k);
      if (!list.every((item) => item && typeof item === "object" && required.every((k) => text((item as Record<string, unknown>)[k])))) {
        return false;
      }
    }
  }
  // Tabela: cada linha com um valor por coluna.
  if (block.kind === "table") {
    const columns = block.columns.length;
    if (!block.groups.every((g) => text(g.title) && Array.isArray(g.rows) && g.rows.length > 0 && g.rows.every((r) => text(r.label) && Array.isArray(r.values) && r.values.length === columns))) {
      return false;
    }
  }
  return true;
}

/**
 * Funde a sobreposição no padrão. Bloco que não passa na conferência volta ao padrão do
 * código (e o nome dele vai para `report`, que a API usa para recusar a gravação).
 */
export function resolveInnerPage(defaults: PageContent, override: unknown, report?: string[]): PageContent {
  const data = (override && typeof override === "object" ? override : {}) as Record<string, unknown>;
  const top = mergeContent(
    { eyebrow: defaults.eyebrow ?? "", h1: defaults.h1, lead: defaults.lead, cta: defaults.cta ? { label: defaults.cta.label } : undefined },
    { eyebrow: data.eyebrow, h1: data.h1, lead: data.lead, cta: data.cta },
  );
  if (!text(top.h1)) {
    report?.push("topo");
    top.h1 = defaults.h1;
  }
  if (!text(top.lead)) {
    report?.push("topo");
    top.lead = defaults.lead;
  }

  const blocosOverride = (data.blocos && typeof data.blocos === "object" ? data.blocos : {}) as Record<string, unknown>;
  const blocks = defaults.blocks.map((block, index) => {
    const patch = blocosOverride[blockKey(index)];
    if (!patch) return block;
    const merged = mergeContent(block, patch);
    try {
      if (validBlock(merged, block)) return merged;
    } catch {
      // formato tão fora do esperado que a conferência quebrou
    }
    if (report) report.push(blockKey(index));
    else console.error(`[conteudo] bloco inválido, usando o padrão do código: ${blockKey(index)}`);
    return block;
  });

  return {
    ...defaults,
    eyebrow: top.eyebrow || defaults.eyebrow,
    h1: top.h1,
    lead: top.lead,
    cta: defaults.cta && top.cta?.label ? { ...defaults.cta, label: top.cta.label } : defaults.cta,
    blocks,
  };
}

/** Formato que a gaveta do editor lê: blocos como objeto { b0, b1, … } (ponteiros estáveis). */
export function innerEditorView(content: PageContent): Record<string, unknown> {
  return {
    eyebrow: content.eyebrow ?? "",
    h1: content.h1,
    lead: content.lead,
    ...(content.cta ? { cta: { label: content.cta.label } } : {}),
    blocos: Object.fromEntries(content.blocks.map((block, index) => [blockKey(index), block])),
  };
}

export function invalidInnerSections(path: string, override: unknown): string[] {
  const defaults = innerPageDefaults(path);
  if (!defaults) return ["pagina"];
  const report: string[] = [];
  resolveInnerPage(defaults, override, report);
  return [...new Set(report)];
}

/** Conteúdo publicado (site) ou rascunho (editor) de uma página interna. */
export async function getInnerPageContent(path: string, status: ContentStatus = "publicado"): Promise<PageContent> {
  const defaults = innerPageDefaults(path);
  if (!defaults) throw new Error(`Página interna sem conteúdo registrado: ${path}`);
  const [data, site] = await Promise.all([getPageContentData(path, status), getSiteContent(status)]);
  const content = resolveInnerPage(defaults, parseOverride(data));
  // Bloco de logos mostra a parede de logos do site (editável no painel), não a lista do código.
  return { ...content, blocks: content.blocks.map((b) => (b.kind === "logos" ? { ...b, items: site.clients } : b)) };
}
