import Link from "next/link";
import { blogPaths, formatPostDate, type BlogPostSummary } from "@/lib/blog";
import { BlogImage } from "./BlogImage";
import styles from "./Blog.module.css";

// Card de artigo das listagens. O título é o link principal (texto descritivo, SEO.md
// §1.6); a imagem repete o destino só para o clique, fora da ordem de tabulação.
export function PostCard({
  post,
  headingLevel = 2,
  priority = false,
  wide = false,
}: {
  post: BlogPostSummary;
  headingLevel?: 2 | 3;
  priority?: boolean;
  wide?: boolean;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const href = blogPaths.post(post.slug);
  return (
    <article className={styles.card} data-wide={wide || undefined}>
      {post.coverUrl && (
        <Link href={href} className={styles.cardMedia} tabIndex={-1} aria-hidden="true">
          <BlogImage
            src={post.coverUrl}
            alt={post.coverAlt || post.title}
            width={post.coverWidth}
            height={post.coverHeight}
            sizes={wide ? "(max-width: 900px) 100vw, 60vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"}
            priority={priority}
          />
        </Link>
      )}
      <div className={styles.cardBody}>
        {post.category && (
          <Link href={blogPaths.category(post.category.slug)} className={styles.cardCategory}>
            {post.category.name}
          </Link>
        )}
        <Heading className={styles.cardTitle}>
          <Link href={href}>{post.title}</Link>
        </Heading>
        {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}
        <p className={styles.meta}>
          <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
          <span aria-hidden="true"> · </span>
          {post.readingMinutes} min de leitura
        </p>
      </div>
    </article>
  );
}
