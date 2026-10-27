import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { landingModel } from "@/content/landing/modelo";
import { getPageContentData, type ContentStatus } from "@/lib/page-content";

// Landing pages (tabela landing_pages, migração 0009). O conteúdo mora em page_content no
// caminho "/_lp/<id>" — ver lib/content/landing.ts.
//
// Leitura do site público: nunca derruba a página (sem banco = página inexistente).
// Escrita: só pelo painel (api/admin/landing-pages).

export type LandingPage = {
  id: string;
  slug: string;
  name: string;
  active: number;
  seo_title: string;
  seo_description: string;
  noindex: number;
  created_at: string;
  created_by_name: string | null;
  updated_at: string;
  updated_by_name: string | null;
};

export type LandingActor = { id: string; name: string };

/** Endereço público. */
export const LANDING_BASE = "/conteudo";
export const landingPath = (slug: string) => `${LANDING_BASE}/${slug}`;

/** Onde o conteúdo fica no page_content (preso ao id: trocar o slug não move o texto). */
export const landingContentPath = (id: string) => `/_lp/${id}`;
export const LANDING_CONTENT_PATH = /^\/_lp\/(lp_[a-f0-9]{24})$/;

/** Slug: minúsculas, números e hífen, sem hífen nas pontas. */
export const SLUG_OK = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function db(): Promise<D1Database | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.LEADS_DB ?? null;
  } catch {
    return null;
  }
}

async function must(): Promise<D1Database> {
  const database = await db();
  if (!database) throw new Error("Banco indisponível");
  return database;
}

export async function listLandingPages(): Promise<LandingPage[]> {
  const database = await must();
  const { results } = await database.prepare("SELECT * FROM landing_pages ORDER BY created_at DESC").all<LandingPage>();
  return results ?? [];
}

export async function getLandingById(id: string): Promise<LandingPage | null> {
  const database = await must();
  return database.prepare("SELECT * FROM landing_pages WHERE id = ?").bind(id).first<LandingPage>();
}

/** Site público: a página pelo slug, ou o slug atual quando o pedido veio por um endereço antigo. */
export async function findLandingBySlug(slug: string): Promise<{ page: LandingPage } | { redirectTo: string } | null> {
  try {
    const database = await db();
    if (!database) return null;
    const page = await database.prepare("SELECT * FROM landing_pages WHERE slug = ?").bind(slug).first<LandingPage>();
    if (page) return { page };
    const moved = await database
      .prepare("SELECT p.slug FROM landing_redirects r JOIN landing_pages p ON p.id = r.page_id WHERE r.old_slug = ?")
      .bind(slug)
      .first<{ slug: string }>();
    return moved ? { redirectTo: moved.slug } : null;
  } catch (error) {
    console.error("[landing] falha ao ler", slug, error);
    return null;
  }
}

/** Sitemap: as páginas ativas e indexáveis. */
export async function listPublishedLandingPages(): Promise<LandingPage[]> {
  try {
    const database = await db();
    if (!database) return [];
    const { results } = await database
      .prepare("SELECT * FROM landing_pages WHERE active = 1 AND noindex = 0 ORDER BY created_at")
      .all<LandingPage>();
    return results ?? [];
  } catch {
    return [];
  }
}

