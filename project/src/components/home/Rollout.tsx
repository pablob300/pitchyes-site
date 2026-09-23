import type { Rollout as RolloutContent } from "@/content/home.schema";
import { editFn } from "@/lib/content/edit";
import { rich } from "@/lib/content/richtext";
import styles from "./Rollout.module.css";

export function Rollout({ content, editable }: { content: RolloutContent; editable?: boolean }) {
  const edit = editFn(editable);
  return (
    <section className="section" aria-labelledby="implantacao-title">
      <div className="container">
        <h2 id="implantacao-title" className={styles.title} data-reveal {...edit("rollout.title")}>
          {content.title}
        </h2>
        <ol className={styles.timeline}>
          {content.steps.map((step, i) => (
            <li
              key={step.day}
              className={styles.step}
              data-live={step.live ?? false}
              data-reveal
              {...edit(`rollout.steps.${i}`)}
            >
              <span className={styles.dot} aria-hidden="true" />
              <p className={styles.day}>{step.day}</p>
              <h3>{step.title}</h3>
              <p className={styles.text}>{rich(step.text)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
