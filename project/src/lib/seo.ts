import type { Metadata } from "next";
import { getPageMeta } from "./page-meta";
import { getSiteUrl, isIndexable } from "./site";

export const SITE_NAME = "PitchYes";
export const SITE_TAGLINE = "IA de voz para empresas";
export const SITE_DESCRIPTION =
  "Agentes de voz com IA que fazem e recebem ligações em escala: prospecção, atendimento e agendamento para saúde, seguros e serviços financeiros.";

/**
 * Metadata for one page. Every page must go through here so canonical, Open Graph and
 * robots stay consistent — see SEO.md ("Checklist para cada página").
 *
 * `noindex` is for pages with no real content yet (they stay crawlable via `follow`,
 * so link equity still flows). The whole site is noindex until it runs on a real domain.
 */
export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
}: {
  title?: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const indexable = isIndexable() && !noindex;
  const url = new URL(path, getSiteUrl()).toString();
  // A home é a única página cujo título já é o nome do site: nela o sufixo
  // "| PitchYes" do layout viraria repetição, então o título vai como absoluto.
  const titleValue = title ? (path === "/" ? { absolute: title } : title) : undefined;
  return {
    // Only set `title` when the page has one: passing undefined would blank out the
    // layout's default title instead of falling back to it.
    ...(titleValue ? { title: titleValue } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      title: title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`,
      description,
      url,
      siteName: SITE_NAME,
      locale: "pt_BR",
      type: "website",
      // Explicit: a route that declares `openGraph` stops inheriting the
      // app/opengraph-image.jpg file convention from the root segment.
      images: [{ url: "/opengraph-image.jpg", width: 1200, height: 630, alt: SITE_DESCRIPTION }],
    },
    twitter: { card: "summary_large_image", images: ["/twitter-image.jpg"] },
    robots: { index: indexable, follow: isIndexable() },
  };
}

/**
 * Metadados da página já com o que foi editado no Page Editor por cima. É esta a
 * função que as páginas chamam: `pageMetadata()` continua existindo para quem não
 * precisa do banco (404, área interna).
 */
export async function pageMetadataWithOverrides(args: {
  title?: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Promise<Metadata> {
  const override = await getPageMeta(args.path);
  const base = pageMetadata({
    title: override?.title || args.title,
    description: override?.description || args.description,
    path: args.path,
    noindex: args.noindex || override?.noindex === 1,
  });

  if (!override) return base;

  const image = override.image_url
    ? [{ url: override.image_url, width: 1200, height: 630, alt: override.image_alt || SITE_DESCRIPTION }]
    : undefined;

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      ...(override.og_title ? { title: override.og_title } : {}),
      ...(override.og_description ? { description: override.og_description } : {}),
      ...(image ? { images: image } : {}),
    },
    ...(override.image_url ? { twitter: { card: "summary_large_image", images: [override.image_url] } } : {}),
  };
}

type Thing = Record<string, unknown>;

export function organizationSchema(): Thing {
  const url = getSiteUrl().origin;
  return {
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name: SITE_NAME,
    url,
    logo: `${url}/brand/pitchyes-logo.svg`,
    description: SITE_DESCRIPTION,
    // TODO(seo): add sameAs (LinkedIn, X) and contactPoint once the profiles exist.
  };
}

export function webSiteSchema(): Thing {
  const url = getSiteUrl().origin;
  return {
    "@type": "WebSite",
    "@id": `${url}/#website`,
    name: SITE_NAME,
    url,
    inLanguage: "pt-BR",
    publisher: { "@id": `${url}/#organization` },
  };
}

export function serviceSchema({ name, description, path }: { name: string; description: string; path: string }): Thing {
  const url = getSiteUrl();
  return {
    "@type": "Service",
    "@id": `${new URL(path, url).toString()}#service`,
    name,
    description,
    serviceType: "IA de voz para ligações ativas e receptivas",
    areaServed: "BR",
    inLanguage: "pt-BR",
    provider: { "@id": `${url.origin}/#organization` },
  };
}

/** Depoimento em vídeo hospedado no YouTube (Shorts do canal da PitchYes). */
export function videoSchema({
  company,
  videoId,
  thumb,
  seconds,
  published,
}: {
  company: string;
  videoId: string;
  thumb: string;
  seconds: number;
  published: string;
}): Thing {
  const url = getSiteUrl();
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return {
    "@type": "VideoObject",
    name: `Depoimento da ${company} sobre a PitchYes`,
    description: `${company} conta o que mudou na operação depois de automatizar ligações com a IA de voz da PitchYes.`,
    thumbnailUrl: new URL(thumb, url).toString(),
    uploadDate: published,
    duration: `PT${minutes ? `${minutes}M` : ""}${rest}S`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    contentUrl: `https://www.youtube.com/shorts/${videoId}`,
    inLanguage: "pt-BR",
    publisher: { "@id": `${url.origin}/#organization` },
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]): Thing {
  const base = getSiteUrl();
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: new URL(item.path, base).toString(),
    })),
  };
}

export function webPageSchema({ title, description, path }: { title: string; description: string; path: string }): Thing {
  const url = getSiteUrl();
  return {
    "@type": "WebPage",
    "@id": new URL(path, url).toString(),
    name: title,
    description,
    inLanguage: "pt-BR",
    isPartOf: { "@id": `${url.origin}/#website` },
  };
}
