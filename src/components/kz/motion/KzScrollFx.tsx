"use client";

/**
 * Scroll-linked motion kit (category 2).
 *
 * House rules encoded here, so callers cannot accidentally break them:
 *  - every effect writes ONLY `transform` and `opacity` (plus one CSS custom
 *    property, which paints nothing on its own), so no frame costs layout;
 *  - every scrubbed tween uses `ease: "none"`. Easing a scrubbed tween would
 *    decouple the pixels from the wheel and read as lag. The site's easing
 *    language — cubic-bezier(0.22, 1, 0.36, 1) — belongs to entrances; here the
 *    softening comes from Lenis's damping in KzSmoothScroll;
 *  - `scrub: true` (never a number) everywhere: a numeric scrub keeps animating
 *    after the scroll stops, which would animate above-the-fold content on
 *    first paint and cost LCP. With `true` a trigger lands on its correct
 *    progress in the same frame it is created;
 *  - every effect is inert under prefers-reduced-motion, and every effect lives
 *    in a gsap.context() that is reverted on unmount.
 */

import { Children, Fragment, useEffect, useRef, useSyncExternalStore } from "react";
import type { CSSProperties, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ==========================================================================
   Environment probes
   ========================================================================== */

/** Shared so KzSmoothScroll asks the same question with the same string. */
export const KZ_REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Below this width KzPin and KzHorizontalScroll degrade to plain vertical flow.
 * A pinned section on a phone consumes the whole viewport and swallows the
 * flick gesture, and a scroll-jacked horizontal track leaves a touch user no
 * gesture free to escape the section — both read as a frozen page.
 */
export const KZ_PIN_MIN_WIDTH = 900;

const KZ_NARROW_QUERY = `(max-width: ${KZ_PIN_MIN_WIDTH - 0.02}px)`;

function subscribeTo(query: string) {
  return (onStoreChange: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", onStoreChange);
    return () => media.removeEventListener("change", onStoreChange);
  };
}

const subscribeReducedMotion = subscribeTo(KZ_REDUCED_MOTION_QUERY);
const subscribeNarrow = subscribeTo(KZ_NARROW_QUERY);
const matchReducedMotion = () => window.matchMedia(KZ_REDUCED_MOTION_QUERY).matches;
const matchNarrow = () => window.matchMedia(KZ_NARROW_QUERY).matches;

// The static export prerenders these components at build time, where no media
// query can be evaluated. Both snapshots answer "yes", so the prerendered HTML
// is the reduced-motion, mobile-first, already-settled state: nothing animates
// on first paint, and the phone layout never has to be undone after hydration.
const serverSnapshot = () => true;

/** True when the visitor has asked the OS for reduced motion. */
/* Private again now that KzPin is gone: KzStickyStack is the only remaining
   caller, and an exported hook that lives beside a GSAP import is how this
   module ended up on the critical path of every page in the first place. */
function useKzNarrowViewport(): boolean {
  return useSyncExternalStore(subscribeNarrow, matchNarrow, serverSnapshot);
}

export function useKzReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, matchReducedMotion, serverSnapshot);
}

/* ==========================================================================
   Internals
   ========================================================================== */

// Web fonts land after the first ScrollTrigger measurement and move every
// start/end below them. One refresh once the faces are ready fixes the whole
// page; the flag keeps it to a single pass no matter how many effects mount.
let fontRefreshScheduled = false;

function refreshAfterFonts() {
  if (fontRefreshScheduled || typeof document === "undefined" || !("fonts" in document)) return;
  fontRefreshScheduled = true;
  void document.fonts.ready.then(() => ScrollTrigger.refresh());
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));


/* ==========================================================================
   KzScrollProgress — thin top bar

/* ==========================================================================
   KzScrub — raw progress, reverses on scroll up

/* ==========================================================================
   KzParallax — fractional translateY by depth
   ========================================================================== */

export interface KzParallaxProps {
  children: ReactNode;
  /** 0 = static, 1 = maximum drift. Default 0.3. */
  depth?: number;
  className?: string;
  style?: CSSProperties;
}

// yPercent is a fraction of the element's OWN height, so the drift scales with
// the content and never needs a magic pixel number. Give a parallaxed image a
// clipping parent and a little overscale so the drift cannot expose an edge.
const PARALLAX_RANGE = 18;
const PARALLAX_RANGE_NARROW = 8;

