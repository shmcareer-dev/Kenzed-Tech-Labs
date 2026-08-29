"use client";

/**
 * The thin reading-progress bar at the top of every page.
 *
 * It lived in KzScrollFx, which imports GSAP and ScrollTrigger at module
 * scope. Because this bar is rendered from the root layout, that one import
 * put ~200KB of animation library on the critical path of every route on the
 * site — including the legal pages, which have no animation at all — to scale
 * one div horizontally as the document scrolls.
 *
 * A passive scroll listener and a transform do the same job. The rAF gate
 * means the write happens once per painted frame no matter how many scroll
 * events fire, and the listener is passive so it can never block the
 * compositor.
 *
 * Under prefers-reduced-motion the bar is not rendered at all rather than
 * frozen at zero: a progress bar that never fills misreports the page state,
 * which is worse than not having one.
 */

import { useEffect, useRef, useSyncExternalStore } from "react";

const KZ_QUERY_REDUCED = "(prefers-reduced-motion: reduce)";

let mql: MediaQueryList | null = null;
const media = () => (mql ??= window.matchMedia(KZ_QUERY_REDUCED));
const subscribe = (onChange: () => void) => {
  const m = media();
  m.addEventListener("change", onChange);
  return () => m.removeEventListener("change", onChange);
};

export interface KzScrollProgressProps {
  /** Bar thickness in px. Default 3. */
  height?: number;
  /** Any CSS background value; defaults to the brand gradient token. */
  background?: string;
  /** Sits above the header (z-index 50) and its mobile sheet (60) by default. */
  zIndex?: number;
  className?: string;
}

export function KzScrollProgress({
  height = 3,
  background = "var(--gr)",
  zIndex = 70,
  className = "",
}: KzScrollProgressProps) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const reduced = useSyncExternalStore(
    subscribe,
    () => media().matches,
    () => false
  );

  useEffect(() => {
    const bar = barRef.current;
    if (!bar || reduced) return;

    let frame = 0;

    const write = () => {
      frame = 0;
      const doc = document.documentElement;
      /* The travel, not the document height: at the bottom of the page the
         last viewport-worth is already shown, so dividing by scrollHeight
         alone would leave the bar short of full on every page. */
      const travel = doc.scrollHeight - doc.clientHeight;
      const progress = travel > 0 ? Math.min(1, Math.max(0, window.scrollY / travel)) : 0;
      bar.style.transform = `scaleX(${progress.toFixed(4)})`;
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(write);
    };

    write();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "fixed",
        top: 0,
        insetInlineStart: 0,
        insetInlineEnd: 0,
        height,
        zIndex,
        pointerEvents: "none",
      }}
    >
      <div
        ref={barRef}
        style={{
          height: "100%",
          background,
          transform: "scaleX(0)",
          transformOrigin: "left center",
          willChange: "transform",
        }}
      />
    </div>
  );
}
