import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ArticleView } from "@/components/blog/ArticleView";
import { JsonLd } from "@/components/JsonLd";
import { adjacentPosts, blogPaths, getAllPosts, getPost, getRedirect, relatedPosts } from "@/lib/blog";
import { prepareArticleHtml } from "@/lib/blog/html";
import { blogPostingSchema, faqSchema, personSchema, postMetadata } from "@/lib/blog/schema";
import { breadcrumbSchema } from "@/lib/seo";

// Artigo do blog. Gerado no build e revalidado a cada minuto; publicar no painel também
// revalida na hora (revalidatePath). Slug antigo (site anterior ou slug editado) → 301.
export const revalidate = 60;

export async function generateStaticParams() {
  return (await getAllPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return post ? postMetadata(post) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    const to = await getRedirect(blogPaths.post(slug));
    if (to) permanentRedirect(to);
    notFound();
  }

  const [{ html, toc, faq }, related, { previous, next }] = await Promise.all([
    Promise.resolve(prepareArticleHtml(post.contentHtml)),
    relatedPosts(post, 3),
    adjacentPosts(post),
  ]);

  const trail = [
    { name: "Início", path: "/" },
    { name: "Blog", path: "/blog" },
    ...(post.category ? [{ name: post.category.name, path: blogPaths.category(post.category.slug) }] : []),
    { name: post.title, path: blogPaths.post(post.slug) },
  ];

  return (
    <>
      <JsonLd
        graph={[
          blogPostingSchema(post),
          ...(post.authorFull ? [personSchema(post.authorFull)] : []),
          breadcrumbSchema(trail),
          ...(faq.length ? [faqSchema(faq)] : []),
        ]}
      />
      <ArticleView post={post} html={html} toc={toc} trail={trail} related={related} previous={previous} next={next} />
    </>
  );
}
