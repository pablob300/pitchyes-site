import { listVersions } from "@/lib/admin/content";
import { jsonError, jsonOk } from "@/lib/admin/request";
import { requireApiSession } from "@/lib/admin/session";
import { can } from "@/lib/admin/users";
import { writableContentPaths } from "@/lib/content/pages";

// Histórico de publicações de uma página: data, hora e quem publicou.
// É o que o link discreto "Histórico", ao lado do botão Publicar, abre.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  if (!can(auth.session.user, "conteudo.editar")) return jsonError("Sem permissão.", 403);

  const path = new URL(request.url).searchParams.get("caminho") ?? "";
  if (!writableContentPaths().includes(path)) return jsonError("Página desconhecida.", 404);

  const versions = await listVersions(path);
  return jsonOk({
    versoes: versions.map((v) => ({ id: v.id, em: v.created_at, por: v.created_by_name })),
  });
}
