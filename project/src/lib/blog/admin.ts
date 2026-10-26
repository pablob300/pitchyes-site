import "server-only";
import { revalidatePath } from "next/cache";
import { getDb, MINUTE, newId, nowIso } from "@/lib/admin/db";
import { blogPaths } from "@/lib/blog";
import { pages as sitePages } from "@/lib/routes";
import { blockingErrors, runChecks } from "./checks";
import { sanitizeArticleHtml, textStats } from "./html";
import { toPostInput } from "./post-input";
import { isValidSlug, slugify } from "./slug";

// Blog no painel: leitura completa (rascunhos inclusive) e gravação. Só as rotas de
// /api/admin/blog e as telas de /admin/blog importam isto — nunca o site público.

export type PostStatus = "rascunho" | "agendado" | "publicado";

export type AdminPostRow = {
  id: string;
  slug: string;
  title: string;
  status: PostStatus;
  published_at: string | null;
  updated_at: string;
  updated_by_name: string | null;
  category_name: string | null;
  author_name: string | null;
  cover_url: string | null;
  word_count: number;
  featured: number;
};

export type AdminPost = {
  id: string;
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  excerpt: string;
  contentHtml: string;
  coverUrl: string | null;
  coverAlt: string;
  coverWidth: number | null;
  coverHeight: number | null;
  authorId: string | null;
  categoryId: string | null;
  tags: string[];
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
  featured: boolean;
  noindex: boolean;
  lockedBy: string | null;
  lockedByName: string | null;
  lockedAt: string | null;
};

export type PostInput = Omit<AdminPost, "id" | "updatedAt" | "createdAt" | "lockedBy" | "lockedByName" | "lockedAt">;

export type Actor = { id: string; email: string; name: string };

// ── Listagem ────────────────────────────────────────────────────────────────────

export type PostFilters = { q?: string; status?: string; categoria?: string; autor?: string; pagina?: number };
export const ADMIN_PER_PAGE = 30;

export async function listAdminPosts(filters: PostFilters): Promise<{ rows: AdminPostRow[]; total: number; counts: Record<string, number> }> {
  const db = await getDb();
  const where: string[] = [];
  const binds: unknown[] = [];
  if (filters.q) {
    where.push("(p.title LIKE ? OR p.slug LIKE ?)");
    binds.push(`%${filters.q}%`, `%${filters.q}%`);
  }
  if (filters.status) {
    where.push("p.status = ?");
    binds.push(filters.status);
  }
  if (filters.categoria) {
    where.push("p.category_id = ?");
    binds.push(filters.categoria);
  }
  if (filters.autor) {
    where.push("p.author_id = ?");
    binds.push(filters.autor);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const page = Math.max(1, filters.pagina ?? 1);
  const [rows, total, counts] = await db.batch([
    db
      .prepare(
        `SELECT p.id, p.slug, p.title, p.status, p.published_at, p.updated_at, p.updated_by_name, p.cover_url,
                p.word_count, p.featured, c.name AS category_name, a.name AS author_name
           FROM blog_posts p
           LEFT JOIN blog_categories c ON c.id = p.category_id
           LEFT JOIN blog_authors a ON a.id = p.author_id
           ${clause}
          ORDER BY COALESCE(p.published_at, p.updated_at) DESC
          LIMIT ? OFFSET ?`,
      )
      .bind(...binds, ADMIN_PER_PAGE, (page - 1) * ADMIN_PER_PAGE),
    db.prepare(`SELECT COUNT(*) AS total FROM blog_posts p ${clause}`).bind(...binds),
    db.prepare("SELECT status, COUNT(*) AS n FROM blog_posts GROUP BY status"),
  ]);
  return {
    rows: rows.results as AdminPostRow[],
    total: (total.results[0] as { total: number }).total,
    counts: Object.fromEntries((counts.results as { status: string; n: number }[]).map((r) => [r.status, r.n])),
  };
}

// ── Artigo ──────────────────────────────────────────────────────────────────────

type PostDbRow = {
  id: string;
  slug: string;
  title: string;
  seo_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  excerpt: string | null;
  content_html: string;
  cover_url: string | null;
  cover_alt: string | null;
  cover_width: number | null;
  cover_height: number | null;
  author_id: string | null;
  category_id: string | null;
  status: PostStatus;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  featured: number;
  noindex: number;
  locked_by: string | null;
  locked_by_name: string | null;
  locked_at: string | null;
};

export async function getAdminPost(id: string): Promise<AdminPost | null> {
  const db = await getDb();
  const row = await db.prepare("SELECT * FROM blog_posts WHERE id = ?").bind(id).first<PostDbRow>();
  if (!row) return null;
  const { results } = await db
    .prepare("SELECT t.name FROM blog_post_tags pt JOIN blog_tags t ON t.id = pt.tag_id WHERE pt.post_id = ? ORDER BY t.name")
    .bind(id)
    .all<{ name: string }>();
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    seoTitle: row.seo_title ?? "",
    metaDescription: row.meta_description ?? "",
    focusKeyword: row.focus_keyword ?? "",
    excerpt: row.excerpt ?? "",
    contentHtml: row.content_html,
    coverUrl: row.cover_url,
    coverAlt: row.cover_alt ?? "",
    coverWidth: row.cover_width,
    coverHeight: row.cover_height,
    authorId: row.author_id,
    categoryId: row.category_id,
    tags: (results ?? []).map((t) => t.name),
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    featured: row.featured === 1,
    noindex: row.noindex === 1,
    lockedBy: row.locked_by,
    lockedByName: row.locked_by_name,
    lockedAt: row.locked_at,
  };
}

