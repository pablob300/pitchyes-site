import { getSiteUrl } from "./site";

export type SitemapEntry = {
  path: string;
  lastModified?: string;
  /** Imagem principal da URL (capa do artigo): vira <image:image> para o Google Imagens. */
  image?: { path: string; title?: string | null };
};

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
      const image = e.image
        ? `<image:image><image:loc>${escape(absoluteUrl(e.image.path))}</image:loc>${
            e.image.title ? `<image:title>${escape(e.image.title)}</image:title>` : ""
          }</image:image>`
        : "";
      return `  <url><loc>${escape(absoluteUrl(e.path))}</loc>${lastmod}${image}</url>`;
    })
    .join("\n");
  return xmlResponse(
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>`,
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
