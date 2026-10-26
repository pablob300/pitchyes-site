import { audit } from "@/lib/admin/audit";
import { jsonError, jsonOk, readJson } from "@/lib/admin/request";
import { listTerms, saveTerm, type TermInput, type TermKind } from "@/lib/blog/admin";
import { blogAuth } from "@/lib/blog/api";

// Categorias e tags: listar (?tipo=categoria|tag) e criar.
export const dynamic = "force-dynamic";

const kindOf = (raw: unknown): TermKind | null => (raw === "categoria" || raw === "tag" ? raw : null);

export async function GET(request: Request) {
  const auth = await blogAuth(request);
  if ("response" in auth) return auth.response;
  const kind = kindOf(new URL(request.url).searchParams.get("tipo"));
  if (!kind) return jsonError("Tipo inválido.", 400);
  return jsonOk({ termos: await listTerms(kind) });
}

export async function POST(request: Request) {
  const auth = await blogAuth(request, { write: true });
  if ("response" in auth) return auth.response;
  const body = await readJson<TermInput & { tipo?: string }>(request);
  const kind = kindOf(body?.tipo);
  if (!body || !kind) return jsonError("Envio inválido.", 400);
  const result = await saveTerm(kind, null, body);
  if (!result.ok) return jsonError(result.message, result.status, { errors: result.errors });
  await audit({
    action: "blog.termo.salvo",
    actorId: auth.actor.id,
    actorEmail: auth.actor.email,
    targetType: kind,
    targetId: result.id,
    detail: { slug: result.slug },
    request,
  });
  return jsonOk({ id: result.id, slug: result.slug });
}
