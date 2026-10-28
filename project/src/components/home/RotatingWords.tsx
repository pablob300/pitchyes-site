"use client";

import { useEffect, useRef } from "react";
import { editFn } from "@/lib/content/edit";
import { gsap, motion, useGSAP } from "@/lib/gsap";
import { ROLL, useHeroSync } from "./HeroSync";
import styles from "./RotatingWords.module.css";

// Second line of the hero h1: the words take turns rolling up, like bland.ai's hero. The
// turn comes from HeroSync (the same index drives the agent cards beside it); here the
// current word leaves upward while the next one comes in from below, in ROLL seconds.
//
// All words are in the server HTML, stacked in one grid cell (only transform/opacity
// change), so the h1 read by crawlers keeps the full list and the line never changes
// height — the cell is as tall as the longest word, even when it wraps on mobile.

export function RotatingWords({ words, editable }: { words: string[]; editable?: boolean }) {
  const edit = editFn(editable);
  const root = useRef<HTMLSpanElement>(null);
  const { index, setPaused } = useHeroSync();
  const shown = useRef(0);
  // Reduced motion: a plain crossfade, no travel.
  const travel = useRef(100);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-word]", root.current);
      if (items.length < 2) return;
      const mm = gsap.matchMedia();

      mm.add({ move: motion.noPreference, still: motion.reduce }, (ctx) => {
        travel.current = ctx.conditions?.move ? 100 : 0;
        const current = shown.current;
        // Take over the CSS starting state (translateY(100%)) as yPercent, so GSAP does
        // not read it as pixels and stack both offsets.
        gsap.set(items, {
          y: 0,
          yPercent: (i: number) => (i === current ? 0 : travel.current),
          opacity: (i: number) => (i === current ? 1 : 0),
        });
      });

      // Only while the hero is on screen (background tabs already stop GSAP's ticker).
      const io = new IntersectionObserver(([entry]) => setPaused("offscreen", !entry.isIntersecting));
      if (root.current) io.observe(root.current);

      return () => {
        io.disconnect();
        setPaused("offscreen", false);
        mm.revert();
      };
    },
    { scope: root, dependencies: [words.join("|")] },
  );

  // The shared index moved: roll from the word on screen to the new one.
  useEffect(() => {
    if (index === shown.current || index >= words.length) return;
    const items = gsap.utils.toArray<HTMLElement>("[data-word]", root.current);
    const out = items[shown.current];
    const into = items[index];
    shown.current = index;
    if (!out || !into) return;
    if (travel.current) {
      // The line's overflow clip hides the words while they travel, so they stay fully
      // opaque: a half-faded word read mid-roll counts as low-contrast text
      // (PageSpeed color-contrast, 25/10/2026). Opacity only switches at the ends.
      gsap.to(out, {
        yPercent: -travel.current,
        duration: ROLL,
        ease: "power2.inOut",
        overwrite: true,
        onComplete: () => gsap.set(out, { opacity: 0 }),
      });
      gsap.fromTo(into, { yPercent: travel.current, opacity: 1 }, { yPercent: 0, duration: ROLL, ease: "power2.inOut", overwrite: true });
    } else {
      gsap.to(out, { opacity: 0, duration: ROLL, ease: "power2.inOut", overwrite: true });
      gsap.fromTo(into, { opacity: 0 }, { opacity: 1, duration: ROLL, ease: "power2.inOut", overwrite: true });
    }
  }, [index, words.length]);

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
