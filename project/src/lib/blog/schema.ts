import "server-only";
import type { Metadata } from "next";
import { blogPaths, type BlogAuthor, type BlogPost, type BlogPostSummary } from "@/lib/blog";
import { pageMetadataWithOverrides, SITE_NAME } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";
import type { FaqItem } from "./html";

// Metadados e dados estruturados do blog. Tudo continua passando por
// pageMetadataWithOverrides() (canonical, robots, Open Graph padrão — SEO.md §1.3); aqui só
// entra o que é próprio de artigo: og:type=article, datas, seção, tags e a capa.

type Thing = Record<string, unknown>;

const abs = (path: string) => new URL(path, getSiteUrl()).toString();

/** Título do artigo no <title> e no Google: o de SEO se houver, senão o título. */
export function postSeoTitle(post: Pick<BlogPost, "seoTitle" | "title">): string {
  return post.seoTitle?.trim() || post.title;
}

export function postSeoDescription(post: Pick<BlogPost, "metaDescription" | "excerpt" | "title">): string {
  return post.metaDescription?.trim() || post.excerpt?.trim() || post.title;
}

export async function postMetadata(post: BlogPost): Promise<Metadata> {
  const path = blogPaths.post(post.slug);
  const title = postSeoTitle(post);
  const description = postSeoDescription(post);
  const base = await pageMetadataWithOverrides({ title, description, path, noindex: post.noindex });
  const image = post.coverUrl
    ? [{ url: abs(post.coverUrl), width: post.coverWidth ?? 1200, height: post.coverHeight ?? 630, alt: post.coverAlt ?? title }]
    : undefined;
  // O <title> completo cabe em ~60 caracteres no Google. Se o sufixo " | PitchYes" passar
  // disso, o artigo vai sem ele: melhor o título inteiro que a marca cortando a frase.
  const withSuffix = `${title} | ${SITE_NAME}`;
  return {
    ...base,
    title: withSuffix.length > 60 ? { absolute: title } : title,
    authors: post.author ? [{ name: post.author.name, url: abs(blogPaths.author(post.author.slug)) }] : undefined,
    keywords: post.tags.map((t) => t.name),
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      section: post.category?.name,
      tags: post.tags.map((t) => t.name),
      authors: post.author ? [abs(blogPaths.author(post.author.slug))] : undefined,
      ...(image ? { images: image } : {}),
    },
    ...(image ? { twitter: { card: "summary_large_image", images: [image[0].url] } } : {}),
    alternates: {
      ...base.alternates,
      types: { "application/rss+xml": [{ url: blogPaths.feed(), title: `Blog da ${SITE_NAME}` }] },
    },
  };
}

export function personSchema(author: BlogAuthor): Thing {
  const url = abs(blogPaths.author(author.slug));
  return {
    "@type": "Person",
    "@id": `${url}#person`,
    name: author.name,
    url,
    ...(author.role ? { jobTitle: author.role } : {}),
    ...(author.bio ? { description: author.bio } : {}),
    ...(author.avatarUrl ? { image: abs(author.avatarUrl) } : {}),
    ...(author.sameAs.length ? { sameAs: author.sameAs } : {}),
    worksFor: { "@id": `${getSiteUrl().origin}/#organization` },
  };
}

export function blogPostingSchema(post: BlogPost): Thing {
  const url = abs(blogPaths.post(post.slug));
  const origin = getSiteUrl().origin;
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title.slice(0, 110),
    description: postSeoDescription(post),
    url,
    mainEntityOfPage: { "@id": url },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: "pt-BR",
    wordCount: post.wordCount,
    timeRequired: `PT${post.readingMinutes}M`,
    ...(post.coverUrl
      ? {
          image: {
            "@type": "ImageObject",
            url: abs(post.coverUrl),
            width: post.coverWidth ?? undefined,
            height: post.coverHeight ?? undefined,
            caption: post.coverAlt ?? undefined,
          },
        }
      : {}),
    ...(post.category ? { articleSection: post.category.name } : {}),
    ...(post.tags.length ? { keywords: post.tags.map((t) => t.name).join(", ") } : {}),
    author: post.authorFull ? { "@id": `${abs(blogPaths.author(post.authorFull.slug))}#person` } : { "@id": `${origin}/#organization` },
    publisher: { "@id": `${origin}/#organization` },
    isPartOf: { "@id": `${abs("/blog")}#blog` },
  };
}

export function faqSchema(items: FaqItem[]): Thing {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function blogSchema(): Thing {
  const url = abs("/blog");
  return {
    "@type": "Blog",
    "@id": `${url}#blog`,
    name: `Blog da ${SITE_NAME}`,
    url,
    inLanguage: "pt-BR",
    publisher: { "@id": `${getSiteUrl().origin}/#organization` },
  };
}

/** Lista de artigos de uma página de listagem (categoria, tag, autor ou o blog). */
export function itemListSchema(path: string, posts: BlogPostSummary[], offset = 0): Thing {
  return {
    "@type": "ItemList",
    "@id": `${abs(path)}#lista`,
    itemListElement: posts.map((post, i) => ({
      "@type": "ListItem",
      position: offset + i + 1,
      url: abs(blogPaths.post(post.slug)),
      name: post.title,
    })),
  };
}

export function collectionPageSchema({ title, description, path }: { title: string; description: string; path: string }): Thing {
  return {
    "@type": "CollectionPage",
    "@id": abs(path),
    name: title,
    description,
    inLanguage: "pt-BR",
    isPartOf: { "@id": `${getSiteUrl().origin}/#website` },
    mainEntity: { "@id": `${abs(path)}#lista` },
  };
}
