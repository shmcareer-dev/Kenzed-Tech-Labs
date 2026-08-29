"use client";

import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";
/* Was `import { useReducedMotion } from "motion/react"` — 132KB of animation
   library pulled in for one media query. KzEntrance already exports the same
   hook built on useSyncExternalStore. */
import { useKzReducedMotion as useReducedMotion } from "./KzEntrance";

export const KZ_FEEDBACK_EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

const KZ_FEEDBACK_CSS = `
.kzfb-num {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}

@keyframes kzfbSpin {
  to { transform: rotate(360deg); }
}

.kzbtnl { gap: 10px; }
.kzbtnl:disabled { cursor: not-allowed; opacity: .62; }
.kzspin {
  flex: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, currentColor 26%, transparent);
  border-top-color: currentColor;
  animation: kzfbSpin .72s linear infinite;
}

.kzlot {
  display: inline-block;
  position: relative;
  line-height: 0;
}
.kzlot > *,
.kzlot svg {
  width: 100%;
  height: 100%;
  display: block;
}

@media (prefers-reduced-motion: reduce) {
  .kzspin { display: none; }
}
`;

function KzFeedbackStyles() {
  return (
    <style
      href="kz-feedback"
      precedence="default"
      dangerouslySetInnerHTML={{ __html: KZ_FEEDBACK_CSS }}
    />
  );
}

export interface KzCountUpProps {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
  startOnView?: boolean;
  className?: string;
  style?: CSSProperties;
}

function kzEaseOutExpo(t: number) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/* Both the rendered markup and the frame loop below go through here, so the
   value the count lands on is character for character the one React renders. */
function kzCountText(
  value: number,
  decimals: number,
  locale: string,
  prefix: string,
  suffix: string
) {
  return `${prefix}${value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;
}

/** Renders the final value in static HTML, then animates only after entering view. */
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
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        /* Each frame is written straight onto the text node. The running value
           used to live in state, so every one of the ~48 frames cost a render
           and a commit, and the hero mounts one of these per stat: four counts
           entering React together on the frame the panel scrolls into view. */
        el.textContent = kzCountText(
          t < 1 ? from + (to - from) * kzEaseOutExpo(t) : to,
          decimals,
          locale,
          prefix,
          suffix
        );
        frame = t < 1 ? requestAnimationFrame(step) : 0;
      };
      frame = requestAnimationFrame(step);
    };

    if (!startOnView) {
      run();
      return () => cancelAnimationFrame(frame);
    }

    let firstReport = true;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (firstReport) {
          firstReport = false;
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
  }, [decimals, duration, from, locale, prefix, reduced, startOnView, suffix, to]);

  /* Prefix, number and suffix are joined into one child so the span carries a
     single text node: that is the node React updates through textContent, and
     the frame loop above writes to the very same one rather than to text nodes
     React still believes it owns. */
  return (
    <>
      <KzFeedbackStyles />
      <span ref={ref} className={`kzfb-num ${className}`.trim()} style={style}>
        {kzCountText(to, decimals, locale, prefix, suffix)}
      </span>
    </>
  );
}

export interface KzButtonLoadingProps {
  children: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  variant?: "primary" | "ghost";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

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

interface KzLottiePlayerProps {
  src: string;
  loop?: boolean | number;
  autoplay?: boolean;
  className?: string;
}

const KZ_LOTTIE_BASE = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/lottie`;

const KzLottiePlayer = lazy(() =>
  import("lottie-react").then((mod) => ({
    default: mod.LottieLight as unknown as ComponentType<KzLottiePlayerProps>,
  }))
);

function KzLottieMark({
  src,
  size,
  active,
  label,
  fallback,
}: {
  src: string;
  size: number;
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
          <KzLottiePlayer src={src} loop={false} autoplay />
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

export interface KzSuccessCheckProps {
  size?: number;
  play?: boolean;
  label?: string;
}

export function KzSuccessCheck({
  size = 72,
  play = true,
  label = "Success",
}: KzSuccessCheckProps) {
  return (
    <>
      <KzFeedbackStyles />
      <KzLottieMark
        src={`${KZ_LOTTIE_BASE}/check-draw.json`}
        size={size}
        active={play}
        label={label}
        fallback={<KzStaticCheck />}
      />
    </>
  );
}
