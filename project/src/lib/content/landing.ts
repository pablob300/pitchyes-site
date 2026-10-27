import type { Block } from "@/content/types";
import { landingBlockTemplates, landingModel, type LandingDoc, type LandingSection } from "@/content/landing/modelo";
import { validBlock } from "./inner";

// Conteúdo das landing pages (/conteudo/<slug>).
//
// Diferente das páginas internas, aqui o banco guarda o DOCUMENTO INTEIRO, não uma
// sobreposição: a página nasce como cópia do modelo (content/landing/modelo.ts) e depois
// ganha, perde e reordena blocos pelo editor. Cada bloco tem uma chave estável
// ("blocos.<chave>"), então remover o 3º bloco não desalinha os seguintes.

/** Bloco que serve de molde para a conferência de um bloco do tipo dado. */
function moldFor(kind: Block["kind"]): Block | undefined {
  return landingBlockTemplates[kind] ?? Object.values(landingModel.blocos).find((b) => b.kind === kind);
}

/** "https://youtu.be/BkdjBEooc1o", "…watch?v=BkdjBEooc1o&t=3" ou só o id → o id. */
export function youtubeId(value: string): string | null {
  const raw = value.trim();
  if (/^[\w-]{11}$/.test(raw)) return raw;
  const match = raw.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/);
  return match ? match[1] : null;
}

function validLandingBlock(block: unknown): block is Block {
  if (!block || typeof block !== "object" || !("kind" in block)) return false;
  const mold = moldFor((block as Block).kind);
  if (!mold) return false;
  try {
    if (!validBlock(block as Block, mold)) return false;
  } catch {
    return false;
  }
  if ((block as Block).kind === "video" && !youtubeId((block as Extract<Block, { kind: "video" }>).videoId)) return false;
  return true;
}

function sectionsOf(data: Record<string, unknown>): LandingSection[] {
  const raw = Array.isArray(data.sections) ? data.sections : [];
  const seen = new Set<string>();
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const key = String((item as LandingSection).key ?? "");
    if (!key || seen.has(key)) return [];
    seen.add(key);
    return [{ key, ...((item as LandingSection).hidden ? { hidden: true } : {}) }];
  });
}

/** O documento como o banco guarda, com o mínimo de forma garantida. */
export function landingDoc(override: unknown): LandingDoc {
  const data = (override && typeof override === "object" ? override : {}) as Record<string, unknown>;
  const blocos = (data.blocos && typeof data.blocos === "object" ? data.blocos : {}) as Record<string, Block>;
  return { sections: sectionsOf(data), blocos };
}

export type ResolvedLandingBlock = { key: string; block: Block };

/**
 * Os blocos que a página mostra, na ordem: só os visíveis e completos. Bloco que não passa
 * na conferência sai da página (e o nome dele vai para `report`, que a API usa para recusar
 * a gravação) — não existe "padrão do código" para onde voltar.
 */
export function resolveLanding(override: unknown, report?: string[]): ResolvedLandingBlock[] {
  const doc = landingDoc(override);
  return doc.sections.flatMap(({ key, hidden }) => {
    const block = doc.blocos[key];
    if (!validLandingBlock(block)) {
      report?.push(key);
      return [];
    }
    if (hidden) return [];
    return [{ key, block: { ...block, id: block.id || key } }];
  });
}

/**
 * Conferência antes de salvar e publicar: blocos incompletos e a regra do topo — a página
 * precisa de um, e só um, "Topo com formulário" visível (é o h1 e o formulário).
 */
export function invalidLandingSections(override: unknown): string[] {
  const report: string[] = [];
  const blocks = resolveLanding(override, report);
  const heroes = blocks.filter(({ block }) => block.kind === "heroForm").length;
  if (heroes !== 1) report.push("topo");
  return [...new Set(report)];
}
