"use client";

import { useRef, useState } from "react";
import { testimonials } from "./content";
import styles from "./CustomerVideos.module.css";

const { eyebrow, title, lead, items } = testimonials;

// Vertical (9:16) testimonial carousel; the caption below follows the active video.
export function CustomerVideos() {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLUListElement>(null);

  const select = (index: number) => {
    const next = (index + items.length) % items.length;
    setActive(next);
    const card = trackRef.current?.children[next] as HTMLElement | undefined;
    const track = trackRef.current;
    if (card && track) {
      track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
    }
  };

  const current = items[active];

  return (
    <section className="section" aria-labelledby="clientes-reais-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="clientes-reais-title">{title}</h2>
          <p className="lead">{lead}</p>
        </div>

        <div className={styles.slider}>
          <button type="button" className={styles.arrow} onClick={() => select(active - 1)} aria-label="Depoimento anterior">
            ‹
          </button>
          <ul ref={trackRef} className={styles.track}>
            {items.map((item, i) => (
              <li key={item.name}>
                <button
                  type="button"
                  className={styles.video}
                  data-active={i === active}
                  aria-pressed={i === active}
                  onClick={() => select(i)}
                >
                  <span className={styles.play} aria-hidden="true">▶</span>
                  <span className={styles.overlay}>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.role}>{item.role}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.arrow} onClick={() => select(active + 1)} aria-label="Próximo depoimento">
            ›
          </button>
        </div>

        <div className={styles.dots} aria-hidden="true">
          {items.map((item, i) => (
            <span key={item.name} data-active={i === active} />
          ))}
        </div>

        <figure className={styles.caption} aria-live="polite">
          {current.headline && <h3>{current.headline}</h3>}
          {current.quote ? (
            <blockquote>
              “{current.quote}” — {current.name}, {current.role}
            </blockquote>
          ) : (
            <figcaption>
              {current.name}, {current.role}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}
