"use client";

import { useEffect, useState } from "react";

/**
 * Scoped stylesheet for the same reason as KzFooter/KzScrollSpy: hover,
 * media queries and prefers-reduced-motion are not expressible as style
 * props. Tokens throughout so the light theme gets a white chip instead of a
 * dark one; the only hardcoded value is the design language's single easing
 * curve.
 */
const BACKTOP_CSS = `
.kzbt{
  position:fixed;
  /* Column-aligned with KzChatbot's launcher (right: clamp(14px,4vw,26px),
     58px tall) and parked 72px above its bottom edge — 58px launcher + the
     14px gap the chatbot uses inside its own stack — so the two never
     collide at any viewport width. */
  right:clamp(14px,4vw,26px);
  bottom:calc(clamp(14px,4vw,26px) + env(safe-area-inset-bottom,0px) + 72px);
  /* One below the chatbot's z 40: its panel opens upward over this exact
     spot and must win. */
  z-index:39;
  display:grid;place-items:center;width:44px;height:44px;
  border:1px solid var(--line);border-radius:11px;
  background:color-mix(in srgb,var(--bg2) 86%,transparent);
  -webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);
  color:var(--mut);cursor:pointer;
  opacity:0;visibility:hidden;transform:translateY(10px);
  transition:opacity .3s cubic-bezier(0.22,1,0.36,1),transform .3s cubic-bezier(0.22,1,0.36,1),visibility .3s,border-color .25s cubic-bezier(0.22,1,0.36,1),color .25s cubic-bezier(0.22,1,0.36,1)
}
.kzbt.is-visible{opacity:1;visibility:visible;transform:none}
.kzbt:hover{border-color:var(--acc3);color:var(--ink)}
@media (prefers-reduced-motion:reduce){.kzbt{transition:none;transform:none}}
`;

/**
 * The design's back-to-top chip: appears once the reader is ~22% through the
 * page (deep enough that "top" is no longer a flick away), fixed above the
 * chatbot bubble. Hidden state uses visibility, which also removes it from
 * the tab order without extra aria bookkeeping.
 */
export function KzBackTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // rAF-throttled: scroll fires per frame or faster, and the read of
    // scrollHeight is layout-bound, so coalesce to at most one check a frame.
    let ticking = false;
    const check = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(max > 0 && window.scrollY / max > 0.22);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(check);
    };
    check(); // deep links can land mid-page, past the threshold
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function handleClick() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: BACKTOP_CSS }} />
      <button
        type="button"
        className={`kzbt${visible ? " is-visible" : ""}`}
        aria-label="Back to top"
        onClick={handleClick}
      >
        {/* Inline stroke arrow instead of the "↑" glyph: renders identically
            across the font fallback chain. */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M7 12V2M7 2 2.5 6.5M7 2l4.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </>
  );
}
