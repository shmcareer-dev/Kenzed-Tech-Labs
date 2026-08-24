"use client";

/**
 * KzPointer — the pointer and hover kit.
 *
 * Everything in this file is POLISH. A phone, a tablet, a TV browser and a
 * reduced-motion desktop all render the same information; they simply do not
 * get the lean, the tilt or the spotlight. Nothing here may ever be the only
 * carrier of a label, a state or an affordance.
 *
 * Three rules hold the file together:
 *
 * 1. Every effect is gated on `(hover: hover) and (pointer: fine)` — in CSS for
 *    the pure-CSS ones, and in JS (`useKzPointerEnabled`) for the ones that need
 *    pointer maths. A touch device never has a pointer listener attached to it.
 * 2. Only `transform` and `opacity` are animated. No top/left/width/height, no
 *    box-shadow or filter transitions — those force layout or a full repaint on
 *    every frame and are what drops mid-range phones to 20fps.
 * 3. One easing language: KZ_EASE for entrances and travel, KZ_SPRING for the
 *    release of an interaction. Durations stay inside 200-800ms.
 */

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";

/* ==========================================================================
   Shared vocabulary
   ========================================================================== */

/** Entrances and travel. The single non-default curve used across the site. */
const KZ_EASE = "cubic-bezier(.22,1,.36,1)";
/** Release of a held interaction: a short overshoot, never a bounce. */
const KZ_SPRING = "cubic-bezier(.34,1.28,.5,1)";

const KZ_FINE = "(hover: hover) and (pointer: fine)";
const KZ_REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * Add this class to any ancestor to let it drive the hover-only effects nested
 * inside it — a card that zooms its own image, sweeps its own title underline
 * and nudges its own arrow from a single hover.
 */
export const KZ_HOVER_GROUP = "kz-hover-group";

/** Custom properties are not part of React's CSSProperties surface. */
function kzVars(
  base: CSSProperties | undefined,
  entries: Record<string, string | number>
): CSSProperties {
  return { ...base, ...entries } as CSSProperties;
}

