import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { LandingPage } from "@/components/landing/LandingPage";
import { withSiteLists } from "@/lib/content/inner";
import { resolveLanding } from "@/lib/content/landing";
import { getSiteContent } from "@/lib/content/resolve";
import { toPlainText } from "@/lib/content/richtext";
import { findLandingBySlug, getLandingContent, landingPath } from "@/lib/landing-db";
import { breadcrumbSchema, organizationSchema, pageMetadata, webPageSchema } from "@/lib/seo";
import { getSiteSettings } from "@/lib/settings";

// Landing page pública. Criada e editada no painel (Landing Pages), sem deploy.
//
// ISR: a página é montada uma vez e servida do cache; publicar no editor, ligar/desligar ou
// trocar o endereço revalida na hora (api/admin/conteudo e api/admin/landing-pages). A
// revalidação por tempo é só a rede de segurança.
export const revalidate = 3600;

/** Nenhuma pré-gerada no build (as páginas vivem no banco): todas entram no cache na 1ª visita. */
export function generateStaticParams() {
  return [];
}

async function load(slug: string) {
  const found = await findLandingBySlug(slug);
  if (!found) notFound();
  // Endereço antigo (o slug foi trocado no painel): 301 para o atual.
  if ("redirectTo" in found) permanentRedirect(landingPath(found.redirectTo));
  if (!found.page.active) notFound();
  return found.page;
}

export async function generateMetadata({ params }: PageProps<"/conteudo/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await load(slug);
  return pageMetadata({
    title: page.seo_title,
    description: page.seo_description,
    path: landingPath(page.slug),
    noindex: page.noindex === 1,
  });
}

export default async function Page({ params }: PageProps<"/conteudo/[slug]">) {
  const { slug } = await params;
  const page = await load(slug);
  const [data, site, settings] = await Promise.all([
    getLandingContent(page.id, "publicado"),
    getSiteContent("publicado"),
    getSiteSettings(),
  ]);
  // A parede de clientes é a lista global do site (/_site), a mesma da home.
  const blocks = resolveLanding(data).map((item) => ({ ...item, block: withSiteLists(item.block, site) }));
  const path = landingPath(page.slug);
  const faq = blocks.flatMap(({ block }) => (block.kind === "faq" ? block.items : []));

  return (
    <>
      <JsonLd
        graph={[
          organizationSchema(settings),
          webPageSchema({
            title: page.seo_title,
            description: page.seo_description,
            path,
            dateModified: page.updated_at.slice(0, 10),
            breadcrumb: true,
          }),
          breadcrumbSchema([
            { name: "Início", path: "/" },
            { name: page.name, path },
          ]),
          ...(faq.length
            ? [
                {
                  "@type": "FAQPage",
                  mainEntity: faq.map((item) => ({
                    "@type": "Question",
                    name: item.q,
                    acceptedAnswer: { "@type": "Answer", text: toPlainText(item.a) },
                  })),
                },
              ]
            : []),
        ]}
      />
      <LandingPage blocks={blocks} slug={page.slug} logo={settings.logo} />
    </>
  );
}
