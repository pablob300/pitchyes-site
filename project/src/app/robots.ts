import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/sitemap";
import { getSiteUrl, isIndexable } from "@/lib/site";

// Rendered per request so a SITE_URL change in the dashboard applies without a rebuild.
export const dynamic = "force-dynamic";

// Answer engines we explicitly welcome: being cited by them is a goal (see SEO.md).
// Listing them by name also documents the decision — removing one here opts it out.
const AI_AGENTS = [
  "GPTBot", // ChatGPT training/index
  "OAI-SearchBot", // ChatGPT search
  "ChatGPT-User", // ChatGPT browsing on a user's request
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended", // Gemini / AI Overviews grounding
  "Applebot-Extended",
  "Bingbot",
  "CCBot", // Common Crawl, feeds many models
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  // Staging on workers.dev: nobody indexes anything.
  if (!isIndexable()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AI_AGENTS, allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl().origin,
  };
}
