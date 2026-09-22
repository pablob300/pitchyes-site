import type { Metadata } from "next";
import { NewsletterTable, type SubscriberRow } from "@/components/admin/newsletter/NewsletterTable";
import { Pagination } from "@/components/admin/leads/Pagination";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { hasFilters, parseLeadFilters, PER_PAGE } from "@/lib/leads-filters";
import { listSubscribers } from "@/lib/newsletter-db";
import { pageMetadata } from "@/lib/seo";

// Assinaturas da newsletter do rodapé. Separadas da Central de leads desde a
// migração 0005: lá é contato para o comercial, aqui é lista de e-mails.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Newsletter",
    description: "Área interna da PitchYes: assinaturas da newsletter do rodapé.",
    path: "/admin/newsletter",
    noindex: true,
  });
}

const TZ = "America/Sao_Paulo";
const dateFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseLeadFilters(await searchParams);
  const { items, total } = await listSubscribers(filters);

  const rows: SubscriberRow[] = items.map((item) => {
    const when = new Date(item.created_at);
    return { id: item.id, email: item.email, date: dateFmt.format(when), time: timeFmt.format(when) };
  });

  const descricao =
    total === 0
      ? hasFilters(filters)
        ? "Nenhuma assinatura nesse período."
        : "Nenhuma assinatura ainda."
      : `${total} ${total === 1 ? "assinatura" : "assinaturas"}${hasFilters(filters) ? " no período" : ""} · horário de Brasília`;

  return (
    <>
      <PageHeader eyebrow="Newsletter" title="Assinaturas da Newsletter" description={descricao} />
      <NewsletterTable rows={rows} filters={filters} total={total} />
      <Pagination filters={filters} total={total} perPage={PER_PAGE} basePath="/admin/newsletter" />
    </>
  );
}
