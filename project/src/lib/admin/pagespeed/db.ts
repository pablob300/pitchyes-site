import "server-only";
import { getDb, newId, nowIso } from "../db";
import type { PageSpeedResult, PageSpeedRun, Scores, Strategy } from "./types";

// Histórico das análises do PageSpeed no D1 (tabela pagespeed_runs, migração 0007).

type Row = {
  id: string;
  batch_id: string;
  url: string;
  strategy: Strategy;
  created_at: string;
  created_by: string | null;
  lighthouse_version: string | null;
  perf: number | null;
  a11y: number | null;
  best: number | null;
  seo: number | null;
  fcp_ms: number | null;
  lcp_ms: number | null;
  tbt_ms: number | null;
  cls: number | null;
  si_ms: number | null;
  ttfb_ms: number | null;
  field_json: string | null;
  audits_json: string;
};

function scoresOf(row: Pick<Row, "perf" | "a11y" | "best" | "seo">): Scores {
  return { performance: row.perf, accessibility: row.a11y, "best-practices": row.best, seo: row.seo };
}

function toRun(row: Row): PageSpeedRun {
  return {
    id: row.id,
    batchId: row.batch_id,
    url: row.url,
    strategy: row.strategy,
    createdAt: row.created_at,
    createdBy: row.created_by,
    lighthouseVersion: row.lighthouse_version,
    scores: scoresOf(row),
    metrics: { fcp: row.fcp_ms, lcp: row.lcp_ms, tbt: row.tbt_ms, cls: row.cls, si: row.si_ms, ttfb: row.ttfb_ms },
    field: row.field_json ? JSON.parse(row.field_json) : null,
    audits: JSON.parse(row.audits_json),
  };
}

/** Grava as estratégias de uma análise sob o mesmo `batch_id` e devolve esse id. */
export async function saveBatch(results: PageSpeedResult[], createdBy: string | null): Promise<string> {
  const db = await getDb();
  const batchId = newId("psi");
  const createdAt = nowIso();

  await db.batch(
    results.map((result) =>
      db
        .prepare(
          `INSERT INTO pagespeed_runs (id, batch_id, url, strategy, created_at, created_by, lighthouse_version,
             perf, a11y, best, seo, fcp_ms, lcp_ms, tbt_ms, cls, si_ms, ttfb_ms, field_json, audits_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          newId("run"),
          batchId,
          result.url,
          result.strategy,
          createdAt,
          createdBy,
          result.lighthouseVersion,
          result.scores.performance,
          result.scores.accessibility,
          result.scores["best-practices"],
          result.scores.seo,
          result.metrics.fcp,
          result.metrics.lcp,
          result.metrics.tbt,
          result.metrics.cls,
          result.metrics.si,
          result.metrics.ttfb,
          result.field ? JSON.stringify(result.field) : null,
          JSON.stringify(result.audits),
        ),
    ),
  );

  return batchId;
}

export async function getBatch(batchId: string): Promise<PageSpeedRun[]> {
  const db = await getDb();
  const { results } = await db
    .prepare("SELECT * FROM pagespeed_runs WHERE batch_id = ? ORDER BY strategy DESC")
    .bind(batchId)
    .all<Row>();
  return results.map(toRun);
}

export type BatchSummary = {
  batchId: string;
  url: string;
  createdAt: string;
  createdBy: string | null;
  scores: Partial<Record<Strategy, Scores>>;
};

/** Últimas análises, uma linha por análise (mobile e desktop juntos). */
export async function listBatches(limit = 40): Promise<BatchSummary[]> {
  const db = await getDb();
  const { results } = await db
    .prepare(
      `SELECT batch_id, url, strategy, created_at, created_by, perf, a11y, best, seo
         FROM pagespeed_runs
        WHERE batch_id IN (SELECT batch_id FROM pagespeed_runs GROUP BY batch_id ORDER BY MAX(created_at) DESC LIMIT ?)
        ORDER BY created_at DESC`,
    )
    .bind(limit)
    .all<Pick<Row, "batch_id" | "url" | "strategy" | "created_at" | "created_by" | "perf" | "a11y" | "best" | "seo">>();

  const batches = new Map<string, BatchSummary>();
  for (const row of results) {
    const batch = batches.get(row.batch_id) ?? {
      batchId: row.batch_id,
      url: row.url,
      createdAt: row.created_at,
      createdBy: row.created_by,
      scores: {},
    };
    batch.scores[row.strategy] = scoresOf(row);
    batches.set(row.batch_id, batch);
  }
  return [...batches.values()];
}

/** A análise anterior da mesma URL, para mostrar a variação da nota. */
export async function previousBatchId(url: string, before: string): Promise<string | null> {
  const db = await getDb();
  const row = await db
    .prepare("SELECT batch_id FROM pagespeed_runs WHERE url = ? AND created_at < ? ORDER BY created_at DESC LIMIT 1")
    .bind(url, before)
    .first<{ batch_id: string }>();
  return row?.batch_id ?? null;
}
