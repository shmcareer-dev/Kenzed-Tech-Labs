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
export function useKzReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, matchReducedMotion, serverSnapshot);
}

/** True below KZ_PIN_MIN_WIDTH — the degradation switch for pin-based effects. */
export function useKzNarrowViewport(): boolean {
  return useSyncExternalStore(subscribeNarrow, matchNarrow, serverSnapshot);
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

/**
 * Keeps a callback reachable from inside a gsap.context() without making that
 * context a dependency of the caller's render. An inline arrow passed as
 * `onProgress` would otherwise tear down and rebuild every ScrollTrigger on
 * every render.
 */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const PROGRESS_VAR = "--kz-progress";

/* ==========================================================================
   KzScrollProgress — thin top bar
   ========================================================================== */

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
  const reduced = useKzReducedMotion();

  useEffect(() => {
    const bar = barRef.current;
    if (!bar || reduced) return;

    refreshAfterFonts();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          transformOrigin: "left center",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }, bar);

    return () => ctx.revert();
  }, [reduced]);

  // Removed rather than frozen at zero: a bar that never fills misreports the
  // page state, and the contract for this kit is inert, not decorative.
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
        }}
      />
    </div>
  );
}

/* ==========================================================================
   KzScrub — raw progress, reverses on scroll up
   ========================================================================== */

export interface KzScrubProps {
  children: ReactNode;
  /** ScrollTrigger start. Default "top bottom". */
  start?: string;
  /** ScrollTrigger end. Default "bottom top". */
  end?: string;
  /** Called with 0..1 on every update, in both scroll directions. */
  onProgress?: (progress: number) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Publishes the element's pass through the viewport as the CSS custom property
 * `--kz-progress` (0..1) and, optionally, to a callback. Consume it with
 * transform or opacity only: `transform: scale(calc(0.9 + var(--kz-progress) * 0.1))`
 * is in bounds, `width: calc(var(--kz-progress) * 100%)` is not.
 * Under reduced motion the variable is pinned to 1 so consumers render the
 * finished state rather than the empty one.
 */
export function KzScrub({
  children,
  start = "top bottom",
  end = "bottom top",
  onProgress,
  className = "",
  style,
}: KzScrubProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useKzReducedMotion();
  const onProgressRef = useLatest(onProgress);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.style.setProperty(PROGRESS_VAR, "1");
      onProgressRef.current?.(1);
      return;
    }

    refreshAfterFonts();

    const ctx = gsap.context(() => {
      const publish = (self: ScrollTrigger) => {
        el.style.setProperty(PROGRESS_VAR, self.progress.toFixed(4));
        onProgressRef.current?.(self.progress);
      };
      ScrollTrigger.create({
        trigger: el,
        start,
        end,
        invalidateOnRefresh: true,
        onUpdate: publish,
        onRefresh: publish,
      });
    }, el);

    return () => {
      ctx.revert();
      el.style.removeProperty(PROGRESS_VAR);
    };
  }, [end, onProgressRef, reduced, start]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

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
   ========================================================================== */

export interface KzPinProps {
  children: ReactNode;
  /** ScrollTrigger start. Default "top top". */
  start?: string;
  /** How long the section stays pinned. Default "+=100%" (one viewport). */
  end?: string;
  /** Called with 0..1 across the pinned range. */
  onProgress?: (progress: number) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * MOBILE DEGRADATION: below KZ_PIN_MIN_WIDTH (900px) nothing is pinned. The
 * section renders as an ordinary block in normal vertical flow and scrolls past
 * at native speed, because a pinned full-height section on a phone eats the
 * entire viewport and makes the page feel stuck. `--kz-progress` is pinned to 1
 * there — and under reduced motion at any width — so content keyed off it shows
 * its end state instead of its first frame.
 */
export function KzPin({
  children,
  start = "top top",
  end = "+=100%",
  onProgress,
  className = "",
  style,
}: KzPinProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useKzReducedMotion();
  const narrow = useKzNarrowViewport();
  const onProgressRef = useLatest(onProgress);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced || narrow) {
      el.style.setProperty(PROGRESS_VAR, "1");
      onProgressRef.current?.(1);
      return;
    }

    refreshAfterFonts();

