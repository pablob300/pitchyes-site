import { getCloudflareContext } from "@opennextjs/cloudflare";

// Serve as imagens enviadas pelo painel. Público (é imagem de compartilhamento:
// o WhatsApp e o LinkedIn precisam buscar sem sessão), com cache longo.
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ caminho: string[] }> }) {
  const { caminho } = await params;
  const key = caminho.join("/");
  try {
    const { env } = await getCloudflareContext({ async: true });
    const object = await env.MEDIA_BUCKET.get(key);
    if (!object) return new Response("Não encontrado", { status: 404 });
    return new Response(object.body, {
      headers: {
        "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
        "cache-control": "public, max-age=604800, stale-while-revalidate=86400",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[midia] falha ao ler", key, error);
    return new Response("Erro", { status: 500 });
  }
}
