import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { dayBoundsUtc, PER_PAGE, type LeadFilters } from "./leads-filters";

// Assinaturas da newsletter do rodapé. Tabela própria (migração 0005): é uma lista
// de e-mails, não um lead para o comercial trabalhar.

export type Subscriber = {
  id: string;
  email: string;
  created_at: string;
  source_url: string | null;
};

async function db(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.LEADS_DB;
}

/**
 * Grava a assinatura. E-mail repetido não vira linha nova nem erro para quem
 * assinou — a data que vale é a da primeira vez.
 */
export async function saveSubscriber({
  email,
  sourceUrl,
  userAgent,
}: {
  email: string;
  sourceUrl?: string;
  userAgent?: string;
}): Promise<void> {
  const database = await db();
  await database
    .prepare(
      `INSERT INTO newsletter (id, email, created_at, source_url, user_agent)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(email) DO NOTHING`,
    )
    .bind(crypto.randomUUID(), email.trim().toLowerCase(), new Date().toISOString(), sourceUrl ?? null, userAgent ?? null)
    .run();
}

const WHERE = `WHERE (?1 IS NULL OR created_at >= ?1)
   AND (?2 IS NULL OR created_at <  ?2)`;

function bindings(filters: LeadFilters) {
  const { start, end } = dayBoundsUtc(filters.from, filters.to);
  return [start ?? null, end ?? null];
}

export async function listSubscribers(
  filters: LeadFilters = { page: 1 },
  perPage = PER_PAGE,
): Promise<{ items: Subscriber[]; total: number }> {
  const database = await db();
  const offset = (filters.page - 1) * perPage;
  const args = bindings(filters);

  const [page, count] = await database.batch<Subscriber | { total: number }>([
    database
      .prepare(`SELECT id, email, created_at, source_url FROM newsletter ${WHERE} ORDER BY created_at DESC LIMIT ?3 OFFSET ?4`)
      .bind(...args, perPage, offset),
    database.prepare(`SELECT COUNT(*) AS total FROM newsletter ${WHERE}`).bind(...args),
  ]);

  return {
    items: (page.results ?? []) as Subscriber[],
    total: ((count.results ?? []) as { total: number }[])[0]?.total ?? 0,
  };
}

/** Mesma consulta da tela, sem paginação, para a exportação. */
export async function listSubscribersForExport(filters: LeadFilters, limit = 20000): Promise<Subscriber[]> {
  const database = await db();
  const { results } = await database
    .prepare(`SELECT id, email, created_at, source_url FROM newsletter ${WHERE} ORDER BY created_at DESC LIMIT ?3`)
    .bind(...bindings(filters), limit)
    .all<Subscriber>();
  return results ?? [];
}
