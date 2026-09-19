import { ButtonLink } from "@/components/ui/Button";
import { TALK_TO_AI_HREF } from "@/lib/routes";
import { finalCta } from "./content";
import styles from "./FinalCta.module.css";

export function FinalCta() {
  return (
    <section className={styles.band} aria-labelledby="cta-final-title">
      <div className={`container ${styles.inner}`}>
        <h2 id="cta-final-title" data-reveal>
          {finalCta.title}
        </h2>
        <ButtonLink href={TALK_TO_AI_HREF} variant="dark" size="lg" data-reveal>
          {finalCta.cta} →
        </ButtonLink>
      </div>
    </section>
  );
}
