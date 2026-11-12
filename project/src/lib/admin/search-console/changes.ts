import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { absoluteUrl } from "@/lib/sitemap";
import { isIndexable } from "@/lib/site";
import { getDb, newId, nowIso } from "../db";
import { GscError, serviceAccount } from "./auth";
import { submitSitemap } from "./client";
import { pingIndexNow } from "./indexnow";

// Rotina de indexação: toda URL pública criada, alterada ou apagada pelo painel passa por
// recordChange(). Ela grava a mudança (tabela site_changes) e, em segundo plano
// (waitUntil, sem atrasar o "Salvar"), reenvia ao Google o sitemap daquela URL e avisa o
// IndexNow. Fora da produção no domínio definitivo, só grava.

export const SITEMAPS = {
  paginas: "/sitemap-paginas.xml",
  blog: "/sitemap-blog.xml",
  conteudo: "/sitemap-conteudo.xml",
} as const;
export type SitemapKey = keyof typeof SITEMAPS;
export type ChangeKind = "create" | "update" | "delete";

/** O mesmo sitemap não é reenviado mais de uma vez nesse intervalo (vários "Salvar" seguidos). */
const RESUBMIT_GAP_MS = 60_000;

export type Change = { path: string; kind: ChangeKind; sitemap: SitemapKey };

export async function logPing(kind: "sitemap" | "indexnow", target: string, status: number, message: string): Promise<void> {
  try {
    const db = await getDb();
    await db
      .prepare("INSERT INTO gsc_pings (id, kind, target, status, message, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(newId("png"), kind, target.slice(0, 2000), status, message.slice(0, 500), nowIso())
      .run();
  } catch (error) {
    console.error("[gsc] falha ao gravar o histórico", error);
  }
}

async function recentlySubmitted(sitemapUrl: string): Promise<boolean> {
  const db = await getDb();
  const row = await db
    .prepare("SELECT created_at FROM gsc_pings WHERE kind = 'sitemap' AND target = ? AND status BETWEEN 200 AND 299 ORDER BY created_at DESC LIMIT 1")
    .bind(sitemapUrl)
    .first<{ created_at: string }>();
  return Boolean(row && Date.now() - new Date(row.created_at).getTime() < RESUBMIT_GAP_MS);
}

/** Reenvia os sitemaps ao Google e avisa o IndexNow. Devolve um resumo para a tela. */
export async function notifyIndexing(
  sitemaps: Iterable<SitemapKey>,
  urls: string[],
  options: { force?: boolean } = {},
): Promise<{ sitemaps: { sitemap: string; ok: boolean; message: string }[]; indexNow: { status: number; message: string } | null }> {
  const results: { sitemap: string; ok: boolean; message: string }[] = [];

  for (const key of new Set(sitemaps)) {
    const sitemapUrl = absoluteUrl(SITEMAPS[key]);
    if (!serviceAccount()) {
      results.push({ sitemap: sitemapUrl, ok: false, message: "Search Console não configurado (GSC_SERVICE_ACCOUNT_JSON)." });
      continue;
    }
    if (!options.force && (await recentlySubmitted(sitemapUrl))) {
      results.push({ sitemap: sitemapUrl, ok: true, message: "Já reenviado há menos de 1 minuto." });
      continue;
    }
    try {
      await submitSitemap(sitemapUrl);
      await logPing("sitemap", sitemapUrl, 200, "Sitemap reenviado ao Google.");
      results.push({ sitemap: sitemapUrl, ok: true, message: "Sitemap reenviado ao Google." });
    } catch (error) {
      const message = error instanceof GscError ? error.message : "Falha inesperada ao reenviar o sitemap.";
      if (!(error instanceof GscError)) console.error("[gsc]", error);
      await logPing("sitemap", sitemapUrl, error instanceof GscError ? error.status : 0, message);
      results.push({ sitemap: sitemapUrl, ok: false, message });
    }
  }

  let indexNow: { status: number; message: string } | null = null;
  if (urls.length) {
    indexNow = await pingIndexNow(urls);
    await logPing("indexnow", urls.join(" "), indexNow.status, indexNow.message);
  }
  return { sitemaps: results, indexNow };
}

/** Roda em segundo plano quando há contexto do Worker; senão espera (scripts, testes). */
async function inBackground(task: Promise<unknown>): Promise<void> {
  const safe = task.catch((error) => console.error("[gsc] rotina de indexação falhou", error));
  try {
    const { ctx } = await getCloudflareContext({ async: true });
    ctx.waitUntil(safe);
  } catch {
    await safe;
  }
}

/** Só grava as mudanças em site_changes, sem avisar ninguém. */
export async function saveChanges(changes: Change[], actor: string | null): Promise<void> {
  if (!changes.length) return;
  const db = await getDb();
  const now = nowIso();
  await db.batch(
    changes.map((change) =>
      db
        .prepare("INSERT INTO site_changes (id, path, kind, sitemap, changed_at, changed_by) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(newId("chg"), change.path, change.kind, SITEMAPS[change.sitemap], now, actor),
    ),
  );
}

/**
 * Grava as mudanças e agenda o aviso aos buscadores. Nunca derruba quem chamou: o conteúdo
 * já foi salvo, e uma falha aqui só fica registrada.
 */
export async function recordChange(changes: Change[], actor: string | null): Promise<void> {
  const list = changes.filter((change) => change.path.startsWith("/"));
  if (!list.length) return;
  try {
    await saveChanges(list, actor);
  } catch (error) {
    console.error("[gsc] falha ao gravar a mudança", error);
    return;
  }
  if (!isIndexable()) return;
  await inBackground(
    notifyIndexing(
      list.map((change) => change.sitemap),
      list.map((change) => absoluteUrl(change.path)),
    ),
  );
}

/** Última mudança gravada de cada caminho (ISO). Vazio se o banco não responder (build). */
export async function lastChangesByPath(): Promise<Map<string, string>> {
  try {
    const db = await getDb();
    const { results } = await db
      .prepare("SELECT path, MAX(changed_at) AS changed_at FROM site_changes GROUP BY path")
      .all<{ path: string; changed_at: string }>();
    return new Map((results ?? []).map((row) => [row.path, row.changed_at]));
  } catch {
    return new Map();
  }
}

/** A maior de duas datas ISO (data simples ou data e hora). */
export function latest(a: string | undefined | null, b: string | undefined | null): string | undefined {
  if (!a) return b ?? undefined;
  if (!b) return a;
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}
