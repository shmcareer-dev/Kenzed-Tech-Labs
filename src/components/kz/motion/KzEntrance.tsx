"use client";

/**
 * KzEntrance — the scroll entrance kit (category 1 of the Kenzed motion vocabulary).
 *
 * Every component here fires ONCE when the element scrolls into view and never
 * re-runs: `whileInView` + `viewport={{ once: true }}`. Nothing loops, nothing
 * scrubs, nothing reverses on scroll-up.
 *
 * House rules baked in, so callers cannot break them:
 *  - Only transform / opacity / filter / clip-path / mask are animated. Nothing
 *    here touches top, left, width or height, so no frame ever forces layout.
 *  - One easing language: KZ_EASE on every entrance.
 *  - Durations are clamped to 200-800ms and stagger steps to 80-120ms.
 *  - prefers-reduced-motion renders the children plainly with no variants, no
 *    hidden initial state and no IntersectionObserver attached at all.
 *  - Mobile keeps the same choreography at reduced amplitude (KZ_MOBILE_FIDELITY)
 *    rather than shipping full-amplitude jank.
 */

import {
  Children,
  isValidElement,
  useMemo,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type Ref,
  type SVGProps,
} from "react";
import { motion, type MotionProps, type Variants } from "motion/react";

/**
 * SVG attributes minus the handful of names motion reserves for its own props
 * (onAnimationStart, onDrag…). Safe to spread onto a plain svg or a motion one.
 */
type KzSvgProps<T> = Omit<SVGProps<T>, keyof MotionProps>;

/**
 * The single easing language for the whole site. Entrances use this curve and
 * only this curve — a browser-default `ease` anywhere is the amateur tell.
 */
export const KZ_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Elements a Kz entrance may render as. */
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

/**
 * The edge the motion originates from: a KzSlideIn enters from that edge, and a
 * KzClipReveal / KzMaskReveal wipe starts at that edge and travels across.
 */
export type KzDirection = "left" | "right" | "top" | "bottom";

const KZ_MIN_DURATION = 200;
const KZ_MAX_DURATION = 800;
const KZ_MIN_STEP = 80;
const KZ_MAX_STEP = 120;

/** Below 640px every travel distance, blur radius and angle is scaled by this. */
const KZ_MOBILE_FIDELITY = 0.6;

/** Start the entrance slightly before the element is fully on screen. */
const KZ_VIEWPORT_MARGIN = "0px 0px -12% 0px";
const KZ_AMOUNT = 0.2;

const clampDuration = (ms: number) =>
  Math.min(Math.max(ms, KZ_MIN_DURATION), KZ_MAX_DURATION) / 1000;
const clampStep = (ms: number) => Math.min(Math.max(ms, KZ_MIN_STEP), KZ_MAX_STEP) / 1000;
const toSeconds = (ms: number) => Math.max(ms, 0) / 1000;

/* -------------------------------------------------------------------------- */
/* Media queries                                                              */
/* -------------------------------------------------------------------------- */

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

/**
 * useSyncExternalStore settles during the hydration layout phase, so a
 * reduced-motion visitor swaps to the plain branch before the first paint —
 * no flash of the hidden initial state and no hydration mismatch.
 */
function useKzReducedMotion(): boolean {
  return useSyncExternalStore(kzSubscribeReduced, kzReadReduced, kzServerSnapshot);
}

function useKzFidelity(): number {
  const small = useSyncExternalStore(kzSubscribeSmall, kzReadSmall, kzServerSnapshot);
  return small ? KZ_MOBILE_FIDELITY : 1;
}

/* -------------------------------------------------------------------------- */
/* Shared props                                                               */
/* -------------------------------------------------------------------------- */

export interface KzEntranceProps {
  children: ReactNode;
  /** Milliseconds to wait after the element enters view. */
  delay?: number;
  /** Milliseconds the entrance runs for. Clamped to 200-800. */
  duration?: number;
  className?: string;
  style?: CSSProperties;
  /** Element rendered by both the animated and the plain branch. */
  as?: KzTag;
  /**
   * ABOVE-THE-FOLD ESCAPE HATCH. `eager` skips the entrance completely: no
   * variants, no hidden initial state, no IntersectionObserver — just the
   * children in a bare element.
   *
   * Use it for anything painted in the first viewport. An above-fold element
   * that starts at opacity 0 delays Largest Contentful Paint until the observer
   * fires, and LCP is a ranking signal this site is actively optimised for.
   * Rule of thumb: hero copy, hero CTA and the first card row are `eager`;
   * everything the visitor has to scroll to is not.
   */
  eager?: boolean;
  /** Fraction of the element that must be visible before firing. */
  amount?: number;
  ref?: Ref<HTMLElement>;
}

