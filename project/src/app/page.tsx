import styles from "./page.module.css";

const swatches = [
  "--color-text",
  "--color-accent-gold",
  "--color-accent-burnt",
  "--color-bg-subtle",
  "--color-pastel-green",
  "--color-pastel-peach",
  "--color-pastel-gray",
  "--color-pastel-cream",
];

export default function Home() {
  return (
    <main className={`container ${styles.main}`}>
      <p className="eyebrow">PitchYes · Fase 0</p>
      <h1>
        IA que liga, <span className={styles.accent}>conversa</span> e vende.
      </h1>
      <p className={styles.lead}>
        Página de teste da Fase 0 — valida tokens do design system, tipografia e o deploy
        automático na Cloudflare.
      </p>
      <div className={styles.row}>
        <a className={`${styles.btn} ${styles.solid}`} href="#">Fale com nossa IA</a>
        <a className={`${styles.btn} ${styles.outline}`} href="#">Ver soluções</a>
      </div>
      <h2>Cores</h2>
      <div className={styles.swatches}>
        {swatches.map((v) => (
          <div key={v}>
            <div className={styles.swatch} style={{ background: `var(${v})` }} />
            <small>{v}</small>
          </div>
        ))}
      </div>
      <h3>Estatística</h3>
      <div className={styles.stat}>3x</div>
    </main>
  );
}
