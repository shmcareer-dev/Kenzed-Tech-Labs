"use client";

/**
 * Kenzed motion kit — category 09 (data + feedback).
 *
 * House rules enforced here:
 *   - transform and opacity only (the one exception is the progress ring's
 *     `stroke-dashoffset`, which is a paint-only property and never triggers
 *     layout — it is the single correct way to draw an arc);
 *   - one easing language: KZ_EASE for entrances, KZ_SPRING for interactions;
 *   - `prefers-reduced-motion` swaps every animation for its finished state;
 *   - the Lottie engine and its JSON are behind a dynamic import, so neither
 *     reaches the initial bundle, and neither loads at all under reduced motion.
 *
 * The easing constants are re-declared here rather than imported from KzNav so
 * that a page using a count-up does not pull cmdk and next/navigation with it.
 */

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import NumberFlow, { type Format } from "@number-flow/react";

/** The one entrance curve for the whole site. */
export const KZ_FEEDBACK_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
/** Same curve, spelled for CSS transitions and Web Animations. */
export const KZ_FEEDBACK_EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Portals only exist after mount. Read as an external store rather than an
 * effect, so hydration flips it once instead of cascading a render.
 */
const kzNoopSubscribe = () => () => {};
const kzHydrated = () => true;
const kzNotHydrated = () => false;

function useKzMounted() {
  return useSyncExternalStore(kzNoopSubscribe, kzHydrated, kzNotHydrated);
}

/* ==========================================================================
   Styles — one sheet, deduplicated by React through href + precedence.
   ========================================================================== */

