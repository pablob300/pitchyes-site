import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { HomePage } from "@/components/home/HomePage";
import { getHomeContent, getSiteContent } from "@/lib/content/resolve";
import {
  organizationSchema,
  pageMetadataWithOverrides,
  SITE_DESCRIPTION,
  videoSchema,
  webPageSchema,
  webSiteSchema,
} from "@/lib/seo";

// Os metadados podem ser editados no Page Editor: a página se reconstrói a cada
// minuto para a mudança aparecer sem precisar de um novo deploy.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadataWithOverrides({ description: SITE_DESCRIPTION, path: "/" });
}

// Section order follows docs/PitchYes — Wireframe Homepage (Desktop).pdf (01 → 09);
// section 10 (final CTA) is site-wide, rendered by the root layout.
//
// O JSON-LD sai do MESMO conteúdo que a página desenha: dado estruturado que contradiz o
// texto visível é o pior erro de SEO possível.
export default async function Home() {
  const content = await getHomeContent("publicado");
  const { clients } = await getSiteContent("publicado");

  return (
    <>
      <JsonLd
        graph={[
          organizationSchema(),
          webSiteSchema(),
          webPageSchema({
            title: "PitchYes — IA de voz para empresas",
            description: SITE_DESCRIPTION,
            path: "/",
          }),
          {
            "@type": "FAQPage",
            mainEntity: content.faq.items.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          },
          ...content.testimonials.items.map(videoSchema),
        ]}
      />
      <HomePage content={content} clients={clients} />
    </>
  );
}
