import type { MetadataRoute } from "next";
import { getSiteUrl, isIndexable } from "@/lib/site";

// Rendered per request so a SITE_URL change in the dashboard applies without a rebuild.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    host: getSiteUrl().origin,
  };
}
