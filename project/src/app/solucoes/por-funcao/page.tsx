import type { Metadata } from "next";
import { ContentPage } from "@/components/blocks/ContentPage";
import { JsonLd } from "@/components/JsonLd";
import { solucoesPorFuncao } from "@/content/solucoes-por-funcao";
import { faqItems } from "@/content/types";
import { breadcrumbSchema, pageMetadata, serviceSchema, webPageSchema } from "@/lib/seo";

const content = solucoesPorFuncao;
const path = "/solucoes/por-funcao";

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
          serviceSchema({ name: content.h1, description: content.seoDescription, path }),
          breadcrumbSchema([
            { name: "Início", path: "/" },
            { name: "Soluções", path: "/solucoes" },
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
