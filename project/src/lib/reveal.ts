// Inline <head> script for the scroll-reveal handoff (see components/motion/RevealOnScroll.tsx).
// Runs before first paint: marks JS as available, and un-hides content after 3s no matter what.
export const revealBootstrap =
  'document.documentElement.classList.add("js");' +
  'setTimeout(function(){document.documentElement.classList.add("reveal-ready")},3000);';
