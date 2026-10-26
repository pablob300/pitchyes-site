import Link from "next/link";
import { blogPaths, type BlogCategory, type BlogPostSummary } from "@/lib/blog";
import { Breadcrumbs } from "./Breadcrumbs";
import { Pagination } from "./Pagination";
import { PostCard } from "./PostCard";
import styles from "./Blog.module.css";

// Moldura de toda listagem do blog: a home do blog, categoria, tag e autor.
// Topo sem `data-reveal` (é a primeira tela; o h1 pinta de cara — lição do PageSpeed),
// os cards abaixo entram com a revelação padrão.
export function BlogListing({
  eyebrow,
  title,
  lead,
  trail,
  posts,
  page,
  pages,
  href,
  categories,
  activeCategory,
  featured,
  empty = "Nenhum artigo publicado aqui ainda.",
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string | null;
  trail: { name: string; path: string }[];
  posts: BlogPostSummary[];
  page: number;
  pages: number;
  href: (n: number) => string;
  categories?: BlogCategory[];
  activeCategory?: string;
  featured?: BlogPostSummary | null;
  empty?: string;
  children?: React.ReactNode;
}) {
  const rest = featured ? posts.filter((p) => p.id !== featured.id) : posts;
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <Breadcrumbs trail={trail} />
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {lead && <p className={`lead ${styles.heroLead}`}>{lead}</p>}
          {children}
          {categories && categories.length > 0 && (
            <nav className={styles.chips} aria-label="Categorias do blog">
              <Link href={blogPaths.listing()} className={styles.chip} aria-current={!activeCategory ? "page" : undefined}>
                Todos
              </Link>
              {categories
                .filter((c) => c.count > 0)
                .map((c) => (
                  <Link
                    key={c.slug}
                    href={blogPaths.category(c.slug)}
                    className={styles.chip}
                    aria-current={activeCategory === c.slug ? "page" : undefined}
                  >
                    {c.name}
                  </Link>
                ))}
            </nav>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          {featured && (
            <div className={styles.featured}>
              <PostCard post={featured} priority wide />
            </div>
          )}
          {rest.length ? (
            <div className={styles.grid}>
              {rest.map((post, i) => (
                <div key={post.id} data-reveal={i >= 3 || featured ? true : undefined}>
                  <PostCard post={post} priority={!featured && i === 0} />
                </div>
              ))}
            </div>
          ) : (
            !featured && <p className={styles.empty}>{empty}</p>
          )}
          <Pagination page={page} pages={pages} href={href} />
        </div>
      </section>
    </>
  );
}
