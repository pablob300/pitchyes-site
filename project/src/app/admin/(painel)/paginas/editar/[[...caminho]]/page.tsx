import { notFound } from "next/navigation";
import { ContentEditor } from "@/components/admin/content/ContentEditor";
import { SITE_CONTENT_PATH } from "@/content/site";
import { openDraft } from "@/lib/admin/content";
import { requireSession } from "@/lib/admin/session";
import { pathFromEditorSegments, isContentEditable } from "@/lib/content/pages";
import { resolveHome, resolveSite } from "@/lib/content/resolve";
import { homeSchema } from "@/lib/content/schema/home";

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

  return (
    <ContentEditor
      schema={homeSchema}
      pagePath={path}
      sitePath={SITE_CONTENT_PATH}
      inicial={{
        pagina: {
          rev: pagina.rev,
          resolved: resolveHome(pagina.data) as unknown as Record<string, unknown>,
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
