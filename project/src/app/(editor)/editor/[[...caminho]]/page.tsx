import { notFound } from "next/navigation";
import { ContentPage } from "@/components/blocks/ContentPage";
import { HomePage } from "@/components/home/HomePage";
import { getInnerPageContent } from "@/lib/content/inner";
import { getHomeContent, getSiteContent } from "@/lib/content/resolve";
import { isContentEditable, pathFromEditorSegments } from "@/lib/content/pages";

// A página dentro do iframe do editor. Renderiza o RASCUNHO com os ganchos data-edit:
// a home com HomePage, as páginas internas com ContentPage (o mesmo componente do site).
//
// Sem JSON-LD de propósito: dado estruturado descreve o que está publicado. Emitir aqui
// só criaria uma cópia divergente numa página que ninguém indexa.
export const dynamic = "force-dynamic";

export default async function EditorPreview({ params }: PageProps<"/editor/[[...caminho]]">) {
  const { caminho } = await params;
  const path = pathFromEditorSegments(caminho);
  if (!isContentEditable(path)) notFound();

  if (path !== "/") {
    return <ContentPage content={await getInnerPageContent(path, "rascunho")} editable />;
  }

  const [content, site] = await Promise.all([getHomeContent("rascunho"), getSiteContent("rascunho")]);
  return <HomePage content={content} clients={site.clients} editable />;
}
