import { indexNowKey } from "@/lib/admin/search-console/indexnow";

// Arquivo de verificação do IndexNow: o corpo é a própria chave (segredo INDEXNOW_KEY).
// É o `keyLocation` dos avisos (lib/admin/search-console/indexnow.ts).
export const dynamic = "force-dynamic";

export function GET() {
  const key = indexNowKey();
  if (!key) return new Response("Not found", { status: 404 });
  return new Response(key, {
    headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex" },
  });
}
