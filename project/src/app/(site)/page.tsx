import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ClientLogos } from "@/components/home/ClientLogos";
import { faq, testimonials } from "@/components/home/content";
import { CustomerVideos } from "@/components/home/CustomerVideos";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { Latency } from "@/components/home/Latency";
import { Platform } from "@/components/home/Platform";
import { Rollout } from "@/components/home/Rollout";
import { Security } from "@/components/home/Security";
import { UseCases } from "@/components/home/UseCases";
import {
  organizationSchema,
  pageMetadata,
  SITE_DESCRIPTION,
  videoSchema,
  webPageSchema,
  webSiteSchema,
} from "@/lib/seo";

export function generateMetadata(): Metadata {
  return pageMetadata({ description: SITE_DESCRIPTION, path: "/" });
}

// Section order follows docs/PitchYes — Wireframe Homepage (Desktop).pdf (01 → 09);
// section 10 (final CTA) is site-wide, rendered by the root layout.
export default function Home() {
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
            mainEntity: faq.items.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          },
          ...testimonials.items.map(videoSchema),
        ]}
      />
      <Hero />
      <ClientLogos />
      <Platform />
      <Latency />
      <CustomerVideos />
      <Rollout />
      <Security />
      <UseCases />
      <Faq />
    </>
  );
}
