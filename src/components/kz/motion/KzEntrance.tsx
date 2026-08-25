"use client";

import {
  Children,
  useMemo,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { motion, type Variants } from "motion/react";

export const KZ_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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
const KZ_VIEWPORT_MARGIN = "0px 0px -12% 0px";
const KZ_AMOUNT = 0.2;

const clampDuration = (ms: number) =>
  Math.min(Math.max(ms, KZ_MIN_DURATION), KZ_MAX_DURATION) / 1000;
const clampStep = (ms: number) =>
  Math.min(Math.max(ms, KZ_MIN_STEP), KZ_MAX_STEP) / 1000;
const toSeconds = (ms: number) => Math.max(ms, 0) / 1000;

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

function useKzReducedMotion() {
  return useSyncExternalStore(kzSubscribeReduced, kzReadReduced, kzServerSnapshot);
}

function useKzFidelity() {
  const small = useSyncExternalStore(kzSubscribeSmall, kzReadSmall, kzServerSnapshot);
  return small ? KZ_MOBILE_FIDELITY : 1;
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

interface KzEntranceBaseProps extends KzEntranceProps {
  variants: Variants;
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
      style={style}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin: KZ_VIEWPORT_MARGIN }}
      transition={{
        duration: clampDuration(duration),
        delay: toSeconds(delay),
        ease: KZ_EASE,
      }}
    >
      {children}
    </Animated>
  );
}

export interface KzFadeUpProps extends KzEntranceProps {
  distance?: number;
}

/** The default one-shot section entrance. */
export function KzFadeUp({
  distance = 26,
  duration = 620,
  ...rest
}: KzFadeUpProps) {
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

  const container = useMemo<Variants>(
    () => ({
      hidden: {},
      visible: {
        transition: {
          delayChildren: toSeconds(delay),
          staggerChildren: clampStep(step),
        },
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
    [distance, duration, fidelity]
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
