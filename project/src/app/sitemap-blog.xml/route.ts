import {
  blogPaths,
  getAllCategories,
  getAllPosts,
  getAllTags,
  pageCount,
} from "@/lib/blog";
import { urlsetResponse, type SitemapEntry } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

// Empty while the blog is in standby: getAll*() return [] until WordPress is wired up.
export async function GET() {
  const [posts, categories, tags] = await Promise.all([
    getAllPosts(),
    getAllCategories(),
    getAllTags(),
  ]);
  if (posts.length === 0) return urlsetResponse([]);

  const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
  const entries: SitemapEntry[] = [
    ...range(pageCount(posts.length)).map((n) => ({ path: blogPaths.listing(n) })),
    ...posts.map((p) => ({ path: blogPaths.post(p.slug), lastModified: p.modified })),
    { path: blogPaths.categories() },
    ...categories.flatMap((c) =>
      range(pageCount(c.count)).map((n) => ({ path: blogPaths.category(c.slug, n) })),
    ),
    ...tags.flatMap((t) =>
      range(pageCount(t.count)).map((n) => ({ path: blogPaths.tag(t.slug, n) })),
    ),
  ];
  return urlsetResponse(entries);
}
