import type { Metadata } from "next";
import { ContentPage } from "@/components/blocks/ContentPage";
import { JsonLd } from "@/components/JsonLd";
import { clientes } from "@/content/clientes";
import { faqItems } from "@/content/types";
import { breadcrumbSchema, pageMetadataWithOverrides, webPageSchema } from "@/lib/seo";

const content = clientes;
const path = "/clientes";

// Os metadados podem ser editados no Page Editor: a página se reconstrói a cada
// minuto para a mudança aparecer sem precisar de um novo deploy.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadataWithOverrides({ title: content.seoTitle, description: content.seoDescription, path });
}

export default function Page() {
  const faq = faqItems(content);
  return (
    <>
      <JsonLd
        graph={[
          webPageSchema({ title: content.seoTitle, description: content.seoDescription, path }),
          breadcrumbSchema([
            { name: "Início", path: "/" },
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
