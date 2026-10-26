import { audit } from "@/lib/admin/audit";
import { jsonError, jsonOk, readJson } from "@/lib/admin/request";
import { saveAuthor } from "@/lib/blog/admin";
import { blogAuth } from "@/lib/blog/api";

// Edita um autor (nome, cargo, bio e perfis públicos).
export const dynamic = "force-dynamic";

type Body = { name?: string; role?: string; bio?: string; sameAs?: string[] };

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await blogAuth(request, { write: true });
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const body = await readJson<Body>(request);
  if (!body) return jsonError("Envio inválido.", 400);
  const result = await saveAuthor(id, { name: body.name ?? "", role: body.role ?? "", bio: body.bio ?? "", sameAs: body.sameAs ?? [] });
  if (!result.ok) return jsonError(result.message, result.status, { errors: result.errors });
  await audit({ action: "blog.autor.salvo", actorId: auth.actor.id, actorEmail: auth.actor.email, targetType: "blog_author", targetId: id, request });
  return jsonOk({ id });
}
