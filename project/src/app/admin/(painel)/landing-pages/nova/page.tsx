import type { Metadata } from "next";
import { NewLanding } from "@/components/admin/landing/NewLanding";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { pageMetadata } from "@/lib/seo";

// Landing Pages › Criar página: duplica o modelo padrão (content/landing/modelo.ts) com
// nome e endereço novos e abre direto no editor visual.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Criar landing page",
    description: "Área interna da PitchYes: nova landing page a partir do modelo padrão.",
    path: "/admin/landing-pages/nova",
    noindex: true,
  });
}

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Landing Pages"
        title="Criar página"
        description="A página nasce como cópia do modelo padrão (topo com formulário, números, comparativo, vídeo, depoimentos, perguntas e chamada final). Depois é só ajustar no editor: trocar textos e imagens, adicionar, remover e reordenar blocos."
      />
      <NewLanding />
    </>
  );
}
