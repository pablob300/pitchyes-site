import { CATEGORY_LABEL, fallbackAction, GROUP_LABEL, guideFor } from "./guide";
import {
  CATEGORIES,
  STRATEGIES,
  type CategoryId,
  type IssueItem,
  type LabMetrics,
  type PageSpeedRun,
  type Strategy,
} from "./types";

// Junta as análises mobile e desktop em um único plano de ação, ordenado pelo quanto
// cada correção deve subir a nota. Puro: a tela e o Markdown saem daqui.

export type Priority = "alta" | "media" | "baixa" | "esperado";

export const PRIORITY_LABEL: Record<Priority, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
  esperado: "Esperado",
};

export const STRATEGY_LABEL: Record<Strategy, string> = { mobile: "Mobile", desktop: "Desktop" };

export type ReportTask = {
  id: string;
  category: CategoryId;
  groupLabel: string | null;
  title: string;
  /** Título original do Lighthouse, quando há tradução. */
  originalTitle: string | null;
  description: string;
  action: string;
  priority: Priority;
  /** Pontos estimados que a correção devolve à nota (ou equivalente, nos insights). */
  impact: number;
  note?: string;
  where: Partial<Record<Strategy, { score: number | null; displayValue?: string; savingsMs?: number; savingsBytes?: number }>>;
  items: IssueItem[];
  itemCount: number;
};

export type Report = {
  url: string;
  createdAt: string;
  createdBy: string | null;
  lighthouseVersion: string | null;
  staging: boolean;
  runs: Partial<Record<Strategy, PageSpeedRun>>;
  tasks: ReportTask[];
  passed: { id: string; category: CategoryId; title: string }[];
};

/** Metas do Google para cada métrica de laboratório ("bom"). */
export const METRICS: { key: keyof LabMetrics; label: string; good: number; poor: number; unit: "ms" | "cls" }[] = [
  { key: "lcp", label: "Maior conteúdo (LCP)", good: 2500, poor: 4000, unit: "ms" },
  { key: "fcp", label: "Primeiro conteúdo (FCP)", good: 1800, poor: 3000, unit: "ms" },
  { key: "tbt", label: "Tempo de bloqueio (TBT)", good: 200, poor: 600, unit: "ms" },
  { key: "cls", label: "Mudança de layout (CLS)", good: 0.1, poor: 0.25, unit: "cls" },
  { key: "si", label: "Speed Index", good: 3400, poor: 5800, unit: "ms" },
  { key: "ttfb", label: "Resposta do servidor", good: 800, poor: 1800, unit: "ms" },
];

/** Dados reais (CrUX) que o Google costuma devolver. */
export const FIELD_METRICS: { key: string; label: string; unit: "ms" | "cls100" }[] = [
  { key: "LARGEST_CONTENTFUL_PAINT_MS", label: "LCP", unit: "ms" },
  { key: "INTERACTION_TO_NEXT_PAINT", label: "INP", unit: "ms" },
  { key: "CUMULATIVE_LAYOUT_SHIFT_SCORE", label: "CLS", unit: "cls100" },
  { key: "FIRST_CONTENTFUL_PAINT_MS", label: "FCP", unit: "ms" },
  { key: "EXPERIMENTAL_TIME_TO_FIRST_BYTE", label: "TTFB", unit: "ms" },
];

export const FIELD_CATEGORY: Record<string, string> = { FAST: "Bom", AVERAGE: "Precisa melhorar", SLOW: "Ruim" };

/** "cls100": o CrUX entrega o CLS multiplicado por 100. */
export function formatMetric(value: number | null | undefined, unit: "ms" | "cls" | "cls100"): string {
  if (value === null || value === undefined) return "—";
  if (unit === "cls" || unit === "cls100") return (unit === "cls100" ? value / 100 : value).toFixed(2).replace(".", ",");
  return value >= 1000 ? `${(value / 1000).toFixed(1).replace(".", ",")} s` : `${Math.round(value)} ms`;
}

export function metricRating(value: number | null, good: number, poor: number): "bom" | "medio" | "ruim" | null {
  if (value === null) return null;
  return value <= good ? "bom" : value <= poor ? "medio" : "ruim";
}

export function scoreRating(score: number | null): "bom" | "medio" | "ruim" | null {
  if (score === null) return null;
  return score >= 90 ? "bom" : score >= 50 ? "medio" : "ruim";
}

