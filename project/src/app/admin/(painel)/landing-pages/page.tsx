import type { Metadata } from "next";
import Link from "next/link";
import { LandingList, type LandingItem } from "@/components/admin/landing/LandingList";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { buttonClass } from "@/components/ui/Button";
import { landingPath, listLandingPages } from "@/lib/landing-db";
import { pageMetadata } from "@/lib/seo";

// Landing Pages › Ver todas.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Landing Pages",
    description: "Área interna da PitchYes: landing pages de campanha.",
    path: "/admin/landing-pages",
    noindex: true,
  });
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function Page() {
  const pages = await listLandingPages();
  const items: LandingItem[] = pages.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    url: landingPath(p.slug),
    active: p.active === 1,
    noindex: p.noindex === 1,
    seoTitle: p.seo_title,
    seoDescription: p.seo_description,
    updated: dateFmt.format(new Date(p.updated_at)),
    updatedBy: p.updated_by_name,
  }));
  const ativas = items.filter((i) => i.active).length;

  return (
    <>
      <PageHeader
        eyebrow="Landing Pages"
        title="Todas as landing pages"
        description={
          items.length
            ? `${items.length} ${items.length === 1 ? "página" : "páginas"} · ${ativas} no ar. Páginas ativas entram no sitemap (menos as marcadas como fora do índice).`
            : "Páginas de campanha em /conteudo/<endereço>, sem o menu do site: quem chega fica na página."
        }
        actions={
          <Link href="/admin/landing-pages/nova" className={buttonClass("solid")}>
            Criar página
          </Link>
        }
      />
      <LandingList items={items} />
    </>
  );
}
