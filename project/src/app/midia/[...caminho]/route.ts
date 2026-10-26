import { getCloudflareContext } from "@opennextjs/cloudflare";

// Serve as imagens enviadas pelo painel. Público (é imagem de compartilhamento:
// o WhatsApp e o LinkedIn precisam buscar sem sessão), com cache longo.
//
// `?w=320|640|960|1280|1600` devolve a imagem redimensionada (binding IMAGES), em AVIF ou
// WebP conforme o `Accept` do navegador — é o `srcset` das capas e das imagens dos artigos
// do blog. Cada variante é guardada no cache da borda: a conversão roda uma vez por largura.
export const dynamic = "force-dynamic";

const WIDTHS = new Set([320, 640, 960, 1280, 1600]);
const IMMUTABLE = "public, max-age=31536000, immutable";

export async function GET(request: Request, { params }: { params: Promise<{ caminho: string[] }> }) {
  const { caminho } = await params;
  const key = caminho.join("/");
  const width = Number(new URL(request.url).searchParams.get("w"));
  const resize = WIDTHS.has(width);

  try {
    const { env } = await getCloudflareContext({ async: true });

    // Variante já pronta no cache da borda? A chave inclui o formato aceito.
    const accept = request.headers.get("accept") ?? "";
    const format: "image/avif" | "image/webp" = accept.includes("image/avif") ? "image/avif" : "image/webp";
    const cache = (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;
    const cacheKey = new Request(`${new URL(request.url).origin}/midia/${key}?w=${width}&f=${format}`);
    if (resize && cache) {
      const hit = await cache.match(cacheKey);
      if (hit) return hit;
    }

    const object = await env.MEDIA_BUCKET.get(key);
    if (!object) return new Response("Não encontrado", { status: 404 });
    const contentType = object.httpMetadata?.contentType ?? "application/octet-stream";

    // A chave carrega um identificador único: o mesmo endereço nunca devolve outra imagem,
    // então o navegador e o edge podem guardar para sempre. Trocar a imagem gera chave nova.
    const headers = { "cache-control": IMMUTABLE, "x-content-type-options": "nosniff", vary: "Accept" };

    const images = env.IMAGES;
    const raster = contentType.startsWith("image/") && contentType !== "image/svg+xml" && contentType !== "image/gif";
    if (!resize || !raster || !images) {
      // x-midia: por que veio o original (diagnóstico de variantes no DevTools).
      const reason = !resize ? "original" : !raster ? "nao-raster" : "sem-binding";
      return new Response(object.body, { headers: { ...headers, "content-type": contentType, "x-midia": reason } });
    }

    const result = await images
      .input(object.body)
      .transform({ width, fit: "scale-down" })
      .output({ format, quality: 80 });
    const final = new Response(result.image(), {
      headers: { ...headers, "content-type": result.contentType(), "x-midia": `variante-${width}` },
    });
    if (cache) await cache.put(cacheKey, final.clone());
    return final;
  } catch (error) {
    console.error("[midia] falha ao ler", key, error);
    return new Response("Erro", { status: 500 });
  }
}
