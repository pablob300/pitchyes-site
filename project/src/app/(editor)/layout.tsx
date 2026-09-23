import type { Metadata } from "next";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { getSiteContent } from "@/lib/content/resolve";
import { requireSession } from "@/lib/admin/session";
import { can } from "@/lib/admin/users";
import { forbidden } from "./forbidden";

// Pré-visualização do RASCUNHO, servida dentro do iframe do editor.
//
// Renderiza a moldura e os mesmos componentes do site público — é o que garante que o
// editor mostra o site, e não uma imitação dele. A diferença é toda aqui: o conteúdo vem
// do rascunho, a rota é dinâmica e nunca entra em cache, e os componentes emitem os
// atributos data-edit.
//
// Esta rota fica FORA de /admin, então quem a protege é o proxy (matcher "/editor/:path*")
// mais o requireSession() abaixo. O proxy só confere a assinatura do cookie, não a
// revogação — por isso a checagem é refeita aqui, contra o banco.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function EditorLayout({ children }: LayoutProps<"/">) {
  const session = await requireSession();
  if (!can(session.user, "conteudo.editar")) return forbidden();

  return (
    <SiteChrome content={await getSiteContent("rascunho")} editable>
      {children}
    </SiteChrome>
  );
}
