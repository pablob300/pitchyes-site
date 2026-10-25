// Formato enxuto de uma análise do PageSpeed, como fica gravado no D1.
// Sem "server-only": a tela e o relatório em Markdown leem os mesmos tipos.

export type Strategy = "mobile" | "desktop";
export const STRATEGIES: Strategy[] = ["mobile", "desktop"];

export type CategoryId = "performance" | "accessibility" | "best-practices" | "seo";
export const CATEGORIES: CategoryId[] = ["performance", "accessibility", "best-practices", "seo"];

/** Um elemento ou arquivo apontado por uma auditoria (a linha da tabela do Lighthouse). */
export type IssueItem = {
  label: string;
  /** Seletor CSS, tamanho, tempo — o que ajuda a achar o culpado. */
  detail?: string;
  /** Trecho do HTML, quando a auditoria é sobre um elemento. */
  snippet?: string;
};

/** Auditoria que não passou (nota abaixo de 0,9). */
export type StoredIssue = {
  id: string;
  category: CategoryId;
  group: string | null;
  title: string;
  description: string;
  score: number | null;
  displayValue?: string;
  /** Peso da auditoria na nota da categoria (0 nos "insights" de desempenho). */
  weight: number;
  /** Soma dos pesos da categoria, para converter peso em pontos. */
  categoryWeight: number;
  /** Economia estimada no LCP/FCP, em ms. */
  savingsMs?: number;
  savingsBytes?: number;
  /** Quantos itens a auditoria listou no total (só os 10 primeiros são guardados). */
  itemCount: number;
  items: IssueItem[];
};

export type StoredAudits = {
  issues: StoredIssue[];
  passed: { id: string; category: CategoryId; title: string }[];
};

/** Dados reais de usuários do Chrome (CrUX), quando a URL tem tráfego suficiente. */
export type FieldData = {
  /** "origin" quando a página sozinha não tem tráfego e o Google usou o domínio todo. */
  scope: "url" | "origin";
  overall?: string;
  metrics: Record<string, { percentile: number; category: string }>;
};

export type Scores = Record<CategoryId, number | null>;

export type LabMetrics = {
  fcp: number | null;
  lcp: number | null;
  tbt: number | null;
  cls: number | null;
  si: number | null;
  ttfb: number | null;
};

export type PageSpeedRun = {
  id: string;
  batchId: string;
  url: string;
  strategy: Strategy;
  createdAt: string;
  createdBy: string | null;
  lighthouseVersion: string | null;
  scores: Scores;
  metrics: LabMetrics;
  field: FieldData | null;
  audits: StoredAudits;
};

/** Resultado de uma chamada ao Google, antes de ganhar id e data. */
export type PageSpeedResult = Omit<PageSpeedRun, "id" | "batchId" | "createdAt" | "createdBy">;
