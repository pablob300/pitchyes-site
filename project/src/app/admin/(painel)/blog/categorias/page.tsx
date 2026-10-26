import type { Metadata } from "next";
import { TermsManager } from "@/components/admin/blog/TermsManager";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { listTerms } from "@/lib/blog/admin";
import { pages } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

// Blog › Categorias.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata({ title: "Categorias do blog", description: "Área interna da PitchYes: Categorias do blog.", path: "/admin/blog/categorias", noindex: true });
}

export default async function Page() {
  const terms = await listTerms("categoria");
  const commercial = pages.filter((p) => !p.placeholder && !p.path.startsWith("/blog") && p.path !== "/").map((p) => ({ path: p.path, title: p.title }));
  return (
    <>
      <PageHeader eyebrow="Blog" title="Categorias" description="Cada categoria tem página própria no blog, com descrição e SEO próprios, e liga os artigos a uma página comercial." />
      <TermsManager kind="categoria" terms={terms} pages={commercial} />
    </>
  );
}
