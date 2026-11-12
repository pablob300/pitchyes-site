import "server-only";
import { lastChangesByPath, latest } from "@/lib/admin/search-console/changes";
import { blogPaths, getAllPosts, listAuthors, listCategories, listTags, pageCount, TAG_INDEX_MIN } from "@/lib/blog";
import { landingPath, listPublishedLandingPages } from "@/lib/landing-db";
import { getAllPageMeta } from "@/lib/page-meta";
import { pages } from "@/lib/routes";
import type { SitemapEntry } from "@/lib/sitemap";

// As URLs de cada sitemap, em um lugar só: as rotas /sitemap-*.xml e a tela
// Análise > Search Console leem daqui, então a tela lista exatamente o que o Google recebe.

/**
 * Páginas do site (lib/routes.ts). Placeholder e as marcadas noindex no Page Editor ficam
 * de fora; blog tem sitemap próprio. O <lastmod> é a data de revisão (routes.ts ou Page
 * Editor) ou a última mudança registrada pelo painel, a que for mais recente.
 */
export async function pageEntries(): Promise<SitemapEntry[]> {
  const [overrides, changes] = await Promise.all([getAllPageMeta(), lastChangesByPath()]);
  return pages
    .filter((p) => !p.placeholder && !p.path.startsWith("/blog"))
    .filter((p) => overrides.get(p.path)?.noindex !== 1)
    .map((p) => ({
      path: p.path,
      lastModified: latest(overrides.get(p.path)?.updated || p.updated, changes.get(p.path)),
    }));
}

/**
 * Tudo do blog que é indexável: listagem e páginas, artigos (com a capa como <image:image>),
 * categorias e suas páginas, tags com ≥ TAG_INDEX_MIN artigos (só a 1ª página) e autores
 * (só a 1ª página). Artigo noindex fica de fora — o sitemap espelha o que pede indexação.
 */
export async function blogEntries(): Promise<SitemapEntry[]> {
  const [posts, categories, tags, authors] = await Promise.all([getAllPosts(), listCategories(), listTags(), listAuthors()]);
  const indexable = posts.filter((p) => !p.noindex);
  const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
  const newest = indexable[0]?.updatedAt;

  return [
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
    ...tags.filter((t) => t.count >= TAG_INDEX_MIN).map((t) => ({ path: blogPaths.tag(t.slug) })),
    ...authors.filter((a) => a.count > 0).map((a) => ({ path: blogPaths.author(a.slug) })),
  ];
}

/** Landing pages (/conteudo/<slug>): só as ativas e sem noindex. */
export async function landingEntries(): Promise<SitemapEntry[]> {
  const list = await listPublishedLandingPages();
  return list.map((p) => ({ path: landingPath(p.slug), lastModified: p.updated_at.slice(0, 10) }));
}
