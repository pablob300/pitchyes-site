import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionPlan } from "@/components/admin/pagespeed/ActionPlan";
import { AnalyzeForm } from "@/components/admin/pagespeed/AnalyzeForm";
import { CopyReport } from "@/components/admin/pagespeed/CopyReport";
import { ScoreRing } from "@/components/admin/pagespeed/ScoreRing";
import styles from "@/components/admin/pagespeed/PageSpeed.module.css";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { CATEGORY_LABEL } from "@/lib/admin/pagespeed/guide";
import { getBatch, previousBatchId } from "@/lib/admin/pagespeed/db";
import {
  buildReport,
  FIELD_CATEGORY,
  FIELD_METRICS,
  formatDate,
  formatMetric,
  METRICS,
  metricRating,
  STRATEGY_LABEL,
  toMarkdown,
} from "@/lib/admin/pagespeed/report";
import { CATEGORIES, STRATEGIES, type Scores, type Strategy } from "@/lib/admin/pagespeed/types";
import { pageMetadata } from "@/lib/seo";

// Relatório de uma análise: notas mobile e desktop, métricas e o plano de ação.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Relatório PageSpeed",
    description: "Área interna da PitchYes: relatório do PageSpeed Insights com o plano de ação para melhorar a nota da página.",
    path: "/admin/analise/pagespeed",
    noindex: true,
  });
}

const FIELD_RATING: Record<string, "bom" | "medio" | "ruim"> = { FAST: "bom", AVERAGE: "medio", SLOW: "ruim" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const runs = await getBatch(id);
  if (!runs.length) notFound();

  const report = buildReport(runs);
  const previousId = await previousBatchId(report.url, report.createdAt);
  const previous: Partial<Record<Strategy, Scores>> = {};
  if (previousId) for (const run of await getBatch(previousId)) previous[run.strategy] = run.scores;

  const present = STRATEGIES.filter((strategy) => report.runs[strategy]);
  const path = new URL(report.url).pathname;
  const slug = path === "/" ? "home" : path.replace(/^\/|\/$/g, "").replace(/\//g, "-");
  const filename = `pagespeed-${slug}-${report.createdAt.slice(0, 10)}.md`;

  return (
    <>
      <PageHeader
        eyebrow="Análise · PageSpeed"
        title={path}
        description={`${report.url} · analisado em ${formatDate(report.createdAt)}${report.createdBy ? ` por ${report.createdBy}` : ""} · Lighthouse ${report.lighthouseVersion ?? "?"}`}
        actions={
          <>
            <CopyReport markdown={toMarkdown(report)} filename={filename} />
            <AnalyzeForm fixedUrl={report.url} />
          </>
        }
      />

      <p className={styles.back}>
        <Link className={styles.link} href="/admin/analise/pagespeed">
          ← Todas as análises
        </Link>
      </p>

      {report.staging && (
        <p className={styles.notice} data-tipo="alerta">
          Endereço de homologação (workers.dev): a nota de SEO perde pontos por <code>noindex</code> de propósito, e o
          Google ainda não tem dados reais de usuários. Rode de novo quando o domínio definitivo estiver no ar.
        </p>
      )}
      {present.length < STRATEGIES.length && (
        <p className={styles.notice} data-tipo="alerta">
          Só a análise {STRATEGY_LABEL[present[0]].toLowerCase()} terminou. Analise de novo para ter as duas.
        </p>
      )}

      <section>
        <h2 className={styles.sectionTitle}>Notas</h2>
        <div className={styles.scoreGrid}>
          {present.map((strategy) => {
            const scores = report.runs[strategy]!.scores;
            return (
              <div key={strategy} className={styles.scoreCard}>
                <p className={styles.scoreCardTitle}>{STRATEGY_LABEL[strategy]}</p>
                <div className={styles.rings}>
                  {CATEGORIES.map((category) => {
                    const before = previous[strategy]?.[category];
                    const now = scores[category];
                    return (
                      <ScoreRing
                        key={category}
                        label={CATEGORY_LABEL[category]}
                        score={now}
                        delta={before != null && now != null ? now - before : null}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Métricas de laboratório</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Métrica</th>
                {present.map((strategy) => (
                  <th key={strategy} className={styles.num}>
                    {STRATEGY_LABEL[strategy]}
                  </th>
                ))}
                <th className={styles.num}>Meta (bom)</th>
              </tr>
            </thead>
            <tbody>
              {METRICS.map((metric) => (
                <tr key={metric.key}>
                  <td>{metric.label}</td>
                  {present.map((strategy) => {
                    const value = report.runs[strategy]!.metrics[metric.key];
                    return (
                      <td key={strategy} className={styles.num}>
                        <span
                          className={styles.metricValue}
                          data-rating={metricRating(value, metric.good, metric.poor) ?? undefined}
                        >
                          {formatMetric(value, metric.unit)}
                        </span>
                      </td>
                    );
                  })}
                  <td className={styles.num}>≤ {formatMetric(metric.good, metric.unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {present.some((strategy) => report.runs[strategy]!.field) && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Dados reais de usuários (Chrome, últimos 28 dias)</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Métrica</th>
                  {present.map((strategy) => (
                    <th key={strategy} className={styles.num}>
                      {STRATEGY_LABEL[strategy]}
                      {report.runs[strategy]!.field?.scope === "origin" ? " (domínio)" : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FIELD_METRICS.map((metric) => (
                  <tr key={metric.key}>
                    <td>{metric.label}</td>
                    {present.map((strategy) => {
                      const value = report.runs[strategy]!.field?.metrics[metric.key];
                      return (
                        <td key={strategy} className={styles.num}>
                          {value ? (
                            <span
                              className={styles.metricValue}
                              data-rating={FIELD_RATING[value.category]}
                              title={FIELD_CATEGORY[value.category] ?? value.category}
                            >
                              {formatMetric(value.percentile, metric.unit)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Plano de ação</h2>
        <p className={styles.intro}>
          Ordenado pelo quanto cada correção deve subir a nota. &quot;pts&quot; é a estimativa de pontos devolvidos à
          categoria; nos itens de oportunidade, convertida da economia de tempo e de bytes. Depois de corrigir, publique e
          analise de novo.
        </p>
        <ActionPlan report={report} />
      </section>
    </>
  );
}
