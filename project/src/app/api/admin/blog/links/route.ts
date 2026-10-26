import { jsonError, jsonOk, MAX_CONTENT_BODY, readJson } from "@/lib/admin/request";
import { searchLinkTargets, suggestLinks } from "@/lib/blog/admin";
import { blogAuth } from "@/lib/blog/api";

// Links internos no editor: GET ?q= busca artigos e páginas; POST { id, html } sugere
// links a partir do texto (assuntos de outros artigos e das páginas comerciais).
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await blogAuth(request);
  if ("response" in auth) return auth.response;
  return jsonOk({ resultados: await searchLinkTargets(new URL(request.url).searchParams.get("q") ?? "") });
}

export async function POST(request: Request) {
  const auth = await blogAuth(request);
  if ("response" in auth) return auth.response;
  const body = await readJson<{ id?: string | null; html?: string }>(request, MAX_CONTENT_BODY);
  if (!body) return jsonError("Envio inválido.", 400);
  return jsonOk({ sugestoes: await suggestLinks(body.id ?? null, body.html ?? "") });
}
