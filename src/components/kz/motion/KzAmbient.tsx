"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

function useAmbientRun<T extends Element>(active: boolean) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!active) {
      el.setAttribute("data-kz-run", "0");
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let onScreen = false;

    const sync = () => {
      const run = onScreen && !document.hidden && !reduced.matches;
      el.setAttribute("data-kz-run", run ? "1" : "0");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries[entries.length - 1].isIntersecting;
        sync();
      },
      { rootMargin: "160px 0px" }
    );
    observer.observe(el);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, [active]);

  return ref;
}

const AMBIENT_CSS = `
.kza {
  --kza-ease-enter: cubic-bezier(0.22, 1, 0.36, 1);
}

[data-kz-run="0"],
[data-kz-run="0"] * {
  animation-play-state: paused !important;
}

[data-kz-run="1"] .kza-w,
[data-kz-run="1"].kza-w {
  will-change: transform;
}

.kza-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
}

.kza-grid {
  overflow: hidden;
}
.kza-grid-layer {
  position: absolute;
  inset: calc(var(--kza-cell) * -2);
  background-image:
    repeating-linear-gradient(
      to right,
      var(--kza-c1) 0 1px,
      transparent 1px var(--kza-cell)
    ),
    repeating-linear-gradient(
      to bottom,
      var(--kza-c1) 0 1px,
      transparent 1px var(--kza-cell)
    );
  opacity: var(--kza-o);
}
.kza-grid-drift {
  animation: kzaGridDrift var(--kza-dur) linear infinite;
}
.kza-fade-center {
  -webkit-mask-image: radial-gradient(ellipse at center, black 10%, transparent 72%);
  mask-image: radial-gradient(ellipse at center, black 10%, transparent 72%);
}
.kza-fade-top {
  -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 88%);
  mask-image: linear-gradient(to bottom, black 0%, transparent 88%);
}
.kza-fade-bottom {
  -webkit-mask-image: linear-gradient(to top, black 0%, transparent 88%);
  mask-image: linear-gradient(to top, black 0%, transparent 88%);
}
@keyframes kzaGridDrift {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(var(--kza-cell), var(--kza-cell), 0); }
}

.kza-spot {
  position: relative;
  isolation: isolate;
}
.kza-spot-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 320ms var(--kza-ease-enter);
  background: radial-gradient(
    circle var(--kza-size) at var(--kza-mx) var(--kza-my),
    var(--kza-c1),
    transparent 68%
  );
}
.kza-spot[data-kza-lit="1"] .kza-spot-layer {
  opacity: 1;
}
.kza-spot-body {
  position: relative;
  z-index: 1;
}

@media (hover: none), (pointer: coarse) {
  .kza-spot-layer { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .kza,
  .kza * {
    animation: none !important;
    transition: none !important;
  }
  .kza-spot-layer { display: none; }
}
`;

function AmbientCSS() {
  return (
    <style href="kz-ambient" precedence="medium">
      {AMBIENT_CSS}
    </style>
  );
}

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export interface KzGridPatternProps {
  cell?: number;
  color?: string;
  opacity?: number;
  fade?: "center" | "top" | "bottom" | "none";
  drift?: boolean;
  speed?: number;
  className?: string;
  style?: CSSProperties;
}

/** A lightweight blueprint grid that can optionally drift while visible. */
export function KzGridPattern({
  cell = 48,
  color,
  opacity = 0.55,
  fade = "center",
  drift = false,
  speed = 24,
  className,
  style,
}: KzGridPatternProps) {
  const ref = useAmbientRun<HTMLDivElement>(drift);
  const fadeClass =
    fade === "none"
      ? undefined
      : fade === "center"
        ? "kza-fade-center"
        : fade === "top"
          ? "kza-fade-top"
          : "kza-fade-bottom";

  return (
    <div
      ref={ref}
      data-kz-run="0"
      aria-hidden="true"
      className={cx("kza", "kza-layer", "kza-grid", fadeClass, className)}
      style={
        {
          "--kza-cell": `${cell}px`,
          "--kza-c1": color ?? "var(--line)",
          "--kza-o": opacity,
          "--kza-dur": `${speed}s`,
          ...style,
        } as Vars
      }
    >
      <AmbientCSS />
      <div className={cx("kza-grid-layer", drift && "kza-grid-drift kza-w")} />
    </div>
  );
}

export interface KzSpotlightProps {
  children: ReactNode;
  size?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

/** Fine-pointer highlight written through CSS variables without React renders. */
export function KzSpotlight({
  children,
  size = 260,
  color,
  className,
  style,
}: KzSpotlightProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let onScreen = false;
    let bound = false;
    let frame = 0;
    let clientX = 0;
    let clientY = 0;

    const paint = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--kza-mx", `${clientX - rect.left}px`);
      el.style.setProperty("--kza-my", `${clientY - rect.top}px`);
    };

    const onMove = (event: PointerEvent) => {
      clientX = event.clientX;
      clientY = event.clientY;
      if (frame === 0) frame = requestAnimationFrame(paint);
    };
    const onEnter = () => el.setAttribute("data-kza-lit", "1");
    const onLeave = () => el.setAttribute("data-kza-lit", "0");

    const bind = () => {
      if (bound) return;
      bound = true;
      el.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);
    };

    const unbind = () => {
      if (!bound) return;
      bound = false;
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      onLeave();
    };

    const sync = () => {
      if (onScreen && !document.hidden && fine.matches && !reduced.matches) {
        bind();
      } else {
        unbind();
      }
    };

    const observer = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      sync();
    });
    observer.observe(el);
    document.addEventListener("visibilitychange", sync);
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      fine.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      unbind();
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-kza-lit="0"
      className={cx("kza", "kza-spot", className)}
      style={
        {
          "--kza-size": `${size}px`,
          "--kza-c1":
            color ?? "color-mix(in srgb, var(--acc) 22%, transparent)",
          "--kza-mx": "50%",
          "--kza-my": "50%",
          ...style,
        } as Vars
      }
    >
      <AmbientCSS />
      <span className="kza-spot-layer" aria-hidden="true" />
      <div className="kza-spot-body">{children}</div>
    </div>
  );
}
