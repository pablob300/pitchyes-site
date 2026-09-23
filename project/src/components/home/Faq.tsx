import type { Faq as FaqContent } from "@/content/home.schema";
import { editFn } from "@/lib/content/edit";
import styles from "./Faq.module.css";

// Native exclusive accordion: <details name="faq"> keeps one answer open at a time.
export function Faq({ content, editable }: { content: FaqContent; editable?: boolean }) {
  const edit = editFn(editable);
  return (
    <section className="section" aria-labelledby="faq-title">
      <div className={`container ${styles.wrap}`}>
        <h2 id="faq-title" data-reveal {...edit("faq.title")}>
          {content.title}
        </h2>
        <div className={styles.list}>
          {content.items.map((item, i) => (
            <details key={item.q} name="faq" className={styles.item} data-reveal {...edit(`faq.items.${i}`)}>
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
