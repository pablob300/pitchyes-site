import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Blog — leitura pública do D1 (tabelas blog_*, migração 0008). Edição: painel, em
// Blog › Artigos (lib/blog/admin.ts). Esquema de URLs fixo desde o início do projeto:
//   /blog                          listagem (página 1)
//   /blog/pagina/[n]               listagem, página n ≥ 2
//   /blog/[slug]                   artigo
//   /blog/categorias               todas as categorias
//   /blog/categoria/[slug]         categoria (paginada: /blog/categoria/[slug]/pagina/[n])
//   /blog/tag/[slug]               tag (paginada: /blog/tag/[slug]/pagina/[n])
//   /blog/autor/[slug]             autor (paginada: /blog/autor/[slug]/pagina/[n])
//   /feed.xml                      RSS do blog (na raiz: dentro de /blog o OpenNext o confundia com um artigo)
//
// Como lib/page-meta.ts: nada aqui lê cookie ou sessão (as páginas continuam em cache com
// revalidação) e, sem banco — no build local, por exemplo —, tudo devolve vazio em vez de quebrar.
//
// "Publicado" = status publicado OU agendado com data já passada: o agendado entra sozinho
// na próxima revalidação depois da hora marcada.

export const POSTS_PER_PAGE = 12;
/** Tag com menos artigos que isso fica noindex e fora do sitemap (página rala). */
export const TAG_INDEX_MIN = 5;

export const blogPaths = {
  listing: (page = 1) => (page > 1 ? `/blog/pagina/${page}` : "/blog"),
  post: (slug: string) => `/blog/${slug}`,
  categories: () => "/blog/categorias",
  category: (slug: string, page = 1) =>
    page > 1 ? `/blog/categoria/${slug}/pagina/${page}` : `/blog/categoria/${slug}`,
  tag: (slug: string, page = 1) => (page > 1 ? `/blog/tag/${slug}/pagina/${page}` : `/blog/tag/${slug}`),
  author: (slug: string, page = 1) => (page > 1 ? `/blog/autor/${slug}/pagina/${page}` : `/blog/autor/${slug}`),
  feed: () => "/feed.xml",
};

export type BlogTermRef = { slug: string; name: string };

export type BlogCategory = BlogTermRef & {
  id: string;
  description: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  ctaPath: string | null;
  count: number;
};

export type BlogTag = BlogTermRef & {
  id: string;
  description: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  count: number;
};

export type BlogAuthor = BlogTermRef & {
  id: string;
  role: string | null;
  bio: string | null;
  avatarUrl: string | null;
  sameAs: string[];
};

export type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  coverAlt: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  featured: boolean;
  category: BlogTermRef | null;
  author: BlogTermRef | null;
};

export type BlogPost = BlogPostSummary & {
  seoTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  contentHtml: string;
  wordCount: number;
  noindex: boolean;
  categoryFull: BlogCategory | null;
  authorFull: BlogAuthor | null;
  tags: BlogTermRef[];
};

async function db(): Promise<D1Database | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.LEADS_DB ?? null;
  } catch {
    return null;
  }
}

async function safe<T>(label: string, fallback: T, run: (database: D1Database) => Promise<T>): Promise<T> {
  try {
    const database = await db();
    if (!database) return fallback;
    return await run(database);
  } catch (error) {
    console.error(`[blog] falha em ${label}`, error);
    return fallback;
  }
}

const LIVE = `(p.status = 'publicado' OR p.status = 'agendado') AND p.published_at IS NOT NULL AND p.published_at <= ?`;

const SUMMARY_COLUMNS = `
  p.id, p.slug, p.title, p.excerpt, p.cover_url, p.cover_alt, p.cover_width, p.cover_height,
  p.published_at, p.updated_at, p.reading_minutes, p.featured,
  c.slug AS category_slug, c.name AS category_name,
  a.slug AS author_slug, a.name AS author_name`;

const FROM = `
  FROM blog_posts p
  LEFT JOIN blog_categories c ON c.id = p.category_id
  LEFT JOIN blog_authors a ON a.id = p.author_id`;

type SummaryRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  cover_width: number | null;
  cover_height: number | null;
  published_at: string;
  updated_at: string;
  reading_minutes: number;
  featured: number;
  category_slug: string | null;
  category_name: string | null;
  author_slug: string | null;
  author_name: string | null;
};

function toSummary(row: SummaryRow): BlogPostSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverUrl: row.cover_url,
    coverAlt: row.cover_alt,
    coverWidth: row.cover_width,
    coverHeight: row.cover_height,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    readingMinutes: row.reading_minutes,
    featured: row.featured === 1,
    category: row.category_slug ? { slug: row.category_slug, name: row.category_name ?? row.category_slug } : null,
    author: row.author_slug ? { slug: row.author_slug, name: row.author_name ?? row.author_slug } : null,
  };
}

const now = () => new Date().toISOString();

export type ListFilter = { category?: string; tag?: string; author?: string };

/** Uma página de artigos publicados (mais novos primeiro), com o total para a paginação. */
export async function listPosts(
  page = 1,
  filter: ListFilter = {},
  perPage = POSTS_PER_PAGE,
): Promise<{ items: BlogPostSummary[]; total: number }> {
  return safe("listPosts", { items: [], total: 0 }, async (database) => {
    const where = [LIVE];
    const binds: unknown[] = [now()];
    if (filter.category) {
      where.push("c.slug = ?");
      binds.push(filter.category);
    }
    if (filter.author) {
      where.push("a.slug = ?");
      binds.push(filter.author);
    }
    if (filter.tag) {
      where.push("p.id IN (SELECT pt.post_id FROM blog_post_tags pt JOIN blog_tags t ON t.id = pt.tag_id WHERE t.slug = ?)");
      binds.push(filter.tag);
    }
    const clause = where.join(" AND ");
    const [rows, count] = await database.batch<SummaryRow | { total: number }>([
      database
        .prepare(`SELECT ${SUMMARY_COLUMNS} ${FROM} WHERE ${clause} ORDER BY p.published_at DESC LIMIT ? OFFSET ?`)
        .bind(...binds, perPage, (page - 1) * perPage),
      database.prepare(`SELECT COUNT(*) AS total ${FROM} WHERE ${clause}`).bind(...binds),
    ]);
    return {
      items: (rows.results as SummaryRow[]).map(toSummary),
      total: (count.results[0] as { total: number } | undefined)?.total ?? 0,
    };
  });
}

/** Artigo publicado pelo slug, com categoria, autor e tags completos. */
export async function getPost(slug: string): Promise<BlogPost | null> {
  return safe("getPost", null, async (database) => {
    const row = await database
      .prepare(
        `SELECT ${SUMMARY_COLUMNS}, p.seo_title, p.meta_description, p.focus_keyword, p.content_html,
                p.word_count, p.noindex, p.category_id, p.author_id
           ${FROM} WHERE p.slug = ? AND ${LIVE}`,
      )
      .bind(slug, now())
      .first<SummaryRow & {
        seo_title: string | null;
        meta_description: string | null;
        focus_keyword: string | null;
        content_html: string;
        word_count: number;
        noindex: number;
        category_id: string | null;
        author_id: string | null;
      }>();
    if (!row) return null;

    const [tags, category, author] = await Promise.all([
      database
        .prepare("SELECT t.slug, t.name FROM blog_post_tags pt JOIN blog_tags t ON t.id = pt.tag_id WHERE pt.post_id = ? ORDER BY t.name")
        .bind(row.id)
        .all<BlogTermRef>(),
      row.category_id ? categoryById(database, row.category_id) : Promise.resolve(null),
      row.author_id ? authorById(database, row.author_id) : Promise.resolve(null),
    ]);

    return {
      ...toSummary(row),
      seoTitle: row.seo_title,
      metaDescription: row.meta_description,
      focusKeyword: row.focus_keyword,
      contentHtml: row.content_html,
      wordCount: row.word_count,
      noindex: row.noindex === 1,
      categoryFull: category,
      authorFull: author,
      tags: tags.results ?? [],
    };
  });
}

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  seo_title: string | null;
  meta_description: string | null;
  cta_path: string | null;
  count?: number;
};

