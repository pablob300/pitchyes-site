import { audit } from "@/lib/admin/audit";
import { jsonError, jsonOk, readJson } from "@/lib/admin/request";
import { deleteTerm, mergeTerm, saveTerm, type TermInput, type TermKind } from "@/lib/blog/admin";
import { blogAuth } from "@/lib/blog/api";

// Uma categoria ou tag: editar (PUT), fundir em outra (POST { tipo, destino }) e excluir.
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };
const kindOf = (raw: unknown): TermKind | null => (raw === "categoria" || raw === "tag" ? raw : null);

export async function PUT(request: Request, { params }: Ctx) {
  const auth = await blogAuth(request, { write: true });
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const body = await readJson<TermInput & { tipo?: string }>(request);
  const kind = kindOf(body?.tipo);
  if (!body || !kind) return jsonError("Envio inválido.", 400);
  const result = await saveTerm(kind, id, body);
  if (!result.ok) return jsonError(result.message, result.status, { errors: result.errors });
  await audit({
    action: "blog.termo.salvo",
    actorId: auth.actor.id,
    actorEmail: auth.actor.email,
    targetType: kind,
    targetId: id,
    detail: { slug: result.slug },
    request,
  });
  return jsonOk({ id, slug: result.slug });
}

export async function POST(request: Request, { params }: Ctx) {
  const auth = await blogAuth(request, { write: true });
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const body = await readJson<{ tipo?: string; destino?: string }>(request);
  const kind = kindOf(body?.tipo);
  if (!body || !kind || !body.destino) return jsonError("Envio inválido.", 400);
  if (!(await mergeTerm(kind, id, body.destino))) return jsonError("Não foi possível fundir.", 400);
  await audit({
    action: "blog.termo.fundido",
    actorId: auth.actor.id,
    actorEmail: auth.actor.email,
    targetType: kind,
    targetId: id,
    detail: { destino: body.destino },
    request,
  });
  return jsonOk({ message: "Fundido. O endereço antigo redireciona para o novo." });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const auth = await blogAuth(request, { write: true });
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const kind = kindOf(new URL(request.url).searchParams.get("tipo"));
  if (!kind) return jsonError("Tipo inválido.", 400);
  const result = await deleteTerm(kind, id);
  if (result === "nao-encontrado") return jsonError("Não encontrado.", 404);
  if (result === "em-uso") return jsonError("Ainda há artigos aqui: funda em outro item em vez de excluir.", 409);
  await audit({ action: "blog.termo.excluido", actorId: auth.actor.id, actorEmail: auth.actor.email, targetType: kind, targetId: id, request });
  return jsonOk({ message: "Excluído." });
}
