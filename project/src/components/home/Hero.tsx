import { ButtonLink } from "@/components/ui/Button";
import { TALK_TO_AI_HREF } from "@/lib/routes";
import { AgentWidget } from "./AgentWidget";
import { hero } from "./content";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <h1 data-reveal>
            {hero.titleBefore}
            <span className="accent">{hero.titleAccent}</span>
            {hero.titleAfter}
          </h1>
          <p className="lead" data-reveal>
            {hero.lead}
          </p>
          <div className={styles.actions} data-reveal>
            <ButtonLink href={TALK_TO_AI_HREF} size="lg">
              {hero.cta}
            </ButtonLink>
            <p className={styles.stat}>
              <strong>{hero.stat.value}</strong> {hero.stat.label}
            </p>
          </div>
        </div>
        <div data-reveal>
          <AgentWidget />
        </div>
      </div>
    </section>
  );
}
