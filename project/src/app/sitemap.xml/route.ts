import { sitemapIndexResponse } from "@/lib/sitemap";

// Per request so SITE_URL changes in the dashboard apply without a rebuild.
export const dynamic = "force-dynamic";

export function GET() {
  return sitemapIndexResponse(["/sitemap-paginas.xml", "/sitemap-blog.xml", "/sitemap-conteudo.xml"]);
}
