import { notFound } from "next/navigation";
import { ContentEditor } from "@/components/admin/content/ContentEditor";
import { innerPageDefaults } from "@/content/registry";
import { SITE_CONTENT_PATH } from "@/content/site";
import { openDraft } from "@/lib/admin/content";
import { requireSession } from "@/lib/admin/session";
import { pathFromEditorSegments, isContentEditable } from "@/lib/content/pages";
import { innerEditorView, resolveInnerPage } from "@/lib/content/inner";
import { resolveHome, resolveSite } from "@/lib/content/resolve";
import { homeSchema } from "@/lib/content/schema/home";
import { buildInnerSchema } from "@/lib/content/schema/inner";
import { getPage } from "@/lib/routes";

// Tela do editor visual. O trabalho pesado é do cliente (iframe + gaveta); aqui só
// abrimos o rascunho e resolvemos o conteúdo que a gaveta vai mostrar.
export const dynamic = "force-dynamic";

export default async function EditarConteudo({
  params,
}: PageProps<"/admin/paginas/editar/[[...caminho]]">) {
  const { caminho } = await params;
  const path = pathFromEditorSegments(caminho);
  if (!isContentEditable(path)) notFound();

  const session = await requireSession();
  const actor = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };

  // Abrir a tela já cria o rascunho, copiado do que está publicado: quem começa a editar
  // continua de onde o site está, não de uma página em branco.
  const [pagina, site] = await Promise.all([
    openDraft(path, actor),
    openDraft(SITE_CONTENT_PATH, actor),
  ]);

  // Home: schema escrito à mão. Página interna: schema gerado a partir dos blocos dela, mais
  // os blocos globais da home (faixa final), que aparecem em todas as páginas. A lista de
  // clientes também é global, mas só entra na gaveta da página que mostra os logos.
  const defaults = path === "/" ? null : innerPageDefaults(path);
  const schema = defaults
    ? {
        ...buildInnerSchema(path, getPage(path)?.title ?? path, defaults),
      }
    : homeSchema;
  if (defaults) {
    const hasLogos = defaults.blocks.some((b) => b.kind === "logos");
    schema.sections = [
      ...schema.sections,
      ...homeSchema.sections.filter((s) => s.scope === "site" && (s.key !== "clients" || hasLogos)),
    ];
  }
  const resolvedPage = defaults
    ? innerEditorView(resolveInnerPage(defaults, pagina.data))
    : (resolveHome(pagina.data) as unknown as Record<string, unknown>);

  return (
    <ContentEditor
      schema={schema}
      pagePath={path}
      sitePath={SITE_CONTENT_PATH}
      inicial={{
        pagina: {
          rev: pagina.rev,
          resolved: resolvedPage,
          override: (pagina.data ?? {}) as Record<string, unknown>,
        },
        site: {
          rev: site.rev,
          resolved: resolveSite(site.data) as unknown as Record<string, unknown>,
          override: (site.data ?? {}) as Record<string, unknown>,
        },
      }}
      editadoPor={pagina.updatedByName}
      trancadoPor={pagina.lockedByName}
    />
  );
}
