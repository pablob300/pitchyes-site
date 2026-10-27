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
  "Applebot", // Siri / Spotlight
  "Bingbot", // Bing e Copilot
  "DuckAssistBot", // respostas com IA do DuckDuckGo
  "Amazonbot", // Alexa
  "MistralAI-User", // Le Chat
  "cohere-ai",
  "YouBot",
  "CCBot", // Common Crawl, feeds many models
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  // Staging on workers.dev: nobody indexes anything.
  if (!isIndexable()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  // Área interna, endpoints e a pré-visualização do editor não entram em buscador nenhum.
  const off = ["/admin", "/api", "/editor"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: off },
      { userAgent: AI_AGENTS, allow: "/", disallow: off },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl().origin,
  };
}