function kzClass(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function kzClamp(value: number, limit: number) {
  return Math.max(-limit, Math.min(limit, value));
}

/* ==========================================================================
   Capability gate
   ========================================================================== */

function kzSubscribeMedia(query: string) {
  return (onChange: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  };
}

const kzSubFine = kzSubscribeMedia(KZ_FINE);
const kzSubReduced = kzSubscribeMedia(KZ_REDUCED);
const kzGetFine = () => window.matchMedia(KZ_FINE).matches;
const kzGetReduced = () => window.matchMedia(KZ_REDUCED).matches;
const kzGetFalse = () => false;

/**
 * True only on a device with a real hovering pointer AND no reduced-motion
 * request, and it re-evaluates live when either changes (plugging a mouse into
 * a tablet, or flipping the OS setting mid-session).
 *
 * The server snapshot is `false`, so the first client render matches the static
 * export exactly and no pointer effect can touch the first paint. That is also
 * what keeps this kit off the Largest Contentful Paint critical path.
 */
function useKzPointerEnabled(): boolean {
  const fine = useSyncExternalStore(kzSubFine, kzGetFine, kzGetFalse);
  const reduced = useSyncExternalStore(kzSubReduced, kzGetReduced, kzGetFalse);
  return fine && !reduced;
}

/** Keeps a render-fresh value readable from a long-lived event handler. */
function useKzLatest<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

/* ==========================================================================
   Pointer bus

   One `pointermove` listener and one rAF for the whole page, no matter how many
   effects are live. Many pointermove events can land inside a single frame; the
   bus keeps only the last position and flushes once per frame, so a fast mouse
   costs exactly one style write per subscriber per frame. Listener is passive —
   nothing here ever calls preventDefault.
   ========================================================================== */

type KzPointerFn = (x: number, y: number) => void;

const kzBus = new Set<KzPointerFn>();
let kzPointerX = 0;
let kzPointerY = 0;
let kzBusFrame = 0;

function kzBusFlush() {
  kzBusFrame = 0;
  // Snapshot: a subscriber is allowed to unsubscribe from inside its own call.
  for (const fn of Array.from(kzBus)) fn(kzPointerX, kzPointerY);
}

function kzBusMove(event: PointerEvent) {
  // A hybrid laptop matches `(hover:hover) and (pointer:fine)` and still emits
  // touch pointers. A finger must never drive a hover-only effect.
  if (event.pointerType === "touch") return;
  kzPointerX = event.clientX;
  kzPointerY = event.clientY;
  if (kzBusFrame === 0) kzBusFrame = requestAnimationFrame(kzBusFlush);
}

function kzBusSubscribe(fn: KzPointerFn) {
  if (kzBus.size === 0) {
    window.addEventListener("pointermove", kzBusMove, { passive: true });
  }
  kzBus.add(fn);
  return () => {
    kzBus.delete(fn);
    if (kzBus.size > 0) return;
    window.removeEventListener("pointermove", kzBusMove);
    if (kzBusFrame !== 0) {
      cancelAnimationFrame(kzBusFrame);
      kzBusFrame = 0;
    }
  };
}

/* ==========================================================================
   Per-element tracking
   ========================================================================== */

interface KzTrackFrame {
  /** Pointer position inside the element, normalised to 0..1. */
  nx: number;
  ny: number;
  /** Pointer position inside the element, px from its top-left. */
  x: number;
  y: number;
  /** Pointer offset from the element's centre, px. */
  dx: number;
  dy: number;
  width: number;
  height: number;
}

interface KzTrackHandlers<T extends HTMLElement> {
  onMove: (frame: KzTrackFrame, el: T) => void;
  onEnter?: (frame: KzTrackFrame, el: T) => void;
  onLeave?: (el: T) => void;
}

/**
 * Attaches `pointerenter` / `pointerleave` to one element and subscribes to the
 * pointer bus only while the pointer is actually inside it, so at most one or
 * two elements on a page are ever doing per-frame work.
 *
 * The rect is re-measured on each frame rather than cached on enter: Lenis keeps
 * the page moving under a parked cursor and a cached rect would drift. Because
 * only the hovered element is subscribed, that is one layout read per frame for
 * the whole document, not one per instance.
 *
 * The hook also owns `data-kz-on`, which the stylesheet uses to switch between
 * the tracking transition and the slower spring release, and which a consumer
 * can style against ("fill is in, invert my text now").
 */
function useKzTrack<T extends HTMLElement>(
  enabled: boolean,
  handlers: KzTrackHandlers<T>
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const latest = useKzLatest(handlers);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    el.dataset.kzOn = "0";
    let unsubscribe: (() => void) | null = null;

    const measure = (x: number, y: number): KzTrackFrame => {
      const rect = el.getBoundingClientRect();
      const width = rect.width || 1;
      const height = rect.height || 1;
      const localX = x - rect.left;
      const localY = y - rect.top;
      return {
        nx: localX / width,
        ny: localY / height,
        x: localX,
        y: localY,
        dx: localX - width / 2,
        dy: localY - height / 2,
        width,
        height,
      };
    };

    const onFrame = (x: number, y: number) => {
      latest.current.onMove(measure(x, y), el);
    };

    const stop = () => {
      if (!unsubscribe) return;
      unsubscribe();
      unsubscribe = null;
    };

    const handleEnter = (event: PointerEvent) => {
      if (event.pointerType === "touch" || unsubscribe) return;
      unsubscribe = kzBusSubscribe(onFrame);
      el.dataset.kzOn = "1";
      const frame = measure(event.clientX, event.clientY);
      latest.current.onEnter?.(frame, el);
      latest.current.onMove(frame, el);
    };

    const handleLeave = () => {
      stop();
      el.dataset.kzOn = "0";
      latest.current.onLeave?.(el);
    };

    el.addEventListener("pointerenter", handleEnter, { passive: true });
    el.addEventListener("pointerleave", handleLeave, { passive: true });

    return () => {
      el.removeEventListener("pointerenter", handleEnter);
      el.removeEventListener("pointerleave", handleLeave);
      // Reset rather than freeze: if `enabled` just flipped false because the
      // user turned reduced-motion on, the element must not keep a leftover
      // transform from the last frame.
      handleLeave();
    };
  }, [enabled, latest]);

  return ref;
}

/* ==========================================================================
   Stylesheet

   Deduplicated by React 19 on `href`, so every component can render it and the
   document still gets exactly one copy.
   ========================================================================== */