const KZ_FEEDBACK_CSS = `
.kzfb-sr{
  position:absolute;width:1px;height:1px;padding:0;margin:-1px;
  overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;
}
.kzfb-num{font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1}

@keyframes kzfbShimmer{from{transform:translate3d(-100%,0,0)}to{transform:translate3d(100%,0,0)}}
@keyframes kzfbSpin{to{transform:rotate(360deg)}}

.kzsk{
  position:relative;overflow:hidden;display:block;
  background:var(--card2);border-radius:var(--kzsk-r,10px);
}
/* A looping placeholder is ambience, not a transition, so it sits outside the
   200-800ms window that governs discrete moves. It travels on transform only. */
.kzsk::after{
  content:"";position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--ink) 10%,transparent),transparent);
  animation:kzfbShimmer 1.2s ${KZ_FEEDBACK_EASE_CSS} infinite;
}
.kzsk-stack{display:grid;gap:10px}

.kzbtnl{gap:10px}
.kzbtnl:disabled{cursor:not-allowed;opacity:.62}
.kzspin{
  flex:none;width:16px;height:16px;border-radius:50%;
  border:2px solid color-mix(in srgb,currentColor 26%,transparent);
  border-top-color:currentColor;animation:kzfbSpin .72s linear infinite;
}

.kzring{display:inline-grid;place-items:center;position:relative}
.kzring svg{display:block;transform:rotate(-90deg)}
.kzring-track{stroke:var(--line)}
/* stroke-dashoffset repaints the arc; it never reflows the document. */
.kzring-arc{
  stroke:var(--acc);
  transition:stroke-dashoffset .6s ${KZ_FEEDBACK_EASE_CSS};
  filter:drop-shadow(0 0 6px var(--accglow));
}
.kzring-face{
  position:absolute;inset:0;display:grid;place-items:center;gap:2px;
  text-align:center;pointer-events:none;
}
.kzring-value{
  font-family:var(--font-display);font-weight:700;letter-spacing:-.015em;
  color:var(--ink);line-height:1;
  font-size:var(--kzring-fs,1.05rem);font-variant-numeric:tabular-nums;
}
.kzring-label{
  font-family:var(--font-mono);font-size:.55rem;letter-spacing:.13em;
  text-transform:uppercase;color:var(--mut);
}

.kzlot{display:inline-block;position:relative;line-height:0}
.kzlot > *{width:100%;height:100%;display:block}
.kzlot svg{width:100%;height:100%;display:block}

.kztoasts{
  position:fixed;left:0;right:0;bottom:0;z-index:130;
  display:flex;flex-direction:column;gap:8px;pointer-events:none;
  padding:12px clamp(12px,4vw,20px);
  padding-bottom:calc(12px + env(safe-area-inset-bottom,0px));
}
.kztoasts[data-position="top"]{
  top:0;bottom:auto;flex-direction:column-reverse;
  padding-top:calc(12px + env(safe-area-inset-top,0px));
}
.kztoast{
  pointer-events:auto;display:flex;align-items:center;gap:10px;
  padding:10px 12px;border-radius:14px;border:1px solid var(--line);
  background:var(--bg2);box-shadow:var(--shadow);color:var(--ink);
  font-size:.88rem;line-height:1.45;
}
.kztoast[data-tone="success"]{border-color:color-mix(in srgb,var(--ok) 52%,transparent)}
.kztoast[data-tone="error"]{border-color:color-mix(in srgb,var(--err) 52%,transparent)}
.kztoast-dot{flex:none;width:8px;height:8px;border-radius:50%;background:var(--acc)}
.kztoast[data-tone="success"] .kztoast-dot{background:var(--ok)}
.kztoast[data-tone="error"] .kztoast-dot{background:var(--err)}
.kztoast-msg{flex:1 1 auto;min-width:0;overflow-wrap:break-word}
.kztoast-action{
  flex:none;min-height:44px;padding:0 12px;border-radius:10px;
  border:1px solid var(--line);background:transparent;color:var(--acc);cursor:pointer;
  font-family:var(--font-mono);font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;
}
.kztoast-x{
  flex:none;width:44px;height:44px;display:grid;place-items:center;
  border:0;background:transparent;color:var(--dim);cursor:pointer;
  font-family:var(--font-mono);font-size:.85rem;border-radius:10px;
}
@media (min-width:720px){
  .kztoasts{left:auto;right:clamp(14px,3vw,26px);bottom:clamp(14px,3vw,26px);max-width:400px}
  .kztoasts[data-position="top"]{top:clamp(14px,3vw,26px);bottom:auto}
}

.kzconf{position:fixed;inset:0;z-index:140;pointer-events:none}

.kzcopy{
  display:inline-flex;align-items:center;gap:9px;min-height:44px;padding:0 14px;
  border:1px solid var(--line);border-radius:12px;background:var(--card);
  color:var(--mut);cursor:pointer;
  font-family:var(--font-mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;
  transition:color .2s ${KZ_FEEDBACK_EASE_CSS},border-color .2s ${KZ_FEEDBACK_EASE_CSS};
}
.kzcopy[data-copied="true"]{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 52%,transparent)}
.kzcopy-icon{position:relative;flex:none;width:16px;height:16px}
.kzcopy-icon svg{
  position:absolute;inset:0;width:16px;height:16px;
  transition:opacity .2s ${KZ_FEEDBACK_EASE_CSS},transform .2s ${KZ_FEEDBACK_EASE_CSS};
}
.kzcopy-icon svg[data-on="false"]{opacity:0;transform:scale(.66)}
.kzcopy-icon svg[data-on="true"]{opacity:1;transform:scale(1)}

@media (prefers-reduced-motion:reduce){
  .kzsk::after{display:none}
  .kzspin{display:none}
  .kzring-arc{transition:none}
  .kzcopy-icon svg{transition:opacity .12s linear;transform:none}
  .kzcopy-icon svg[data-on="false"]{transform:none}
}
`;

function KzFeedbackStyles() {
  return (
    <style href="kz-feedback" precedence="default" dangerouslySetInnerHTML={{ __html: KZ_FEEDBACK_CSS }} />
  );
}

/* ==========================================================================
   Numbers
   ========================================================================== */

export interface KzCountUpProps {
  to: number;
  from?: number;
  /** Milliseconds. Held inside the 200-800ms window by default. */
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
  /**
   * Wait for the number to scroll into view. A value that is already on screen
   * at first paint renders finished and never animates, so a hero statistic
   * cannot cost Largest Contentful Paint.
   */
  startOnView?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** easeOutExpo — fast commit, long settle. The classic counter curve. */
function kzEaseOutExpo(t: number) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** rAF counter. Renders its final value server-side, so the number is in the HTML. */
export function KzCountUp({
  to,
  from = 0,
  duration = 800,
  decimals = 0,
  prefix = "",
  suffix = "",
  locale = "en-IN",
  startOnView = true,
  className = "",
  style,
}: KzCountUpProps) {
  const reduced = useReducedMotion() === true;
  /** null means "not mid-flight", so `to` is rendered straight through. */
  const [inFlight, setInFlight] = useState<number | null>(null);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (reduced) return;

    let frame = 0;
    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        if (t < 1) {
          setInFlight(from + (to - from) * kzEaseOutExpo(t));
          frame = requestAnimationFrame(step);
        } else {
          setInFlight(null);
        }
      };
      frame = requestAnimationFrame(step);
    };

    if (!startOnView) {
      run();
      return () => cancelAnimationFrame(frame);
    }

    const el = ref.current;
    if (!el) return;
    let firstReport = true;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (firstReport) {
          firstReport = false;
          // Already on screen at first paint: show the answer, animate nothing.
          if (entry.isIntersecting) observer.disconnect();
          return;
        }
        if (!entry.isIntersecting) return;
        observer.disconnect();
        run();
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, [duration, from, reduced, startOnView, to]);

  const text = (inFlight ?? to).toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <>
      <KzFeedbackStyles />
      <span ref={ref} className={`kzfb-num ${className}`.trim()} style={style}>
        {prefix}
        {text}
        {suffix}
      </span>
    </>
  );
}

