import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { resolveLanding } from "@/lib/content/landing";
import { getSiteContent } from "@/lib/content/resolve";
import { getLandingById, getLandingContent } from "@/lib/landing-db";
import { getSiteSettings } from "@/lib/settings";

// Pré-visualização do RASCUNHO de uma landing page, dentro do iframe do editor. Mesmo
// componente da página pública (app/(lp)/conteudo/[slug]), com os ganchos data-edit.
// Mostra a página mesmo inativa: é aqui que ela é montada antes de ir ao ar.
export const dynamic = "force-dynamic";

export default async function LandingPreview({ params }: PageProps<"/editor/conteudo/[id]">) {
  const { id } = await params;
  const page = await getLandingById(id);
  if (!page) notFound();

  const [data, site, settings] = await Promise.all([
    getLandingContent(page.id, "rascunho"),
    getSiteContent("rascunho"),
    getSiteSettings(),
  ]);
  const blocks = resolveLanding(data).map((item) =>
    item.block.kind === "logos" && item.block.source !== "proprio" ? { ...item, block: { ...item.block, items: site.clients } } : item,
  );
  return <LandingPage blocks={blocks} slug={page.slug} logo={settings.logo} editable />;
}
