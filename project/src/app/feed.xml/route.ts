import { blogPaths, getAllPosts } from "@/lib/blog";
import { SITE_NAME } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";

// RSS do blog: leitores de feed, agregadores e mecanismos de IA descobrem artigos novos
// por aqui. Anunciado no <head> de cada artigo (alternates.types).
export const revalidate = 300;

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const base = getSiteUrl();
  const posts = (await getAllPosts()).filter((post) => !post.noindex).slice(0, 50);
  const items = posts
    .map((post) => {
      const url = new URL(blogPaths.post(post.slug), base).toString();
      const image = post.coverUrl
        ? `\n      <enclosure url="${escape(new URL(post.coverUrl, base).toString())}" type="image/webp" length="0" />`
        : "";
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>${post.categoryName ? `\n      <category>${escape(post.categoryName)}</category>` : ""}
      <description>${escape(post.excerpt ?? "")}</description>${image}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog da ${SITE_NAME}</title>
    <link>${new URL("/blog", base).toString()}</link>
    <atom:link href="${new URL(blogPaths.feed(), base).toString()}" rel="self" type="application/rss+xml" />
    <description>Artigos sobre IA de voz, prospecção, atendimento e gestão comercial.</description>
    <language>pt-BR</language>${posts[0] ? `\n    <lastBuildDate>${new Date(posts[0].updatedAt).toUTCString()}</lastBuildDate>` : ""}
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=300" },
  });
}
