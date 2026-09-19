// Inline <head> script — runs before first paint and before the browser restores scroll.
// 1. Scroll-reveal handoff (components/motion/RevealOnScroll.tsx): marks JS as available,
//    and un-hides content after 3s no matter what.
// 2. Open at the top on load/reload (no #hash, not back/forward): stop the browser from
//    restoring the old position for this load only, then hand restoration back ("auto")
//    so back/forward inside the site keeps working. SPA navigations: ScrollReset.tsx.
export const headBootstrap = [
  'var d=document.documentElement;d.classList.add("js");',
  'setTimeout(function(){d.classList.add("reveal-ready")},3000);',
  'try{var n=performance.getEntriesByType("navigation")[0];',
  'if(!location.hash&&(!n||n.type!=="back_forward")&&"scrollRestoration"in history){',
  'history.scrollRestoration="manual";',
  'addEventListener("load",function(){scrollTo(0,0);setTimeout(function(){history.scrollRestoration="auto"},0)})}}catch(e){}',
].join("");
