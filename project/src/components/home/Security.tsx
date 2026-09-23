import { ButtonLink } from "@/components/ui/Button";
import type { Security as SecurityContent } from "@/content/home.schema";
import { editFn } from "@/lib/content/edit";
import { rich } from "@/lib/content/richtext";
import styles from "./Security.module.css";

// Shield outline for the certification badges (drawn in CSS colors via currentColor/tokens).
function Shield() {
  return (
    <svg className={styles.shield} viewBox="0 0 96 124" aria-hidden="true">
      <path d="M8 1.5h80a6.5 6.5 0 0 1 6.5 6.5v71c0 16-19 30-46.5 43.5C20.5 109 1.5 95 1.5 79V8A6.5 6.5 0 0 1 8 1.5Z" />
    </svg>
  );
}

export function Security({ content, editable }: { content: SecurityContent; editable?: boolean }) {
  const edit = editFn(editable);
  return (
    <section className="section" aria-labelledby="seguranca-title">
      <div className="container">
        <div className={styles.head} data-reveal>
          <h2 id="seguranca-title" {...edit("security.title")}>{content.title}</h2>
          <p {...edit("security.lead")}>{rich(content.lead)}</p>
        </div>

        <ul className={styles.grid}>
          {content.items.map((item, i) => (
            <li key={item.name} className={styles.cell} data-reveal {...edit(`security.items.${i}`)}>
              <div className={styles.badgeArea}>
                <div className={styles.badge}>
                  <Shield />
                  <div className={styles.badgeText}>
                    <span className={styles.status}>{item.status}</span>
                    <strong>{item.name}</strong>
                    <span className={styles.detail}>{item.detail}</span>
                  </div>
                </div>
              </div>
              <div className={styles.control}>
                <h3>{item.controlTitle}</h3>
                <p>{rich(item.controlText)}</p>
              </div>
            </li>
          ))}
        </ul>

        <ButtonLink href="/privacidade" variant="outline" size="lg" data-reveal {...edit("security.cta")}>
          {content.cta} →
        </ButtonLink>
      </div>
    </section>
  );
}
