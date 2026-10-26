import { jsonError, jsonOk, readJson } from "@/lib/admin/request";
import { listMedia, updateMedia } from "@/lib/blog/admin";
import { blogAuth } from "@/lib/blog/api";

// Biblioteca de mídia do blog. O envio continua em /api/admin/midia (pasta "blog").
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await blogAuth(request);
  if ("response" in auth) return auth.response;
  return jsonOk({ midias: await listMedia(new URL(request.url).searchParams.get("q") ?? "") });
}

export async function PUT(request: Request) {
  const auth = await blogAuth(request, { write: true });
  if ("response" in auth) return auth.response;
  const body = await readJson<{ id?: string; alt?: string; legenda?: string }>(request);
  if (!body?.id) return jsonError("Envio inválido.", 400);
  await updateMedia(body.id, body.alt ?? "", body.legenda ?? "");
  return jsonOk();
}
