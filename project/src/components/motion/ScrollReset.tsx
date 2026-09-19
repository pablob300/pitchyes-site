"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });

// Every page opens at the top: on internal link navigation and on load/reload.
// Exceptions: URLs with a #hash (anchors) and browser back/forward, which keep the
// position the visitor left. Mounted before RevealOnScroll so reveal triggers are
// measured from the top of the new page.
export function ScrollReset() {
  const pathname = usePathname();
  const fromHistory = useRef(false);
  const firstRun = useRef(true);

  useEffect(() => {
    const onPop = () => {
      fromHistory.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useLayoutEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (nav?.type === "back_forward" || window.location.hash) return;
      // Reload restoration is blocked by the inline <head> script (lib/bootstrap.ts).
      toTop();
      return;
    }
    if (fromHistory.current) {
      fromHistory.current = false;
      return;
    }
    if (!window.location.hash) toTop();
  }, [pathname]);

  return null;
}
