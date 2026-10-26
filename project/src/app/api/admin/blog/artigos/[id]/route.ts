import { audit } from "@/lib/admin/audit";
import { jsonError, jsonOk, MAX_CONTENT_BODY, readJson } from "@/lib/admin/request";
import { deletePost, getAdminPost, savePost, touchLock, type PostInput } from "@/lib/blog/admin";
import { blogAuth } from "@/lib/blog/api";

// Um artigo: ler, gravar (rascunho, publicar, agendar), renovar o trinco e excluir.
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Ctx) {
  const auth = await blogAuth(request);
  if ("response" in auth) return auth.response;
  const post = await getAdminPost((await params).id);
  return post ? jsonOk({ artigo: post }) : jsonError("Artigo não encontrado.", 404);
}

export async function PUT(request: Request, { params }: Ctx) {
  const auth = await blogAuth(request, { write: true });
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const body = await readJson<PostInput & { nota?: string }>(request, MAX_CONTENT_BODY);
  if (!body) return jsonError("Envio inválido.", 400);

  const result = await savePost(id, body, auth.actor, body.nota);
  if (!result.ok) return jsonError(result.message, result.status, { errors: result.errors });

  await audit({
    action: result.status === "rascunho" ? "blog.artigo.salvo" : "blog.artigo.publicado",
    actorId: auth.actor.id,
    actorEmail: auth.actor.email,
    targetType: "blog_post",
    targetId: id,
    detail: { slug: result.slug, status: result.status },
    request,
  });
  return jsonOk(result);
}

/** Sinal de vida do editor aberto: mantém o aviso "Fulano está editando". */
export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await blogAuth(request, { write: true });
  if ("response" in auth) return auth.response;
  await touchLock((await params).id, auth.actor);
  return jsonOk();
}

export async function DELETE(request: Request, { params }: Ctx) {
  const auth = await blogAuth(request, { write: true });
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const deleted = await deletePost(id);
  if (!deleted) return jsonError("Artigo não encontrado.", 404);
  await audit({
    action: "blog.artigo.excluido",
    actorId: auth.actor.id,
    actorEmail: auth.actor.email,
    targetType: "blog_post",
    targetId: id,
    detail: { slug: deleted.slug },
    request,
  });
  return jsonOk({ message: "Artigo excluído." });
}
