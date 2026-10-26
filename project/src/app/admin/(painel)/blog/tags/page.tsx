import type { Metadata } from "next";
import { TermsManager } from "@/components/admin/blog/TermsManager";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { listTerms } from "@/lib/blog/admin";
import { pages } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

// Blog › Tags.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata({ title: "Tags do blog", description: "Área interna da PitchYes: Tags do blog.", path: "/admin/blog/tags", noindex: true });
}

export default async function Page() {
  const terms = await listTerms("tag");
  const commercial = pages.filter((p) => !p.placeholder && !p.path.startsWith("/blog") && p.path !== "/").map((p) => ({ path: p.path, title: p.title }));
  return (
    <>
      <PageHeader eyebrow="Blog" title="Tags" description="Assuntos transversais dos artigos. Tag com menos de 5 artigos fica fora do Google (página rala), mas continua navegável e repassando links." />
      <TermsManager kind="tag" terms={terms} pages={commercial} />
    </>
  );
}