const KZ_POINTER_CSS = `
.kzmag{position:relative;display:inline-flex;max-width:100%;vertical-align:middle}
.kzmag::before{content:"";position:absolute;inset:calc(var(--kzmag-field,0px) * -1);z-index:-1}
.kzmag-in{display:inline-flex;max-width:100%;transition:transform .28s ${KZ_EASE}}
.kzmag[data-kz-on="1"] .kzmag-in{will-change:transform}
.kzmag[data-kz-on="0"] .kzmag-in{transition:transform .5s ${KZ_SPRING}}

.kzsp{position:relative}
.kzsp-clip{position:absolute;inset:0;z-index:0;overflow:hidden;border-radius:inherit;pointer-events:none}
.kzsp-glow{position:absolute;top:0;left:0;width:var(--kzsp-size,320px);height:var(--kzsp-size,320px);border-radius:50%;opacity:0;background:radial-gradient(circle closest-side,var(--kzsp-color,var(--accglow)),transparent);transform:translate3d(calc(var(--kzsp-x,0px) - 50%),calc(var(--kzsp-y,0px) - 50%),0);transition:opacity .32s ${KZ_EASE}}
.kzsp[data-kz-on="1"] .kzsp-glow{opacity:1;will-change:transform}
.kzsp-in{position:relative;z-index:1}

.kztilt{position:relative}
.kztilt-in{transform-style:preserve-3d;transition:transform .3s ${KZ_EASE}}
.kztilt[data-kz-on="1"] .kztilt-in{will-change:transform}
.kztilt[data-kz-on="0"] .kztilt-in{transition:transform .55s ${KZ_SPRING}}

.kzlift{transition:transform .32s ${KZ_EASE}}
.kzlift:focus-within{transform:translate3d(0,calc(var(--kzlift-y,6px) * -1),0) scale(var(--kzlift-s,1))}
@media ${KZ_FINE}{.kzlift:hover{transform:translate3d(0,calc(var(--kzlift-y,6px) * -1),0) scale(var(--kzlift-s,1));will-change:transform}}

.kzbge{position:relative}
.kzbge-e{position:absolute;pointer-events:none;transition:opacity .4s ${KZ_EASE}}
.kzbge[data-kz-on="1"] .kzbge-e{transition:opacity .2s linear}
.kzbge-t,.kzbge-b{left:var(--kzbge-inset,14%);right:var(--kzbge-inset,14%);height:1px;background:linear-gradient(90deg,transparent,var(--kzbge-color,var(--acc)),transparent)}
.kzbge-l,.kzbge-r{top:var(--kzbge-inset,14%);bottom:var(--kzbge-inset,14%);width:1px;background:linear-gradient(180deg,transparent,var(--kzbge-color,var(--acc)),transparent)}
.kzbge-t{top:0;opacity:var(--kzbge-t,0)}
.kzbge-b{bottom:0;opacity:var(--kzbge-b,0)}
.kzbge-l{left:0;opacity:var(--kzbge-l,0)}
.kzbge-r{right:0;opacity:var(--kzbge-r,0)}

.kzzoom{position:relative;overflow:hidden}
.kzzoom-in{display:block;transform:scale(1);transition:transform .6s ${KZ_EASE}}
.kzzoom:focus-within .kzzoom-in,.${KZ_HOVER_GROUP}:focus-within .kzzoom-in{transform:scale(var(--kzzoom-s,1.06))}
@media ${KZ_FINE}{.kzzoom:hover .kzzoom-in,.${KZ_HOVER_GROUP}:hover .kzzoom-in{transform:scale(var(--kzzoom-s,1.06));will-change:transform}}

.kzdf{position:relative;isolation:isolate;overflow:hidden}
.kzdf-fill{position:absolute;inset:0;z-index:0;background:var(--kzdf-fill,var(--gr));transform:translate3d(0,101%,0);transition:transform .46s ${KZ_EASE}}
.kzdf[data-kz-on="1"] .kzdf-fill{will-change:transform}
.kzdf-in{position:relative;z-index:1}

.kzbw{position:relative;display:inline-flex;overflow:hidden;isolation:isolate}
.kzbw-fill{position:absolute;inset:0;z-index:0;background:var(--kzbw-fill,var(--gr));transform:scaleX(0);transform-origin:right center;transition:transform .45s ${KZ_EASE}}
.kzbw-in{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;width:100%}
.kzbw:focus-within .kzbw-fill{transform:scaleX(1);transform-origin:left center}
@media ${KZ_FINE}{.kzbw:hover .kzbw-fill{transform:scaleX(1);transform-origin:left center;will-change:transform}}

.kzus{position:relative;display:inline-block;max-width:100%}
.kzus::after{content:"";position:absolute;left:0;right:0;bottom:var(--kzus-offset,-2px);height:var(--kzus-size,1px);background:var(--kzus-color,currentColor);transform:scaleX(0);transform-origin:right center;transition:transform .38s ${KZ_EASE}}
.kzus:focus-within::after,.${KZ_HOVER_GROUP}:focus-within .kzus::after{transform:scaleX(1);transform-origin:left center}
@media ${KZ_FINE}{.kzus:hover::after,.${KZ_HOVER_GROUP}:hover .kzus::after{transform:scaleX(1);transform-origin:left center}}

.kzan{display:inline-flex;align-items:center}
.kzan-hit{min-width:44px;min-height:44px;justify-content:center}
.kzan-in{display:inline-flex;transition:transform .34s ${KZ_EASE}}
.kzan:focus-within .kzan-in,.${KZ_HOVER_GROUP}:focus-within .kzan-in{transform:translate3d(var(--kzan-x,0px),var(--kzan-y,0px),0)}
@media ${KZ_FINE}{.kzan:hover .kzan-in,.${KZ_HOVER_GROUP}:hover .kzan-in{transform:translate3d(var(--kzan-x,0px),var(--kzan-y,0px),0)}}

.kzcr{position:relative;margin:0;overflow:hidden}
.kzcr-cap{position:absolute;left:0;right:0;bottom:0;padding:14px 16px;text-align:left;font-size:.82rem;line-height:1.45;color:var(--ink);background:linear-gradient(to top,color-mix(in oklab,var(--bg) 92%,transparent),color-mix(in oklab,var(--bg) 0%,transparent))}
@media ${KZ_FINE} and (prefers-reduced-motion:no-preference){
.kzcr-cap{opacity:0;transform:translate3d(0,14px,0);transition:opacity .4s ${KZ_EASE},transform .4s ${KZ_EASE}}
.kzcr:hover .kzcr-cap,.kzcr:focus-within .kzcr-cap{opacity:1;transform:translate3d(0,0,0)}
}

.kzcur{position:fixed;top:0;left:0;width:0;height:0;z-index:9999;pointer-events:none;opacity:0;transition:opacity .28s ${KZ_EASE}}
.kzcur[data-kz-live="1"]{opacity:1}
.kzcur-ring,.kzcur-dot{position:absolute;top:0;left:0;width:0;height:0}
.kzcur-s{position:absolute;top:0;left:0;width:var(--kzcur-size,34px);height:var(--kzcur-size,34px);transform:translate(-50%,-50%) scale(1);transition:transform .32s ${KZ_EASE};will-change:transform}
.kzcur-i{position:absolute;inset:0;border-radius:50%;border:1px solid var(--kzcur-color,var(--acc))}
.kzcur-f{position:absolute;inset:0;border-radius:50%;background:var(--kzcur-color,var(--acc));opacity:0;transition:opacity .28s ${KZ_EASE}}
.kzcur-d{position:absolute;top:0;left:0;width:var(--kzcur-dot,6px);height:var(--kzcur-dot,6px);border-radius:50%;background:var(--kzcur-color,var(--acc));transform:translate(-50%,-50%);transition:opacity .28s ${KZ_EASE}}
.kzcur-l{position:absolute;top:0;left:0;transform:translate(-50%,-50%);white-space:nowrap;font-family:var(--font-mono);font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;color:var(--bg);opacity:0;transition:opacity .24s ${KZ_EASE}}
.kzcur[data-kz-state="press"] .kzcur-s{transform:translate(-50%,-50%) scale(.78)}
.kzcur[data-kz-label="1"] .kzcur-s{transform:translate(-50%,-50%) scale(2.15)}
.kzcur[data-kz-label="1"] .kzcur-f{opacity:1}
.kzcur[data-kz-label="1"] .kzcur-d{opacity:0}
.kzcur[data-kz-label="1"] .kzcur-l{opacity:1}

@media ${KZ_FINE} and (prefers-reduced-motion:no-preference){
[data-kz-nocursor="on"],[data-kz-nocursor="on"] *{cursor:none !important}
[data-kz-nocursor="on"] :is(input,textarea,select,[contenteditable="true"]){cursor:auto !important}
}

@media (prefers-reduced-motion:reduce){
.kzlift:hover,.kzlift:focus-within{transform:none}
.kzzoom:hover .kzzoom-in,.kzzoom:focus-within .kzzoom-in,.${KZ_HOVER_GROUP}:hover .kzzoom-in,.${KZ_HOVER_GROUP}:focus-within .kzzoom-in{transform:none}
.kzan:hover .kzan-in,.kzan:focus-within .kzan-in,.${KZ_HOVER_GROUP}:hover .kzan-in,.${KZ_HOVER_GROUP}:focus-within .kzan-in{transform:none}
.kzcur{display:none}
}
`;

