import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Metadados editados no Page Editor (/admin/paginas), lidos pelo site público.
//
// Regra de ouro: isto é SOBREPOSIÇÃO. O padrão continua em lib/routes.ts e nos
// arquivos de conteúdo; aqui só vem o que alguém mudou no painel. Se o banco não
// responder — inclusive durante o build, quando não existe binding —, a página usa
// o padrão do código e nada quebra.

export type PageMeta = {
  path: string;
  title: string | null;
  description: string | null;
  og_title: string | null;
  og_description: string | null;
  image_url: string | null;
  image_alt: string | null;
  noindex: number;
  updated: string | null;
  updated_at: string;
  updated_by_name: string | null;
};

async function db(): Promise<D1Database | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.LEADS_DB ?? null;
  } catch {
    return null;
  }
}

export async function getPageMeta(path: string): Promise<PageMeta | null> {
  try {
    const database = await db();
    if (!database) return null;
    return await database.prepare("SELECT * FROM page_meta WHERE path = ?").bind(path).first<PageMeta>();
  } catch (error) {
    console.error("[page-meta] falha ao ler", path, error);
    return null;
  }
}

export async function getAllPageMeta(): Promise<Map<string, PageMeta>> {
  try {
    const database = await db();
    if (!database) return new Map();
    const { results } = await database.prepare("SELECT * FROM page_meta").all<PageMeta>();
    return new Map((results ?? []).map((row) => [row.path, row]));
  } catch (error) {
    console.error("[page-meta] falha ao listar", error);
    return new Map();
  }
}
