import { latency } from "./content";
import styles from "./Latency.module.css";

export function Latency() {
  return (
    <section className="section" aria-labelledby="latencia-title">
      <div className="container">
        <h2 id="latencia-title" className={styles.title}>
          {latency.title}
        </h2>
        <dl className={styles.rows}>
          {latency.rows.map((row) => (
            <div key={row.label} className={styles.row}>
              <dt>{row.label}</dt>
              <dd className={styles.track}>
                <span
                  className={styles.bar}
                  data-highlight={row.highlight}
                  style={{ width: `${row.width}%` }}
                >
                  {row.value}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