export interface KzOdometerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  locales?: Intl.LocalesArgument;
  format?: Format;
  /** Milliseconds for the digit transform. */
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

/** Digit-rolling number for live values. Respects the motion preference itself. */
export function KzOdometer({
  value,
  prefix,
  suffix,
  locales = "en-IN",
  format,
  duration = 620,
  className = "",
  style,
}: KzOdometerProps) {
  const timing = { duration, easing: KZ_FEEDBACK_EASE_CSS };
  return (
    <>
      <KzFeedbackStyles />
      <NumberFlow
        value={value}
        prefix={prefix}
        suffix={suffix}
        locales={locales}
        format={format}
        transformTiming={timing}
        spinTiming={timing}
        opacityTiming={{ duration: 220, easing: KZ_FEEDBACK_EASE_CSS }}
        respectMotionPreference
        className={className}
        style={style}
      />
    </>
  );
}

export interface KzProgressRingProps {
  /** Current amount, in the same unit as `max`. */
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: string;
  /** Hides the percentage in the middle. */
  hideValue?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** SVG arc driven by stroke-dashoffset. */
export function KzProgressRing({
  value,
  max = 100,
  size = 104,
  stroke = 7,
  label,
  hideValue = false,
  className = "",
  style,
}: KzProgressRingProps) {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const ratio = clamped / safeMax;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.round(ratio * 100);

  return (
    <>
      <KzFeedbackStyles />
      <div
        className={`kzring ${className}`.trim()}
        style={{ width: size, height: size, "--kzring-fs": `${Math.max(size * 0.2, 13)}px`, ...style } as CSSProperties}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clamped}
        aria-label={label ?? "Progress"}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle
            className="kzring-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
          />
          <circle
            className="kzring-arc"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - ratio)}
          />
        </svg>
        {!hideValue && (
          <div className="kzring-face">
            <span className="kzring-value">{percent}%</span>
            {label && <span className="kzring-label">{label}</span>}
          </div>
        )}
      </div>
    </>
  );
}

/* ==========================================================================
   Pending states
   ========================================================================== */

export interface KzSkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  /** Renders this many stacked bars, the last one short, like real prose. */
  lines?: number;
  className?: string;
  style?: CSSProperties;
}

/** Shimmering placeholder. The sheen is a transform, never a background sweep. */
export function KzSkeleton({
  width = "100%",
  height = 14,
  radius = 10,
  lines = 1,
  className = "",
  style,
}: KzSkeletonProps) {
  const bar = (index: number) => (
    <span
      key={index}
      className={`kzsk ${lines === 1 ? className : ""}`.trim()}
      style={
        {
          width: lines > 1 && index === lines - 1 ? "62%" : width,
          height,
          "--kzsk-r": typeof radius === "number" ? `${radius}px` : radius,
          ...(lines === 1 ? style : undefined),
        } as CSSProperties
      }
    />
  );

  return (
    <>
      <KzFeedbackStyles />
      {lines === 1 ? (
        bar(0)
      ) : (
        <span className={`kzsk-stack ${className}`.trim()} style={style} aria-hidden="true">
          {Array.from({ length: lines }, (_, index) => bar(index))}
        </span>
      )}
    </>
  );
}

