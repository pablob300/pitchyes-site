import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { revealBootstrap } from "@/lib/reveal";
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
    <html lang="pt-BR" className={brandFont.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: revealBootstrap }} />
      </head>
      <body>
        <SiteHeader />
        <main id="conteudo">{children}</main>
        <SiteFooter />
        <RevealOnScroll />
      </body>
    </html>
  );
}
