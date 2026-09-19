import type { Metadata } from "next";
import { ClientLogos } from "@/components/home/ClientLogos";
import { faq } from "@/components/home/content";
import { CustomerVideos } from "@/components/home/CustomerVideos";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { Latency } from "@/components/home/Latency";
import { Platform } from "@/components/home/Platform";
import { Rollout } from "@/components/home/Rollout";
import { Security } from "@/components/home/Security";
import { UseCases } from "@/components/home/UseCases";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

function StructuredData() {
  const url = getSiteUrl().origin;
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "PitchYes",
      url,
      logo: `${url}/brand/pitchyes-logo.svg`,
    },
    { "@context": "https://schema.org", "@type": "WebSite", name: "PitchYes", url, inLanguage: "pt-BR" },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

// Section order follows docs/PitchYes — Wireframe Homepage (Desktop).pdf (01 → 09);
// section 10 (final CTA) is site-wide, rendered by the root layout.
export default function Home() {
  return (
    <>
      <StructuredData />
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