function toCategory(row: CategoryRow): BlogCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    seoTitle: row.seo_title,
    metaDescription: row.meta_description,
    ctaPath: row.cta_path,
    count: row.count ?? 0,
  };
}

async function categoryById(database: D1Database, id: string): Promise<BlogCategory | null> {
  const row = await database.prepare("SELECT * FROM blog_categories WHERE id = ?").bind(id).first<CategoryRow>();
  return row ? toCategory(row) : null;
}

type AuthorRow = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
  same_as: string | null;
};

function toAuthor(row: AuthorRow): BlogAuthor {
  let sameAs: string[] = [];
  try {
    sameAs = row.same_as ? (JSON.parse(row.same_as) as string[]) : [];
  } catch {
    sameAs = [];
  }
  return { id: row.id, slug: row.slug, name: row.name, role: row.role, bio: row.bio, avatarUrl: row.avatar_url, sameAs };
}

async function authorById(database: D1Database, id: string): Promise<BlogAuthor | null> {
  const row = await database.prepare("SELECT * FROM blog_authors WHERE id = ?").bind(id).first<AuthorRow>();
  return row ? toAuthor(row) : null;
}

const COUNT_LIVE = (column: string) =>
  `(SELECT COUNT(*) FROM blog_posts p WHERE p.${column} AND ${LIVE})`;

/** Categorias com a contagem de artigos publicados (as vazias também, para o painel). */
export async function listCategories(): Promise<BlogCategory[]> {
  return safe("listCategories", [], async (database) => {
    const { results } = await database
      .prepare(`SELECT c.*, ${COUNT_LIVE("category_id = c.id")} AS count FROM blog_categories c ORDER BY c.position, c.name`)
      .bind(now())
      .all<CategoryRow>();
    return (results ?? []).map(toCategory);
  });
}

export async function getCategory(slug: string): Promise<BlogCategory | null> {
  return safe("getCategory", null, async (database) => {
    const row = await database
      .prepare(`SELECT c.*, ${COUNT_LIVE("category_id = c.id")} AS count FROM blog_categories c WHERE c.slug = ?`)
      .bind(now(), slug)
      .first<CategoryRow>();
    return row ? toCategory(row) : null;
  });
}

type TagRow = Omit<CategoryRow, "cta_path">;

function toTag(row: TagRow): BlogTag {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    seoTitle: row.seo_title,
    metaDescription: row.meta_description,
    count: row.count ?? 0,
  };
}

const TAG_COUNT = `(SELECT COUNT(*) FROM blog_post_tags pt JOIN blog_posts p ON p.id = pt.post_id WHERE pt.tag_id = t.id AND ${LIVE})`;

export async function listTags(): Promise<BlogTag[]> {
  return safe("listTags", [], async (database) => {
    const { results } = await database
      .prepare(`SELECT t.*, ${TAG_COUNT} AS count FROM blog_tags t ORDER BY t.name`)
      .bind(now())
      .all<TagRow>();
    return (results ?? []).map(toTag);
  });
}

export async function getTag(slug: string): Promise<BlogTag | null> {
  return safe("getTag", null, async (database) => {
    const row = await database
      .prepare(`SELECT t.*, ${TAG_COUNT} AS count FROM blog_tags t WHERE t.slug = ?`)
      .bind(now(), slug)
      .first<TagRow>();
    return row ? toTag(row) : null;
  });
}

export async function listAuthors(): Promise<(BlogAuthor & { count: number })[]> {
  return safe("listAuthors", [], async (database) => {
    const { results } = await database
      .prepare(`SELECT a.*, ${COUNT_LIVE("author_id = a.id")} AS count FROM blog_authors a ORDER BY a.name`)
      .bind(now())
      .all<AuthorRow & { count: number }>();
    return (results ?? []).map((row) => ({ ...toAuthor(row), count: row.count }));
  });
}

