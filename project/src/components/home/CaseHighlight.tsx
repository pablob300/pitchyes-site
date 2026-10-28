import { CaseStory } from "@/components/blocks/CaseStory";
import type { CaseHighlight as CaseHighlightContent } from "@/content/home.schema";
import { editFn, scoped } from "@/lib/content/edit";

// Case em destaque acima dos depoimentos: o mesmo container de /clientes/cases (vídeo à
// esquerda, texto à direita). Sem botão: logo depois vêm os depoimentos em vídeo.
export function CaseHighlight({ content, editable }: { content: CaseHighlightContent; editable?: boolean }) {
  return (
    <section className="section" aria-label={content.title}>
      <div className="container">
        <CaseStory item={content} e={scoped(editFn(editable), "caseHighlight")} heading="h2" />
      </div>
    </section>
  );
}
