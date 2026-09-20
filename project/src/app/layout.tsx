import type { Metadata, Viewport } from "next";
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
        {/* A moldura do site (cabeçalho, CTA, rodapé) fica no layout do grupo (site);
            /admin renderiza só o conteúdo. */}
        {children}
        <ScrollReset />
        <RevealOnScroll />
      </body>
    </html>
  );
}
