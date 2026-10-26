import { audit } from "@/lib/admin/audit";
import { jsonError, jsonOk, MAX_CONTENT_BODY, readJson } from "@/lib/admin/request";
import { savePost, type PostInput } from "@/lib/blog/admin";
import { blogAuth } from "@/lib/blog/api";

// Cria um artigo (o primeiro "salvar" do editor em /admin/blog/novo).
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await blogAuth(request, { write: true });
  if ("response" in auth) return auth.response;
  const input = await readJson<PostInput>(request, MAX_CONTENT_BODY);
  if (!input) return jsonError("Envio inválido.", 400);

  const result = await savePost(null, input, auth.actor);
  if (!result.ok) return jsonError(result.message, result.status, { errors: result.errors });

  await audit({
    action: result.status === "rascunho" ? "blog.artigo.salvo" : "blog.artigo.publicado",
    actorId: auth.actor.id,
    actorEmail: auth.actor.email,
    targetType: "blog_post",
    targetId: result.id,
    detail: { slug: result.slug, status: result.status },
    request,
  });
  return jsonOk(result);
}
