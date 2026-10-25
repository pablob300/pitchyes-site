import "server-only";
import {
  CATEGORIES,
  type CategoryId,
  type FieldData,
  type IssueItem,
  type PageSpeedResult,
  type StoredAudits,
  type StoredIssue,
  type Strategy,
} from "./types";

// Chamada à API PageSpeed Insights (Google Cloud) e redução da resposta ao que o
// painel usa. A chave é segredo do Worker (PAGESPEED_API_KEY) e nunca chega ao
// navegador. O Google ignora o parâmetro `locale` e devolve os textos do Lighthouse
// em inglês — o português do relatório vem de lib/admin/pagespeed/guide.ts.

const ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const TIMEOUT_MS = 90_000;
const MAX_ITEMS = 10;
/** Modos de auditoria que têm nota e entram no plano de ação. */
const SCORED = new Set(["binary", "numeric", "metricSavings"]);

export class PageSpeedError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

// A resposta do Lighthouse é enorme e pouco tipada; só o que lemos está descrito aqui.
type LhDetails = {
  type?: string;
  items?: Record<string, unknown>[];
  overallSavingsBytes?: number;
  value?: LhDetails;
};
type LhAudit = {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode: string;
  displayValue?: string;
  numericValue?: number;
  metricSavings?: Record<string, number>;
  details?: LhDetails;
};
type LhCategory = { score: number | null; auditRefs: { id: string; weight: number; group?: string }[] };
type PsiResponse = {
  error?: { code?: number; message?: string };
  loadingExperience?: {
    id?: string;
    origin_fallback?: boolean;
    overall_category?: string;
    metrics?: Record<string, { percentile: number; category: string }>;
  };
  lighthouseResult?: {
    lighthouseVersion?: string;
    categories: Partial<Record<CategoryId, LhCategory>>;
    audits: Record<string, LhAudit>;
  };
};

function apiKey(): string {
  const key = process.env.PAGESPEED_API_KEY?.trim();
  if (!key) throw new PageSpeedError("PAGESPEED_API_KEY não configurado no Worker.", 500);
  return key;
}

function friendlyError(status: number, message: string): string {
  if (status === 429) return "Cota da API do PageSpeed esgotada no momento. Tente de novo em alguns minutos.";
  if (status === 403) return "A chave da API foi recusada pelo Google (chave inválida ou PageSpeed Insights API desativada no projeto).";
  if (/FAILED_DOCUMENT_REQUEST|ERRORED_DOCUMENT_REQUEST|NO_FCP|DNS_FAILURE/.test(message)) {
    return "O Google não conseguiu carregar a página. Confira se o endereço abre normalmente e tente de novo.";
  }
  return `O PageSpeed respondeu com erro (${status}).`;
}

