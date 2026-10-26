import { blogPaths, getAllPosts, listAuthors, listCategories, listTags, pageCount, TAG_INDEX_MIN } from "@/lib/blog";
import { urlsetResponse, type SitemapEntry } from "@/lib/sitemap";

// Tudo do blog que é indexável: listagem e páginas, artigos (com a capa como <image:image>),
// categorias e suas páginas, tags com ≥ TAG_INDEX_MIN artigos (só a 1ª página) e autores
// (só a 1ª página). Artigo noindex fica de fora — o sitemap espelha o que pede indexação.
export const revalidate = 300;

export async function GET() {
  const [posts, categories, tags, authors] = await Promise.all([getAllPosts(), listCategories(), listTags(), listAuthors()]);
  const indexable = posts.filter((p) => !p.noindex);
  const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
  const newest = indexable[0]?.updatedAt;

  const entries: SitemapEntry[] = [
    ...range(pageCount(indexable.length)).map((n) => ({ path: blogPaths.listing(n), lastModified: n === 1 ? newest : undefined })),
    ...indexable.map((p) => ({
      path: blogPaths.post(p.slug),
      lastModified: p.updatedAt,
      image: p.coverUrl ? { path: p.coverUrl, title: p.coverAlt } : undefined,
    })),
    ...(categories.some((c) => c.count > 0) ? [{ path: blogPaths.categories() }] : []),
    ...categories
      .filter((c) => c.count > 0)
      .flatMap((c) => range(pageCount(c.count)).map((n) => ({ path: blogPaths.category(c.slug, n) }))),
    ...tags
      .filter((t) => t.count >= TAG_INDEX_MIN)
      .map((t) => ({ path: blogPaths.tag(t.slug) })),
    ...authors
      .filter((a) => a.count > 0)
      .map((a) => ({ path: blogPaths.author(a.slug) })),
  ];
  return urlsetResponse(entries);
}