interface KzEntranceBaseProps extends KzEntranceProps {
  variants: Variants;
  /** Static CSS only the animated branch needs (mask plumbing, transform origin). */
  baseStyle?: CSSProperties;
}

function KzEntranceBase({
  children,
  delay = 0,
  duration = 620,
  className,
  style,
  as = "div",
  eager = false,
  amount = KZ_AMOUNT,
  ref,
  variants,
  baseStyle,
}: KzEntranceBaseProps) {
  const reduced = useKzReducedMotion();

  if (eager || reduced) {
    const Plain = as as "div";
    return (
      <Plain ref={ref as Ref<HTMLDivElement>} className={className} style={style}>
        {children}
      </Plain>
    );
  }

  const Animated = motion[as] as typeof motion.div;
  return (
    <Animated
      ref={ref as Ref<HTMLDivElement>}
      className={className}
      style={baseStyle ? { ...baseStyle, ...style } : style}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin: KZ_VIEWPORT_MARGIN }}
      transition={{ duration: clampDuration(duration), delay: toSeconds(delay), ease: KZ_EASE }}
    >
      {children}
    </Animated>
  );
}

/* -------------------------------------------------------------------------- */
/* KzFadeUp                                                                   */
/* -------------------------------------------------------------------------- */

export interface KzFadeUpProps extends KzEntranceProps {
  /** Travel distance in px, before mobile scaling. */
  distance?: number;
}

/** Opacity 0 to 1 with a short upward translate. The workhorse. */
export function KzFadeUp({ distance = 26, duration = 620, ...rest }: KzFadeUpProps) {
  const fidelity = useKzFidelity();
  const variants = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, y: distance * fidelity },
      visible: { opacity: 1, y: 0 },
    }),
    [distance, fidelity]
  );
  return <KzEntranceBase {...rest} duration={duration} variants={variants} />;
}

/* -------------------------------------------------------------------------- */
/* KzStagger                                                                  */
/* -------------------------------------------------------------------------- */

export interface KzStaggerProps extends KzEntranceProps {
  /** Milliseconds between consecutive children. Clamped to 80-120. */
  step?: number;
  /** Travel distance in px, before mobile scaling. */
  distance?: number;
  /** Element each direct child is wrapped in — use "li" inside a list. */
  childAs?: KzTag;
  childClassName?: string;
}

/**
 * Fades its direct children up in sequence, child N starting at N * step.
 * Each child is wrapped in a `childAs` element because motion only cascades
 * variants down through motion components.
 */
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

  const container = useMemo<Variants>(
    () => ({
      hidden: {},
      visible: {
        transition: { delayChildren: toSeconds(delay), staggerChildren: clampStep(step) },
      },
    }),
    [delay, step]
  );

  const item = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, y: distance * fidelity },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: clampDuration(duration), ease: KZ_EASE },
      },
    }),
    [distance, fidelity, duration]
  );

  if (eager || reduced) {
    const Plain = as as "div";
    return (
      <Plain ref={ref as Ref<HTMLDivElement>} className={className} style={style}>
        {children}
      </Plain>
    );
  }

  const Parent = motion[as] as typeof motion.div;
  const Item = motion[childAs] as typeof motion.div;

  return (
    <Parent
      ref={ref as Ref<HTMLDivElement>}
      className={className}
      style={style}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin: KZ_VIEWPORT_MARGIN }}
    >
      {Children.map(children, (child) => (
        <Item className={childClassName} variants={item}>
          {child}
        </Item>
      ))}
    </Parent>
  );
}

/* -------------------------------------------------------------------------- */
/* KzBlurIn                                                                   */
/* -------------------------------------------------------------------------- */

export interface KzBlurInProps extends KzEntranceProps {
  /** Starting blur radius in px, before mobile scaling. */
  blur?: number;
}

/**
 * Focus pull: blur plus opacity. `filter` is GPU-composited, so this costs paint
 * but never layout; the radius stays small and drops further on mobile.
 */
export function KzBlurIn({ blur = 9, duration = 700, ...rest }: KzBlurInProps) {
  const fidelity = useKzFidelity();
  const variants = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, filter: `blur(${(blur * fidelity).toFixed(2)}px)` },
      visible: { opacity: 1, filter: "blur(0px)" },
    }),
    [blur, fidelity]
  );
  return <KzEntranceBase {...rest} duration={duration} variants={variants} />;
}

/* -------------------------------------------------------------------------- */
/* KzScaleIn                                                                  */
/* -------------------------------------------------------------------------- */

export interface KzScaleInProps extends KzEntranceProps {
  /** Starting scale. Keep it near 1 — anything under 0.9 reads as a zoom. */
  from?: number;
}

