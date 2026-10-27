import type { Metadata, MetadataRoute } from "next";
import robots from "@/app/robots";
import { GeneralSettingsForm } from "@/components/admin/settings/GeneralSettingsForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { pageMetadata, SITE_NAME } from "@/lib/seo";
import { getSiteSettings } from "@/lib/settings";

// Configurações › Configuração geral: nome, logo, favicon, robots.txt (só leitura) e GTM.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Configurações",
    description: "Área interna da PitchYes: nome, marca e etiquetas do site.",
    path: "/admin/configuracoes",
    noindex: true,
  });
}

/** O mesmo texto que /robots.txt entrega, montado a partir de app/robots.ts. */
function robotsText(config: MetadataRoute.Robots): string {
  const lines: string[] = [];
  const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
  for (const rule of rules) {
    for (const agent of [rule.userAgent ?? "*"].flat()) lines.push(`User-Agent: ${agent}`);
    for (const allow of [rule.allow ?? []].flat()) lines.push(`Allow: ${allow}`);
    for (const disallow of [rule.disallow ?? []].flat()) lines.push(`Disallow: ${disallow}`);
    lines.push("");
  }
  if (config.host) lines.push(`Host: ${config.host}`);
  for (const sitemap of [config.sitemap ?? []].flat()) lines.push(`Sitemap: ${sitemap}`);
  return lines.join("\n").trim();
}

export default async function Page() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHeader
        eyebrow="Configurações"
        title="Configuração geral"
        description="Identidade do site e etiquetas de medição. Vale para o site e para as landing pages."
      />
      <GeneralSettingsForm inicial={settings} padraoNome={SITE_NAME} robots={robotsText(robots())} />
    </>
  );
}
