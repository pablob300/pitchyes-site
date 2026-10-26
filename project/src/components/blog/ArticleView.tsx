import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { blogPaths, formatPostDate, type BlogPost, type BlogPostSummary, type BlogTermRef } from "@/lib/blog";
import type { TocItem } from "@/lib/blog/html";
import { getPage, TALK_TO_AI_HREF } from "@/lib/routes";
import { BlogImage } from "./BlogImage";
import { Breadcrumbs } from "./Breadcrumbs";
import { PostCard } from "./PostCard";
import styles from "./Article.module.css";

// Página do artigo. O texto vem pronto de prepareArticleHtml (sanitizado, com âncoras e
// imagens responsivas). Topo e capa sem `data-reveal`: a capa (ou o h1) é o LCP.
//
// Links internos do fim da página, em ordem: tags, autor, página comercial da categoria
// (ctaPath), "Leia também" (relacionados) e anterior/próximo — a malha que liga os artigos
// entre si e ao site comercial (SEO.md §5).

const DAY = 24 * 60 * 60 * 1000;

export function ArticleView({
  post,
  html,
  toc,
  trail,
  related,
  previous,
  next,
}: {
  post: BlogPost;
  html: string;
  toc: TocItem[];
  trail: { name: string; path: string }[];
  related: BlogPostSummary[];
  previous: BlogTermRef | null;
  next: BlogTermRef | null;
}) {
  const updated = new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > DAY;
  const commercial = post.categoryFull?.ctaPath ? getPage(post.categoryFull.ctaPath) : undefined;
  const author = post.authorFull;

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <div className="container">
          <Breadcrumbs trail={trail} />
          {post.category && (
            <Link href={blogPaths.category(post.category.slug)} className={styles.category}>
              {post.category.name}
            </Link>
          )}
          <h1 className={styles.title}>{post.title}</h1>
          {post.excerpt && <p className={`lead ${styles.excerpt}`}>{post.excerpt}</p>}
          <p className={styles.meta}>
            {post.author && (
              <>
                Por{" "}
                <Link href={blogPaths.author(post.author.slug)} rel="author">
                  {post.author.name}
                </Link>
                <span aria-hidden="true"> · </span>
              </>
            )}
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            {updated && (
              <>
                <span aria-hidden="true"> · </span>
                Atualizado em <time dateTime={post.updatedAt}>{formatPostDate(post.updatedAt)}</time>
              </>
            )}
            <span aria-hidden="true"> · </span>
            {post.readingMinutes} min de leitura
          </p>
        </div>
      </header>

      {post.coverUrl && (
        <figure className={`container ${styles.cover}`}>
          <BlogImage
            src={post.coverUrl}
            alt={post.coverAlt || post.title}
            width={post.coverWidth}
            height={post.coverHeight}
            sizes="(max-width: 1240px) 100vw, 1160px"
            priority
          />
        </figure>
      )}

      <div className={`container ${styles.layout}`}>
        {toc.length >= 3 && (
          <nav className={styles.toc} aria-label="Neste artigo">
            <p className={styles.tocTitle}>Neste artigo</p>
            <ol>
              {toc
                .filter((item) => item.level === 2)
                .map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.text}</a>
                  </li>
                ))}
            </ol>
          </nav>
        )}

        <div className={styles.body}>
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: html }} />

          {post.tags.length > 0 && (
            <ul className={styles.tags} aria-label="Assuntos deste artigo">
              {post.tags.map((tag) => (
                <li key={tag.slug}>
                  <Link href={blogPaths.tag(tag.slug)}>{tag.name}</Link>
                </li>
              ))}
            </ul>
          )}

          <aside className={styles.cta} data-reveal>
            <p className={styles.ctaTitle}>Quer ver a IA de voz da PitchYes na sua operação?</p>
            <p className={styles.ctaText}>
              Fale com nossa IA agora ou veja como funciona
              {commercial ? (
                <>
                  {" "}
                  em <Link href={commercial.path}>{commercial.title.toLowerCase()}</Link>
                </>
              ) : (
                <>
                  {" "}
                  nas <Link href="/solucoes">soluções da PitchYes</Link>
                </>
              )}
              .
            </p>
            <ButtonLink href={TALK_TO_AI_HREF}>Fale com nossa IA</ButtonLink>
          </aside>

          {author && (
            <aside className={styles.author} aria-label="Sobre o autor" data-reveal>
              <p className={styles.authorName}>
                <Link href={blogPaths.author(author.slug)}>{author.name}</Link>
                {author.role && <span className={styles.authorRole}>{author.role}</span>}
              </p>
              {author.bio && <p className={styles.authorBio}>{author.bio}</p>}
            </aside>
          )}

          {(previous || next) && (
            <nav className={styles.adjacent} aria-label="Outros artigos">
              {previous ? (
                <Link href={blogPaths.post(previous.slug)} rel="prev">
                  <span>Artigo anterior</span>
                  {previous.name}
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={blogPaths.post(next.slug)} rel="next" data-next>
                  <span>Próximo artigo</span>
                  {next.name}
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className={`section ${styles.related}`} aria-labelledby="leia-tambem">
          <div className="container">
            <h2 id="leia-tambem" className={styles.relatedTitle}>
              Leia também
            </h2>
            <div className={styles.relatedGrid}>
              {related.map((item) => (
                <div key={item.id} data-reveal>
                  <PostCard post={item} headingLevel={3} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