function KzPointerCss() {
  /* Raw markup: React escapes ">" in element children, which would corrupt the
     child selectors. The sheet is a module constant, never user data. */
  return (
    <style
      href="kz-pointer"
      precedence="default"
      dangerouslySetInnerHTML={{ __html: KZ_POINTER_CSS }}
    />
  );
}

/* ==========================================================================
   1. KzMagnetic
   ========================================================================== */

export interface KzMagneticProps {
  children: ReactNode;
  /** Fraction of the pointer's offset from centre that the child travels. */
  strength?: number;
  /** Hard cap on travel, px, so a wide button never slides out of its row. */
  max?: number;
  /**
   * Invisible halo, px, that starts the pull before the pointer reaches the
   * element. Left at 0 by default: the halo is hit-testable, and on a tight
   * layout a generous one would sit over its neighbours.
   */
  field?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Leans its child toward the pointer. Wraps — it never becomes the button, so
 * the real `<button>` or `<a>` inside keeps its own semantics, focus ring and
 * 44px target.
 */
export function KzMagnetic({
  children,
  strength = 0.3,
  max = 14,
  field = 0,
  className,
  style,
}: KzMagneticProps) {
  const enabled = useKzPointerEnabled();
  const innerRef = useRef<HTMLSpanElement | null>(null);

  const hostRef = useKzTrack<HTMLSpanElement>(enabled, {
    onMove: (frame) => {
      const inner = innerRef.current;
      if (!inner) return;
      const x = kzClamp(frame.dx * strength, max);
      const y = kzClamp(frame.dy * strength, max);
      inner.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
    },
    onLeave: () => {
      const inner = innerRef.current;
      if (inner) inner.style.transform = "";
    },
  });

  return (
    <span
      ref={hostRef}
      className={kzClass("kzmag", className)}
      style={kzVars(style, { "--kzmag-field": `${field}px` })}
    >
      <KzPointerCss />
      <span ref={innerRef} className="kzmag-in">
        {children}
      </span>
    </span>
  );
}

/* ==========================================================================
   2. KzCursorSpotlight
   ========================================================================== */

export interface KzCursorSpotlightProps {
  children: ReactNode;
  /** Diameter of the glow, px. */
  size?: number;
  /** Any CSS colour. Defaults to the --accglow token. */
  color?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * A soft glow that follows the pointer inside a card. The glow is clipped by
 * its own absolutely positioned layer, so the host keeps `overflow: visible`
 * and nothing the card needs to spill (a badge, a menu) gets cut off.
 */
export function KzCursorSpotlight({
  children,
  size = 320,
  color,
  className,
  style,
}: KzCursorSpotlightProps) {
  const enabled = useKzPointerEnabled();

  const hostRef = useKzTrack<HTMLDivElement>(enabled, {
    onMove: (frame, el) => {
      el.style.setProperty("--kzsp-x", `${frame.x.toFixed(1)}px`);
      el.style.setProperty("--kzsp-y", `${frame.y.toFixed(1)}px`);
    },
  });

  return (
    <div
      ref={hostRef}
      className={kzClass("kzsp", className)}
      style={kzVars(style, {
        "--kzsp-size": `${size}px`,
        ...(color ? { "--kzsp-color": color } : {}),
      })}
    >
      <KzPointerCss />
      <span className="kzsp-clip" aria-hidden="true">
        <span className="kzsp-glow" />
      </span>
      <div className="kzsp-in">{children}</div>
    </div>
  );
}

/* ==========================================================================
   3. KzTilt3D
   ========================================================================== */

export interface KzTilt3DProps {
  children: ReactNode;
  /** Maximum rotation on each axis, degrees. Past ~10 it reads as a gimmick. */
  max?: number;
  /** Scale held while the pointer is inside. */
  scale?: number;
  /** Perspective depth, px. Lower is a stronger effect. */
  perspective?: number;
  className?: string;
  style?: CSSProperties;
}

/** Perspective tilt toward the pointer. Transform only, on one composited layer. */
export function KzTilt3D({
  children,
  max = 8,
  scale = 1,
  perspective = 900,
  className,
  style,
}: KzTilt3DProps) {
  const enabled = useKzPointerEnabled();
  const innerRef = useRef<HTMLDivElement | null>(null);

  const hostRef = useKzTrack<HTMLDivElement>(enabled, {
    onMove: (frame) => {
      const inner = innerRef.current;
      if (!inner) return;
      const rx = (0.5 - frame.ny) * 2 * max;
      const ry = (frame.nx - 0.5) * 2 * max;
      inner.style.transform = `perspective(${perspective}px) rotateX(${rx.toFixed(
        2
      )}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale})`;
    },
    onLeave: () => {
      const inner = innerRef.current;
      if (inner) inner.style.transform = "";
    },
  });

  return (
    <div ref={hostRef} className={kzClass("kztilt", className)} style={style}>
      <KzPointerCss />
      <div ref={innerRef} className="kztilt-in">
        {children}
      </div>
    </div>
  );
}

/* ==========================================================================
   4. KzHoverLift
   ========================================================================== */

export interface KzHoverLiftProps {
  children: ReactNode;
  /** Travel upward, px. */
  lift?: number;
  /** Optional scale held with the lift. */
  scale?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Pure CSS, so it costs nothing until it is hovered. `:focus-within` is
 * deliberately outside the hover gate: a keyboard user tabbing to a card gets
 * the same feedback a mouse user gets.
 */
export function KzHoverLift({
  children,
  lift = 6,
  scale = 1,
  className,
  style,
}: KzHoverLiftProps) {
  return (
    <div
      className={kzClass("kzlift", className)}
      style={kzVars(style, { "--kzlift-y": `${lift}px`, "--kzlift-s": scale })}
    >
      <KzPointerCss />
      {children}
    </div>
  );
}

/* ==========================================================================
   5. KzBorderGlowFollow
   ========================================================================== */

export interface KzBorderGlowFollowProps {
  children: ReactNode;
  /** Any CSS colour for the edge light. Defaults to the --acc token. */
  color?: string;
  /**
   * How far each edge strip is held back from the corners, so a rounded card
   * never shows a straight line running past its radius.
   */
  inset?: string;
  className?: string;
  style?: CSSProperties;
}

/** Edge normals in radians: right, bottom, left, top. */
const KZ_EDGE_ANGLE = [0, Math.PI / 2, Math.PI, -Math.PI / 2] as const;
const KZ_EDGE_VAR = ["--kzbge-r", "--kzbge-b", "--kzbge-l", "--kzbge-t"] as const;

/**
 * The edge nearest the pointer lights up, falling off as the pointer swings
 * away. Four 1px strips whose OPACITY is driven — a conic-gradient border would
 * have meant repainting the whole card on every frame.
 */
export function KzBorderGlowFollow({
  children,
  color,
  inset = "14%",
  className,
  style,
}: KzBorderGlowFollowProps) {
  const enabled = useKzPointerEnabled();

  const hostRef = useKzTrack<HTMLDivElement>(enabled, {
    onMove: (frame, el) => {
      const theta = Math.atan2(frame.dy, frame.dx);
      for (let i = 0; i < KZ_EDGE_ANGLE.length; i += 1) {
        const facing = Math.max(0, Math.cos(theta - KZ_EDGE_ANGLE[i]));
        el.style.setProperty(KZ_EDGE_VAR[i], (facing * facing).toFixed(3));
      }
    },
    onLeave: (el) => {
      for (const name of KZ_EDGE_VAR) el.style.setProperty(name, "0");
    },
  });

  return (
    <div
      ref={hostRef}
      className={kzClass("kzbge", className)}
      style={kzVars(style, {
        "--kzbge-inset": inset,
        ...(color ? { "--kzbge-color": color } : {}),
      })}
    >
      <KzPointerCss />
      <span className="kzbge-e kzbge-t" aria-hidden="true" />
      <span className="kzbge-e kzbge-r" aria-hidden="true" />
      <span className="kzbge-e kzbge-b" aria-hidden="true" />
      <span className="kzbge-e kzbge-l" aria-hidden="true" />
      {children}
    </div>
  );
}

/* ==========================================================================
   6. KzImageZoom
   ========================================================================== */

export interface KzImageZoomProps {
  children: ReactNode;
  /** Scale reached on hover. Above ~1.1 the image visibly softens. */
  scale?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Scales media inside a clipped frame. Add KZ_HOVER_GROUP to the card around it
 * and the whole card drives the zoom.
 */
export function KzImageZoom({
  children,
  scale = 1.06,
  className,
  style,
}: KzImageZoomProps) {
  return (
    <div
      className={kzClass("kzzoom", className)}
      style={kzVars(style, { "--kzzoom-s": scale })}
    >
      <KzPointerCss />
      <div className="kzzoom-in">{children}</div>
    </div>
  );
}

/* ==========================================================================
   7. KzDirectionalFill
   ========================================================================== */

export interface KzDirectionalFillProps {
  children: ReactNode;
  /** Any CSS colour or gradient. Defaults to the --gr token. */
  fill?: string;
  className?: string;
  style?: CSSProperties;
}

type KzEdge = "top" | "right" | "bottom" | "left";

const KZ_EDGE_OFFSET: Record<KzEdge, string> = {
  /* 101% rather than 100%: sub-pixel rounding otherwise leaves a hairline of
     fill parked against the edge. */
  top: "translate3d(0,-101%,0)",
  right: "translate3d(101%,0,0)",
  bottom: "translate3d(0,101%,0)",
  left: "translate3d(-101%,0,0)",
};

function kzNearestEdge(frame: KzTrackFrame): KzEdge {
  /* Measured in px, not in normalised space: on a wide card the normalised
     distances would report left/right for a pointer that plainly came in over
     the top. */
  const top = frame.y;
  const bottom = frame.height - frame.y;
  const left = frame.x;
  const right = frame.width - frame.x;
  const nearest = Math.min(top, bottom, left, right);
  if (nearest === top) return "top";
  if (nearest === bottom) return "bottom";
  if (nearest === left) return "left";
  return "right";
}

/**
 * The fill enters from the edge the pointer crossed and leaves through the edge
 * it exits by — the panel feels pushed rather than switched.
 *
 * While the fill is in, the host carries `data-kz-on="1"`, so a consumer can
 * invert its own text colour against it from CSS.
 */
export function KzDirectionalFill({
  children,
  fill,
  className,
  style,
}: KzDirectionalFillProps) {
  const enabled = useKzPointerEnabled();
  const fillRef = useRef<HTMLSpanElement | null>(null);
  const edgeRef = useRef<KzEdge>("bottom");

  const hostRef = useKzTrack<HTMLDivElement>(enabled, {
    onEnter: (frame) => {
      const layer = fillRef.current;
      if (!layer) return;
      edgeRef.current = kzNearestEdge(frame);
      layer.style.transition = "none";
      layer.style.transform = KZ_EDGE_OFFSET[edgeRef.current];
      /* One deliberate synchronous layout read, to commit the jump to the entry
         edge before the run to zero is started. */
      layer.getBoundingClientRect();
      layer.style.transition = "";
      layer.style.transform = "translate3d(0,0,0)";
    },
    onMove: (frame) => {
      edgeRef.current = kzNearestEdge(frame);
    },
    onLeave: () => {
      const layer = fillRef.current;
      if (!layer) return;
      layer.style.transition = "";
      layer.style.transform = KZ_EDGE_OFFSET[edgeRef.current];
    },
  });

  return (
    <div
      ref={hostRef}
      className={kzClass("kzdf", className)}
      style={kzVars(style, fill ? { "--kzdf-fill": fill } : {})}
    >
      <KzPointerCss />
      <span ref={fillRef} className="kzdf-fill" aria-hidden="true" />
      <div className="kzdf-in">{children}</div>
    </div>
  );
}

/* ==========================================================================
   8. KzButtonWipe
   ========================================================================== */

export interface KzButtonWipeProps {
  children: ReactNode;
  /** Any CSS colour or gradient. Defaults to the --gr token. */
  fill?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * A fill that wipes in from the left and, on leave, keeps going out to the
 * right rather than reversing. That is the untransitioned `transform-origin`
 * flip in the sheet: scaleX is the only animated value.
 */
export function KzButtonWipe({
  children,
  fill,
  className,
  style,
}: KzButtonWipeProps) {
  return (
    <span
      className={kzClass("kzbw", className)}
      style={kzVars(style, fill ? { "--kzbw-fill": fill } : {})}
    >
      <KzPointerCss />
      <span className="kzbw-fill" aria-hidden="true" />
      <span className="kzbw-in">{children}</span>
    </span>
  );
}

/* ==========================================================================
   9. KzUnderlineSweep
   ========================================================================== */

export interface KzUnderlineSweepProps {
  children: ReactNode;
  /** Rule thickness, px. */
  thickness?: number;
  /** Distance below the text baseline box, px. */
  offset?: number;
  /** Any CSS colour. Defaults to the inherited text colour. */
  color?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * scaleX on `::after`, in from the left and out to the right. Reduced motion
 * keeps the rule — it is an affordance, and the global sheet already collapses
 * the duration, so it appears instead of sweeping.
 */
export function KzUnderlineSweep({
  children,
  thickness = 1,
  offset = -2,
  color,
  className,
  style,
}: KzUnderlineSweepProps) {
  return (
    <span
      className={kzClass("kzus", className)}
      style={kzVars(style, {
        "--kzus-size": `${thickness}px`,
        "--kzus-offset": `${offset}px`,
        ...(color ? { "--kzus-color": color } : {}),
      })}
    >
      <KzPointerCss />
      {children}
    </span>
  );
}

/* ==========================================================================
   10. KzArrowNudge
   ========================================================================== */

export type KzNudgeDirection = "right" | "left" | "up" | "down";

export interface KzArrowNudgeProps {
  children: ReactNode;
  direction?: KzNudgeDirection;
  /** Travel, px. Four or five is the whole effect; ten looks like a bug. */
  distance?: number;
  /**
   * Pads the wrapper out to a 44px target. Only for a standalone arrow — when
   * the arrow sits inside a larger link, that link already owns the target and
   * padding this would tear the text line apart.
   */
  hitArea?: boolean;
  className?: string;
  style?: CSSProperties;
}

const KZ_NUDGE_AXIS: Record<KzNudgeDirection, [number, number]> = {
  right: [1, 0],
  left: [-1, 0],
  up: [0, -1],
  down: [0, 1],
};

/**
 * Nudges an arrow on hover of itself or of any KZ_HOVER_GROUP ancestor, so a
 * whole card can move its own arrow.
 */
export function KzArrowNudge({
  children,
  direction = "right",
  distance = 4,
  hitArea = false,
  className,
  style,
}: KzArrowNudgeProps) {
  const [ax, ay] = KZ_NUDGE_AXIS[direction];

  return (
    <span
      className={kzClass("kzan", hitArea && "kzan-hit", className)}
      style={kzVars(style, {
        "--kzan-x": `${ax * distance}px`,
        "--kzan-y": `${ay * distance}px`,
      })}
    >
      <KzPointerCss />
      <span className="kzan-in">{children}</span>
    </span>
  );
}

/* ==========================================================================
   11. KzCaptionReveal
   ========================================================================== */

export interface KzCaptionRevealProps {
  /** The media the caption sits over. */
  children: ReactNode;
  caption: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * The caption is CONTENT, so it is visible by default and only hidden inside
 * the hover + no-reduced-motion query. A phone, a keyboard user and anyone with
 * motion turned down reads it outright; a mouse user gets it on hover.
 */
export function KzCaptionReveal({
  children,
  caption,
  className,
  style,
}: KzCaptionRevealProps) {
  return (
    <figure className={kzClass("kzcr", className)} style={style}>
      <KzPointerCss />
      {children}
      <figcaption className="kzcr-cap">{caption}</figcaption>
    </figure>
  );
}

/* ==========================================================================
   12. KzCustomCursor
   ========================================================================== */

/**
 * Spread onto any element to give the custom cursor a label over it:
 * `<a {...kzCursorLabel("View")}>`. It is a decoration on top of the element's
 * real accessible name, never a replacement for it.
 */
export function kzCursorLabel(label: string) {
  return { "data-kz-cursor": label } as const;
}

export interface KzCustomCursorProps {
  /** Ring diameter, px. */
  size?: number;
  /** Dot diameter, px. */
  dotSize?: number;
  /** Any CSS colour. Defaults to the --acc token. */
  color?: string;
  /**
   * Hide the OS cursor while the mouse is the active input. Withdrawn on the
   * first keypress and restored on the next real mouse move, so a keyboard user
   * is never left without a pointer. Text fields keep their caret regardless.
   */
  hideNative?: boolean;
}

/** Ring trails, dot leads. Two rates are what makes it read as one object. */
const KZ_RING_LERP = 0.16;
const KZ_DOT_LERP = 0.42;
/** Below this the remaining travel is sub-pixel; stop the loop rather than idle. */
const KZ_SETTLE = 0.2;

/**
 * A dot and a lerping ring, with an optional label over marked targets.
 *
 * Mount once, near the root. It renders nothing at all unless the device has a
 * fine pointer and motion is allowed, and it stays invisible until the mouse
 * actually moves — so it can never cost the first paint. The rAF loop parks
 * itself the moment the ring catches up.
 */
export function KzCustomCursor({
  size = 34,
  dotSize = 6,
  color,
  hideNative = true,
}: KzCustomCursorProps) {
  const enabled = useKzPointerEnabled();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    const labelEl = labelRef.current;
    if (!root || !ring || !dot || !labelEl) return;

    const doc = document.documentElement;
    let targetX = 0;
    let targetY = 0;
    let ringX = 0;
    let ringY = 0;
    let dotX = 0;
    let dotY = 0;
    let placed = false;
    let frame = 0;

    const applyHide = (on: boolean) => {
      if (on && hideNative) {
        if (doc.dataset.kzNocursor !== "on") doc.dataset.kzNocursor = "on";
      } else if (doc.dataset.kzNocursor !== undefined) {
        delete doc.dataset.kzNocursor;
      }
    };

    const tick = () => {
      frame = 0;
      ringX += (targetX - ringX) * KZ_RING_LERP;
      ringY += (targetY - ringY) * KZ_RING_LERP;
      dotX += (targetX - dotX) * KZ_DOT_LERP;
      dotY += (targetY - dotY) * KZ_DOT_LERP;
      ring.style.transform = `translate3d(${ringX.toFixed(2)}px,${ringY.toFixed(2)}px,0)`;
      dot.style.transform = `translate3d(${dotX.toFixed(2)}px,${dotY.toFixed(2)}px,0)`;
      const remaining =
        Math.abs(targetX - ringX) +
        Math.abs(targetY - ringY) +
        Math.abs(targetX - dotX) +
        Math.abs(targetY - dotY);
      if (remaining > KZ_SETTLE) frame = requestAnimationFrame(tick);
    };

    const ensureFrame = () => {
      if (frame === 0) frame = requestAnimationFrame(tick);
    };

    const retire = () => {
      placed = false;
      root.dataset.kzLive = "0";
      applyHide(false);
    };

    const onMove = (event: PointerEvent) => {
      // Touch on a hybrid machine: hand the OS cursor straight back.
      if (event.pointerType === "touch") {
        retire();
        return;
      }
      targetX = event.clientX;
      targetY = event.clientY;
      if (!placed) {
        placed = true;
        ringX = dotX = targetX;
        ringY = dotY = targetY;
      }
      if (root.dataset.kzLive !== "1") root.dataset.kzLive = "1";
      applyHide(true);
      ensureFrame();
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        retire();
        return;
      }
      root.dataset.kzState = "press";
    };

