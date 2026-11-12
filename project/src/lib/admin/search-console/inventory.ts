import "server-only";
import { absoluteUrl } from "@/lib/sitemap";
import { blogEntries, landingEntries, pageEntries } from "@/lib/sitemap-entries";
import { getDb, nowIso } from "../db";
import { lastChangesByPath, latest, type SitemapKey } from "./changes";
import type { IndexStatus } from "./client";
import { statusOf, type InspectionSnapshot, type Status } from "./status";

// Lista da tela Análise > Search Console: todas as URLs dos três sitemaps, com a última
// alteração do site e o último resultado da Inspeção de URL guardado no D1.

export type InventoryRow = {
  path: string;
  url: string;
  sitemap: SitemapKey;
  lastChange?: string;
  inspection: (InspectionSnapshot & { indexingState: string | null; googleCanonical: string | null }) | null;
  status: Status;
};

type InspectionRow = {
  path: string;
  inspected_at: string;
  verdict: string | null;
  coverage_state: string | null;
  indexing_state: string | null;
  last_crawl_time: string | null;
  google_canonical: string | null;
};

async function inspections(): Promise<Map<string, InspectionRow>> {
  const db = await getDb();
  const { results } = await db
    .prepare("SELECT path, inspected_at, verdict, coverage_state, indexing_state, last_crawl_time, google_canonical FROM gsc_inspections")
    .all<InspectionRow>();
  return new Map((results ?? []).map((row) => [row.path, row]));
}

export async function getInventory(): Promise<InventoryRow[]> {
  const [paginas, blog, conteudo, changes, saved] = await Promise.all([
    pageEntries(),
    blogEntries(),
    landingEntries(),
    lastChangesByPath(),
    inspections(),
  ]);

  const groups: [SitemapKey, typeof paginas][] = [
    ["paginas", paginas],
    ["blog", blog],
    ["conteudo", conteudo],
  ];
  return groups.flatMap(([sitemap, entries]) =>
    entries.map((entry) => {
      const row = saved.get(entry.path);
      const inspection = row
        ? {
            verdict: row.verdict,
            coverageState: row.coverage_state,
            lastCrawlTime: row.last_crawl_time,
            inspectedAt: row.inspected_at,
            indexingState: row.indexing_state,
            googleCanonical: row.google_canonical,
          }
        : null;
      const lastChange = latest(entry.lastModified, changes.get(entry.path));
      return {
        path: entry.path,
        url: absoluteUrl(entry.path),
        sitemap,
        lastChange,
        inspection,
        status: statusOf(inspection, lastChange),
      };
    }),
  );
}

export async function saveInspection(path: string, result: IndexStatus): Promise<void> {
  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO gsc_inspections (path, inspected_at, verdict, coverage_state, indexing_state, last_crawl_time,
         google_canonical, robots_state, page_fetch_state, raw_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(path) DO UPDATE SET inspected_at = excluded.inspected_at, verdict = excluded.verdict,
         coverage_state = excluded.coverage_state, indexing_state = excluded.indexing_state,
         last_crawl_time = excluded.last_crawl_time, google_canonical = excluded.google_canonical,
         robots_state = excluded.robots_state, page_fetch_state = excluded.page_fetch_state, raw_json = excluded.raw_json`,
    )
    .bind(
      path,
      nowIso(),
      result.verdict ?? null,
      result.coverageState ?? null,
      result.indexingState ?? null,
      result.lastCrawlTime ?? null,
      result.googleCanonical ?? null,
      result.robotsTxtState ?? null,
      result.pageFetchState ?? null,
      JSON.stringify(result),
    )
    .run();
}

export type PingRow = { id: string; kind: string; target: string; status: number | null; message: string | null; created_at: string };

export async function recentPings(limit = 15): Promise<PingRow[]> {
  const db = await getDb();
  const { results } = await db.prepare("SELECT * FROM gsc_pings ORDER BY created_at DESC LIMIT ?").bind(limit).all<PingRow>();
  return results ?? [];
}
