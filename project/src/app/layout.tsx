import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { ScrollReset } from "@/components/motion/ScrollReset";
import { headBootstrap } from "@/lib/bootstrap";
import { getSiteUrl, isIndexable } from "@/lib/site";
import { brandFont } from "./fonts";
import "./globals.css";

export function generateMetadata(): Metadata {
  const indexable = isIndexable();
  return {
    metadataBase: getSiteUrl(),
    title: {
      default: "PitchYes — IA de voz para empresas",
      template: "%s | PitchYes",
    },
    description: "IA de voz para setores que exigem segurança e confiança: saúde, seguros, serviços financeiros e mais.",
    openGraph: { siteName: "PitchYes", locale: "pt_BR", type: "website" },
    robots: { index: indexable, follow: indexable },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior: Next 16 only turns off our CSS smooth scrolling during route
    // transitions when this is set, so page changes jump straight to the top.
    <html
      lang="pt-BR"
      className={brandFont.variable}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: headBootstrap }} />
      </head>
      <body>
        <SiteHeader />
        <main id="conteudo">{children}</main>
        <SiteFooter />
        <ScrollReset />
        <RevealOnScroll />
      </body>
    </html>
  );
}
