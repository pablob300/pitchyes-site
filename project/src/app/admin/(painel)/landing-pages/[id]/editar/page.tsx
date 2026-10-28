import { notFound } from "next/navigation";
import { ContentEditor } from "@/components/admin/content/ContentEditor";
import { landingBlockTemplates } from "@/content/landing/modelo";
import { SITE_CONTENT_PATH } from "@/content/site";
import { openDraft } from "@/lib/admin/content";
import { requireSession } from "@/lib/admin/session";
import { landingDoc } from "@/lib/content/landing";
import { resolveSite } from "@/lib/content/resolve";
import { homeSchema } from "@/lib/content/schema/home";
import { kindLabel } from "@/lib/content/schema/inner";
import { buildLandingSchema } from "@/lib/content/schema/landing";
import { getLandingById, landingContentPath, landingPath } from "@/lib/landing-db";

// Editor visual de uma landing page: o mesmo editor das páginas do site, com a estrutura
// liberada (adicionar e remover blocos) e a pré-visualização sem o menu do site.
export const dynamic = "force-dynamic";

export default async function EditarLanding({ params }: PageProps<"/admin/landing-pages/[id]/editar">) {
  const { id } = await params;
  const page = await getLandingById(id);
  if (!page) notFound();

  const session = await requireSession();
  const actor = { id: session.user.id, name: session.user.name, email: session.user.email };
  const path = landingContentPath(page.id);
  const [pagina, site] = await Promise.all([openDraft(path, actor), openDraft(SITE_CONTENT_PATH, actor)]);

  const doc = landingDoc(pagina.data);
  const schema = buildLandingSchema(path, page.name, doc);
  // A parede de clientes é a lista global do site: aparece na gaveta quando a página a usa.
  const usesClients = Object.values(doc.blocos).some((b) => b?.kind === "logos" && b.source !== "proprio");
  if (usesClients) schema.sections.push(...homeSchema.sections.filter((s) => s.key === "clients"));
  // Idem para a lista de setores, quando um bloco de cards está ligado a ela.
  const usesSectors = Object.values(doc.blocos).some((b) => b?.kind === "features" && b.source === "setores");
  if (usesSectors) schema.sections.push(...homeSchema.sections.filter((s) => s.key === "sectors"));

  const paleta = Object.keys(landingBlockTemplates).map((kind) => ({
    kind,
    label: kindLabel(kind as keyof typeof landingBlockTemplates),
  }));

  return (
    <ContentEditor
      schema={schema}
      pagePath={path}
      sitePath={SITE_CONTENT_PATH}
      inicial={{
        pagina: {
          rev: pagina.rev,
          resolved: doc as unknown as Record<string, unknown>,
          override: {},
        },
        site: {
          rev: site.rev,
          resolved: resolveSite(site.data) as unknown as Record<string, unknown>,
          override: (site.data ?? {}) as Record<string, unknown>,
        },
      }}
      editadoPor={pagina.updatedByName}
      trancadoPor={pagina.lockedByName}
      landing={{
        preview: `/editor/conteudo/${page.id}`,
        voltar: { href: "/admin/landing-pages", label: "Landing Pages" },
        publicUrl: page.active ? landingPath(page.slug) : null,
        paleta,
        modelos: landingBlockTemplates,
      }}
    />
  );
}
