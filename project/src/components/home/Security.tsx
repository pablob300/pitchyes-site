import { ButtonLink } from "@/components/ui/Button";
import { security } from "./content";
import styles from "./Security.module.css";

// Shield outline for the certification badges (drawn in CSS colors via currentColor/tokens).
function Shield() {
  return (
    <svg className={styles.shield} viewBox="0 0 96 124" aria-hidden="true">
      <path d="M8 1.5h80a6.5 6.5 0 0 1 6.5 6.5v71c0 16-19 30-46.5 43.5C20.5 109 1.5 95 1.5 79V8A6.5 6.5 0 0 1 8 1.5Z" />
    </svg>
  );
}

export function Security() {
  return (
    <section className="section" aria-labelledby="seguranca-title">
      <div className="container">
        <div className={styles.head} data-reveal>
          <h2 id="seguranca-title">{security.title}</h2>
          <p>{security.lead}</p>
        </div>

        <ul className={styles.grid}>
          {security.certifications.map((cert, i) => {
            const control = security.controls[i];
            return (
              <li key={cert.name} className={styles.cell} data-reveal>
                <div className={styles.badgeArea}>
                  <div className={styles.badge}>
                    <Shield />
                    <div className={styles.badgeText}>
                      <span className={styles.status}>{cert.status}</span>
                      <strong>{cert.name}</strong>
                      <span className={styles.detail}>{cert.detail}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.control}>
                  <h3>{control.title}</h3>
                  <p>{control.text}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <ButtonLink href="/privacidade" variant="outline" size="lg" data-reveal>
          {security.cta} →
        </ButtonLink>
      </div>
    </section>
  );
}