/** O conteúdo (documento inteiro) publicado ou em rascunho. */
export async function getLandingContent(id: string, status: ContentStatus): Promise<unknown> {
  const raw = await getPageContentData(landingContentPath(id), status);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function slugTaken(slug: string, exceptId?: string): Promise<boolean> {
  const database = await must();
  const row = await database
    .prepare("SELECT id FROM landing_pages WHERE slug = ? AND id != ?")
    .bind(slug, exceptId ?? "")
    .first<{ id: string }>();
  return Boolean(row);
}

function newLandingId(): string {
  return `lp_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
}

/**
 * Cria a página com uma CÓPIA do conteúdo: o modelo padrão, ou outra landing page
 * ("Duplicar"). Nasce inativa — vai ao ar quando alguém liga a chave na lista.
 */
export async function createLanding(
  input: { name: string; slug: string; seoTitle: string; seoDescription: string; copyFrom?: string },
  actor: LandingActor,
): Promise<LandingPage> {
  const database = await must();
  const id = newLandingId();
  const now = new Date().toISOString();
  const source = input.copyFrom ? await getLandingContent(input.copyFrom, "rascunho") : null;
  const data = JSON.stringify(source ?? landingModel);
  const path = landingContentPath(id);

  await database.batch([
    database
      .prepare(
        `INSERT INTO landing_pages (id, slug, name, active, seo_title, seo_description, noindex, created_at, created_by, created_by_name, updated_at, updated_by, updated_by_name)
         VALUES (?1, ?2, ?3, 0, ?4, ?5, 0, ?6, ?7, ?8, ?6, ?7, ?8)`,
      )
      .bind(id, input.slug, input.name, input.seoTitle, input.seoDescription, now, actor.id, actor.name),
    // Rascunho e publicado nascem iguais: a página já tem conteúdo para mostrar ao ser ativada.
    ...(["rascunho", "publicado"] as const).map((status) =>
      database
        .prepare(
          `INSERT INTO page_content (path, status, schema_version, rev, data, updated_at, updated_by, updated_by_name)
           VALUES (?1, ?2, 1, 1, ?3, ?4, ?5, ?6)`,
        )
        .bind(path, status, data, now, actor.id, actor.name),
    ),
    // Um slug reaproveitado deixa de redirecionar para a página antiga.
    database.prepare("DELETE FROM landing_redirects WHERE old_slug = ?").bind(input.slug),
  ]);

  return (await getLandingById(id))!;
}

/** Edita nome, endereço, SEO, situação. Trocar o slug guarda o antigo para o 301. */
export async function updateLanding(
  current: LandingPage,
  patch: Partial<{ name: string; slug: string; seoTitle: string; seoDescription: string; active: boolean; noindex: boolean }>,
  actor: LandingActor,
): Promise<LandingPage> {
  const database = await must();
  const now = new Date().toISOString();
  const next = {
    name: patch.name ?? current.name,
    slug: patch.slug ?? current.slug,
    seo_title: patch.seoTitle ?? current.seo_title,
    seo_description: patch.seoDescription ?? current.seo_description,
    active: patch.active === undefined ? current.active : patch.active ? 1 : 0,
    noindex: patch.noindex === undefined ? current.noindex : patch.noindex ? 1 : 0,
  };

  const statements = [
    database
      .prepare(
        `UPDATE landing_pages SET name = ?1, slug = ?2, seo_title = ?3, seo_description = ?4, active = ?5, noindex = ?6,
           updated_at = ?7, updated_by = ?8, updated_by_name = ?9 WHERE id = ?10`,
      )
      .bind(next.name, next.slug, next.seo_title, next.seo_description, next.active, next.noindex, now, actor.id, actor.name, current.id),
  ];
  if (next.slug !== current.slug) {
    statements.push(
      database.prepare("DELETE FROM landing_redirects WHERE old_slug = ?").bind(next.slug),
      database
        .prepare("INSERT OR REPLACE INTO landing_redirects (old_slug, page_id, created_at) VALUES (?, ?, ?)")
        .bind(current.slug, current.id, now),
    );
  }
  await database.batch(statements);
  return (await getLandingById(current.id))!;
}

/** Data de revisão (vira o <lastmod> do sitemap) ao publicar o conteúdo. */
export async function touchLanding(id: string, actor: LandingActor): Promise<LandingPage | null> {
  const database = await must();
  await database
    .prepare("UPDATE landing_pages SET updated_at = ?, updated_by = ?, updated_by_name = ? WHERE id = ?")
    .bind(new Date().toISOString(), actor.id, actor.name, id)
    .run();
  return getLandingById(id);
}
