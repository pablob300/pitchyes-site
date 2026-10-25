import { audit } from "@/lib/admin/audit";
import { PageSpeedError, runPageSpeed } from "@/lib/admin/pagespeed/client";
import { getBatch, saveBatch } from "@/lib/admin/pagespeed/db";
import { STRATEGIES, type PageSpeedResult } from "@/lib/admin/pagespeed/types";
import { checkRateLimit } from "@/lib/admin/rate-limit";
import { assertSameOrigin, jsonError, jsonOk, readJson } from "@/lib/admin/request";
import { requireApiSession } from "@/lib/admin/session";
import { can } from "@/lib/admin/users";
import { getSiteUrl } from "@/lib/site";

// Análise > PageSpeed: roda o PageSpeed Insights (mobile e desktop em paralelo) para
// uma página do próprio site e grava o resultado. Cada chamada ao Google leva de 15 a
// 40 segundos; o painel espera a resposta.
export const dynamic = "force-dynamic";

/**
 * Só páginas do próprio site: a chave da API é da PitchYes e não deve servir para
 * analisar terceiros. Aceita caminho ("/contato") ou URL completa do domínio público
 * ou do endereço em que o painel está aberto (homologação).
 */
function resolveTarget(raw: string, request: Request): string | null {
  const site = getSiteUrl();
  let url: URL;
  try {
    url = raw.startsWith("/") ? new URL(raw, site) : new URL(raw);
  } catch {
    return null;
  }
  const allowed = new Set([site.origin, new URL(request.url).origin]);
  if (url.protocol !== "https:" || !allowed.has(url.origin)) return null;
  url.hash = "";
  return url.toString();
}

export async function GET(request: Request) {
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  if (!can(auth.session.user, "analise.pagespeed")) return jsonError("Sem permissão.", 403);

  const id = new URL(request.url).searchParams.get("id") ?? "";
  const runs = id ? await getBatch(id) : [];
  if (!runs.length) return jsonError("Análise não encontrada.", 404);
  return jsonOk({ analise: runs });
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Pedido inválido.", 403);

  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const user = auth.session.user;
  if (!can(user, "analise.pagespeed")) return jsonError("Sem permissão.", 403);

  const body = await readJson<{ url?: string }>(request);
  const url = resolveTarget(String(body?.url ?? "").trim(), request);
  if (!url) return jsonError("Informe uma página deste site (ex.: /contato).", 400, { errors: { url: "Só páginas do próprio site podem ser analisadas." } });

  const limit = await checkRateLimit(`pagespeed:${auth.session.userId}`, { limit: 30, windowMinutes: 60 });
  if (!limit.ok) return jsonError(`Muitas análises seguidas. Tente de novo em ${Math.ceil(limit.retryAfterSeconds / 60)} min.`, 429);

  const settled = await Promise.allSettled(STRATEGIES.map((strategy) => runPageSpeed(url, strategy)));
  const results = settled
    .filter((item): item is PromiseFulfilledResult<PageSpeedResult> => item.status === "fulfilled")
    .map((item) => item.value);
  const failures = settled
    .filter((item): item is PromiseRejectedResult => item.status === "rejected")
    .map((item) => item.reason);

  if (!results.length) {
    const error = failures[0];
    if (!(error instanceof PageSpeedError)) console.error("[pagespeed]", error);
    return error instanceof PageSpeedError
      ? jsonError(error.message, error.status)
      : jsonError("Não foi possível analisar a página.", 500);
  }

  const batchId = await saveBatch(results, user.email);

  await audit({
    action: "pagespeed.analisada",
    actorId: auth.session.userId,
    actorEmail: user.email,
    targetType: "pagespeed",
    targetId: batchId,
    detail: {
      url,
      notas: Object.fromEntries(results.map((result) => [result.strategy, result.scores])),
    },
    request,
  });

  return jsonOk({
    id: batchId,
    aviso: failures.length
      ? `Só uma das análises terminou: ${failures[0] instanceof PageSpeedError ? failures[0].message : "erro inesperado."}`
      : undefined,
  });
}
