import type { FinalCta as FinalCtaContent } from "@/content/site";
import { editFn } from "@/lib/content/edit";
import styles from "./FinalCta.module.css";
import { TalkToAiButton } from "./TalkToAiButton";

// Atenção: esta faixa aparece em TODAS as páginas, então o texto dela é conteúdo global
// ("/_site" no editor), não conteúdo da home — mesmo tendo nascido no arquivo da home.
export function FinalCta({
  content,
  editable,
}: {
  content: FinalCtaContent;
  editable?: boolean;
}) {
  const edit = editFn(editable);
  return (
    <section className={styles.band} aria-labelledby="cta-final-title">
      <div className={`container ${styles.inner}`}>
        <h2 id="cta-final-title" data-reveal {...edit("@site.finalCta.title")}>
          {content.title}
        </h2>
        <TalkToAiButton size="lg" data-reveal {...edit("@site.finalCta.cta")}>
          {content.cta} →
        </TalkToAiButton>
      </div>
    </section>
  );
}
