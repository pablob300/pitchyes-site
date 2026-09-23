import "server-only";
import { getDb, nowIso } from "./db";
import { getAllPageMeta, type PageMeta } from "@/lib/page-meta";
import { pages } from "@/lib/routes";
import { pageDefault } from "@/lib/page-defaults";

// Páginas editáveis no Page Editor.
//
// A lista sai de lib/routes.ts, a fonte única do mapa do site — o painel não tem
// lista própria, senão as duas divergem. O blog fica de fora: ele é servido pelo
// WordPress headless e os metadados de lá são editados lá.

export type EditablePage = {
  path: string;
  /** Nome da página no menu/rodapé (routes.ts). */
  name: string;
  /** Título e descrição em vigor (o editado, se houver; senão o do código). */
  title: string;
  description: string;
  /** Valores padrão do código, para mostrar "voltou ao padrão" e comparar. */
  defaultTitle: string;
  defaultDescription: string;
  edited: boolean;
  noindex: boolean;
  placeholder: boolean;
  updated: string;
  imageUrl: string | null;
  imageAlt: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  editedAt: string | null;
  editedBy: string | null;
};

/** Caminhos que o Page Editor aceita — qualquer outro é recusado pela API. */
export function editablePaths(): string[] {
  return pages.filter((page) => !page.path.startsWith("/blog")).map((page) => page.path);
}

export async function listEditablePages(): Promise<EditablePage[]> {
  const overrides = await getAllPageMeta();

  return pages
    .filter((page) => !page.path.startsWith("/blog"))
    .map((page) => {
      const meta: PageMeta | undefined = overrides.get(page.path);
      const padrao = pageDefault(page.path, page.title, page.description);
      const title = meta?.title || padrao.title;
      const description = meta?.description || padrao.description;
      return {
        path: page.path,
        name: page.title,
        title,
        description,
        defaultTitle: padrao.title,
        defaultDescription: padrao.description,
        // "Editada" só quando o texto difere do padrão do código — a semente de
        // imagens e rótulos sociais não deve marcar todas as páginas como alteradas.
        edited: Boolean(meta) && (title !== padrao.title || description !== padrao.description),
        noindex: meta?.noindex === 1 || page.placeholder,
        placeholder: page.placeholder,
        updated: meta?.updated || page.updated,
        imageUrl: meta?.image_url ?? null,
        imageAlt: meta?.image_alt ?? null,
        ogTitle: meta?.og_title ?? null,
        ogDescription: meta?.og_description ?? null,
        editedAt: meta?.updated_at ?? null,
        editedBy: meta?.updated_by_name ?? null,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path, "pt-BR"));
}

export type PageMetaInput = {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  imageUrl?: string;
  imageAlt?: string;
  noindex?: boolean;
  updated?: string;
};

export async function savePageMeta(
  path: string,
  input: PageMetaInput,
  actor: { id: string; name: string },
): Promise<void> {
  const db = await getDb();
  const blank = (value?: string) => (value && value.trim() ? value.trim() : null);

  await db
    .prepare(
      `INSERT INTO page_meta
         (path, title, description, og_title, og_description, image_url, image_alt, noindex, updated, updated_at, updated_by, updated_by_name)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
       ON CONFLICT(path) DO UPDATE SET
         title = ?2, description = ?3, og_title = ?4, og_description = ?5,
         image_url = ?6, image_alt = ?7, noindex = ?8, updated = ?9,
         updated_at = ?10, updated_by = ?11, updated_by_name = ?12`,
    )
    .bind(
      path,
      blank(input.title),
      blank(input.description),
      blank(input.ogTitle),
      blank(input.ogDescription),
      blank(input.imageUrl),
      blank(input.imageAlt),
      input.noindex ? 1 : 0,
      blank(input.updated),
      nowIso(),
      actor.id,
      actor.name,
    )
    .run();
}

/**
 * Carimba SÓ a data de revisão (alimenta o <lastmod> do sitemap), preservando o resto.
 *
 * Não dá para reaproveitar savePageMeta aqui: ela grava a linha inteira, então uma
 * chamada só com `updated` zeraria o título, a descrição e a imagem social editados no
 * Page Editor. Publicar conteúdo não pode apagar metadado.
 */
export async function stampPageUpdated(
  path: string,
  updated: string,
  actor: { id: string; name: string },
): Promise<void> {
  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO page_meta (path, noindex, updated, updated_at, updated_by, updated_by_name)
       VALUES (?1, 0, ?2, ?3, ?4, ?5)
       ON CONFLICT(path) DO UPDATE SET
         updated = ?2, updated_at = ?3, updated_by = ?4, updated_by_name = ?5`,
    )
    .bind(path, updated, nowIso(), actor.id, actor.name)
    .run();
}

/** Devolve a página ao que está no código. */
export async function resetPageMeta(path: string): Promise<void> {
  const db = await getDb();
  await db.prepare("DELETE FROM page_meta WHERE path = ?").bind(path).run();
}
