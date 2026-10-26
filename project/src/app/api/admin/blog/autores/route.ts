import { audit } from "@/lib/admin/audit";
import { jsonError, jsonOk, readJson } from "@/lib/admin/request";
import { listAdminAuthors, saveAuthor } from "@/lib/blog/admin";
import { blogAuth } from "@/lib/blog/api";

// Autores do blog (schema Person e página /blog/autor/...).
export const dynamic = "force-dynamic";

type Body = { name?: string; role?: string; bio?: string; sameAs?: string[] };

export async function GET(request: Request) {
  const auth = await blogAuth(request);
  if ("response" in auth) return auth.response;
  return jsonOk({ autores: await listAdminAuthors() });
}

export async function POST(request: Request) {
  const auth = await blogAuth(request, { write: true });
  if ("response" in auth) return auth.response;
  const body = await readJson<Body>(request);
  if (!body) return jsonError("Envio inválido.", 400);
  const result = await saveAuthor(null, { name: body.name ?? "", role: body.role ?? "", bio: body.bio ?? "", sameAs: body.sameAs ?? [] });
  if (!result.ok) return jsonError(result.message, result.status, { errors: result.errors });
  await audit({ action: "blog.autor.salvo", actorId: auth.actor.id, actorEmail: auth.actor.email, targetType: "blog_author", targetId: result.id, request });
  return jsonOk({ id: result.id, slug: result.slug });
}
