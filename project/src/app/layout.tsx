import type { Metadata, Viewport } from "next";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { ScrollReset } from "@/components/motion/ScrollReset";
import { headBootstrap } from "@/lib/bootstrap";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";
import { getSiteSettings } from "@/lib/settings";
import { getSiteUrl, isIndexable } from "@/lib/site";
import { brandFont } from "./fonts";
import "./globals.css";

export const viewport: Viewport = { themeColor: "#ffffff" };

// Nome do site e favicon podem ser trocados em Configurações › Configuração geral
// (lib/settings.ts); sem nada cadastrado, valem o SITE_NAME e os ícones de /public/brand.
// Os ícones são declarados aqui, e não como arquivos em app/ (icon.svg): ícone em arquivo
// tem prioridade sobre o metadata e tornaria o favicon do painel impossível de aplicar.
export async function generateMetadata(): Promise<Metadata> {
  const indexable = isIndexable();
  const settings = await getSiteSettings();
  const name = settings.siteName ?? SITE_NAME;
  return {
    metadataBase: getSiteUrl(),
    title: {
      default: `${name} — ${SITE_TAGLINE}`,
      template: `%s | ${name}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: name,
    icons: settings.favicon
      ? { icon: settings.favicon, apple: settings.favicon }
      : { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/brand/icon.svg", type: "image/svg+xml" }], apple: "/brand/apple-icon.png" },
    openGraph: { siteName: name, locale: "pt_BR", type: "website" },
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