    const onUp = () => {
      root.dataset.kzState = "idle";
    };

    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const target = event.target;
      const hit =
        target instanceof Element ? target.closest("[data-kz-cursor]") : null;
      const next = hit?.getAttribute("data-kz-cursor") ?? "";
      if (labelEl.textContent === next) return;
      // Written straight to the DOM rather than through state: this fires on
      // every hover boundary, and a React render per boundary buys nothing.
      labelEl.textContent = next;
      root.dataset.kzLabel = next ? "1" : "0";
    };

    // Any keypress means the keyboard is driving. Give the OS cursor back and
    // stand down until a real mouse move says otherwise.
    const onKey = () => retire();

    // A null relatedTarget is the cross-browser signal that the pointer left the
    // document entirely — `pointerleave` on `document` is not dependable.
    const onDocOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) retire();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("keydown", onKey, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onDocOut, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onDocOut);
      if (frame !== 0) cancelAnimationFrame(frame);
      applyHide(false);
    };
  }, [enabled, hideNative]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      className="kzcur"
      aria-hidden="true"
      style={kzVars(undefined, {
        "--kzcur-size": `${size}px`,
        "--kzcur-dot": `${dotSize}px`,
        ...(color ? { "--kzcur-color": color } : {}),
      })}
    >
      <KzPointerCss />
      <div ref={ringRef} className="kzcur-ring">
        <span className="kzcur-s">
          <span className="kzcur-f" />
          <span className="kzcur-i" />
        </span>
        <span ref={labelRef} className="kzcur-l" />
      </div>
      <div ref={dotRef} className="kzcur-dot">
        <span className="kzcur-d" />
      </div>
    </div>
  );
}