/** Settles up from 0.95 to 1 while fading in. Good for cards and media. */
export function KzScaleIn({ from = 0.95, duration = 560, ...rest }: KzScaleInProps) {
  const variants = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, scale: from },
      visible: { opacity: 1, scale: 1 },
    }),
    [from]
  );
  return <KzEntranceBase {...rest} duration={duration} variants={variants} />;
}

/* -------------------------------------------------------------------------- */
/* KzSlideIn                                                                  */
/* -------------------------------------------------------------------------- */

export interface KzSlideInProps extends KzEntranceProps {
  /** Edge the element travels in from. */
  direction?: KzDirection;
  /** Travel distance in px, before mobile scaling. */
  distance?: number;
}

/** Translates in from one edge. Transform only — never left/top. */
export function KzSlideIn({
  direction = "left",
  distance = 40,
  duration = 620,
  ...rest
}: KzSlideInProps) {
  const fidelity = useKzFidelity();
  const variants = useMemo<Variants>(() => {
    const d = distance * fidelity;
    const offset =
      direction === "left"
        ? { x: -d }
        : direction === "right"
          ? { x: d }
          : direction === "top"
            ? { y: -d }
            : { y: d };
    return {
      hidden: { opacity: 0, ...offset },
      visible: { opacity: 1, x: 0, y: 0 },
    };
  }, [direction, distance, fidelity]);
  return <KzEntranceBase {...rest} duration={duration} variants={variants} />;
}

/* -------------------------------------------------------------------------- */
/* KzClipReveal                                                               */
/* -------------------------------------------------------------------------- */

const KZ_CLIP_FROM: Record<KzDirection, string> = {
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
  top: "inset(0% 0% 100% 0%)",
  bottom: "inset(100% 0% 0% 0%)",
};
const KZ_CLIP_TO = "inset(0% 0% 0% 0%)";

export interface KzClipRevealProps extends KzEntranceProps {
  /** Edge the wipe starts from. */
  direction?: KzDirection;
}

/**
 * Hard-edged inset wipe. The element is never resized — clip-path only changes
 * what is painted, so the layout box is stable for the whole entrance.
 */
export function KzClipReveal({ direction = "left", duration = 700, ...rest }: KzClipRevealProps) {
  const variants = useMemo<Variants>(
    () => ({
      hidden: { clipPath: KZ_CLIP_FROM[direction] },
      visible: { clipPath: KZ_CLIP_TO },
    }),
    [direction]
  );
  return <KzEntranceBase {...rest} duration={duration} variants={variants} />;
}

/* -------------------------------------------------------------------------- */
/* KzMaskReveal                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Mask alpha stops. These are channel values, not design colours — the mask
 * layer is never seen, so it intentionally sits outside the token palette.
 */
const KZ_MASK_OPAQUE = "rgba(0,0,0,1)";
const KZ_MASK_CLEAR = "rgba(0,0,0,0)";

const kzMaskImage = (angle: number) =>
  `linear-gradient(${angle}deg, ${KZ_MASK_OPAQUE} 0%, ${KZ_MASK_OPAQUE} 42%, ${KZ_MASK_CLEAR} 68%)`;

interface KzMaskSpec {
  image: string;
  size: string;
  from: string;
  to: string;
}

const KZ_MASK: Record<KzDirection, KzMaskSpec> = {
  left: { image: kzMaskImage(90), size: "260% 100%", from: "100% 50%", to: "0% 50%" },
  right: { image: kzMaskImage(270), size: "260% 100%", from: "0% 50%", to: "100% 50%" },
  top: { image: kzMaskImage(180), size: "100% 260%", from: "50% 100%", to: "50% 0%" },
  bottom: { image: kzMaskImage(0), size: "100% 260%", from: "50% 0%", to: "50% 100%" },
};

export interface KzMaskRevealProps extends KzEntranceProps {
  /** Edge the soft sweep starts from. */
  direction?: KzDirection;
}

/**
 * Soft-edged sweep: an oversized alpha gradient slides across the element via
 * mask-position. Same silhouette as KzClipReveal with a feathered edge instead
 * of a hard one. Reduced-motion visitors get no mask applied at all.
 */
export function KzMaskReveal({ direction = "left", duration = 750, ...rest }: KzMaskRevealProps) {
  const spec = KZ_MASK[direction];

  const baseStyle = useMemo<CSSProperties>(
    () => ({
      maskImage: spec.image,
      WebkitMaskImage: spec.image,
      maskSize: spec.size,
      WebkitMaskSize: spec.size,
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
    }),
    [spec]
  );

  const variants = useMemo<Variants>(
    () => ({
      hidden: { maskPosition: spec.from, WebkitMaskPosition: spec.from },
      visible: { maskPosition: spec.to, WebkitMaskPosition: spec.to },
    }),
    [spec]
  );

  return <KzEntranceBase {...rest} duration={duration} variants={variants} baseStyle={baseStyle} />;
}

