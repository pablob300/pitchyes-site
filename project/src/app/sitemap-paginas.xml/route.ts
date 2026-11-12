import { urlsetResponse } from "@/lib/sitemap";
import { pageEntries } from "@/lib/sitemap-entries";

export const dynamic = "force-dynamic";

// Placeholder pages are noindex and stay out until they get real content.
// Blog URLs live in sitemap-blog.xml. As regras (noindex do Page Editor, <lastmod>) ficam
// em lib/sitemap-entries.ts, que a tela Análise > Search Console também lê.
export async function GET() {
  return urlsetResponse(await pageEntries());
}
