import { useCases } from "./content";
import styles from "./UseCases.module.css";

export function UseCases() {
  return (
    <section className="section" aria-labelledby="casos-de-uso-title">
      <div className="container">
        <h2 id="casos-de-uso-title" className={styles.title} data-reveal>
          {useCases.title}
        </h2>
        <ul className={styles.grid}>
          {useCases.items.map((item) => (
            <li key={item.title} className={styles.card} data-reveal>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
