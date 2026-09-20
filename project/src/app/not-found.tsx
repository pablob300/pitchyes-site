import type { Metadata } from "next";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { PageHeadline } from "@/components/PageHeadline";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <SiteChrome>
      <PageHeadline
        eyebrow="Erro 404"
        title="Página não encontrada."
        description="O endereço pode ter mudado ou a página não existe mais."
      >
        <div>
          <ButtonLink href="/" variant="dark">
            Voltar para o início
          </ButtonLink>
        </div>
      </PageHeadline>
    </SiteChrome>
  );
}
