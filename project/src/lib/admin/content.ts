import "server-only";
import { getDb, newId, nowIso } from "./db";
import type { ContentStatus, PageContentRow } from "@/lib/page-content";

// Rascunho, publicação e histórico do conteúdo das páginas.
//
// O que fica guardado é SOBREPOSIÇÃO esparsa: só os campos que alguém mudou. O padrão
// continua nos arquivos de conteúdo do código, e a fusão acontece na leitura
// (lib/content/resolve.ts).

export const SCHEMA_VERSION = 1;

/** Histórico guardado por página. Publicação antiga sai quando passa disto. */
const KEEP_VERSIONS = 30;

/** Quanto tempo o aviso "Fulano está editando" vale sem ser renovado. */
const LOCK_TTL_MS = 90_000;

export type Actor = { id: string; name: string; email: string };

export type DraftState = {
  data: unknown;
  rev: number;
  updatedAt: string | null;
  updatedByName: string | null;
  /** Quem está com a página aberta agora, se não for quem perguntou. */
  lockedByName: string | null;
};

function parse(raw: string | null | undefined): unknown {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function row(path: string, status: ContentStatus): Promise<PageContentRow | null> {
  const db = await getDb();
  return db
    .prepare("SELECT * FROM page_content WHERE path = ? AND status = ?")
    .bind(path, status)
    .first<PageContentRow>();
}

/**
 * Abre o rascunho. Se ainda não existe, ele nasce do que está PUBLICADO — quem começa a
 * editar continua de onde o site está, e não de uma página em branco.
 */
export async function openDraft(path: string, actor: Actor): Promise<DraftState> {
  const draft = await row(path, "rascunho");
  if (draft) {
    const fresh =
      draft.locked_at && Date.now() - Date.parse(draft.locked_at) < LOCK_TTL_MS;
    return {
      data: parse(draft.data),
      rev: draft.rev,
      updatedAt: draft.updated_at,
      updatedByName: draft.updated_by_name,
      lockedByName: fresh && draft.locked_by !== actor.id ? draft.locked_by_name : null,
    };
  }

  const published = await row(path, "publicado");
  const db = await getDb();
  await db
    .prepare(
      `INSERT OR IGNORE INTO page_content
         (path, status, schema_version, rev, data, updated_at, updated_by, updated_by_name)
       VALUES (?1, 'rascunho', ?2, 1, ?3, ?4, ?5, ?6)`,
    )
    .bind(path, SCHEMA_VERSION, published?.data ?? "{}", nowIso(), actor.id, actor.name)
    .run();

  return {
    data: parse(published?.data),
    rev: 1,
    updatedAt: null,
    updatedByName: null,
    lockedByName: null,
  };
}

/**
 * Escreve um campo na sobreposição.
 *
 * Ponteiro com número é recusado de propósito. Gravar "faq.items.3.q" produziria uma
 * lista esparsa, com buracos nos índices que ninguém tocou — e a fusão substitui lista
 * inteira, então os buracos virariam itens vazios na página. Para mexer num item, o
 * painel manda a LISTA inteira em "faq.items".
 */
export function setAtPointer(
  target: Record<string, unknown>,
  pointer: string,
  value: unknown,
): void {
  const parts = pointer.split(".");
  if (parts.some((part) => part === "" || /^\d+$/.test(part))) {
    throw new Error(`ponteiro inválido: ${pointer}`);
  }
  let node = target;
  for (const part of parts.slice(0, -1)) {
    const next = node[part];
    if (typeof next !== "object" || next === null || Array.isArray(next)) node[part] = {};
    node = node[part] as Record<string, unknown>;
  }
  node[parts[parts.length - 1]] = value;
}

/**
 * Tira o campo da sobreposição — o oposto de setAtPointer.
 *
 * É o "voltar ao padrão do código": apagar a chave faz o valor voltar a sair do arquivo
 * de conteúdo na próxima fusão. Sem isto, uma lista editada uma vez ficaria congelada
 * para sempre e melhorias feitas no código nunca mais apareceriam.
 */
export function unsetAtPointer(target: Record<string, unknown>, pointer: string): void {
  const parts = pointer.split(".");
  let node: Record<string, unknown> | undefined = target;
  for (const part of parts.slice(0, -1)) {
    const next: unknown = node?.[part];
    if (typeof next !== "object" || next === null || Array.isArray(next)) return;
    node = next as Record<string, unknown>;
  }
  delete node?.[parts[parts.length - 1]];
}

export type SaveResult = { ok: true; rev: number } | { ok: false; conflictWith: string | null };

/**
 * Grava um lote de campos no rascunho, conferindo o trinco otimista.
 *
 * Quem salva manda o `rev` que carregou. Se o banco já está num rev maior, outra pessoa
 * salvou no meio do caminho: a gravação é recusada em vez de apagar o trabalho dela.
 */
export async function saveDraft(
  path: string,
  patches: { pointer: string; value?: unknown; unset?: boolean }[],
  rev: number,
  actor: Actor,
): Promise<SaveResult> {
  const current = await row(path, "rascunho");
  if (!current) return { ok: false, conflictWith: null };
  if (current.rev !== rev) return { ok: false, conflictWith: current.updated_by_name };

  const data = parse(current.data);
  const next = (typeof data === "object" && data !== null && !Array.isArray(data)
    ? data
    : {}) as Record<string, unknown>;
  for (const patch of patches) {
    if (patch.unset) unsetAtPointer(next, patch.pointer);
    else setAtPointer(next, patch.pointer, patch.value);
  }

  const db = await getDb();
  const result = await db
    .prepare(
      `UPDATE page_content
          SET data = ?1, rev = rev + 1, updated_at = ?2, updated_by = ?3, updated_by_name = ?4,
              locked_by = ?3, locked_by_name = ?4, locked_at = ?2
        WHERE path = ?5 AND status = 'rascunho' AND rev = ?6`,
    )
    .bind(JSON.stringify(next), nowIso(), actor.id, actor.name, path, rev)
    .run();

  // Entre a leitura e o UPDATE alguém pode ter salvado: quem decide é o banco.
  if (!result.meta.changes) return { ok: false, conflictWith: current.updated_by_name };
  return { ok: true, rev: rev + 1 };
}

/** Publica o rascunho: o site passa a ler este conteúdo, e a versão entra no histórico. */
export async function publishDraft(path: string, actor: Actor): Promise<{ published: boolean }> {
  const draft = await row(path, "rascunho");
  if (!draft) return { published: false };

  const db = await getDb();
  const now = nowIso();
  await db.batch([
    db
      .prepare(
        `INSERT INTO page_content
           (path, status, schema_version, rev, data, updated_at, updated_by, updated_by_name)
         VALUES (?1, 'publicado', ?2, 1, ?3, ?4, ?5, ?6)
         ON CONFLICT(path, status) DO UPDATE SET
           schema_version = ?2, rev = page_content.rev + 1, data = ?3,
           updated_at = ?4, updated_by = ?5, updated_by_name = ?6`,
      )
      .bind(path, draft.schema_version, draft.data, now, actor.id, actor.name),
    db
      .prepare(
        `INSERT INTO page_content_versions
           (id, path, schema_version, data, created_at, created_by, created_by_name)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
      )
      .bind(newId("ver"), path, draft.schema_version, draft.data, now, actor.id, actor.name),
    // Poda: o histórico serve para voltar atrás, não para guardar tudo para sempre.
    db
      .prepare(
        `DELETE FROM page_content_versions
          WHERE path = ?1 AND id NOT IN (
            SELECT id FROM page_content_versions
             WHERE path = ?1 ORDER BY created_at DESC LIMIT ?2
          )`,
      )
      .bind(path, KEEP_VERSIONS),
  ]);

  return { published: true };
}

/** Joga o rascunho fora e volta ao que está publicado. */
export async function discardDraft(path: string): Promise<void> {
  const db = await getDb();
  await db.prepare("DELETE FROM page_content WHERE path = ? AND status = 'rascunho'").bind(path).run();
}

export type ContentVersion = {
  id: string;
  created_at: string;
  created_by_name: string | null;
};

export async function listVersions(path: string): Promise<ContentVersion[]> {
  const db = await getDb();
  const { results } = await db
    .prepare(
      `SELECT id, created_at, created_by_name FROM page_content_versions
        WHERE path = ? ORDER BY created_at DESC LIMIT ?`,
    )
    .bind(path, KEEP_VERSIONS)
    .all<ContentVersion>();
  return results ?? [];
}

/**
 * Traz uma versão de volta PARA O RASCUNHO, nunca direto para o ar: restaurar continua
 * sendo uma decisão que passa pelo botão Publicar.
 */
export async function restoreVersion(
  path: string,
  versionId: string,
  actor: Actor,
): Promise<boolean> {
  const db = await getDb();
  const version = await db
    .prepare("SELECT data, schema_version FROM page_content_versions WHERE id = ? AND path = ?")
    .bind(versionId, path)
    .first<{ data: string; schema_version: number }>();
  if (!version) return false;

  await db
    .prepare(
      `INSERT INTO page_content
         (path, status, schema_version, rev, data, updated_at, updated_by, updated_by_name)
       VALUES (?1, 'rascunho', ?2, 1, ?3, ?4, ?5, ?6)
       ON CONFLICT(path, status) DO UPDATE SET
         schema_version = ?2, rev = page_content.rev + 1, data = ?3,
         updated_at = ?4, updated_by = ?5, updated_by_name = ?6`,
    )
    .bind(path, version.schema_version, version.data, nowIso(), actor.id, actor.name)
    .run();
  return true;
}