export async function runPageSpeed(url: string, strategy: Strategy): Promise<PageSpeedResult> {
  const query = new URLSearchParams({ url, strategy, key: apiKey() });
  for (const category of CATEGORIES) query.append("category", category);

  let response: Response;
  try {
    response = await fetch(`${ENDPOINT}?${query}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (error) {
    console.error("[pagespeed] falha na chamada", error);
    throw new PageSpeedError("O PageSpeed demorou demais para responder. Tente de novo.", 504);
  }

  const data = (await response.json().catch(() => ({}))) as PsiResponse;
  if (!response.ok || !data.lighthouseResult) {
    const message = data.error?.message ?? "";
    console.error("[pagespeed] erro da API", response.status, message);
    throw new PageSpeedError(friendlyError(response.status, message), response.status === 429 ? 429 : 502);
  }

  const lh = data.lighthouseResult;
  const score = (id: CategoryId) => {
    const value = lh.categories[id]?.score;
    return typeof value === "number" ? Math.round(value * 100) : null;
  };
  const metric = (id: string) => lh.audits[id]?.numericValue ?? null;

  return {
    url,
    strategy,
    lighthouseVersion: lh.lighthouseVersion ?? null,
    scores: {
      performance: score("performance"),
      accessibility: score("accessibility"),
      "best-practices": score("best-practices"),
      seo: score("seo"),
    },
    metrics: {
      fcp: metric("first-contentful-paint"),
      lcp: metric("largest-contentful-paint"),
      tbt: metric("total-blocking-time"),
      cls: metric("cumulative-layout-shift"),
      si: metric("speed-index"),
      ttfb: metric("server-response-time"),
    },
    field: fieldData(data.loadingExperience),
    audits: reduceAudits(lh.categories, lh.audits),
  };
}

function fieldData(experience: PsiResponse["loadingExperience"]): FieldData | null {
  if (!experience?.metrics || !Object.keys(experience.metrics).length) return null;
  return {
    scope: experience.origin_fallback ? "origin" : "url",
    overall: experience.overall_category,
    metrics: experience.metrics,
  };
}

function reduceAudits(
  categories: Partial<Record<CategoryId, LhCategory>>,
  audits: Record<string, LhAudit>,
): StoredAudits {
  const issues: StoredIssue[] = [];
  const passed: StoredAudits["passed"] = [];
  const seen = new Set<string>();

  for (const category of CATEGORIES) {
    const refs = categories[category]?.auditRefs ?? [];
    const categoryWeight = refs.reduce((sum, ref) => sum + ref.weight, 0);

    for (const ref of refs) {
      const audit = audits[ref.id];
      if (!audit || ref.group === "hidden" || seen.has(ref.id)) continue;
      if (!SCORED.has(audit.scoreDisplayMode) || audit.score === null) continue;
      seen.add(ref.id);

      if (audit.score >= 0.9) {
        passed.push({ id: audit.id, category, title: audit.title });
        continue;
      }

      const rows = collectRows(audit.details);
      const savings = audit.metricSavings ?? {};
      const savingsMs = Math.max(0, savings.LCP ?? 0, savings.FCP ?? 0, savings.TBT ?? 0, savings.INP ?? 0);
      const savingsBytes =
        audit.details?.overallSavingsBytes ??
        rows.reduce((sum, row) => sum + (typeof row.wastedBytes === "number" ? row.wastedBytes : 0), 0);

      issues.push({
        id: audit.id,
        category,
        group: ref.group ?? null,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        displayValue: audit.displayValue,
        weight: ref.weight,
        categoryWeight,
        savingsMs: savingsMs || undefined,
        savingsBytes: savingsBytes || undefined,
        itemCount: rows.length,
        items: rows.slice(0, MAX_ITEMS).map(rowToItem).filter((item): item is IssueItem => item !== null),
      });
    }
  }

  return { issues, passed };
}

/** Achata as tabelas da auditoria (inclusive as que vêm dentro de listas) em linhas. */
function collectRows(details: LhDetails | undefined): Record<string, unknown>[] {
  if (!details) return [];
  if (details.type === "table" || details.type === "opportunity") return details.items ?? [];
  if (details.type === "list") {
    return (details.items ?? []).flatMap((item) => {
      const nested = item as LhDetails & { type?: string };
      if (nested.type === "node") return [{ node: nested }];
      if (nested.type === "list-section") return collectRows(nested.value);
      return collectRows(nested);
    });
  }
  return [];
}

function kb(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function clip(text: string, max = 280): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

function rowToItem(row: Record<string, unknown>): IssueItem | null {
  const node = row.node as
    | { nodeLabel?: string; selector?: string; snippet?: string; explanation?: string }
    | undefined;
  if (node) {
    // "Fix any of the following:\n  Element has insufficient color contrast of 4 (...)"
    const explanation = node.explanation?.split("\n").slice(1).join(" ").trim();
    return {
      label: clip(node.nodeLabel || node.selector || "Elemento", 120),
      detail: clip([explanation, node.selector].filter(Boolean).join(" · ")) || undefined,
      snippet: node.snippet ? clip(node.snippet, 300) : undefined,
    };
  }

  const source = row.source as { url?: string; line?: number } | undefined;
  const entity = row.entity as string | { text?: string } | undefined;
  const label =
    (typeof row.url === "string" && row.url) ||
    source?.url ||
    (typeof entity === "string" ? entity : entity?.text) ||
    Object.values(row).find((value): value is string => typeof value === "string" && value.length > 0);
  if (!label) return null;

  const parts: string[] = [];
  if (typeof row.totalBytes === "number") parts.push(`tamanho ${kb(row.totalBytes)}`);
  if (typeof row.wastedBytes === "number") parts.push(`economia ${kb(row.wastedBytes)}`);
  if (typeof row.wastedMs === "number") parts.push(`${Math.round(row.wastedMs)} ms`);
  if (typeof row.duration === "number") parts.push(`${Math.round(row.duration)} ms`);
  if (typeof row.cacheLifetimeMs === "number") {
    parts.push(`cache de ${Math.round(row.cacheLifetimeMs / 86_400_000)} dia(s)`);
  }
  if (typeof source?.line === "number") parts.push(`linha ${source.line + 1}`);

  return { label: clip(label, 200), detail: parts.join(" · ") || undefined };
}
