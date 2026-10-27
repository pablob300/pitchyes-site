"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./blocks.module.css";

// Vídeo do YouTube que só carrega no clique: até lá a página mostra a capa (servida pelo
// próprio site quando existe em /images/landing, senão a do YouTube) e um botão de play.
// O iframe é o youtube-nocookie, como nos depoimentos da home.
export function VideoFacade({ id, alt, poster }: { id: string; alt: string; poster?: string }) {
  const [playing, setPlaying] = useState(false);
  if (playing) {
    return (
      <div className={styles.video}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={alt}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <button type="button" className={styles.video} onClick={() => setPlaying(true)} aria-label={`Assistir: ${alt}`}>
      <Image
        src={poster ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt={alt}
        width={1280}
        height={720}
        sizes="(max-width: 900px) 100vw, 640px"
        unoptimized={!poster}
      />
      <span className={styles.play} aria-hidden="true" />
    </button>
  );
}
