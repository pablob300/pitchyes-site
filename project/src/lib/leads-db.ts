import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { LeadFormDef, LeadValues } from "./leads";

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
  const row: LeadRow = {
    id,
    created_at: createdAt,
    form: form.id,
    name: values[name] ?? "",
    email: values[email] ?? "",
    phone: (phone && values[phone]) || null,
    company: (company && values[company]) || null,
    fields: JSON.stringify(values),
  };

  await (await db())
    .prepare(
      `INSERT INTO leads (id, created_at, form, name, email, phone, company, fields, source_url, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    )
    .run();

  return parse(row);
}

export async function listLeads(limit = 200): Promise<Lead[]> {
  const { results } = await (await db())
    .prepare(
      `SELECT id, created_at, form, name, email, phone, company, fields
       FROM leads ORDER BY created_at DESC LIMIT ?`,
    )
    .bind(limit)
    .all<LeadRow>();
  return (results ?? []).map(parse);
}
