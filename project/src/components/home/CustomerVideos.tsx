"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { editFn } from "@/lib/content/edit";
import styles from "./CustomerVideos.module.css";

/**
 * Só os campos que o carrossel realmente desenha. `seconds` e `published` ficam de fora
 * de propósito: alimentam o VideoObject no JSON-LD, que é montado no servidor, e mandar
 * os dois para o cliente só engordaria o payload do RSC.
 */
export type VideoCard = {
  company: string;
  videoId: string;
  thumb: string;
  person?: string;
  role?: string;
  headline?: string;
  quote?: string;
};

export type VideosContent = {
  eyebrow: string;
  title: string;
  lead: string;
  items: VideoCard[];
};

// Carrossel de depoimentos em vídeo (Shorts do canal da PitchYes), em 9:16.
// A capa é servida pelo próprio site: nada é pedido ao YouTube antes de a pessoa dar play,
// e só então o iframe do youtube-nocookie entra na página.
export function CustomerVideos({
  content,
  editable,
}: {
  content: VideosContent;
  editable?: boolean;
}) {
  const { eyebrow, title, lead, items } = content;
  const edit = editFn(editable);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState<number | null>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  const select = (index: number, play = false) => {
    const next = (index + items.length) % items.length;
    setActive(next);
    setPlaying(play ? next : null);
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
        <div className="section-head" data-reveal>
          <p className="eyebrow" {...edit("testimonials.eyebrow")}>{eyebrow}</p>
          <h2 id="clientes-reais-title" {...edit("testimonials.title")}>{title}</h2>
          <p className="lead" {...edit("testimonials.lead")}>{lead}</p>
        </div>

        <div className={styles.slider} data-reveal {...edit("testimonials.items")}>
          <button type="button" className={styles.arrow} onClick={() => select(active - 1)} aria-label="Depoimento anterior">
            ‹
          </button>
          <ul ref={trackRef} className={styles.track}>
            {items.map((item, i) => (
              <li key={item.videoId} {...edit(`testimonials.items.${i}`)}>
                {playing === i ? (
                  <div className={styles.video} data-active="true">
                    <iframe
                      className={styles.frame}
                      src={`https://www.youtube-nocookie.com/embed/${item.videoId}?autoplay=1&rel=0&modestbranding=1`}
                      title={`Depoimento da ${item.company} sobre a PitchYes`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.video}
                    data-active={i === active}
                    onClick={() => select(i, true)}
                    aria-label={`Assistir ao depoimento da ${item.company}`}
                  >
                    <Image
                      className={styles.thumb}
                      src={item.thumb}
                      alt={`Depoimento em vídeo da ${item.company} sobre a PitchYes`}
                      width={540}
                      height={960}
                      loading="lazy"
                      sizes="(max-width: 640px) 62vw, (max-width: 1024px) 38vw, 300px"
                    />
                    <span className={styles.play} aria-hidden="true" />
                    <span className={styles.overlay}>
                      <span className={styles.name}>{item.company}</span>
                      <span className={styles.role}>{item.person ? `${item.person}, ${item.role}` : "Depoimento em vídeo"}</span>
                    </span>
                  </button>
                )}
              </li>
            ))}
          </ul>
          <button type="button" className={styles.arrow} onClick={() => select(active + 1)} aria-label="Próximo depoimento">
            ›
          </button>
        </div>

        <div className={styles.dots} aria-hidden="true">
          {items.map((item, i) => (
            <span key={item.videoId} data-active={i === active} />
          ))}
        </div>

        <figure className={styles.caption} aria-live="polite" data-reveal>
          {current.headline && <h3>{current.headline}</h3>}
          {current.quote ? (
            <blockquote>
              “{current.quote}”{current.person ? ` — ${current.person}, ${current.role}` : ` — ${current.company}`}
            </blockquote>
          ) : (
            <figcaption>
              {current.person ? `${current.person}, ${current.role} · ` : ""}
              {current.company}
            </figcaption>
          )}
          <a
            className={styles.watch}
            href={`https://www.youtube.com/shorts/${current.videoId}`}
            target="_blank"
            rel="noopener"
          >
            Ver o depoimento da {current.company} no YouTube
          </a>
        </figure>
      </div>
    </section>
  );
}
