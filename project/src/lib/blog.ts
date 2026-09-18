// Blog data layer — headless WordPress, in STANDBY until the rest of the site ships.
// URL scheme is fixed now so the sitemap and internal links don't change later:
//   /blog                          listing (page 1)
//   /blog/pagina/[n]               listing, page n ≥ 2
//   /blog/[slug]                   article
//   /blog/categorias               all categories
//   /blog/categoria/[slug]         category (paginated: /blog/categoria/[slug]/pagina/[n])
//   /blog/tag/[slug]               tag (paginated: /blog/tag/[slug]/pagina/[n])

export const POSTS_PER_PAGE = 12;

export type BlogPost = { slug: string; modified: string };
export type BlogTerm = { slug: string; count: number };

export const blogPaths = {
  listing: (page = 1) => (page > 1 ? `/blog/pagina/${page}` : "/blog"),
  post: (slug: string) => `/blog/${slug}`,
  categories: () => "/blog/categorias",
  category: (slug: string, page = 1) =>
    page > 1 ? `/blog/categoria/${slug}/pagina/${page}` : `/blog/categoria/${slug}`,
  tag: (slug: string, page = 1) =>
    page > 1 ? `/blog/tag/${slug}/pagina/${page}` : `/blog/tag/${slug}`,
};

// TODO(blog): fetch from the WordPress REST API (/wp-json/wp/v2/posts, /categories, /tags).
export async function getAllPosts(): Promise<BlogPost[]> {
  return [];
}
export async function getAllCategories(): Promise<BlogTerm[]> {
  return [];
}
export async function getAllTags(): Promise<BlogTerm[]> {
  return [];
}

export function pageCount(items: number): number {
  return Math.max(1, Math.ceil(items / POSTS_PER_PAGE));
}
