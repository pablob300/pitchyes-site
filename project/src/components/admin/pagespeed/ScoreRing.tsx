import { scoreRating } from "@/lib/admin/pagespeed/report";
import styles from "./PageSpeed.module.css";

// Anel de nota no formato do PageSpeed (0–100), colorido pela faixa do Google.
// SVG estático, renderizado no servidor.

const R = 28;
const C = 2 * Math.PI * R;

export function ScoreRing({ label, score, delta }: { label: string; score: number | null; delta?: number | null }) {
  const filled = score === null ? 0 : (score / 100) * C;
  return (
    <div className={styles.ring} data-rating={scoreRating(score) ?? undefined}>
      <svg className={styles.ringSvg} viewBox="0 0 64 64" role="img" aria-label={`${label}: ${score ?? "sem nota"}`}>
        <circle className={styles.ringTrack} cx="32" cy="32" r={R} fill="none" strokeWidth="5" />
        <circle
          className={styles.ringValue}
          cx="32"
          cy="32"
          r={R}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${C}`}
          transform="rotate(-90 32 32)"
        />
        <text className={styles.ringNumber} x="32" y="38" textAnchor="middle">
          {score ?? "—"}
        </text>
      </svg>
      <span className={styles.ringLabel}>{label}</span>
      {delta ? (
        <span className={styles.delta} data-sinal={delta > 0 ? "mais" : "menos"} title="Variação desde a análise anterior desta página">
          {delta > 0 ? `+${delta}` : delta}
        </span>
      ) : null}
    </div>
  );
}

export function ScoreChip({ score, title }: { score: number | null; title: string }) {
  return (
    <span className={styles.chip} data-rating={scoreRating(score) ?? undefined} title={title}>
      {score ?? "—"}
    </span>
  );
}