    const ctx = gsap.context(() => {
      const publish = (self: ScrollTrigger) => {
        el.style.setProperty(PROGRESS_VAR, self.progress.toFixed(4));
        onProgressRef.current?.(self.progress);
      };
      ScrollTrigger.create({
        trigger: el,
        start,
        end,
        pin: el,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: publish,
        onRefresh: publish,
      });
    }, el);

    return () => {
      ctx.revert();
      el.style.removeProperty(PROGRESS_VAR);
    };
  }, [end, narrow, onProgressRef, reduced, start]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

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
   ========================================================================== */

export interface KzHorizontalScrollProps {
  children: ReactNode;
  /** Height of the pinned stage on wide viewports. Default "100vh". */
  stageHeight?: string;
  /** Gap between panels, in px. Default 24. */
  gap?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * MOBILE DEGRADATION: below KZ_PIN_MIN_WIDTH (900px) — and under reduced motion
 * at any width — the stage is never pinned and the track is never translated.
 * The same panels render as a normal full-width vertical column in ordinary
 * document flow, so a touch user flicks straight through. Scroll-jacking a
 * horizontal track on a phone leaves no gesture free to escape the section.
 * The track's `width: max-content` is confined by `overflow: hidden` on the
 * stage, so it can never widen the document at 360px either.
 */
export function KzHorizontalScroll({
  children,
  stageHeight = "100vh",
  gap = 24,
  className = "",
  style,
}: KzHorizontalScrollProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const reduced = useKzReducedMotion();
  const narrow = useKzNarrowViewport();

  const items = Children.toArray(children);
  const childCount = items.length;
  const horizontal = !reduced && !narrow;

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track || !horizontal || childCount === 0) return;

    refreshAfterFonts();

    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, track.scrollWidth - stage.clientWidth);

      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, stage);

    return () => ctx.revert();
  }, [childCount, horizontal]);

  return (
    <div
      ref={stageRef}
      className={className}
      style={{
        ...style,
        position: "relative",
        overflow: "hidden",
        height: horizontal ? stageHeight : "auto",
        display: horizontal ? "flex" : "block",
        alignItems: horizontal ? "center" : undefined,
      }}
    >
      <div
        ref={trackRef}
        style={{
          display: "flex",
          flexDirection: horizontal ? "row" : "column",
          gap,
          width: horizontal ? "max-content" : "100%",
        }}
      >
        {items.map((child, index) => (
          <div
            key={index}
            style={{
              flex: "0 0 auto",
              minWidth: 0,
              maxWidth: "100%",
              width: horizontal ? undefined : "100%",
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   KzZoomOnScroll — scale mapped to progress
   ========================================================================== */

export interface KzZoomOnScrollProps {
  children: ReactNode;
  /** Scale at progress 0. Default 1.18. */
  from?: number;
  /** Scale at progress 1. Default 1. */
  to?: number;
  /** ScrollTrigger start. Default "top 88%". */
  start?: string;
  /** ScrollTrigger end. Default "top 30%". */
  end?: string;
  /** transform-origin of the scaled layer. Default "center center". */
  origin?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * The outer frame clips, so an overscaled child can never widen the document —
 * the 360px no-horizontal-overflow rule holds by construction. On phones the
 * scale delta is halved: same gesture, half the fill rate.
 */
export function KzZoomOnScroll({
  children,
  from = 1.18,
  to = 1,
  start = "top 88%",
  end = "top 30%",
  origin = "center center",
  className = "",
  style,
}: KzZoomOnScrollProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const reduced = useKzReducedMotion();
  const narrow = useKzNarrowViewport();

  useEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner || reduced) return;

    refreshAfterFonts();

    const softenedFrom = narrow ? to + (from - to) * 0.5 : from;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner,
        { scale: softenedFrom },
        {
          scale: to,
          ease: "none",
          transformOrigin: origin,
          scrollTrigger: {
            trigger: frame,
            start,
            end,
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }, frame);

    return () => ctx.revert();
  }, [end, from, narrow, origin, reduced, start, to]);

  return (
    <div ref={frameRef} className={className} style={{ ...style, overflow: "hidden" }}>
      <div ref={innerRef} style={{ transformOrigin: origin }}>
        {children}
      </div>
    </div>
  );
}

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
              backgroundImage: "var(--grt)",
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
