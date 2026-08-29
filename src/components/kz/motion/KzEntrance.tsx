"use client";

/**
 * Section entrances — IntersectionObserver and CSS, no animation library.
 *
 * This used to be `motion/react`, which is 132KB of raw JavaScript on EVERY
 * page of the site to do one thing: fade a block up by twenty-odd pixels when
 * it scrolls into view. That is the whole feature. `KzReveal` next door had
 * already been doing it with an IntersectionObserver and two CSS classes, so
 * the library was buying nothing that was not already sitting in the codebase.
 *
 * The visual contract is unchanged: same easing curve, same 200-800ms duration
 * clamp, same 80-120ms stagger step, same 0.6 fidelity multiplier below 640px,
 * same `eager` and `prefers-reduced-motion` opt-outs.
 *
 * One behaviour is deliberately DIFFERENT, and it is better:
 *
 *   The old version rendered server HTML with the content visible, then
 *   hydration applied opacity:0 and animated it back in — so anything above
 *   the fold flashed out and back on every load. Here, an element already
 *   inside the viewport when the observer first runs is left alone. Only
 *   things below the fold are hidden and animated. That removes the flash,
 *   and it means the largest element on the page is never hidden by script,
 *   which is exactly what LCP measures.
 *
 * The hidden state is applied by JS and never by the server, so with
 * JavaScript off or broken every one of these renders as plain visible
 * content. There is no way for this component to hide something permanently.
 */

import {
  Children,
  useEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";

export const KZ_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const KZ_EASE_CSS_ENTRANCE = "cubic-bezier(0.22, 1, 0.36, 1)";

export type KzTag =
  | "div"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "main"
  | "nav"
  | "figure"
  | "figcaption"
  | "blockquote"
  | "ul"
  | "ol"
  | "li"
  | "p"
  | "span"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6";

const KZ_MIN_DURATION = 200;
const KZ_MAX_DURATION = 800;
const KZ_MIN_STEP = 80;
const KZ_MAX_STEP = 120;
const KZ_MOBILE_FIDELITY = 0.6;
/* Matches the old viewport margin and amount: start the entrance slightly
   before the block is properly on screen, and count it as seen at 20%. */
const KZ_ROOT_MARGIN = "0px 0px -12% 0px";
const KZ_AMOUNT = 0.2;

const clampDuration = (ms: number) => Math.min(Math.max(ms, KZ_MIN_DURATION), KZ_MAX_DURATION);
const clampStep = (ms: number) => Math.min(Math.max(ms, KZ_MIN_STEP), KZ_MAX_STEP);

const KZ_QUERY_REDUCED = "(prefers-reduced-motion: reduce)";
const KZ_QUERY_SMALL = "(max-width: 640px)";
const kzMediaCache = new Map<string, MediaQueryList>();

function kzMedia(query: string): MediaQueryList {
  let mql = kzMediaCache.get(query);
  if (!mql) {
    mql = window.matchMedia(query);
    kzMediaCache.set(query, mql);
  }
  return mql;
}

function kzSubscriber(query: string) {
  return (onChange: () => void) => {
    const mql = kzMedia(query);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
}

const kzSubscribeReduced = kzSubscriber(KZ_QUERY_REDUCED);
const kzSubscribeSmall = kzSubscriber(KZ_QUERY_SMALL);
const kzReadReduced = () => kzMedia(KZ_QUERY_REDUCED).matches;
const kzReadSmall = () => kzMedia(KZ_QUERY_SMALL).matches;
const kzServerSnapshot = () => false;

export function useKzReducedMotion() {
  return useSyncExternalStore(kzSubscribeReduced, kzReadReduced, kzServerSnapshot);
}

function useKzFidelity() {
  const small = useSyncExternalStore(kzSubscribeSmall, kzReadSmall, kzServerSnapshot);
  return small ? KZ_MOBILE_FIDELITY : 1;
}

/**
 * Hide-then-reveal, but only for what is below the fold.
 *
 * `targets` is either the element itself (fade up) or its children (stagger).
 * Each target carries its own --kz-ent-delay so one observer drives the whole
 * sequence instead of a timer per child.
 */
function useKzEntrance(
  enabled: boolean,
  hostRef: React.RefObject<HTMLElement | null>,
  options: { childMode: boolean; amount: number }
) {
  const { childMode, amount } = options;

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !enabled) return;
    if (typeof IntersectionObserver === "undefined") return;

    const targets: HTMLElement[] = childMode
      ? (Array.from(host.children) as HTMLElement[])
      : [host];
    if (!targets.length) return;

    /* Anything already on screen is left exactly as the server rendered it.
       Hiding it now would be a visible flash, and if it happens to be the
       largest element it would push LCP out to whenever this effect ran. */
    const box = host.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    if (box.top < viewportH * 0.92) return;

    for (const target of targets) target.classList.add("kz-ent-out");

    /* The threshold has to be capped against the ELEMENT's own height, not
       used as given. `amount` is a fraction of the element, so on a block
       taller than the viewport that fraction can be unreachable: the 3D atlas
       on /technology is 5620px, 20% of it is 1124px, and an 844px phone can
       never show that much at once. The observer then never fires and the
       block stays at opacity 0 forever — which is exactly what happened, and
       is the one failure mode this whole mechanism must not have.

       A first attempt scaled the threshold by the element height and STILL
       stranded it, because rootMargin trims 12% off the bottom of the root:
       the observer's usable window is 88% of the viewport, and the scaled
       threshold was computed against the full height. Rather than chase that
       arithmetic, a block taller than the window it is being observed in gets
       threshold 0 — reveal as its leading edge arrives, which is the only
       behaviour that means anything for something you cannot see all of. */
    const observedH = viewportH * 0.88;
    const threshold =
      box.height > observedH * 0.9 ? 0 : Math.max(0, Math.min(amount, 0.95));

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.unobserve(entry.target);
          for (const target of targets) target.classList.add("kz-ent-in");
        }
      },
      { threshold, rootMargin: KZ_ROOT_MARGIN }
    );
    io.observe(host);

    return () => {
      io.disconnect();
      /* Leave nothing hidden behind on unmount: a route change mid-animation
         must not strand a node at opacity 0 if it is reused. */
      for (const target of targets) target.classList.remove("kz-ent-out");
    };
  }, [enabled, hostRef, childMode, amount]);
}

