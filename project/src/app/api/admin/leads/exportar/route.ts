import { audit } from "@/lib/admin/audit";
import { csvResponse, toCsv } from "@/lib/admin/csv";
import { jsonError } from "@/lib/admin/request";
import { requireApiSession } from "@/lib/admin/session";
import { can } from "@/lib/admin/users";
import { leadForms } from "@/lib/leads";
import { listLeadsForExport } from "@/lib/leads-db";
import { parseLeadFilters } from "@/lib/leads-filters";

// Exporta os leads do filtro atual em CSV. É leitura, então GET — e fica registrado
// na auditoria, porque leva dado pessoal para fora do painel.
export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export async function GET(request: Request) {
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  if (!can(auth.session.user, "leads.exportar")) return jsonError("Sem permissão.", 403);

  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const filters = parseLeadFilters(params);
  const leads = await listLeadsForExport(filters);

  // Uma coluna por campo que apareceu em algum dos leads exportados, com o rótulo
  // do formulário quando existir.
  const labels: Record<string, string> = {};
  for (const form of Object.values(leadForms)) {
    for (const field of form.fields) labels[field.name] = field.label;
  }
  const extra = [...new Set(leads.flatMap((lead) => Object.keys(lead.fields)))];

  const headers = ["Data", "Formulário", "Nome", "E-mail", "Telefone", "Empresa", ...extra.map((key) => labels[key] ?? key)];
  const rows = leads.map((lead) => [
    dateFmt.format(new Date(lead.created_at)),
    leadForms[lead.form]?.label ?? lead.form,
    lead.name,
    lead.email,
    lead.phone,
    lead.company,
    ...extra.map((key) => lead.fields[key] ?? ""),
  ]);

  await audit({
    action: "leads.exportados",
    actorId: auth.session.userId,
    actorEmail: auth.session.user.email,
    detail: { quantidade: leads.length, filtros: filters },
    request,
  });

  const today = new Date().toISOString().slice(0, 10);
  return csvResponse(`leads-${today}.csv`, toCsv(headers, rows));
}
