import { ButtonLink } from "@/components/ui/Button";
import { security } from "./content";
import styles from "./Security.module.css";

export function Security() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="seguranca-title">
      <div className="container">
        <div className="section-head" data-reveal>
          <h2 id="seguranca-title">{security.title}</h2>
          <p className="lead">{security.lead}</p>
        </div>

        <ul className={styles.certs}>
          {security.certifications.map((c) => (
            <li key={c.name} className={styles.cert} data-reveal>
              <span className={styles.audited}>Auditado</span>
              <strong>{c.name}</strong>
              <span className={styles.detail}>{c.detail}</span>
            </li>
          ))}
        </ul>

        <ul className={styles.controls}>
          {security.controls.map((c) => (
            <li key={c.title} data-reveal>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </li>
          ))}
        </ul>

        <ButtonLink href="/privacidade" variant="outline" size="lg" data-reveal>
          {security.cta} →
        </ButtonLink>
      </div>
    </section>
  );
}