/* -------------------------------------------------------------------------- */
/* KzLineDraw                                                                 */
/* -------------------------------------------------------------------------- */

const KZ_DRAWABLE = new Set(["path", "line", "polyline", "polygon", "circle", "ellipse", "rect"]);

export interface KzLineDrawProps extends Omit<KzEntranceProps, "as" | "ref"> {
  /** Required — the kit never guesses an SVG coordinate space. */
  viewBox: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  /** Milliseconds between consecutive shapes. Clamped to 80-120. */
  step?: number;
  /** Accessible name. Omit for decorative art and the svg is aria-hidden. */
  label?: string;
  ref?: Ref<SVGSVGElement>;
}

/**
 * Self-drawing line art. Each drawable child is promoted to a motion shape and
 * animated on `pathLength`, which motion implements as stroke-dasharray /
 * stroke-dashoffset, so no geometry is touched and nothing relayouts.
 *
 * Children are plain SVG shapes:
 *   <KzLineDraw viewBox="0 0 64 64"><path d="M8 32 L56 32" /></KzLineDraw>
 * Non-drawable children (defs, g, text) pass straight through, undrawn.
 */
export function KzLineDraw({
  children,
  delay = 0,
  duration = 800,
  step = 90,
  className,
  style,
  viewBox,
  stroke = "currentColor",
  strokeWidth = 1.5,
  fill = "none",
  label,
  eager = false,
  amount = 0.3,
  ref,
}: KzLineDrawProps) {
  const reduced = useKzReducedMotion();

  const container = useMemo<Variants>(
    () => ({
      hidden: {},
      visible: {
        transition: { delayChildren: toSeconds(delay), staggerChildren: clampStep(step) },
      },
    }),
    [delay, step]
  );

  const shape = useMemo<Variants>(
    () => ({
      hidden: { pathLength: 0, opacity: 0 },
      visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: { duration: clampDuration(duration), ease: KZ_EASE },
          opacity: { duration: 0.2, ease: KZ_EASE },
        },
      },
    }),
    [duration]
  );

  const a11y: KzSvgProps<SVGSVGElement> = label
    ? { role: "img", "aria-label": label }
    : { "aria-hidden": true };

  if (eager || reduced) {
    return (
      <svg
        ref={ref}
        viewBox={viewBox}
        className={className}
        style={style}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        {...a11y}
      >
        {children}
      </svg>
    );
  }

  return (
    <motion.svg
      ref={ref}
      viewBox={viewBox}
      className={className}
      style={style}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin: KZ_VIEWPORT_MARGIN }}
      {...a11y}
    >
      {Children.map(children, (child) => {
        if (!isValidElement(child) || typeof child.type !== "string") return child;
        if (!KZ_DRAWABLE.has(child.type)) return child;
        const Shape = motion[child.type as "path"] as typeof motion.path;
        return <Shape {...(child.props as KzSvgProps<SVGPathElement>)} variants={shape} />;
      })}
    </motion.svg>
  );
}

/* -------------------------------------------------------------------------- */
/* KzFlipIn                                                                   */
/* -------------------------------------------------------------------------- */

export interface KzFlipInProps extends KzEntranceProps {
  /** Starting rotateX in degrees, before mobile scaling. */
  angle?: number;
}

/**
 * Hinges down from its top edge under a fixed perspective. `transformPerspective`
 * keeps the projection on the element itself, so no wrapper div is needed and the
 * parent's stacking context is left alone.
 */
export function KzFlipIn({ angle = 20, duration = 660, ...rest }: KzFlipInProps) {
  const fidelity = useKzFidelity();
  const variants = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, rotateX: -angle * fidelity, transformPerspective: 1000 },
      visible: { opacity: 1, rotateX: 0, transformPerspective: 1000 },
    }),
    [angle, fidelity]
  );
  return (
    <KzEntranceBase
      {...rest}
      duration={duration}
      variants={variants}
      baseStyle={{ transformOrigin: "50% 0%" }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* KzSkewSettle                                                               */
/* -------------------------------------------------------------------------- */

export interface KzSkewSettleProps extends KzEntranceProps {
  /** Starting skewY in degrees, before mobile scaling. */
  skew?: number;
  /** Travel distance in px, before mobile scaling. */
  distance?: number;
}

/** Arrives leaning, then straightens. Reads as momentum settling. */
export function KzSkewSettle({
  skew = 5,
  distance = 18,
  duration = 620,
  ...rest
}: KzSkewSettleProps) {
  const fidelity = useKzFidelity();
  const variants = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, skewY: skew * fidelity, y: distance * fidelity },
      visible: { opacity: 1, skewY: 0, y: 0 },
    }),
    [skew, distance, fidelity]
  );
  return <KzEntranceBase {...rest} duration={duration} variants={variants} />;
}
