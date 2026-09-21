import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { foldForSearch, type LeadFormDef, type LeadValues } from "./leads";
import { dayBoundsUtc, PER_PAGE, type LeadFilters } from "./leads-filters";

// Acesso ao banco dos leads (D1, binding LEADS_DB — ver wrangler.jsonc e migrations/).
// Só o servidor entra aqui: nenhum dado de lead pode ser servido em página pública.

export type LeadRow = {
  id: string;
  created_at: string;
  form: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  fields: string;
};

export type Lead = Omit<LeadRow, "fields"> & { fields: LeadValues };

async function db(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.LEADS_DB;
}

function parse(row: LeadRow): Lead {
  let fields: LeadValues = {};
  try {
    const parsed: unknown = JSON.parse(row.fields);
    if (parsed && typeof parsed === "object") fields = parsed as LeadValues;
  } catch {
    // Registro gravado fora do formato esperado: mostra o que der, sem derrubar a página.
  }
  return { ...row, fields };
}

export async function saveLead({
  form,
  values,
  sourceUrl,
  userAgent,
}: {
  form: LeadFormDef;
  values: LeadValues;
  sourceUrl?: string;
  userAgent?: string;
}): Promise<Lead> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const { name, email, phone, company } = form.identity;
  const nameValue = (name && values[name]) || "";
  const companyValue = (company && values[company]) || null;
  const row: LeadRow = {
    id,
    created_at: createdAt,
    form: form.id,
    name: nameValue,
    email: values[email] ?? "",
    phone: (phone && values[phone]) || null,
    company: companyValue,
    fields: JSON.stringify(values),
  };

  await (await db())
    .prepare(
      `INSERT INTO leads (id, created_at, form, name, email, phone, company, fields, source_url, user_agent, search_text)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      row.id,
      row.created_at,
      row.form,
      row.name,
      row.email,
      row.phone,
      row.company,
      row.fields,
      sourceUrl ?? null,
      userAgent ?? null,
      foldForSearch(`${nameValue} ${row.email} ${companyValue ?? ""}`),
    )
    .run();

  return parse(row);
}

/** Escapa os curingas do LIKE para que "100%" procure por "100%", não por qualquer coisa. */
function likeTerm(value: string): string {
  const escaped = foldForSearch(value).replace(/[\%_]/g, (char) => "\\" + char);
  return `%${escaped}%`;
}

const SELECT_COLUMNS = "id, created_at, form, name, email, phone, company, fields";

const WHERE = `WHERE (?1 IS NULL OR form = ?1)
   AND (?2 IS NULL OR created_at >= ?2)
   AND (?3 IS NULL OR created_at <  ?3)
   AND (?4 IS NULL OR search_text LIKE ?4 ESCAPE '\')`;

function bindings(filters: LeadFilters) {
  const { start, end } = dayBoundsUtc(filters.from, filters.to);
  return [filters.form ?? null, start ?? null, end ?? null, filters.q ? likeTerm(filters.q) : null];
}

/** Página da listagem, com o total para a paginação. */
export async function listLeads(
  filters: LeadFilters = { page: 1 },
  perPage = PER_PAGE,
): Promise<{ items: Lead[]; total: number }> {
  const database = await db();
  const offset = (filters.page - 1) * perPage;
  const args = bindings(filters);

  const [page, count] = await database.batch<LeadRow | { total: number }>([
    database
      .prepare(`SELECT ${SELECT_COLUMNS} FROM leads ${WHERE} ORDER BY created_at DESC LIMIT ?5 OFFSET ?6`)
      .bind(...args, perPage, offset),
    database.prepare(`SELECT COUNT(*) AS total FROM leads ${WHERE}`).bind(...args),
  ]);

  const items = ((page.results ?? []) as LeadRow[]).map(parse);
  const total = ((count.results ?? []) as { total: number }[])[0]?.total ?? 0;
  return { items, total };
}

/** Mesma consulta da tela, sem paginação, para a exportação. Teto para não travar o Worker. */
export async function listLeadsForExport(filters: LeadFilters, limit = 5000): Promise<Lead[]> {
  const database = await db();
  const { results } = await database
    .prepare(`SELECT ${SELECT_COLUMNS} FROM leads ${WHERE} ORDER BY created_at DESC LIMIT ?5`)
    .bind(...bindings(filters), limit)
    .all<LeadRow>();
  return (results ?? []).map(parse);
}