/** Está no ar (publicado, ou agendado com data já passada)? */
export function isLive(status: PostStatus, publishedAt: string | null): boolean {
  return status !== "rascunho" && !!publishedAt && publishedAt <= nowIso();
}

export type SaveResult =
  | { ok: true; id: string; slug: string; status: PostStatus; publishedAt: string | null }
  | { ok: false; status: number; message: string; errors?: Record<string, string> };

async function uniqueSlug(db: D1Database, wanted: string, id: string | null): Promise<string> {
  let slug = wanted;
  for (let n = 2; ; n++) {
    const taken = await db.prepare("SELECT id FROM blog_posts WHERE slug = ? AND id <> ?").bind(slug, id ?? "").first();
    if (!taken) return slug;
    slug = `${wanted}-${n}`;
  }
}

async function tagIds(db: D1Database, names: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const raw of names) {
    const name = raw.trim().replace(/^#/, "");
    const slug = slugify(name, 50);
    if (!name || !slug) continue;
    const found = await db.prepare("SELECT id FROM blog_tags WHERE slug = ?").bind(slug).first<{ id: string }>();
    if (found) {
      ids.push(found.id);
      continue;
    }
    const id = newId("tag");
    const now = nowIso();
    await db
      .prepare("INSERT INTO blog_tags (id, slug, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
      .bind(id, slug, name, now, now)
      .run();
    ids.push(id);
  }
  return [...new Set(ids)];
}

/** Revalida o blog inteiro (listagens, artigo, termos) e os arquivos que o citam. */
export function revalidateBlog(): void {
  try {
    revalidatePath("/blog", "layout");
    revalidatePath("/sitemap-blog.xml");
    revalidatePath("/llms.txt");
  } catch (error) {
    console.error("[blog] falha ao revalidar", error);
  }
}

/**
 * Cria (id null) ou grava um artigo. O HTML é sanitizado aqui; publicar exige passar
 * no checklist (sem erro). Trocar o slug de um artigo no ar grava 301 do endereço antigo.
 */
export async function savePost(id: string | null, input: PostInput, actor: Actor, note?: string): Promise<SaveResult> {
  const db = await getDb();
  const existing = id ? await db.prepare("SELECT * FROM blog_posts WHERE id = ?").bind(id).first<PostDbRow>() : null;
  if (id && !existing) return { ok: false, status: 404, message: "Artigo não encontrado." };

  const errors: Record<string, string> = {};
  const title = input.title.trim();
  if (!title) errors.title = "Escreva o título.";
  const wantedSlug = (input.slug.trim() || slugify(title)).toLowerCase();
  if (!isValidSlug(wantedSlug)) errors.slug = "Use só letras minúsculas, números e hífens.";
  if (Object.keys(errors).length) return { ok: false, status: 400, message: "Confira os campos.", errors };

  const html = sanitizeArticleHtml(input.contentHtml ?? "");
  const stats = textStats(html);
  const slug = await uniqueSlug(db, wantedSlug, id);

  // Status: "publicado" com data futura vira "agendado"; publicado sem data ganha a de agora.
  let status: PostStatus = input.status;
  let publishedAt = input.publishedAt || null;
  const now = nowIso();
  if (status !== "rascunho") {
    if (!publishedAt) publishedAt = now;
    status = publishedAt > now ? "agendado" : "publicado";
    const blocking = blockingErrors(
      runChecks({
        title,
        slug,
        seoTitle: input.seoTitle,
        metaDescription: input.metaDescription,
        focusKeyword: input.focusKeyword,
        excerpt: input.excerpt,
        html,
        coverUrl: input.coverUrl,
        coverAlt: input.coverAlt,
        coverWidth: input.coverWidth,
        categoryId: input.categoryId,
        tags: input.tags,
      }),
    );
    if (blocking.length) {
      return { ok: false, status: 400, message: `Antes de publicar: ${blocking.map((c) => c.label.toLowerCase()).join("; ")}.` };
    }
  }

  const postId = id ?? newId("post");
  const values = [
    slug,
    title,
    input.seoTitle.trim() || null,
    input.metaDescription.trim() || null,
    input.focusKeyword.trim() || null,
    input.excerpt.trim() || null,
    html,
    input.coverUrl || null,
    input.coverAlt.trim() || null,
    input.coverWidth ?? null,
    input.coverHeight ?? null,
    input.authorId || null,
    input.categoryId || null,
    status,
    publishedAt,
    now,
    stats.minutes,
    stats.words,
    input.featured ? 1 : 0,
    input.noindex ? 1 : 0,
    actor.email,
    actor.name,
  ];

  const statements: D1PreparedStatement[] = [];
  if (existing) {
    statements.push(
      db
        .prepare(
          `UPDATE blog_posts SET slug = ?, title = ?, seo_title = ?, meta_description = ?, focus_keyword = ?, excerpt = ?,
             content_html = ?, cover_url = ?, cover_alt = ?, cover_width = ?, cover_height = ?, author_id = ?, category_id = ?,
             status = ?, published_at = ?, updated_at = ?, reading_minutes = ?, word_count = ?, featured = ?, noindex = ?,
             updated_by = ?, updated_by_name = ?, locked_by = ?, locked_by_name = ?, locked_at = ?
           WHERE id = ?`,
        )
        .bind(...values, actor.id, actor.name, now, postId),
    );
  } else {
    statements.push(
      db
        .prepare(
          `INSERT INTO blog_posts (slug, title, seo_title, meta_description, focus_keyword, excerpt, content_html, cover_url,
             cover_alt, cover_width, cover_height, author_id, category_id, status, published_at, updated_at, reading_minutes,
             word_count, featured, noindex, updated_by, updated_by_name, id, created_at, created_by, locked_by, locked_by_name, locked_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(...values, postId, now, actor.email, actor.id, actor.name, now),
    );
  }

  // Só um destaque por vez: marcar este desmarca os outros.
  if (input.featured) statements.push(db.prepare("UPDATE blog_posts SET featured = 0 WHERE id <> ?").bind(postId));

  // 301 do endereço antigo quando o slug de um artigo no ar muda; redirecionamentos que
  // apontavam para o antigo passam a apontar direto para o novo (sem cadeia).
  if (existing && existing.slug !== slug && isLive(existing.status, existing.published_at)) {
    const from = blogPaths.post(existing.slug);
    const to = blogPaths.post(slug);
    statements.push(
      db
        .prepare("INSERT INTO blog_redirects (from_path, to_path, reason, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(from_path) DO UPDATE SET to_path = excluded.to_path")
        .bind(from, to, "slug alterado no painel", now),
      db.prepare("UPDATE blog_redirects SET to_path = ? WHERE to_path = ?").bind(to, from),
    );
  }
  statements.push(db.prepare("DELETE FROM blog_redirects WHERE from_path = ?").bind(blogPaths.post(slug)));

  await db.batch(statements);

  const ids = await tagIds(db, input.tags);
  await db.batch([
    db.prepare("DELETE FROM blog_post_tags WHERE post_id = ?").bind(postId),
    ...ids.map((tagId) => db.prepare("INSERT OR IGNORE INTO blog_post_tags (post_id, tag_id) VALUES (?, ?)").bind(postId, tagId)),
  ]);

  // Uma versão a cada publicação (ou quando pedida), para poder restaurar depois.
  if (status !== "rascunho" || note) await saveVersion(postId, actor, note ?? (existing ? "Atualizado" : "Publicado"));

  if (status !== "rascunho" || (existing && existing.status !== "rascunho")) revalidateBlog();
  return { ok: true, id: postId, slug, status, publishedAt };
}

export async function saveVersion(postId: string, actor: Actor, note: string): Promise<void> {
  const post = await getAdminPost(postId);
  if (!post) return;
  const data = toPostInput(post);
  const db = await getDb();
  await db
    .prepare("INSERT INTO blog_post_versions (id, post_id, data, note, created_at, created_by, created_by_name) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(newId("ver"), postId, JSON.stringify(data), note, nowIso(), actor.email, actor.name)
    .run();
}

export async function listVersions(postId: string) {
  const db = await getDb();
  const { results } = await db
    .prepare("SELECT id, note, created_at, created_by_name FROM blog_post_versions WHERE post_id = ? ORDER BY created_at DESC LIMIT 50")
    .bind(postId)
    .all<{ id: string; note: string | null; created_at: string; created_by_name: string | null }>();
  return results ?? [];
}

export async function getVersion(postId: string, versionId: string): Promise<PostInput | null> {
  const db = await getDb();
  const row = await db
    .prepare("SELECT data FROM blog_post_versions WHERE id = ? AND post_id = ?")
    .bind(versionId, postId)
    .first<{ data: string }>();
  return row ? (JSON.parse(row.data) as PostInput) : null;
}

export async function deletePost(id: string): Promise<{ slug: string } | null> {
  const db = await getDb();
  const post = await db.prepare("SELECT slug, status FROM blog_posts WHERE id = ?").bind(id).first<{ slug: string; status: PostStatus }>();
  if (!post) return null;
  await db.batch([
    db.prepare("DELETE FROM blog_post_tags WHERE post_id = ?").bind(id),
    db.prepare("DELETE FROM blog_posts WHERE id = ?").bind(id),
  ]);
  if (post.status !== "rascunho") revalidateBlog();
  return post;
}

/** Trinco consultivo: quem abriu o editor por último. Expira em 2 minutos sem sinal. */
export const LOCK_TTL = 2 * MINUTE;

/** Quem está com o artigo aberto agora (outra pessoa, nos últimos 2 minutos), se alguém. */
export function activeLock(post: AdminPost, userId: string): { name: string; at: string } | null {
  if (!post.lockedAt || !post.lockedBy || post.lockedBy === userId) return null;
  if (Date.now() - new Date(post.lockedAt).getTime() >= LOCK_TTL) return null;
  return { name: post.lockedByName ?? "Alguém", at: post.lockedAt };
}

export async function touchLock(id: string, actor: Actor): Promise<void> {
  const db = await getDb();
  await db
    .prepare("UPDATE blog_posts SET locked_by = ?, locked_by_name = ?, locked_at = ? WHERE id = ?")
    .bind(actor.id, actor.name, nowIso(), id)
    .run();
}

// ── Categorias, tags e autores ──────────────────────────────────────────────────

export type TermKind = "categoria" | "tag";
const TERM_TABLE: Record<TermKind, "blog_categories" | "blog_tags"> = { categoria: "blog_categories", tag: "blog_tags" };
const TERM_PATH: Record<TermKind, (slug: string) => string> = { categoria: (s) => blogPaths.category(s), tag: (s) => blogPaths.tag(s) };

export type TermRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  seo_title: string | null;
  meta_description: string | null;
  cta_path?: string | null;
  position?: number;
  count: number;
};

export async function listTerms(kind: TermKind): Promise<TermRow[]> {
  const db = await getDb();
  const count =
    kind === "categoria"
      ? "(SELECT COUNT(*) FROM blog_posts p WHERE p.category_id = t.id)"
      : "(SELECT COUNT(*) FROM blog_post_tags pt WHERE pt.tag_id = t.id)";
  const order = kind === "categoria" ? "t.position, t.name" : "t.name";
  const { results } = await db.prepare(`SELECT t.*, ${count} AS count FROM ${TERM_TABLE[kind]} t ORDER BY ${order}`).all<TermRow>();
  return results ?? [];
}

export type TermInput = {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  metaDescription: string;
  ctaPath?: string;
};

export async function saveTerm(kind: TermKind, id: string | null, input: TermInput): Promise<SaveResult> {
  const db = await getDb();
  const table = TERM_TABLE[kind];
  const name = input.name.trim();
  const slug = (input.slug.trim() || slugify(name, 50)).toLowerCase();
  if (!name) return { ok: false, status: 400, message: "Escreva o nome.", errors: { name: "Escreva o nome." } };
  if (!isValidSlug(slug)) return { ok: false, status: 400, message: "Endereço inválido.", errors: { slug: "Use só letras minúsculas, números e hífens." } };
  const taken = await db.prepare(`SELECT id FROM ${table} WHERE slug = ? AND id <> ?`).bind(slug, id ?? "").first();
  if (taken) return { ok: false, status: 409, message: "Já existe outro item com esse endereço.", errors: { slug: "Endereço já usado." } };
  if (input.ctaPath && !sitePages.some((p) => p.path === input.ctaPath)) {
    return { ok: false, status: 400, message: "Página comercial inválida.", errors: { ctaPath: "Escolha uma página do site." } };
  }

  const now = nowIso();
  const existing = id ? await db.prepare(`SELECT slug FROM ${table} WHERE id = ?`).bind(id).first<{ slug: string }>() : null;
  if (id && !existing) return { ok: false, status: 404, message: "Não encontrado." };
  const termId = id ?? newId(kind === "categoria" ? "cat" : "tag");
  const statements: D1PreparedStatement[] = [];

  if (kind === "categoria") {
    statements.push(
      existing
        ? db
            .prepare("UPDATE blog_categories SET name = ?, slug = ?, description = ?, seo_title = ?, meta_description = ?, cta_path = ?, updated_at = ? WHERE id = ?")
            .bind(name, slug, input.description.trim() || null, input.seoTitle.trim() || null, input.metaDescription.trim() || null, input.ctaPath || null, now, termId)
        : db
            .prepare(
              "INSERT INTO blog_categories (id, slug, name, description, seo_title, meta_description, cta_path, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(position), 0) + 1 FROM blog_categories), ?, ?)",
            )
            .bind(termId, slug, name, input.description.trim() || null, input.seoTitle.trim() || null, input.metaDescription.trim() || null, input.ctaPath || null, now, now),
    );
  } else {
    statements.push(
      existing
        ? db
            .prepare("UPDATE blog_tags SET name = ?, slug = ?, description = ?, seo_title = ?, meta_description = ?, updated_at = ? WHERE id = ?")
            .bind(name, slug, input.description.trim() || null, input.seoTitle.trim() || null, input.metaDescription.trim() || null, now, termId)
        : db
            .prepare("INSERT INTO blog_tags (id, slug, name, description, seo_title, meta_description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
            .bind(termId, slug, name, input.description.trim() || null, input.seoTitle.trim() || null, input.metaDescription.trim() || null, now, now),
    );
  }

  if (existing && existing.slug !== slug) {
    const from = TERM_PATH[kind](existing.slug);
    const to = TERM_PATH[kind](slug);
    statements.push(
      db
        .prepare("INSERT INTO blog_redirects (from_path, to_path, reason, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(from_path) DO UPDATE SET to_path = excluded.to_path")
        .bind(from, to, `${kind} renomeada`, now),
      db.prepare("UPDATE blog_redirects SET to_path = ? WHERE to_path = ?").bind(to, from),
    );
  }
  await db.batch(statements);
  revalidateBlog();
  return { ok: true, id: termId, slug, status: "publicado", publishedAt: null };
}

/** Funde `fromId` em `intoId`: reatribui os artigos, grava 301 e apaga o de origem. */
export async function mergeTerm(kind: TermKind, fromId: string, intoId: string): Promise<boolean> {
  if (fromId === intoId) return false;
  const db = await getDb();
  const table = TERM_TABLE[kind];
  const [from, into] = await Promise.all([
    db.prepare(`SELECT slug FROM ${table} WHERE id = ?`).bind(fromId).first<{ slug: string }>(),
    db.prepare(`SELECT slug FROM ${table} WHERE id = ?`).bind(intoId).first<{ slug: string }>(),
  ]);
  if (!from || !into) return false;
  const now = nowIso();
  const fromPath = TERM_PATH[kind](from.slug);
  const toPath = TERM_PATH[kind](into.slug);
  await db.batch([
    ...(kind === "categoria"
      ? [db.prepare("UPDATE blog_posts SET category_id = ? WHERE category_id = ?").bind(intoId, fromId)]
      : [
          db.prepare("INSERT OR IGNORE INTO blog_post_tags (post_id, tag_id) SELECT post_id, ? FROM blog_post_tags WHERE tag_id = ?").bind(intoId, fromId),
          db.prepare("DELETE FROM blog_post_tags WHERE tag_id = ?").bind(fromId),
        ]),
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(fromId),
    db
      .prepare("INSERT INTO blog_redirects (from_path, to_path, reason, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(from_path) DO UPDATE SET to_path = excluded.to_path")
      .bind(fromPath, toPath, `${kind} fundida`, now),
    db.prepare("UPDATE blog_redirects SET to_path = ? WHERE to_path = ?").bind(toPath, fromPath),
  ]);
  revalidateBlog();
  return true;
}

/** Exclui um termo sem artigos. Com artigos, a tela oferece "fundir" em outro. */
export async function deleteTerm(kind: TermKind, id: string): Promise<"ok" | "em-uso" | "nao-encontrado"> {
  const terms = await listTerms(kind);
  const term = terms.find((t) => t.id === id);
  if (!term) return "nao-encontrado";
  if (term.count > 0) return "em-uso";
  const db = await getDb();
  await db.prepare(`DELETE FROM ${TERM_TABLE[kind]} WHERE id = ?`).bind(id).run();
  revalidateBlog();
  return "ok";
}

export type AuthorRow = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
  same_as: string | null;
  count: number;
};

export async function listAdminAuthors(): Promise<AuthorRow[]> {
  const db = await getDb();
  const { results } = await db
    .prepare("SELECT a.*, (SELECT COUNT(*) FROM blog_posts p WHERE p.author_id = a.id) AS count FROM blog_authors a ORDER BY a.name")
    .all<AuthorRow>();
  return results ?? [];
}

export async function saveAuthor(
  id: string | null,
  input: { name: string; role: string; bio: string; sameAs: string[] },
): Promise<SaveResult> {
  const db = await getDb();
  const name = input.name.trim();
  if (!name) return { ok: false, status: 400, message: "Escreva o nome.", errors: { name: "Escreva o nome." } };
  const now = nowIso();
  const sameAs = JSON.stringify(input.sameAs.map((u) => u.trim()).filter((u) => /^https:\/\//.test(u)));
  if (id) {
    await db
      .prepare("UPDATE blog_authors SET name = ?, role = ?, bio = ?, same_as = ?, updated_at = ? WHERE id = ?")
      .bind(name, input.role.trim() || null, input.bio.trim() || null, sameAs, now, id)
      .run();
    revalidateBlog();
    return { ok: true, id, slug: "", status: "publicado", publishedAt: null };
  }
  let slug = slugify(name, 40);
  for (let n = 2; await db.prepare("SELECT id FROM blog_authors WHERE slug = ?").bind(slug).first(); n++) slug = `${slugify(name, 36)}-${n}`;
  const authorId = newId("aut");
  await db
    .prepare("INSERT INTO blog_authors (id, slug, name, role, bio, same_as, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(authorId, slug, name, input.role.trim() || null, input.bio.trim() || null, sameAs, now, now)
    .run();
  return { ok: true, id: authorId, slug, status: "publicado", publishedAt: null };
}

// ── Links internos e mídia ──────────────────────────────────────────────────────

export type LinkTarget = { title: string; href: string; kind: "artigo" | "pagina" };

/** Busca para o diálogo de link: artigos (qualquer status no ar) e páginas do site. */
export async function searchLinkTargets(q: string): Promise<LinkTarget[]> {
  const db = await getDb();
  const term = q.trim();
  const { results } = await db
    .prepare(
      `SELECT title, slug FROM blog_posts WHERE status <> 'rascunho' ${term ? "AND (title LIKE ? OR slug LIKE ?)" : ""}
        ORDER BY published_at DESC LIMIT 12`,
    )
    .bind(...(term ? [`%${term}%`, `%${term}%`] : []))
    .all<{ title: string; slug: string }>();
  const normalized = term.toLowerCase();
  const sitePagesFound = sitePages
    .filter((p) => !p.placeholder && !p.path.startsWith("/blog"))
    .filter((p) => !normalized || p.title.toLowerCase().includes(normalized) || p.path.includes(normalized))
    .slice(0, 8)
    .map((p) => ({ title: p.title, href: p.path, kind: "pagina" as const }));
  return [...(results ?? []).map((r) => ({ title: r.title, href: blogPaths.post(r.slug), kind: "artigo" as const })), ...sitePagesFound];
}

export type LinkSuggestion = { title: string; href: string; phrase: string; kind: "artigo" | "pagina" };

/**
 * Sugestões de link interno: artigos no ar e páginas comerciais cujo assunto (palavra-chave
 * foco, tags, nome da página) aparece no texto e ainda não estão linkados.
 */
export async function suggestLinks(postId: string | null, html: string): Promise<LinkSuggestion[]> {
  const db = await getDb();
  const text = html.replace(/<a\b[\s\S]*?<\/a>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const linked = new Set([...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]));

  const { results } = await db
    .prepare(
      `SELECT p.id, p.title, p.slug, p.focus_keyword,
              (SELECT GROUP_CONCAT(t.name, '|') FROM blog_post_tags pt JOIN blog_tags t ON t.id = pt.tag_id WHERE pt.post_id = p.id) AS tags
         FROM blog_posts p WHERE p.status <> 'rascunho' AND p.id <> ?`,
    )
    .bind(postId ?? "")
    .all<{ id: string; title: string; slug: string; focus_keyword: string | null; tags: string | null }>();

  // Palavra inteira: "URA" não pode casar com "procura" nem "estrutura".
  const find = (phrase: string) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "iu").exec(text);
    return match ? match[0] : null;
  };

  const out: LinkSuggestion[] = [];
  for (const post of results ?? []) {
    const href = blogPaths.post(post.slug);
    if (linked.has(href)) continue;
    const candidates = [post.focus_keyword, ...(post.tags?.split("|") ?? [])].filter((c): c is string => !!c && c.length >= 4);
    for (const candidate of candidates) {
      const phrase = find(candidate);
      if (phrase) {
        out.push({ title: post.title, href, phrase, kind: "artigo" });
        break;
      }
    }
  }

  // Páginas comerciais: termos que pedem link para a solução correspondente.
  const commercial: { href: string; phrases: string[] }[] = [
    { href: "/solucoes/ativo", phrases: ["ligações ativas", "prospecção ativa", "ligação ativa", "prospecção"] },
    { href: "/solucoes/receptivo", phrases: ["atendimento receptivo", "substituir a URA", "URA"] },
    { href: "/solucoes", phrases: ["agentes de voz", "IA de voz", "agente de voz"] },
    { href: "/recursos/integracoes", phrases: ["integração com CRM", "integrações", "CRM"] },
    { href: "/planos", phrases: ["custo por minuto", "planos"] },
  ];
  for (const page of commercial) {
    if (linked.has(page.href)) continue;
    const phrase = page.phrases.map(find).find(Boolean);
    const title = sitePages.find((p) => p.path === page.href)?.title ?? page.href;
    if (phrase) out.push({ title, href: page.href, phrase, kind: "pagina" });
  }
  return out.slice(0, 12);
}

export type MediaRow = { id: string; url: string; alt: string | null; caption: string | null; width: number | null; height: number | null; created_at: string };

export async function listMedia(q = "", limit = 60): Promise<MediaRow[]> {
  const db = await getDb();
  const { results } = await db
    .prepare(`SELECT id, url, alt, caption, width, height, created_at FROM blog_media ${q ? "WHERE alt LIKE ? OR caption LIKE ?" : ""} ORDER BY created_at DESC LIMIT ?`)
    .bind(...(q ? [`%${q}%`, `%${q}%`] : []), limit)
    .all<MediaRow>();
  return results ?? [];
}

export async function updateMedia(id: string, alt: string, caption: string): Promise<void> {
  const db = await getDb();
  await db.prepare("UPDATE blog_media SET alt = ?, caption = ? WHERE id = ?").bind(alt.trim() || null, caption.trim() || null, id).run();
}