export function KzParallax({ children, depth = 0.3, className = "", style }: KzParallaxProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useKzReducedMotion();
  const narrow = useKzNarrowViewport();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    refreshAfterFonts();

    // Range is more than halved on phones: same idea, less travel, far fewer
    // composited pixels on the weakest GPUs.
    const range = clamp(depth, 0, 1) * (narrow ? PARALLAX_RANGE_NARROW : PARALLAX_RANGE);
    if (range === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -range },
        {
          yPercent: range,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [depth, narrow, reduced]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/* ==========================================================================
   KzPin — hold a section still while its content changes

/* ==========================================================================
   KzStickyStack — cards pile with an incremental offset
   ========================================================================== */

export interface KzStickyStackProps {
  children: ReactNode;
  /** Sticky offset of the first card from the top, in px. Default 88 (header + 16). */
  top?: number;
  /** Extra offset per card so the pile shows its edges. Default 18. */
  offset?: number;
  /** Vertical gap between cards in flow, in px. Default 24. */
  gap?: number;
  /** How far a buried card shrinks. Default 0.05. */
  scaleStep?: number;
  className?: string;
  style?: CSSProperties;
}

// Past six cards the accumulated offset would push the newest card off screen,
// so the ledger stops deepening and later cards land on the same line.
const STACK_MAX_STEPS = 5;

/** Where card `index` comes to rest, in px from the top of the viewport. */
function stackTop(index: number, top: number, step: number) {
  return top + Math.min(index, STACK_MAX_STEPS) * step;
}

/**
 * Vertical by nature, so it stays live on phones — it never traps anyone. Only
 * the fidelity drops there: a shallower offset and a gentler shrink. Under
 * reduced motion the whole thing collapses to a plain, statically positioned
 * column, because sticky repositioning is itself scroll-linked movement.
 */
export function KzStickyStack({
  children,
  top = 88,
  offset = 18,
  gap = 24,
  scaleStep = 0.05,
  className = "",
  style,
}: KzStickyStackProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reduced = useKzReducedMotion();
  const narrow = useKzNarrowViewport();

  const items = Children.toArray(children);
  const cardCount = items.length;

  // Shallower ledger on phones, where the viewport cannot spare the pixels.
  const activeOffset = narrow ? Math.round(offset * 0.6) : offset;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced || cardCount < 2) return;

    refreshAfterFonts();

    const ctx = gsap.context(() => {
      const cards = Array.from(root.querySelectorAll<HTMLElement>(":scope > [data-kz-stack-card]"));
      const last = cards[cardCount - 1];
      if (!last) return;

      const depth = narrow ? scaleStep * 0.5 : scaleStep;

      cards.slice(0, -1).forEach((card, index) => {
        gsap.to(card, {
          scale: 1 - depth,
          opacity: 0.55,
          ease: "none",
          transformOrigin: "center top",
          scrollTrigger: {
            trigger: card,
            start: () => `top ${stackTop(index, top, activeOffset)}`,
            endTrigger: last,
            end: () => `top ${stackTop(cardCount - 1, top, activeOffset)}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [activeOffset, cardCount, narrow, reduced, scaleStep, top]);

  return (
    <div ref={rootRef} className={className} style={{ position: "relative", ...style }}>
      {items.map((child, index) => (
        <div
          key={index}
          data-kz-stack-card=""
          style={{
            position: reduced ? "static" : "sticky",
            top: reduced ? undefined : stackTop(index, top, activeOffset),
            marginBottom: index === cardCount - 1 ? 0 : gap,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/* ==========================================================================
   KzHorizontalScroll — one block moves sideways from vertical scroll

/* ==========================================================================
   KzZoomOnScroll — scale mapped to progress

/* ==========================================================================
   KzScrollFillText — words light up as you pass
   ========================================================================== */

export interface KzScrollFillTextProps {
  /** Plain text. It is split on whitespace into one lit span per word. */
  children: string;
  /** Opacity of a word before it lights. Default 0.26. */
  dim?: number;
  /** ScrollTrigger start. Default "top 85%". */
  start?: string;
  /** ScrollTrigger end. Default "top 30%". */
  end?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Each word carries the --grt gradient through `background-clip: text`, and the
 * scroll drives it one word at a time via a scrubbed stagger on opacity alone —
 * no background-position, no clip-path, nothing that repaints the whole block
 * every frame. The markup's resting state is fully lit, so reduced-motion
 * visitors, no-JS visitors and any copy that starts above the fold read finished
 * text on first paint.
 */
export function KzScrollFillText({
  children,
  dim = 0.26,
  start = "top 85%",
  end = "top 30%",
  className = "",
  style,
}: KzScrollFillTextProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useKzReducedMotion();

  const words = children.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const wordEls = Array.from(el.querySelectorAll<HTMLElement>(":scope > [data-kz-fill-word]"));
    if (wordEls.length === 0) return;

    refreshAfterFonts();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordEls,
        { opacity: clamp(dim, 0, 1) },
        {
          opacity: 1,
          duration: 0.6,
          ease: "none",
          stagger: 0.4,
          scrollTrigger: {
            trigger: el,
            start,
            end,
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [children, dim, end, reduced, start]);

  return (
    <div ref={ref} className={className} style={style}>
      {words.map((word, index) => (
        <Fragment key={`${index}-${word}`}>
          <span
            data-kz-fill-word=""
            style={{
              display: "inline-block",
              backgroundImage: "var(--gr)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {word}
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </div>
  );
}
