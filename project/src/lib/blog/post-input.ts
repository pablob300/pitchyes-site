import type { AdminPost, PostInput } from "./admin";

// Os campos editáveis de um artigo (o que o editor manda salvar e o que uma versão guarda).
// Sem "server-only": o editor usa no navegador.
export function toPostInput(post: AdminPost): PostInput {
  return {
    slug: post.slug,
    title: post.title,
    seoTitle: post.seoTitle,
    metaDescription: post.metaDescription,
    focusKeyword: post.focusKeyword,
    excerpt: post.excerpt,
    contentHtml: post.contentHtml,
    coverUrl: post.coverUrl,
    coverAlt: post.coverAlt,
    coverWidth: post.coverWidth,
    coverHeight: post.coverHeight,
    authorId: post.authorId,
    categoryId: post.categoryId,
    tags: post.tags,
    status: post.status,
    publishedAt: post.publishedAt,
    featured: post.featured,
    noindex: post.noindex,
  };
}
