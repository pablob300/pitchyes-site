import type { Metadata } from "next";
import { ContentPage } from "@/components/blocks/ContentPage";
import { JsonLd } from "@/components/JsonLd";
import { getInnerPageContent } from "@/lib/content/inner";
import { innerPageGraph } from "@/lib/content/jsonld";
import { solucoes } from "@/content/solucoes";
import { pageMetadataWithOverrides } from "@/lib/seo";

const defaults = solucoes;
const path = "/solucoes";

// Os metadados podem ser editados no Page Editor: a página se reconstrói a cada
// minuto para a mudança aparecer sem precisar de um novo deploy.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadataWithOverrides({ title: defaults.seoTitle, description: defaults.seoDescription, path });
}

export default async function Page() {
  // Texto do código com o que foi publicado no editor visual por cima (lib/content/inner.ts).
  const content = await getInnerPageContent(path);
  return (
    <>
      <JsonLd graph={innerPageGraph(path, content)} />
      <ContentPage content={content} />
    </>
  );
}
