"use client";

/**
 * Loads damped scrolling only once the page is idle, and only where it does
 * anything.
 *
 * KzSmoothScroll imports GSAP, ScrollTrigger and Lenis at module scope, and it
 * was rendered from the root layout — so ~200KB of raw JavaScript sat on the
 * critical path of every route on the site, the legal pages included. On a
 * phone it then did nothing at all: the component no-ops on a coarse pointer
 * by design, because the OS fling already owns momentum.
 *
 * So the import is deferred and conditional:
 *
 *  - Nothing is fetched on a coarse pointer or under reduced motion. On those
 *    devices the library is never downloaded, never parsed, never run.
 *  - Everywhere else it waits for requestIdleCallback. Damped scrolling is an
 *    enhancement to a page that already scrolls perfectly well natively, so it
 *    has no business competing with hydration for the main thread.
 *
 * The visible result on a mouse-driven desktop is unchanged; it simply starts
 * a moment later, by which time the page is interactive.
 */

import { useEffect, useState, type ComponentType } from "react";

const COARSE = "(pointer: coarse)";
const REDUCED = "(prefers-reduced-motion: reduce)";

export function KzSmoothScrollLoader() {
  const [Loaded, setLoaded] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (window.matchMedia(COARSE).matches) return;
    if (window.matchMedia(REDUCED).matches) return;

    let cancelled = false;
    const start = () => {
      import("./KzSmoothScroll")
        .then((mod) => {
          if (!cancelled) setLoaded(() => mod.KzSmoothScroll as ComponentType);
        })
        .catch(() => {
          /* An enhancement that fails to load is not an error worth surfacing:
             the page scrolls natively, which is the fallback either way. */
        });
    };

    /* requestIdleCallback is typed as always present but is absent on Safari
       before 17, so the check is a runtime one on purpose. */
    const hasIdle = typeof window.requestIdleCallback === "function";
    const handle = hasIdle
      ? window.requestIdleCallback(start, { timeout: 2500 })
      : window.setTimeout(start, 1200);
    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(handle as number);
      else clearTimeout(handle as number);
    };
  }, []);

  return Loaded ? <Loaded /> : null;
}
