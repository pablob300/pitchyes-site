import type { Metadata } from "next";
import { LeadsBrowser, type LeadItem } from "@/components/admin/LeadsBrowser";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { leadForms } from "@/lib/leads";
import { listLeads } from "@/lib/leads-db";
import { pageMetadata } from "@/lib/seo";

// Área interna: sempre renderizada na hora, nunca cacheada, nunca indexada
// (ver src/proxy.ts, que exige senha, e app/robots.ts, que bloqueia /admin).
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Leads",
    description: "Área interna da PitchYes: leads recebidos pelos formulários do site.",
    path: "/admin/leads",
    noindex: true,
  });
}

const TZ = "America/Sao_Paulo";
const dateFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

export default async function Page() {
  const leads = await listLeads();

  // Rótulo de cada campo, para a ficha mostrar "Faturamento Mensal" e não "faturamento".
  const labels: Record<string, string> = {};
  for (const form of Object.values(leadForms)) {
    for (const field of form.fields) labels[field.name] = field.label;
  }

  const items: LeadItem[] = leads.map((lead) => {
    const when = new Date(lead.created_at);
    return {
      id: lead.id,
      date: dateFmt.format(when),
      time: timeFmt.format(when),
      name: lead.name,
      email: lead.email,
      company: lead.company,
      form: lead.form,
      fields: lead.fields,
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="Central de leads"
        title="Leads recebidos"
        description={
          items.length === 0
            ? "Nenhum lead recebido ainda."
            : `${items.length} ${items.length === 1 ? "lead" : "leads"} · horário de Brasília`
        }
      />
      <LeadsBrowser items={items} labels={labels} />
    </>
  );
}