export function isStagingUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".workers.dev");
  } catch {
    return false;
  }
}

function priorityOf(impact: number): Priority {
  return impact >= 5 ? "alta" : impact >= 1.5 ? "media" : "baixa";
}

export function buildReport(list: PageSpeedRun[]): Report {
  const runs: Report["runs"] = {};
  for (const run of list) runs[run.strategy] = run;
  const first = runs.mobile ?? runs.desktop ?? list[0];
  const staging = isStagingUrl(first.url);

  const tasks = new Map<string, ReportTask>();
  const failing = new Set<string>();

  for (const strategy of STRATEGIES) {
    const run = runs[strategy];
    if (!run) continue;

    for (const issue of run.audits.issues) {
      failing.add(issue.id);
      const lost = 1 - (issue.score ?? 0);
      // Auditoria com peso: pontos perdidos na categoria. Insights (peso 0): estimativa
      // pela economia de tempo e de bytes, na mesma ordem de grandeza.
      const impact =
        issue.weight > 0 && issue.categoryWeight > 0
          ? (issue.weight / issue.categoryWeight) * 100 * lost
          : (issue.savingsMs ?? 0) / 60 + (issue.savingsBytes ?? 0) / 1024 / 25 + lost * 0.5;

      const guide = guideFor(issue.id);
      const task =
        tasks.get(issue.id) ??
        ({
          id: issue.id,
          category: issue.category,
          groupLabel: issue.group ? (GROUP_LABEL[issue.group] ?? null) : null,
          title: guide?.title ?? issue.title,
          originalTitle: guide ? issue.title : null,
          description: issue.description,
          action: guide?.action ?? fallbackAction(issue.category),
          priority: "baixa",
          impact: 0,
          where: {},
          items: issue.items,
          itemCount: issue.itemCount,
        } satisfies ReportTask);

      task.where[strategy] = {
        score: issue.score,
        displayValue: issue.displayValue,
        savingsMs: issue.savingsMs,
        savingsBytes: issue.savingsBytes,
      };
      // Os itens mostrados são os da estratégia onde o problema pesa mais.
      if (impact > task.impact) {
        task.impact = impact;
        task.items = issue.items;
        task.itemCount = issue.itemCount;
      }
      tasks.set(issue.id, task);
    }
  }

  for (const task of tasks.values()) {
    task.priority = priorityOf(task.impact);
    if (staging && task.id === "is-crawlable") {
      task.priority = "esperado";
      task.impact = 0;
      task.note = "Esperado na homologação: o endereço workers.dev é bloqueado para robôs de propósito.";
    }
  }

  const passed = new Map<string, Report["passed"][number]>();
  for (const run of list) {
    for (const audit of run.audits.passed) {
      // Título original: o Lighthouse o escreve como o estado aprovado ("Document has a <title>"),
      // enquanto o guia em português descreve o problema.
      if (!failing.has(audit.id)) passed.set(audit.id, audit);
    }
  }

  return {
    url: first.url,
    createdAt: first.createdAt,
    createdBy: first.createdBy,
    lighthouseVersion: first.lighthouseVersion,
    staging,
    runs,
    tasks: [...tasks.values()].sort((a, b) => b.impact - a.impact),
    passed: [...passed.values()].sort(
      (a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || a.title.localeCompare(b.title),
    ),
  };
}

export function savingsText(where: ReportTask["where"][Strategy]): string | null {
  if (!where) return null;
  const parts: string[] = [];
  if (where.savingsMs) parts.push(`~${formatMetric(where.savingsMs, "ms")}`);
  if (where.savingsBytes) parts.push(`~${Math.max(1, Math.round(where.savingsBytes / 1024))} KB`);
  if (parts.length) return `economia ${parts.join(" e ")}`;
  return where.displayValue ?? null;
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

/** Relatório completo em Markdown, para entregar ao desenvolvedor. */
export function toMarkdown(report: Report): string {
  const present = STRATEGIES.filter((strategy) => report.runs[strategy]);
  const lines: string[] = [];
  const row = (cells: string[]) => lines.push(`| ${cells.join(" | ")} |`);

  lines.push(`# Relatório PageSpeed: ${report.url}`, "");
  lines.push(
    `Analisado em ${formatDate(report.createdAt)}${report.createdBy ? ` por ${report.createdBy}` : ""}` +
      ` · Lighthouse ${report.lighthouseVersion ?? "?"} · PageSpeed Insights (Google)`,
    "",
  );
  if (report.staging) {
    lines.push(
      "> Endereço de homologação (workers.dev): a nota de SEO perde pontos por `noindex` de propósito, e não há dados reais de usuários (CrUX).",
      "",
    );
  }

  lines.push("## Notas", "");
  row(["Categoria", ...present.map((s) => STRATEGY_LABEL[s])]);
  row(["---", ...present.map(() => "---:")]);
  for (const category of CATEGORIES) {
    row([CATEGORY_LABEL[category], ...present.map((s) => String(report.runs[s]?.scores[category] ?? "—"))]);
  }
  lines.push("");

  lines.push("## Métricas de laboratório", "");
  row(["Métrica", ...present.map((s) => STRATEGY_LABEL[s]), "Meta (bom)"]);
  row(["---", ...present.map(() => "---:"), "---:"]);
  for (const metric of METRICS) {
    row([
      metric.label,
      ...present.map((s) => formatMetric(report.runs[s]?.metrics[metric.key], metric.unit)),
      `≤ ${formatMetric(metric.good, metric.unit)}`,
    ]);
  }
  lines.push("");

  const withField = present.filter((s) => report.runs[s]?.field);
  if (withField.length) {
    lines.push("## Dados reais de usuários (Chrome, últimos 28 dias)", "");
    for (const strategy of withField) {
      const field = report.runs[strategy]!.field!;
      lines.push(`**${STRATEGY_LABEL[strategy]}**${field.scope === "origin" ? " (domínio inteiro — a página sozinha não tem tráfego suficiente)" : ""}:`);
      for (const metric of FIELD_METRICS) {
        const value = field.metrics[metric.key];
        if (value) lines.push(`- ${metric.label}: ${formatMetric(value.percentile, metric.unit)} (${FIELD_CATEGORY[value.category] ?? value.category})`);
      }
      lines.push("");
    }
  }

  const tasks = report.tasks;
  lines.push(`## Plano de ação (${tasks.length} ${tasks.length === 1 ? "item" : "itens"})`, "");
  lines.push(
    "Ordenado pelo quanto cada correção deve subir a nota. \"Impacto\" é a estimativa de pontos devolvidos à categoria (nos itens de oportunidade, convertida a partir da economia de tempo e de bytes). Depois de corrigir, publique e analise de novo.",
    "",
  );

  tasks.forEach((task, index) => {
    lines.push(
      `### ${index + 1}. [${PRIORITY_LABEL[task.priority]}] ${task.title}`,
      "",
      `${CATEGORY_LABEL[task.category]}${task.groupLabel ? ` › ${task.groupLabel}` : ""} · id \`${task.id}\`${task.originalTitle ? ` · "${task.originalTitle}"` : ""}`,
      "",
    );
    if (task.note) lines.push(`> ${task.note}`, "");
    const where = present
      .filter((s) => task.where[s])
      .map((s) => {
        const text = savingsText(task.where[s]);
        return `${STRATEGY_LABEL[s]}${text ? ` (${text})` : ""}`;
      });
    lines.push(`- **Onde:** ${where.join(" · ")}`);
    if (task.priority !== "esperado") lines.push(`- **Impacto estimado:** ~${task.impact.toFixed(1).replace(".", ",")} pontos`);
    lines.push(`- **O que fazer:** ${task.action}`);
    lines.push(`- **Por que importa (Lighthouse):** ${task.description}`);
    if (task.items.length) {
      lines.push(`- **Itens afetados${task.itemCount > task.items.length ? ` (${task.items.length} de ${task.itemCount})` : ""}:**`);
      for (const item of task.items) {
        lines.push(`  - \`${item.label.replace(/`/g, "'")}\`${item.detail ? ` — ${item.detail}` : ""}`);
      }
    }
    lines.push("");
  });

  lines.push(`## Já está certo (${report.passed.length})`, "");
  for (const category of CATEGORIES) {
    const passed = report.passed.filter((audit) => audit.category === category);
    if (passed.length) lines.push(`- **${CATEGORY_LABEL[category]}:** ${passed.map((audit) => audit.title).join("; ")}`);
  }
  lines.push("");

  return lines.join("\n");
}
