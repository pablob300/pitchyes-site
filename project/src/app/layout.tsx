import type { Metadata, Viewport } from "next";
import { FinalCta } from "@/components/layout/FinalCta";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { ScrollReset } from "@/components/motion/ScrollReset";
import { headBootstrap } from "@/lib/bootstrap";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";
import { getSiteUrl, isIndexable } from "@/lib/site";
import { brandFont } from "./fonts";
import "./globals.css";

export const viewport: Viewport = { themeColor: "#ffffff" };

export function generateMetadata(): Metadata {
  const indexable = isIndexable();
  return {
    metadataBase: getSiteUrl(),
    title: {
      default: `${SITE_NAME} — ${SITE_TAGLINE}`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    openGraph: { siteName: SITE_NAME, locale: "pt_BR", type: "website" },
    twitter: { card: "summary_large_image" },
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
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <SiteHeader />
        <main id="conteudo">{children}</main>
        {/* "Fale com nossa IA" band: same on every page, right before the footer */}
        <FinalCta />
        <SiteFooter />
        <ScrollReset />
        <RevealOnScroll />
      </body>
    </html>
  );
}
