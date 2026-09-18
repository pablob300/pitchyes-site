import { getSiteUrl } from "./site";

export type SitemapEntry = { path: string; lastModified?: string };

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function absoluteUrl(path: string): string {
  return new URL(path, getSiteUrl()).toString();
}

function xmlResponse(body: string): Response {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n${body}`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

export function urlsetResponse(entries: SitemapEntry[]): Response {
  const urls = entries
    .map((e) => {
      const lastmod = e.lastModified ? `<lastmod>${escape(e.lastModified)}</lastmod>` : "";
      return `  <url><loc>${escape(absoluteUrl(e.path))}</loc>${lastmod}</url>`;
    })
    .join("\n");
  return xmlResponse(
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
  );
}

export function sitemapIndexResponse(paths: string[]): Response {
  const items = paths
    .map((p) => `  <sitemap><loc>${escape(absoluteUrl(p))}</loc></sitemap>`)
    .join("\n");
  return xmlResponse(
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>`,
  );
}
