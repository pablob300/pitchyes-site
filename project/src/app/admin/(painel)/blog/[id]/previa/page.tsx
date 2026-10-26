import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "@/components/admin/blog/BlogAdmin.module.css";
import { ArticleView } from "@/components/blog/ArticleView";
import { blogPaths, getAuthor, getCategory, type BlogPost } from "@/lib/blog";
import { getAdminPost, listAdminAuthors, listTerms } from "@/lib/blog/admin";
import { prepareArticleHtml, textStats } from "@/lib/blog/html";
import { pageMetadata } from "@/lib/seo";

// Prévia do artigo como vai ficar no site, inclusive rascunho e agendado. Fica sob
// /admin (exige sessão, noindex). Usa o mesmo ArticleView do site público.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata({ title: "Prévia do artigo", description: "Área interna da PitchYes: prévia de artigo do blog.", path: "/admin/blog", noindex: true });
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getAdminPost(id);
  if (!post) notFound();

  const [categories, authors] = await Promise.all([listTerms("categoria"), listAdminAuthors()]);
  const category = categories.find((c) => c.id === post.categoryId) ?? null;
  const author = authors.find((a) => a.id === post.authorId) ?? null;
  const [categoryFull, authorFull] = await Promise.all([
    category ? getCategory(category.slug) : Promise.resolve(null),
    author ? getAuthor(author.slug) : Promise.resolve(null),
  ]);
  const stats = textStats(post.contentHtml);
  const now = new Date().toISOString();

  const view: BlogPost = {
    id: post.id,
    slug: post.slug,
    title: post.title || "(sem título)",
    excerpt: post.excerpt || null,
    coverUrl: post.coverUrl,
    coverAlt: post.coverAlt || null,
    coverWidth: post.coverWidth,
    coverHeight: post.coverHeight,
    publishedAt: post.publishedAt ?? now,
    updatedAt: post.updatedAt,
    readingMinutes: stats.minutes,
    featured: post.featured,
    category: category ? { slug: category.slug, name: category.name } : null,
    author: author ? { slug: author.slug, name: author.name } : null,
    seoTitle: post.seoTitle || null,
    metaDescription: post.metaDescription || null,
    focusKeyword: post.focusKeyword || null,
    contentHtml: post.contentHtml,
    wordCount: stats.words,
    noindex: post.noindex,
    categoryFull,
    authorFull,
    tags: post.tags.map((name) => ({ name, slug: name })),
  };
  const { html, toc } = prepareArticleHtml(post.contentHtml);
  const trail = [
    { name: "Início", path: "/" },
    { name: "Blog", path: "/blog" },
    ...(category ? [{ name: category.name, path: blogPaths.category(category.slug) }] : []),
    { name: view.title, path: blogPaths.post(post.slug) },
  ];

  return (
    <>
      <p className={styles.notice} data-tipo="aviso">
        Prévia ({post.status}). Assim o artigo aparece no site; links do fim da página só funcionam depois de publicado.
      </p>
      <div style={{ background: "var(--color-bg)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
        <ArticleView post={view} html={html} toc={toc} trail={trail} related={[]} previous={null} next={null} />
      </div>
    </>
  );
}
