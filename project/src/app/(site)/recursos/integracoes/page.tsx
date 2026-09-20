import type { Metadata } from "next";
import { ContentPage } from "@/components/blocks/ContentPage";
import { JsonLd } from "@/components/JsonLd";
import { integracoes } from "@/content/integracoes";
import { faqItems } from "@/content/types";
import { breadcrumbSchema, pageMetadata, webPageSchema } from "@/lib/seo";

const content = integracoes;
const path = "/recursos/integracoes";

export function generateMetadata(): Metadata {
  return pageMetadata({ title: content.seoTitle, description: content.seoDescription, path });
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
