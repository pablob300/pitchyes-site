import type { Metadata } from "next";
import { company, socials } from "./company";
import { getPageMeta } from "./page-meta";
import { getSiteUrl, isIndexable } from "./site";

export const SITE_NAME = "PitchYes";
export const SITE_TAGLINE = "IA de voz para empresas";
/** <title> da home: começa pelo termo que a pessoa busca (SEO.md §2) e já traz a marca. */
export const HOME_TITLE = "IA de voz para empresas: agentes de ligação | PitchYes";
export const SITE_DESCRIPTION =
  "IA de voz que atende, qualifica, agenda, transfere e liga para clínicas, imobiliárias, concessionárias, seguradoras, faculdades, corretoras e franquias.";

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
      // Mesma regra do <title>: a home (e qualquer título que já traga a marca) não ganha
      // o sufixo — antes o og:title da home saía "PitchYes — … | PitchYes".
      title: title
        ? path === "/" || title.includes(SITE_NAME)
          ? title
          : `${title} | ${SITE_NAME}`
        : `${SITE_NAME} — ${SITE_TAGLINE}`,
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

/**
 * Como as pessoas procuram o que a PitchYes faz. Vai para `knowsAbout` (Organization) e
 * `keywords` (SoftwareApplication): é o que ajuda um buscador ou uma IA a ligar a marca a
 * "empresa de IA de voz", "URA com IA", "voicebot" — termos que o texto nem sempre repete.
 */
export const VOICE_AI_TOPICS = [
  "IA de voz",
  "agentes de voz com inteligência artificial",
  "agente de telefone com IA",
  "voicebot",
  "URA inteligente",
  "URA conversacional",
  "atendimento telefônico com IA",
  "ligações automáticas com IA",
  "prospecção ativa por telefone com IA",
  "SDR com IA de voz",
  "central de atendimento com IA",
  "cobrança por telefone com IA",
] as const;

/** `brand`: nome e logo de Configurações › Configuração geral (lib/settings.ts), quando houver. */
export function organizationSchema(brand?: { siteName: string | null; logo: { src: string } | null }): Thing {
  const url = getSiteUrl().origin;
  return {
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name: brand?.siteName ?? SITE_NAME,
    url,
    logo: `${url}${brand?.logo?.src ?? "/brand/pitchyes-logo.svg"}`,
    description: SITE_DESCRIPTION,
    slogan: SITE_TAGLINE,
    taxID: company.cnpj,
    areaServed: { "@type": "Country", name: "Brasil" },
    knowsAbout: VOICE_AI_TOPICS,
    // Official profiles and contact: lets search and AI engines tie them to this brand.
    sameAs: [...socials.map((s) => s.href), company.reclameAqui],
    email: company.email,
    telephone: company.phone.tel,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address.street,
      addressLocality: company.address.city,
      addressRegion: company.address.state,
      postalCode: company.address.postalCode,
      addressCountry: company.address.country,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: company.phone.tel,
      email: company.email,
      areaServed: "BR",
      availableLanguage: "pt-BR",
    },
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

/**
 * A plataforma como produto de software: é a entidade que responde a "qual empresa faz IA
 * de voz". Sem nota nem avaliação (não temos fonte para isso — SEO.md §1.5), então não
 * gera estrela no Google; serve para buscador e IA entenderem o que é vendido e por quanto.
 */
export function softwareApplicationSchema(offers?: Thing[]): Thing {
  const url = getSiteUrl().origin;
  return {
    "@type": "SoftwareApplication",
    "@id": `${url}/#software`,
    name: `${SITE_NAME} — plataforma de IA de voz`,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "IA de voz para ligações telefônicas",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    url,
    inLanguage: "pt-BR",
    keywords: VOICE_AI_TOPICS.join(", "),
    publisher: { "@id": `${url}/#organization` },
    ...(offers?.length ? { offers } : { offers: { "@type": "Offer", url: `${url}/planos`, priceCurrency: "BRL" } }),
  };
}

export function serviceSchema({
  name,
  description,
  path,
  serviceType = "IA de voz para ligações ativas e receptivas",
}: {
  name: string;
  description: string;
  path: string;
  serviceType?: string;
}): Thing {
  const url = getSiteUrl();
  return {
    "@type": "Service",
    "@id": `${new URL(path, url).toString()}#service`,
    name,
    description,
    serviceType,
    url: new URL(path, url).toString(),
    areaServed: { "@type": "Country", name: "Brasil" },
    availableLanguage: "pt-BR",
    provider: { "@id": `${url.origin}/#organization` },
    isRelatedTo: { "@id": `${url.origin}/#software` },
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
  const last = trail[trail.length - 1];
  return {
    "@type": "BreadcrumbList",
    ...(last ? { "@id": `${new URL(last.path, base).toString()}#breadcrumb` } : {}),
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: new URL(item.path, base).toString(),
    })),
  };
}

export function webPageSchema({
  title,
  description,
  path,
  type = "WebPage",
  dateModified,
  breadcrumb = false,
}: {
  title: string;
  description: string;
  path: string;
  /** AboutPage, ContactPage, CollectionPage… — diz ao buscador o papel da página. */
  type?: string;
  /** Data da última revisão do texto (a mesma do <lastmod> do sitemap). */
  dateModified?: string;
  /** Liga a página ao BreadcrumbList do mesmo @graph (breadcrumbSchema). */
  breadcrumb?: boolean;
}): Thing {
  const url = getSiteUrl();
  const pageUrl = new URL(path, url).toString();
  return {
    "@type": type,
    "@id": pageUrl,
    url: pageUrl,
    name: title,
    description,
    inLanguage: "pt-BR",
    isPartOf: { "@id": `${url.origin}/#website` },
    about: { "@id": `${url.origin}/#organization` },
    ...(dateModified ? { dateModified } : {}),
    ...(breadcrumb ? { breadcrumb: { "@id": `${pageUrl}#breadcrumb` } } : {}),
  };
}
