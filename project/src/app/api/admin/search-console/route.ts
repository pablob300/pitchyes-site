import { audit } from "@/lib/admin/audit";
import { GscError } from "@/lib/admin/search-console/auth";
import { notifyIndexing, type SitemapKey } from "@/lib/admin/search-console/changes";
import { inspectLink, inspectUrl } from "@/lib/admin/search-console/client";
import { getInventory, saveInspection } from "@/lib/admin/search-console/inventory";
import { statusOf } from "@/lib/admin/search-console/status";
import { assertSameOrigin, jsonError, jsonOk, readJson } from "@/lib/admin/request";
import { requireApiSession } from "@/lib/admin/session";
import { can } from "@/lib/admin/users";

// Análise > Search Console.
//   acao "inspecionar": Inspeção de URL do Google para até MAX_BATCH caminhos (a tela manda
//                       em lotes e mostra o progresso); grava o resultado no D1.
//   acao "indexar":     reenvia os sitemaps das URLs e avisa o IndexNow; devolve o link da
//                       Inspeção de URL no Search Console, onde fica o "Solicitar indexação".
//   acao "sitemaps":    reenvia os três sitemaps.
// Só caminhos que estão nos sitemaps: a lista vem de getInventory().
export const dynamic = "force-dynamic";

const MAX_BATCH = 10;

type Body = { acao?: "inspecionar" | "indexar" | "sitemaps"; caminhos?: string[]; todas?: boolean };

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Pedido inválido.", 403);
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const user = auth.session.user;
  if (!can(user, "analise.searchconsole")) return jsonError("Sem permissão.", 403);

  const body = await readJson<Body>(request);
  if (!body) return jsonError("Envio inválido.", 400);

  const inventory = await getInventory();
  const byPath = new Map(inventory.map((row) => [row.path, row]));
  const requested = body.todas ? inventory.map((row) => row.path) : (body.caminhos ?? []).map(String);
  const rows = [...new Set(requested)].map((path) => byPath.get(path)).filter((row) => row !== undefined);

  if (body.acao === "inspecionar") {
    if (!rows.length) return jsonError("Nenhuma página válida.", 400);
    if (rows.length > MAX_BATCH) return jsonError(`Envie no máximo ${MAX_BATCH} páginas por vez.`, 400);

    const settled = await Promise.allSettled(rows.map((row) => inspectUrl(row.url)));
    const resultados = [];
    let erro: string | undefined;
    for (const [index, item] of settled.entries()) {
      const row = rows[index];
      if (item.status === "rejected") {
        const reason = item.reason;
        if (!(reason instanceof GscError)) console.error("[gsc] inspeção", row.path, reason);
        erro ??= reason instanceof GscError ? reason.message : "Falha inesperada na inspeção.";
        continue;
      }
      await saveInspection(row.path, item.value);
      const inspection = {
        verdict: item.value.verdict ?? null,
        coverageState: item.value.coverageState ?? null,
        lastCrawlTime: item.value.lastCrawlTime ?? null,
        inspectedAt: new Date().toISOString(),
      };
      resultados.push({ caminho: row.path, status: statusOf(inspection, row.lastChange) });
    }
    if (!resultados.length) return jsonError(erro ?? "Não foi possível inspecionar.", 502);
    return jsonOk({ resultados, aviso: erro });
  }

  if (body.acao === "indexar" || body.acao === "sitemaps") {
    const all = body.acao === "sitemaps";
    if (!all && !rows.length) return jsonError("Nenhuma página válida.", 400);
    const sitemaps: SitemapKey[] = all ? ["paginas", "blog", "conteudo"] : rows.map((row) => row.sitemap);
    const result = await notifyIndexing(sitemaps, all ? [] : rows.map((row) => row.url), { force: true });

    await audit({
      action: "searchconsole.indexar",
      actorId: auth.session.userId,
      actorEmail: user.email,
      targetType: "searchconsole",
      targetId: all ? "sitemaps" : body.todas ? "todas" : rows[0].path,
      detail: { paginas: all ? 0 : rows.length, sitemaps: result.sitemaps, indexNow: result.indexNow },
      request,
    });

    const failed = result.sitemaps.filter((item) => !item.ok);
    return jsonOk({
      ...result,
      links: rows.length === 1 && !all ? { [rows[0].path]: inspectLink(rows[0].url) } : undefined,
      message: failed.length
        ? failed[0].message
        : all
          ? "Sitemaps reenviados ao Google."
          : `Sitemap reenviado ao Google${result.indexNow ? ` · IndexNow: ${result.indexNow.message}` : ""}`,
    });
  }

  return jsonError("Ação desconhecida.", 400);
}
