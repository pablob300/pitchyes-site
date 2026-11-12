// Regra de cor da tela Análise > Search Console (função pura, sem banco).
//
// verde    — o Google indexou e rastreou a página depois (ou no mesmo momento) da última
//            alteração do site;
// vermelho — o último rastreamento é anterior à alteração, ou a página não está indexada;
// cinza    — ainda não verificada no Google.

export type Tone = "ok" | "stale" | "missing" | "unknown";

export type InspectionSnapshot = {
  verdict: string | null;
  coverageState: string | null;
  lastCrawlTime: string | null;
  inspectedAt: string;
};

export type Status = { tone: Tone; label: string; reason?: string };

const COVERAGE_PT: Record<string, string> = {
  "Submitted and indexed": "Enviada e indexada",
  "Indexed, not submitted in sitemap": "Indexada, fora do sitemap",
  "Crawled - currently not indexed": "Rastreada, mas não indexada",
  "Discovered - currently not indexed": "Descoberta, ainda não rastreada",
  "URL is unknown to Google": "O Google ainda não conhece a URL",
  "Page with redirect": "Página com redirecionamento",
  "Excluded by ‘noindex’ tag": "Excluída pela tag noindex",
  "Excluded by 'noindex' tag": "Excluída pela tag noindex",
  "Blocked by robots.txt": "Bloqueada pelo robots.txt",
  "Not found (404)": "Não encontrada (404)",
  "Duplicate without user-selected canonical": "Duplicada, sem canonical escolhido",
  "Duplicate, Google chose different canonical than user": "Duplicada: o Google escolheu outro canonical",
  "Alternate page with proper canonical tag": "Página alternativa com canonical correto",
  "Server error (5xx)": "Erro do servidor (5xx)",
  "Soft 404": "Soft 404",
};

export function coverageLabel(state: string | null | undefined): string | undefined {
  if (!state) return undefined;
  return COVERAGE_PT[state] ?? state;
}

export function statusOf(inspection: InspectionSnapshot | null, lastChange: string | undefined): Status {
  if (!inspection) return { tone: "unknown", label: "Não verificada" };
  const reason = coverageLabel(inspection.coverageState);
  if (inspection.verdict !== "PASS") return { tone: "missing", label: "Não indexada", reason };
  if (!inspection.lastCrawlTime) return { tone: "missing", label: "Sem rastreamento", reason };
  if (lastChange && new Date(inspection.lastCrawlTime).getTime() < new Date(lastChange).getTime()) {
    return { tone: "stale", label: "Alterada depois do rastreamento", reason };
  }
  return { tone: "ok", label: "Indexada e atualizada", reason };
}