export interface KzButtonLoadingProps {
  children: ReactNode;
  loading?: boolean;
  /** Swaps the label while pending. Omit to keep the label and avoid a width jump. */
  loadingLabel?: string;
  variant?: "primary" | "ghost";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

/** Button that owns its pending state, built on the site's own .kz-btn skin. */
export function KzButtonLoading({
  children,
  loading = false,
  loadingLabel,
  variant = "primary",
  type = "button",
  disabled = false,
  onClick,
  className = "",
  style,
}: KzButtonLoadingProps) {
  const skin = variant === "primary" ? "kz-btn-primary" : "kz-btn-ghost";
  return (
    <>
      <KzFeedbackStyles />
      <button
        type={type}
        className={`kz-btn ${skin} kzbtnl ${className}`.trim()}
        style={style}
        onClick={onClick}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
      >
        {loading && <span className="kzspin" aria-hidden="true" />}
        <span>{loading && loadingLabel ? loadingLabel : children}</span>
      </button>
    </>
  );
}

/* ==========================================================================
   Lottie marks — engine and JSON both arrive on demand
   ========================================================================== */

interface KzLottiePlayerProps {
  src: string;
  loop?: boolean | number;
  autoplay?: boolean;
  className?: string;
}

/**
 * Lottie JSON is fetched at runtime rather than imported, so the URL is not
 * rewritten by the bundler and has to carry the deployment's base path itself.
 * It is empty for the root-domain build and "/Kenzed-Tech-Labs" on the GitHub
 * Pages target, where a bare "/lottie/..." would 404.
 */
const KZ_LOTTIE_BASE = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/lottie`;

/**
 * The split point. `lottie-react` is code-split away from the initial bundle,
 * and `src` is a URL rather than an import, so the JSON is fetched only when a
 * mark actually plays.
 */
const KzLottiePlayer = lazy(() =>
  import("lottie-react").then((mod) => ({
    default: mod.LottieLight as unknown as ComponentType<KzLottiePlayerProps>,
  }))
);

function KzLottieMark({
  src,
  size,
  loop,
  active,
  label,
  fallback,
}: {
  src: string;
  size: number;
  loop: boolean | number;
  active: boolean;
  label: string;
  fallback: ReactNode;
}) {
  const reduced = useReducedMotion() === true;
  const [inView, setInView] = useState(false);
  const hostRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (reduced || !active) return;
    const el = hostRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setInView(true);
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [active, reduced]);

  const play = active && inView && !reduced;

  return (
    <span
      ref={hostRef}
      className="kzlot"
      role="img"
      aria-label={label}
      style={{ width: size, height: size }}
    >
      {play ? (
        <Suspense fallback={fallback}>
          <KzLottiePlayer src={src} loop={loop} autoplay />
        </Suspense>
      ) : (
        fallback
      )}
    </span>
  );
}

function KzStaticCheck() {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path
        d="M12 54 38 82 88 20"
        stroke="var(--acc)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KzStaticNode() {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <circle cx="50" cy="50" r="34" stroke="var(--acc)" strokeWidth="4" opacity="0.4" />
      <circle cx="50" cy="50" r="13" fill="var(--acc)" />
    </svg>
  );
}

export interface KzSuccessCheckProps {
  size?: number;
  /** Draws the tick once when this turns true. */
  play?: boolean;
  label?: string;
}

/** Hand-drawn tick. Under reduced motion it is simply a finished tick. */
export function KzSuccessCheck({ size = 72, play = true, label = "Success" }: KzSuccessCheckProps) {
  return (
    <>
      <KzFeedbackStyles />
      <KzLottieMark
        src={`${KZ_LOTTIE_BASE}/check-draw.json`}
        size={size}
        loop={false}
        active={play}
        label={label}
        fallback={<KzStaticCheck />}
      />
    </>
  );
}

export interface KzPulseNodeProps {
  size?: number;
  loop?: boolean;
  label?: string;
  /** Stops the pulse without unmounting the mark. */
  active?: boolean;
}

/** Live-status node. Under reduced motion it is a static lit dot. */
export function KzPulseNode({
  size = 44,
  loop = true,
  label = "Live",
  active = true,
}: KzPulseNodeProps) {
  return (
    <>
      <KzFeedbackStyles />
      <KzLottieMark
        src={`${KZ_LOTTIE_BASE}/pulse-node.json`}
        size={size}
        loop={loop}
        active={active}
        label={label}
        fallback={<KzStaticNode />}
      />
    </>
  );
}

/* ==========================================================================
   Toasts
   ========================================================================== */

export type KzToastTone = "info" | "success" | "error";

export interface KzToastItem {
  id: string;
  message: string;
  tone?: KzToastTone;
  /** Milliseconds on screen. 0 pins the toast until it is dismissed. */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

export interface KzToastProps {
  toasts: KzToastItem[];
  onDismiss: (id: string) => void;
  position?: "top" | "bottom";
  dismissLabel?: string;
}

function KzToastRow({
  toast,
  onDismiss,
  reduced,
  offset,
  dismissLabel,
}: {
  toast: KzToastItem;
  onDismiss: (id: string) => void;
  reduced: boolean;
  offset: number;
  dismissLabel: string;
}) {
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (toast.duration === 0) return;
    const timer = setTimeout(() => dismissRef.current(toast.id), toast.duration ?? 4200);
    return () => clearTimeout(timer);
  }, [toast.duration, toast.id]);

  return (
    <motion.li
      layout={!reduced}
      className="kztoast"
      data-tone={toast.tone ?? "info"}
      role={toast.tone === "error" ? "alert" : "status"}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: offset, scale: 0.98 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: offset * 0.5, scale: 0.98 }}
      transition={{ duration: reduced ? 0.15 : 0.3, ease: KZ_FEEDBACK_EASE }}
    >
      <span className="kztoast-dot" aria-hidden="true" />
      <span className="kztoast-msg">{toast.message}</span>
      {toast.action && (
        <button type="button" className="kztoast-action" onClick={toast.action.onClick}>
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        className="kztoast-x"
        onClick={() => onDismiss(toast.id)}
        aria-label={dismissLabel}
      >
        ✕
      </button>
    </motion.li>
  );
}

/** Portalled toast stack. Each row auto-dismisses and clears its own timer. */
export function KzToast({
  toasts,
  onDismiss,
  position = "bottom",
  dismissLabel = "Dismiss notification",
}: KzToastProps) {
  const mounted = useKzMounted();
  const reduced = useReducedMotion() === true;
  const offset = position === "top" ? -16 : 16;

  const stack = (
    <ul className="kztoasts" data-position={position} aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <KzToastRow
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
            reduced={reduced}
            offset={offset}
            dismissLabel={dismissLabel}
          />
        ))}
      </AnimatePresence>
    </ul>
  );

  return (
    <>
      <KzFeedbackStyles />
      {mounted && createPortal(stack, document.body)}
    </>
  );
}

/** State for a `KzToast` stack: push returns the id it assigned. */
export function useKzToasts(defaultDuration = 4200) {
  const [toasts, setToasts] = useState<KzToastItem[]>([]);
  const seqRef = useRef(0);

  const push = useCallback(
    (toast: Omit<KzToastItem, "id"> & { id?: string }) => {
      seqRef.current += 1;
      const id = toast.id ?? `kz-toast-${seqRef.current}`;
      setToasts((prev) => [...prev, { duration: defaultDuration, ...toast, id }]);
      return id;
    },
    [defaultDuration]
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clear = useCallback(() => setToasts([]), []);

  return { toasts, push, dismiss, clear };
}

/* ==========================================================================
   Celebration and correction
   ========================================================================== */

interface KzConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
  life: number;
}

export interface KzConfettiProps {
  /** Fires one burst on each false → true transition. */
  active: boolean;
  /** Capped at 160, and defaulted down on narrow viewports. */
  particleCount?: number;
  /** Milliseconds of flight. */
  duration?: number;
  /** Burst origin as a fraction of the viewport. */
  origin?: { x: number; y: number };
  onDone?: () => void;
}

const KZ_CONFETTI_MAX = 160;

/**
 * Hand-rolled canvas burst — no confetti library involved.
 *
 * The canvas only exists while the burst runs, the particle count is capped,
 * the loop stops itself, and reduced motion skips straight to `onDone`.
 */
export function KzConfetti({
  active,
  particleCount,
  duration = 1600,
  origin = { x: 0.5, y: 0.35 },
  onDone,
}: KzConfettiProps) {
  const reduced = useReducedMotion() === true;
  /** Derived, not stored: no state means no cascading render to start a burst. */
  const running = active && !reduced;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const doneRef = useRef(onDone);
  const optsRef = useRef({ particleCount, duration, origin });

  useEffect(() => {
    doneRef.current = onDone;
    optsRef.current = { particleCount, duration, origin };
  });

  useEffect(() => {
    if (!running) {
      // Reduced motion still completes the flow the caller is waiting on.
      if (active) doneRef.current?.();
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const opts = optsRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const rootStyle = getComputedStyle(document.documentElement);
    const palette = ["--acc", "--acc2", "--acc3", "--ink"]
      .map((token) => rootStyle.getPropertyValue(token).trim())
      .filter((color) => color.length > 0);
    const colors = palette.length > 0 ? palette : ["currentColor"];

    const count = Math.min(
      Math.max(opts.particleCount ?? (width < 640 ? 42 : 88), 8),
      KZ_CONFETTI_MAX
    );
    const originX = width * opts.origin.x;
    const originY = height * opts.origin.y;
    const life = Math.max(opts.duration, 200);

    const particles: KzConfettiParticle[] = Array.from({ length: count }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
      const speed = 6 + Math.random() * 9;
      return {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.34,
        w: 5 + Math.random() * 5,
        h: 8 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life,
      };
    });

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const delta = Math.min((now - last) / 16.667, 3);
      last = now;
      ctx.clearRect(0, 0, width, height);

      let alive = 0;
      for (const particle of particles) {
        particle.life -= 16.667 * delta;
        if (particle.life <= 0 || particle.y > height + 40) continue;
        alive += 1;

        particle.vy += 0.42 * delta;
        particle.vx *= 1 - 0.012 * delta;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.rot += particle.vr * delta;

        ctx.save();
        ctx.globalAlpha = Math.min(1, particle.life / 420);
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rot);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.w / 2, -particle.h / 2, particle.w, particle.h);
        ctx.restore();
      }

      if (alive > 0) {
        frame = requestAnimationFrame(tick);
        return;
      }
      frame = 0;
      ctx.clearRect(0, 0, width, height);
      doneRef.current?.();
    };

    frame = requestAnimationFrame(tick);

    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, width, height);
    };
  }, [active, running]);

  return (
    <>
      <KzFeedbackStyles />
      {running && <canvas ref={canvasRef} className="kzconf" aria-hidden="true" />}
    </>
  );
}

export interface KzErrorShakeProps {
  children: ReactNode;
  /** Any value. Every change after the first mount plays one shake. */
  shakeKey: string | number | boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Shakes its child once, on transform only, through the Web Animations API so
 * nothing is left behind in the element's inline style.
 */
export function KzErrorShake({ children, shakeKey, className = "", style }: KzErrorShakeProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<Animation | null>(null);
  const firstRef = useRef(true);

  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }
    const el = ref.current;
    if (!el || typeof el.animate !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    animationRef.current?.cancel();
    animationRef.current = el.animate(
      [
        { transform: "translate3d(0,0,0)" },
        { transform: "translate3d(-8px,0,0)" },
        { transform: "translate3d(7px,0,0)" },
        { transform: "translate3d(-4px,0,0)" },
        { transform: "translate3d(2px,0,0)" },
        { transform: "translate3d(0,0,0)" },
      ],
      { duration: 420, easing: KZ_FEEDBACK_EASE_CSS }
    );
  }, [shakeKey]);

  useEffect(() => {
    const animation = animationRef;
    return () => {
      animation.current?.cancel();
      animation.current = null;
    };
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

export interface KzCopyButtonProps {
  value: string;
  label?: string;
  copiedLabel?: string;
  failedLabel?: string;
  /** Milliseconds the confirmation holds. */
  timeout?: number;
  onCopy?: (value: string) => void;
  className?: string;
  style?: CSSProperties;
}

/** Copy control whose icon crossfades to a tick and back. */
export function KzCopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  failedLabel = "Press Ctrl+C",
  timeout = 1800,
  onCopy,
  className = "",
  style,
}: KzCopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    },
    []
  );

  const copy = useCallback(async () => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      onCopy?.(value);
    } catch {
      // Clipboard access is denied outside a secure context or by policy.
      setState("failed");
    }
    timerRef.current = setTimeout(() => setState("idle"), timeout);
  }, [onCopy, timeout, value]);

  const copied = state === "copied";
  const text = copied ? copiedLabel : state === "failed" ? failedLabel : label;

  return (
    <>
      <KzFeedbackStyles />
      <button
        type="button"
        className={`kzcopy ${className}`.trim()}
        style={style}
        onClick={copy}
        data-copied={copied}
      >
        <span className="kzcopy-icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none" data-on={!copied}>
            <rect x="5.2" y="5.2" width="8.3" height="8.3" rx="2" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M10.8 5.2V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5.3a1.5 1.5 0 0 0 1.5 1.5h1.2"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <svg viewBox="0 0 16 16" fill="none" data-on={copied}>
            <path
              d="M3 8.6 6.4 12 13 4.6"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>{text}</span>
        <span className="kzfb-sr" role="status" aria-live="polite">
          {copied ? copiedLabel : ""}
        </span>
      </button>
    </>
  );
}