export async function getAuthor(slug: string): Promise<BlogAuthor | null> {
  return safe("getAuthor", null, async (database) => {
    const row = await database.prepare("SELECT * FROM blog_authors WHERE slug = ?").bind(slug).first<AuthorRow>();
    return row ? toAuthor(row) : null;
  });
}

/**
 * "Leia também": mesma categoria e tags em comum pesam mais; empate vai para o mais novo.
 * É o principal elo de links internos entre os artigos.
 */
export async function relatedPosts(post: BlogPost, limit = 3): Promise<BlogPostSummary[]> {
  return safe("relatedPosts", [], async (database) => {
    const { results } = await database
      .prepare(
        `SELECT ${SUMMARY_COLUMNS},
                (CASE WHEN p.category_id = (SELECT category_id FROM blog_posts WHERE id = ?) THEN 2 ELSE 0 END)
              + (SELECT COUNT(*) FROM blog_post_tags pt WHERE pt.post_id = p.id
                   AND pt.tag_id IN (SELECT tag_id FROM blog_post_tags WHERE post_id = ?)) AS score
           ${FROM}
          WHERE p.id <> ? AND ${LIVE}
          ORDER BY score DESC, p.published_at DESC
          LIMIT ?`,
      )
      .bind(post.id, post.id, post.id, now(), limit)
      .all<SummaryRow>();
    return (results ?? []).map(toSummary);
  });
}

/** Artigo anterior (mais antigo) e próximo (mais novo) na linha do tempo. */
export async function adjacentPosts(post: BlogPost): Promise<{ previous: BlogTermRef | null; next: BlogTermRef | null }> {
  return safe("adjacentPosts", { previous: null, next: null }, async (database) => {
    const [previous, next] = await Promise.all([
      database
        .prepare(`SELECT p.slug, p.title AS name ${FROM} WHERE p.published_at < ? AND ${LIVE} ORDER BY p.published_at DESC LIMIT 1`)
        .bind(post.publishedAt, now())
        .first<BlogTermRef>(),
      database
        .prepare(`SELECT p.slug, p.title AS name ${FROM} WHERE p.published_at > ? AND ${LIVE} ORDER BY p.published_at ASC LIMIT 1`)
        .bind(post.publishedAt, now())
        .first<BlogTermRef>(),
    ]);
    return { previous, next };
  });
}

/** Destino de um endereço antigo do blog (slug antigo, termo renomeado), se houver. */
export async function getRedirect(path: string): Promise<string | null> {
  return safe("getRedirect", null, async (database) => {
    const row = await database.prepare("SELECT to_path FROM blog_redirects WHERE from_path = ?").bind(path).first<{ to_path: string }>();
    return row?.to_path ?? null;
  });
}

export type SitemapPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  updatedAt: string;
  publishedAt: string;
  coverUrl: string | null;
  coverAlt: string | null;
  categoryName: string | null;
  noindex: boolean;
};

/** Todos os publicados, para sitemap, RSS e /llms.txt. */
export async function getAllPosts(): Promise<SitemapPost[]> {
  return safe("getAllPosts", [], async (database) => {
    const { results } = await database
      .prepare(
        `SELECT p.slug, p.title, p.excerpt, p.updated_at, p.published_at, p.cover_url, p.cover_alt, p.noindex,
                c.name AS category_name
           ${FROM} WHERE ${LIVE} ORDER BY p.published_at DESC`,
      )
      .bind(now())
      .all<{
        slug: string;
        title: string;
        excerpt: string | null;
        updated_at: string;
        published_at: string;
        cover_url: string | null;
        cover_alt: string | null;
        noindex: number;
        category_name: string | null;
      }>();
    return (results ?? []).map((row) => ({
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      updatedAt: row.updated_at,
      publishedAt: row.published_at,
      coverUrl: row.cover_url,
      coverAlt: row.cover_alt,
      categoryName: row.category_name,
      noindex: row.noindex === 1,
    }));
  });
}

export function pageCount(items: number): number {
  return Math.max(1, Math.ceil(items / POSTS_PER_PAGE));
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "numeric", month: "long", year: "numeric" });

/** "14 de maio de 2026". */
export function formatPostDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}
