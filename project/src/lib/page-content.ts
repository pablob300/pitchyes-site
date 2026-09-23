import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Conteúdo das páginas editado no painel, lido pelo site público.
//
// Espelha lib/page-meta.ts de propósito, inclusive no tratamento de erro: isto é
// SOBREPOSIÇÃO. O padrão continua nos arquivos de conteúdo do código; aqui só vem o que
// alguém mudou. Se o banco não responder — inclusive durante o build, quando não existe
// binding, e antes de a migração 0006 rodar —, a página usa o padrão e nada quebra.

export type ContentStatus = "rascunho" | "publicado";

export type PageContentRow = {
  path: string;
  status: ContentStatus;
  schema_version: number;
  rev: number;
  data: string;
  updated_at: string;
  updated_by: string | null;
  updated_by_name: string | null;
  locked_by: string | null;
  locked_by_name: string | null;
  locked_at: string | null;
};

async function db(): Promise<D1Database | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.LEADS_DB ?? null;
  } catch {
    return null;
  }
}

export async function getPageContentRow(
  path: string,
  status: ContentStatus,
): Promise<PageContentRow | null> {
  try {
    const database = await db();
    if (!database) return null;
    return await database
      .prepare("SELECT * FROM page_content WHERE path = ? AND status = ?")
      .bind(path, status)
      .first<PageContentRow>();
  } catch (error) {
    console.error("[page-content] falha ao ler", path, status, error);
    return null;
  }
}

/** O JSON cru da sobreposição, ou `null` para "use o padrão do código". */
export async function getPageContentData(
  path: string,
  status: ContentStatus,
): Promise<string | null> {
  const row = await getPageContentRow(path, status);
  return row?.data ?? null;
}
