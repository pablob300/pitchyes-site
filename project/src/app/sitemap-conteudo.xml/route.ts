import { landingPath, listPublishedLandingPages } from "@/lib/landing-db";
import { urlsetResponse } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

// Landing pages (/conteudo/<slug>): só as ativas e sem noindex. A data de revisão é a da
// última publicação do conteúdo ou mudança no painel.
export async function GET() {
  const pages = await listPublishedLandingPages();
  return urlsetResponse(pages.map((p) => ({ path: landingPath(p.slug), lastModified: p.updated_at.slice(0, 10) })));
}