export interface KzEntranceProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
  as?: KzTag;
  /** Skip motion for content already visible in the first viewport. */
  eager?: boolean;
  amount?: number;
  ref?: Ref<HTMLElement>;
}

export interface KzFadeUpProps extends KzEntranceProps {
  distance?: number;
}

/** The default one-shot section entrance. */
export function KzFadeUp({
  children,
  delay = 0,
  duration = 620,
  distance = 26,
  className,
  style,
  as = "div",
  eager = false,
  amount = KZ_AMOUNT,
  ref,
}: KzFadeUpProps) {
  const reduced = useKzReducedMotion();
  const fidelity = useKzFidelity();
  const hostRef = useRef<HTMLElement | null>(null);
  const active = !eager && !reduced;

  useKzEntrance(active, hostRef, { childMode: false, amount });

  const Tag = as as "div";
  return (
    <Tag
      ref={(node: HTMLDivElement | null) => {
        hostRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as { current: HTMLElement | null }).current = node;
      }}
      className={className}
      style={
        active
          ? ({
              ...style,
              "--kz-ent-y": `${Math.round(distance * fidelity)}px`,
              "--kz-ent-d": `${clampDuration(duration)}ms`,
              "--kz-ent-delay": `${Math.max(delay, 0)}ms`,
            } as CSSProperties)
          : style
      }
    >
      {children}
    </Tag>
  );
}

export interface KzStaggerProps extends KzEntranceProps {
  step?: number;
  distance?: number;
  childAs?: KzTag;
  childClassName?: string;
}

/** Fades direct children upward in a single bounded sequence. */
export function KzStagger({
  children,
  delay = 0,
  duration = 560,
  step = 90,
  distance = 22,
  className,
  style,
  as = "div",
  childAs = "div",
  childClassName,
  eager = false,
  amount = 0.12,
  ref,
}: KzStaggerProps) {
  const reduced = useKzReducedMotion();
  const fidelity = useKzFidelity();
  const hostRef = useRef<HTMLElement | null>(null);
  const active = !eager && !reduced;

  useKzEntrance(active, hostRef, { childMode: true, amount });

  const Tag = as as "div";
  const Item = childAs as "div";

  return (
    <Tag
      ref={(node: HTMLDivElement | null) => {
        hostRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as { current: HTMLElement | null }).current = node;
      }}
      className={className}
      style={style}
    >
      {Children.map(children, (child, index) => (
        <Item
          className={childClassName}
          style={
            active
              ? ({
                  "--kz-ent-y": `${Math.round(distance * fidelity)}px`,
                  "--kz-ent-d": `${clampDuration(duration)}ms`,
                  /* The old version expressed this as delayChildren +
                     staggerChildren; multiplied out per child it is the same
                     sequence, and one observer drives all of them. */
                  "--kz-ent-delay": `${Math.max(delay, 0) + index * clampStep(step)}ms`,
                } as CSSProperties)
              : undefined
          }
        >
          {child}
        </Item>
      ))}
    </Tag>
  );
}
