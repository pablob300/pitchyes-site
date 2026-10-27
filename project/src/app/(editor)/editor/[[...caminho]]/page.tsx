import { notFound } from "next/navigation";
import { ContentPage } from "@/components/blocks/ContentPage";
import { HomePage } from "@/components/home/HomePage";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { getInnerPageContent } from "@/lib/content/inner";
import { getHomeContent, getSiteContent } from "@/lib/content/resolve";
import { isContentEditable, pathFromEditorSegments } from "@/lib/content/pages";
import { getSiteSettings } from "@/lib/settings";

// A página dentro do iframe do editor. Renderiza o RASCUNHO com os ganchos data-edit:
// a home com HomePage, as páginas internas com ContentPage (o mesmo componente do site),
// dentro da moldura do site.
//
// Sem JSON-LD de propósito: dado estruturado descreve o que está publicado. Emitir aqui
// só criaria uma cópia divergente numa página que ninguém indexa.
export const dynamic = "force-dynamic";

export default async function EditorPreview({ params }: PageProps<"/editor/[[...caminho]]">) {
  const { caminho } = await params;
  const path = pathFromEditorSegments(caminho);
  if (!isContentEditable(path)) notFound();

  const [site, settings] = await Promise.all([getSiteContent("rascunho"), getSiteSettings()]);
  const page =
    path !== "/" ? (
      <ContentPage content={await getInnerPageContent(path, "rascunho")} editable />
    ) : (
      <HomePage content={await getHomeContent("rascunho")} clients={site.clients} editable />
    );

  return (
    <SiteChrome content={site} logo={settings.logo} editable>
      {page}
    </SiteChrome>
  );
}
