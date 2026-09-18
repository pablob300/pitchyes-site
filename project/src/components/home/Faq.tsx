import { faq } from "./content";
import styles from "./Faq.module.css";

// Native exclusive accordion: <details name="faq"> keeps one answer open at a time.
export function Faq() {
  return (
    <section className="section" aria-labelledby="faq-title">
      <div className={`container ${styles.wrap}`}>
        <h2 id="faq-title">{faq.title}</h2>
        <div className={styles.list}>
          {faq.items.map((item) => (
            <details key={item.q} name="faq" className={styles.item}>
              <summary className={styles.q}>
                {item.q}
                <span className={styles.icon} aria-hidden="true" />
              </summary>
              <p className={styles.a}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
