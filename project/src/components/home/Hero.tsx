import { ButtonLink } from "@/components/ui/Button";
import type { Hero as HeroContent } from "@/content/home.schema";
import { editFn } from "@/lib/content/edit";
import { rich } from "@/lib/content/richtext";
import { TALK_TO_AI_HREF } from "@/lib/routes";
import { AgentWidget } from "./AgentWidget";
import { HeroSync } from "./HeroSync";
import { RotatingWords } from "./RotatingWords";
import styles from "./Hero.module.css";

// Toda seção recebe `editable` (booleano), e não a função de marcação: metade das seções
// é "use client", e função não atravessa a fronteira servidor→cliente.
export function Hero({ content, editable }: { content: HeroContent; editable?: boolean }) {
  const edit = editFn(editable);
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.grid}`}>
        {/* A palavra do h1 e o card do player trocam juntos (HeroSync não gera elemento). */}
        <HeroSync count={content.titleWords.length}>
        <div className={styles.copy}>
          {/* Título, texto e botão do topo aparecem já pintados, sem `data-reveal`: o h1 é o
              maior elemento da primeira tela (LCP) e, escondido até o GSAP hidratar, atrasava
              o LCP e o Speed Index em ~2 s no celular (PageSpeed, 25/10/2026). A revelação
              continua no player ao lado e em todas as seções abaixo. */}
          <h1 {...edit("hero.title")}>
            {content.title}{" "}
            <RotatingWords words={content.titleWords.map((w) => w.text)} editable={editable} />
          </h1>
          <p className="lead" {...edit("hero.lead")}>
            {rich(content.lead)}
          </p>
          <div className={styles.actions}>
            <ButtonLink href={TALK_TO_AI_HREF} size="lg" {...edit("hero.cta")}>
              {content.cta}
            </ButtonLink>
            <p className={styles.stat} {...edit("hero.stat")}>
              <strong>{content.stat.value}</strong> {content.stat.label}
            </p>
          </div>
        </div>
        <div data-reveal>
          <AgentWidget
            content={content.widget}
            agents={content.titleWords.map((w) => ({ name: w.text, audio: w.audio }))}
            editable={editable}
          />
        </div>
        </HeroSync>
      </div>
    </section>
  );
}
