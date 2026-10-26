import type { Metadata } from "next";
import { ContentPage } from "@/components/blocks/ContentPage";
import { JsonLd } from "@/components/JsonLd";
import { getInnerPageContent } from "@/lib/content/inner";
import { integracoes } from "@/content/integracoes";
import { faqItems } from "@/content/types";
import { breadcrumbSchema, pageMetadataWithOverrides, webPageSchema } from "@/lib/seo";

const defaults = integracoes;
const path = "/recursos/integracoes";

// Os metadados podem ser editados no Page Editor: a página se reconstrói a cada
// minuto para a mudança aparecer sem precisar de um novo deploy.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadataWithOverrides({ title: defaults.seoTitle, description: defaults.seoDescription, path });
}

export default async function Page() {
  // Texto do código com o que foi publicado no editor visual por cima (lib/content/inner.ts).
  const content = await getInnerPageContent(path);
  const faq = faqItems(content);
  return (
    <>
      <JsonLd
        graph={[
          webPageSchema({ title: content.seoTitle, description: content.seoDescription, path }),
          breadcrumbSchema([
            { name: "Início", path: "/" },
            { name: "Recursos", path: "/recursos/integracoes" },
            { name: content.seoTitle, path },
          ]),
          ...(faq.length
            ? [
                {
                  "@type": "FAQPage",
                  mainEntity: faq.map((item) => ({
                    "@type": "Question",
                    name: item.q,
                    acceptedAnswer: { "@type": "Answer", text: item.a },
                  })),
                },
              ]
            : []),
        ]}
      />
      <ContentPage content={content} />
    </>
  );
}
