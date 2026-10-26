import { jsonError, jsonOk } from "@/lib/admin/request";
import { getVersion, listVersions } from "@/lib/blog/admin";
import { blogAuth } from "@/lib/blog/api";

// Histórico do artigo. `?versao=<id>` devolve o conteúdo daquela versão para o editor
// carregar — nada é gravado até alguém salvar.
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await blogAuth(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const versionId = new URL(request.url).searchParams.get("versao");
  if (versionId) {
    const data = await getVersion(id, versionId);
    return data ? jsonOk({ versao: data }) : jsonError("Versão não encontrada.", 404);
  }
  return jsonOk({ versoes: await listVersions(id) });
}
