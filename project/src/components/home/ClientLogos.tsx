import { clientLogos } from "./content";
import styles from "./ClientLogos.module.css";

export function ClientLogos() {
  return (
    <section className={styles.section} aria-labelledby="clientes-title">
      <div className="container">
        <h2 id="clientes-title" className={styles.title} data-reveal>
          {clientLogos.title}
        </h2>
        <ul className={styles.grid}>
          {clientLogos.names.map((name) => (
            <li key={name} className={styles.logo} data-reveal>
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
