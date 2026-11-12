import { timingSafeEqual } from "@/lib/admin/crypto";
import { getDb } from "@/lib/admin/db";
import { notifyIndexing, saveChanges, type Change } from "@/lib/admin/search-console/changes";
import { pages } from "@/lib/routes";
import { absoluteUrl } from "@/lib/sitemap";
import { isIndexable } from "@/lib/site";

// Chamado por scripts/search-console-ping.mjs no fim de `npm run deploy`. Cobre o que muda
// no CÓDIGO (texto em src/content, páginas novas em lib/routes.ts), que não passa pelo painel:
// compara a data `updated` de cada página com a do deploy anterior (gsc_route_dates), grava
// as mudanças, reenvia os três sitemaps e avisa o IndexNow das URLs que mudaram.
// Protegido pelo segredo DEPLOY_PING_TOKEN (cabeçalho Authorization: Bearer).
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const expected = process.env.DEPLOY_PING_TOKEN?.trim();
  const given = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!expected || !given || !timingSafeEqual(given, expected)) {
    return Response.json({ ok: false, message: "Não autorizado." }, { status: 401 });
  }

  const db = await getDb();
  const { results } = await db.prepare("SELECT path, updated FROM gsc_route_dates").all<{ path: string; updated: string }>();
  const previous = new Map((results ?? []).map((row) => [row.path, row.updated]));
  const current = pages.filter((page) => !page.placeholder);

  const changes: Change[] = [];
  for (const page of current) {
    const before = previous.get(page.path);
    if (before === page.updated) continue;
    changes.push({ path: page.path, kind: before ? "update" : "create", sitemap: page.path.startsWith("/blog") ? "blog" : "paginas" });
  }
  for (const path of previous.keys()) {
    if (!current.some((page) => page.path === path)) changes.push({ path, kind: "delete", sitemap: "paginas" });
  }

  await db.batch([
    db.prepare("DELETE FROM gsc_route_dates"),
    ...current.map((page) => db.prepare("INSERT INTO gsc_route_dates (path, updated) VALUES (?, ?)").bind(page.path, page.updated)),
  ]);

  // Primeira vez (tabela vazia): só guarda a referência. Gravar tudo como "alterado" faria o
  // <lastmod> do sitemap dizer ao Google que todas as páginas mudaram hoje, o que é falso.
  // O IndexNow recebe todas as URLs uma vez, como primeiro aviso.
  const firstRun = previous.size === 0;
  if (!firstRun) await saveChanges(changes, "deploy");
  const urls = (firstRun ? current.map((page) => page.path) : changes.map((change) => change.path)).map(absoluteUrl);

  if (!isIndexable()) return Response.json({ ok: true, changes, message: "Fora da produção: mudanças gravadas, nada enviado." });

  const result = await notifyIndexing(["paginas", "blog", "conteudo"], urls, { force: true });
  return Response.json({ ok: true, changes: firstRun ? [] : changes, firstRun, ...result });
}
