"use client";

import { useRef } from "react";
import { gsap, motion, useGSAP } from "@/lib/gsap";
import { latency } from "./content";
import styles from "./Latency.module.css";

const max = Math.max(...latency.rows.map((r) => r.value));
const format = (n: number) => n.toLocaleString("pt-BR");

export function Latency() {
  const container = useRef<HTMLElement>(null);

  // Bar width and number grow from 0 together, each row with its own duration.
  // Server HTML carries the final values, so no-JS and reduced-motion users see them as-is.
  useGSAP(
    () => {
      const mm = gsap.matchMedia(container.current ?? undefined);
      mm.add(motion.noPreference, () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: container.current, start: motion.counter.start, once: true },
        });
        latency.rows.forEach((row, i) => {
          const numbers = gsap.utils.toArray<HTMLElement>(`[data-num="${i}"]`);
          const counter = { value: 0 };
          const render = () => {
            const text = format(Math.round(counter.value));
            numbers.forEach((n) => (n.textContent = text));
          };
          render();
          tl.fromTo(
            `[data-fill="${i}"]`,
            { width: "0%" },
            { width: `${(row.value / max) * 100}%`, duration: row.duration, ease: motion.counter.ease },
            0,
          ).to(
            counter,
            { value: row.value, duration: row.duration, ease: motion.counter.ease, onUpdate: render },
            0,
          );
        });
      });
      return () => mm.revert();
    },
    { scope: container },
  );

  return (
    <section ref={container} className="section" aria-labelledby="latencia-title">
      <div className="container">
        <h2 id="latencia-title" className={styles.title} data-reveal>
          {latency.title}
        </h2>
        <dl className={styles.rows}>
          {latency.rows.map((row, i) => (
            <div key={row.label} className={styles.row} data-highlight={row.highlight}>
              <dt>{row.label}</dt>
              <dd className={styles.track}>
                {/* Label drawn twice: dark over the empty track, light inside the fill,
                    so the text changes color exactly where the growing bar passes it. */}
                <span className={styles.label}>
                  <span data-num={i}>{format(row.value)}</span>
                  {latency.unit}
                </span>
                <span
                  className={styles.fill}
                  data-fill={i}
                  style={{ width: `${(row.value / max) * 100}%` }}
                  aria-hidden="true"
                >
                  <span className={styles.label}>
                    <span data-num={i}>{format(row.value)}</span>
                    {latency.unit}
                  </span>
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
