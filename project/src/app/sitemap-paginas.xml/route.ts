import { pages } from "@/lib/routes";
import { urlsetResponse } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

// Placeholder pages are noindex and stay out until they get real content.
// Blog URLs live in sitemap-blog.xml.
export function GET() {
  return urlsetResponse(
    pages
      .filter((p) => !p.placeholder && !p.path.startsWith("/blog"))
      .map((p) => ({ path: p.path, lastModified: p.updated })),
  );
}
