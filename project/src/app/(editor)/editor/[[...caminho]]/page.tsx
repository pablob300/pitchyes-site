import { notFound } from "next/navigation";
import { HomePage } from "@/components/home/HomePage";
import { getHomeContent, getSiteContent } from "@/lib/content/resolve";
import { isContentEditable, pathFromEditorSegments } from "@/lib/content/pages";

// A página dentro do iframe do editor. Renderiza o RASCUNHO com os ganchos data-edit.
//
// Sem JSON-LD de propósito: dado estruturado descreve o que está publicado. Emitir aqui
// só criaria uma cópia divergente numa página que ninguém indexa.
export const dynamic = "force-dynamic";

export default async function EditorPreview({ params }: PageProps<"/editor/[[...caminho]]">) {
  const { caminho } = await params;
  const path = pathFromEditorSegments(caminho);
  if (!isContentEditable(path)) notFound();

  const [content, site] = await Promise.all([
    getHomeContent("rascunho"),
    getSiteContent("rascunho"),
  ]);

  return <HomePage content={content} clients={site.clients} editable />;
}
