import type { Metadata } from "next";
import Link from "next/link";
import { AnalyzeForm } from "@/components/admin/pagespeed/AnalyzeForm";
import { ScoreChip } from "@/components/admin/pagespeed/ScoreRing";
import styles from "@/components/admin/pagespeed/PageSpeed.module.css";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { CATEGORY_LABEL } from "@/lib/admin/pagespeed/guide";
import { listBatches } from "@/lib/admin/pagespeed/db";
import { formatDate, STRATEGY_LABEL } from "@/lib/admin/pagespeed/report";
import { CATEGORIES, STRATEGIES } from "@/lib/admin/pagespeed/types";
import { pages } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

// Análise > PageSpeed: escolher uma página, rodar o PageSpeed Insights e ver o histórico.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "PageSpeed",
    description: "Área interna da PitchYes: notas do PageSpeed Insights e plano de ação para cada página do site.",
    path: "/admin/analise/pagespeed",
    noindex: true,
  });
}

// Só páginas com conteúdo real: as placeholder não estão no sitemap nem no Google.
const options = pages.filter((page) => !page.placeholder).map((page) => ({ path: page.path, title: page.title }));

function pathOf(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

export default async function Page() {
  const batches = await listBatches();

  return (
    <>
      <PageHeader
        eyebrow="Análise"
        title="PageSpeed"
        description="Notas do Google (desempenho, acessibilidade, boas práticas e SEO) e um plano de ação do que corrigir para chegar a 100."
      />

      <AnalyzeForm pages={options} />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Histórico</h2>
        {batches.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Página</th>
                  <th>Analisada em</th>
                  {STRATEGIES.map((strategy) => (
                    <th key={strategy}>{STRATEGY_LABEL[strategy]}</th>
                  ))}
                  <th>
                    <span className="visually-hidden">Relatório</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.batchId}>
                    <td className={styles.path}>{pathOf(batch.url)}</td>
                    <td>{formatDate(batch.createdAt)}</td>
                    {STRATEGIES.map((strategy) => (
                      <td key={strategy}>
                        <span className={styles.chips}>
                          {CATEGORIES.map((category) => (
                            <ScoreChip
                              key={category}
                              score={batch.scores[strategy]?.[category] ?? null}
                              title={CATEGORY_LABEL[category]}
                            />
                          ))}
                        </span>
                      </td>
                    ))}
                    <td>
                      <Link className={styles.link} href={`/admin/analise/pagespeed/${batch.batchId}`}>
                        Ver relatório
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={styles.legend}>Ordem das notas: desempenho, acessibilidade, boas práticas e SEO.</p>
          </div>
        ) : (
          <p className={styles.muted}>Nenhuma análise ainda. Escolha uma página acima.</p>
        )}
      </section>
    </>
  );
}
