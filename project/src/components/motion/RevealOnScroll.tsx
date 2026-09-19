"use client";

import { usePathname } from "next/navigation";
import { gsap, motion, ScrollTrigger, useGSAP } from "@/lib/gsap";

// Fades + slides up every [data-reveal] element the first time it enters the viewport.
// Mounted once in the root layout; re-scans the page on every route change.
//
// Flash-free handoff: an inline script in <head> adds `js` to <html>, and globals.css
// hides [data-reveal] until this component adds `reveal-ready` (after setting the
// hidden state with GSAP). The same script adds `reveal-ready` after 3s as a fallback
// so content never stays hidden if scripts fail.
export function RevealOnScroll() {
  const pathname = usePathname();

  useGSAP(
    () => {
      const root = document.documentElement;
      const mm = gsap.matchMedia();

      mm.add(motion.noPreference, () => {
        const { y, duration, ease, stagger, start } = motion.reveal;
        const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        gsap.set(els, { autoAlpha: 0, y });
        root.classList.add("reveal-ready");

        ScrollTrigger.batch(els, {
          start,
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration, ease, stagger, overwrite: true }),
        });
      });

      mm.add(motion.reduce, () => {
        root.classList.add("reveal-ready");
      });

      return () => mm.revert();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}

