import { getAllPageMeta } from "@/lib/page-meta";
import { pages } from "@/lib/routes";
import { urlsetResponse } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

// Placeholder pages are noindex and stay out until they get real content.
// Blog URLs live in sitemap-blog.xml.
// A página marcada como noindex no Page Editor também sai daqui, e a data de
// revisão editada lá vira o <lastmod>.
export async function GET() {
  const overrides = await getAllPageMeta();
  return urlsetResponse(
    pages
      .filter((p) => !p.placeholder && !p.path.startsWith("/blog"))
      .filter((p) => overrides.get(p.path)?.noindex !== 1)
      .map((p) => ({ path: p.path, lastModified: overrides.get(p.path)?.updated || p.updated })),
  );
}
