"use client";

// Single place where GSAP plugins are registered (https://gsap.com/resources/React/).
// Import gsap/ScrollTrigger/useGSAP from here, never straight from the packages.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Motion language for the site — documented in System/README.md ("Motion").
export const motion = {
  reveal: { y: 24, duration: 0.8, ease: "power2.out", stagger: 0.08, start: "top 95%" },
  counter: { ease: "power2.out", start: "top 75%" },
  noPreference: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
} as const;

export { gsap, ScrollTrigger, useGSAP };
