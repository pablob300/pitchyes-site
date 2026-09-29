import { ButtonLink } from "@/components/ui/Button";
import type { Hero as HeroContent } from "@/content/home.schema";
import { editFn } from "@/lib/content/edit";
import { rich } from "@/lib/content/richtext";
import { TALK_TO_AI_HREF } from "@/lib/routes";
import { AgentWidget } from "./AgentWidget";
import { RotatingWords } from "./RotatingWords";
import styles from "./Hero.module.css";

// Toda seção recebe `editable` (booleano), e não a função de marcação: metade das seções
// é "use client", e função não atravessa a fronteira servidor→cliente.
export function Hero({ content, editable }: { content: HeroContent; editable?: boolean }) {
  const edit = editFn(editable);
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <h1 data-reveal {...edit("hero.title")}>
            {content.title}{" "}
            <RotatingWords words={content.titleWords.map((w) => w.text)} editable={editable} />
          </h1>
          <p className="lead" data-reveal {...edit("hero.lead")}>
            {rich(content.lead)}
          </p>
          <div className={styles.actions} data-reveal>
            <ButtonLink href={TALK_TO_AI_HREF} size="lg" {...edit("hero.cta")}>
              {content.cta}
            </ButtonLink>
            <p className={styles.stat} {...edit("hero.stat")}>
              <strong>{content.stat.value}</strong> {content.stat.label}
            </p>
          </div>
        </div>
        <div data-reveal>
          <AgentWidget content={content.widget} editable={editable} />
        </div>
      </div>
    </section>
  );
}
