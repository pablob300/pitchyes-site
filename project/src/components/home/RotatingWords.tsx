"use client";

import { useRef } from "react";
import { editFn } from "@/lib/content/edit";
import { gsap, motion, useGSAP } from "@/lib/gsap";
import styles from "./RotatingWords.module.css";

// Second line of the hero h1: the words take turns rolling up, like bland.ai's hero.
// Each word stays HOLD seconds (the last one LAST_HOLD), then the current one leaves
// upward while the next one comes in from below in the same ROLL-second movement.
//
// All words are in the server HTML, stacked in one grid cell (only transform/opacity
// change), so the h1 read by crawlers keeps the full list and the line never changes
// height — the cell is as tall as the longest word, even when it wraps on mobile.

const HOLD = 2;
const LAST_HOLD = 5;
const ROLL = 0.5;

export function RotatingWords({ words, editable }: { words: string[]; editable?: boolean }) {
  const edit = editFn(editable);
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-word]", root.current);
      const n = items.length;
      if (n < 2) return;

      let call: gsap.core.Tween | null = null;
      let current = 0;
      const mm = gsap.matchMedia();

      mm.add({ move: motion.noPreference, still: motion.reduce }, (ctx) => {
        // Reduced motion: a plain crossfade, no travel.
        const travel = ctx.conditions?.move ? 100 : 0;
        const hold = (i: number) => (i === n - 1 ? LAST_HOLD : HOLD);

        // Take over the CSS starting state (translateY(100%)) as yPercent, so GSAP does
        // not read it as pixels and stack both offsets.
        current = 0;
        gsap.set(items, { y: 0, yPercent: (i: number) => (i === 0 ? 0 : travel), opacity: (i: number) => (i === 0 ? 1 : 0) });

        const roll = () => {
          const out = items[current];
          current = (current + 1) % n;
          const into = items[current];
          gsap.to(out, { yPercent: -travel, opacity: 0, duration: ROLL, ease: "power2.inOut", overwrite: true });
          gsap.fromTo(
            into,
            { yPercent: travel, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: ROLL, ease: "power2.inOut", overwrite: true },
          );
          call = gsap.delayedCall(ROLL + hold(current), roll);
        };

        call = gsap.delayedCall(hold(current), roll);

        // Only while the hero is on screen (background tabs already stop GSAP's ticker).
        const io = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) call?.resume();
          else call?.pause();
        });
        if (root.current) io.observe(root.current);

        return () => {
          io.disconnect();
          call?.kill();
          gsap.killTweensOf(items);
        };
      });
    },
    { scope: root, dependencies: [words.join("|")] },
  );

  return (
    <span ref={root} className={styles.rotator} {...edit("hero.titleWords")}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className={styles.word} data-word data-first={i === 0 || undefined}>
          {/* trailing space keeps the words apart in the text crawlers read; it collapses on screen */}
          {i < words.length - 1 ? `${word} ` : word}
        </span>
      ))}
    </span>
  );
}
