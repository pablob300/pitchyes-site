"use client";

import { usePathname } from "next/navigation";
import { gsap, motion, useGSAP } from "@/lib/gsap";

// Fades + slides up every [data-reveal] element the first time it enters the viewport.
// Mounted once in the root layout; re-scans the page on every route change.
//
// Visibility is detected with IntersectionObserver (reliable on big scroll jumps: anchors,
// End key, back/forward restoring a position); the animation itself is GSAP.
//
// Flash-free handoff: the inline <head> script (lib/bootstrap.ts) adds `js` to <html>, and globals.css
// hides [data-reveal] until this component adds `reveal-ready` (after setting the
// hidden state with GSAP). The same script adds `reveal-ready` after 3s as a fallback
// so content never stays hidden if scripts fail.
export function RevealOnScroll() {
  const pathname = usePathname();

  useGSAP(
    () => {
      const root = document.documentElement;

      // Dentro do editor visual (/editor) a revelação fica desligada. Não é capricho:
      // os elementos começam em opacity 0 e com y: 24, então um bloco recém-criado fora
      // da tela ficaria invisível para quem está editando, e o deslocamento moveria o
      // retângulo de onde o painel desenha as alças de seleção.
      if (pathname.startsWith("/editor")) {
        root.classList.add("reveal-ready");
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(motion.noPreference, () => {
        const { y, duration, ease, stagger, rootMargin } = motion.reveal;
        const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        // opacity (not autoAlpha/visibility): text stays in the rendered DOM for
        // crawlers and assistive tech even before the element animates in.
        gsap.set(els, { opacity: 0, y });
        root.classList.add("reveal-ready");

        const io = new IntersectionObserver(
          (entries) => {
            const entering = entries
              .filter((e) => e.isIntersecting)
              .map((e) => e.target as HTMLElement)
              .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
            if (entering.length === 0) return;
            entering.forEach((el) => io.unobserve(el));
            gsap.to(entering, { opacity: 1, y: 0, duration, ease, stagger, overwrite: true });
          },
          { rootMargin },
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
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
