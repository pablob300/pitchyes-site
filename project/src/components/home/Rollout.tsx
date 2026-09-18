import { rollout } from "./content";
import styles from "./Rollout.module.css";

export function Rollout() {
  return (
    <section className="section" aria-labelledby="implantacao-title">
      <div className="container">
        <h2 id="implantacao-title" className={styles.title}>
          {rollout.title}
        </h2>
        <ol className={styles.timeline}>
          {rollout.steps.map((step) => (
            <li key={step.day} className={styles.step} data-live={step.live ?? false}>
              <span className={styles.dot} aria-hidden="true" />
              <p className={styles.day}>{step.day}</p>
              <h3>{step.title}</h3>
              <p className={styles.text}>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
