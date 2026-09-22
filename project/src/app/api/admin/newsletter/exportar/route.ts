import { audit } from "@/lib/admin/audit";
import { csvResponse, toCsv } from "@/lib/admin/csv";
import { jsonError } from "@/lib/admin/request";
import { requireApiSession } from "@/lib/admin/session";
import { can } from "@/lib/admin/users";
import { parseLeadFilters } from "@/lib/leads-filters";
import { listSubscribersForExport } from "@/lib/newsletter-db";

// Exporta as assinaturas do filtro atual; sem filtro, a lista inteira.
// Fica registrado na auditoria: é lista de e-mails saindo do painel.
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
  if (!can(auth.session.user, "newsletter.exportar")) return jsonError("Sem permissão.", 403);

  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const filters = parseLeadFilters(params);
  const subscribers = await listSubscribersForExport(filters);

  const rows = subscribers.map((subscriber) => [
    subscriber.email,
    dateFmt.format(new Date(subscriber.created_at)),
    subscriber.source_url,
  ]);

  await audit({
    action: "leads.exportados",
    actorId: auth.session.userId,
    actorEmail: auth.session.user.email,
    targetType: "newsletter",
    detail: { quantidade: subscribers.length, filtros: filters },
    request,
  });

  const today = new Date().toISOString().slice(0, 10);
  return csvResponse(`newsletter-${today}.csv`, toCsv(["E-mail", "Assinou em", "Página de origem"], rows));
}
