import { PageHeadline } from "@/components/PageHeadline";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
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
  );
}
