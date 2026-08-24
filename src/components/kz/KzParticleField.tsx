"use client";

import { useEffect, useRef } from "react";

export interface KzParticleFieldProps {
  className?: string;
  /** Rendered height in css px at desktop. The element shrinks below this on phones. */
  height?: number;
  /** 0.5-1.5 multiplier on the point count. */
  density?: number;
}

/* Below this rendered width the field is treated as a phone: fewer points,
   a lower DPR cap and no horizontal drift, so the loop stays inside a frame. */
const KZ_MOBILE_W = 640;

const KZ_TAU = Math.PI * 2;

/* Grid resolution of the parametric surface. Columns run left to right toward
   the convergence line, rows run across the sheet. */
const KZ_COLS_DESKTOP = 78;
const KZ_ROWS_DESKTOP = 26;
const KZ_COLS_MOBILE = 44;
const KZ_ROWS_MOBILE = 16;

/* Dots are drawn in batched paths, one fill per (colour family, alpha step).
   14 steps reads as continuous shading at these dot sizes while keeping the
   per-frame fillStyle changes down to 28. */
const KZ_ALPHA_STEPS = 14;
const KZ_FAMILIES = 2;
const KZ_DOT_ALPHA = 0.86;

/* Where the sheet collapses, as a fraction of the canvas box. */
const KZ_BEAM_Y = 0.585;
const KZ_CONV_X = 0.965;

const KZ_WAVE_SPEED = 1.05;

/* Fallbacks match the target palette for when a token resolves to an empty
   string (e.g. the canvas mounts before the theme attribute lands). */
const KZ_ACC_FALLBACK: KzRgb = [77, 163, 255];
const KZ_ACC2_FALLBACK: KzRgb = [124, 196, 255];

type KzRgb = [number, number, number];

function kzParseRgb(input: string, fallback: KzRgb): KzRgb {
  const value = input.trim();
  if (!value) return fallback;

  if (value.startsWith("#")) {
    const hex = value.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return Number.isNaN(r + g + b) ? fallback : [r, g, b];
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return Number.isNaN(r + g + b) ? fallback : [r, g, b];
    }
    return fallback;
  }

  const nums = value.match(/-?\d*\.?\d+/g);
  if (!nums || nums.length < 3) return fallback;
  return [Number(nums[0]), Number(nums[1]), Number(nums[2])];
}

function kzMix(a: KzRgb, b: KzRgb, t: number): KzRgb {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/* Deterministic per-index jitter: a seeded hash rather than Math.random so a
   dot keeps its brightness and size across a resize rebuild. */
function kzHash(i: number): number {
  let h = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function KzParticleField({
  className = "",
  height = 460,
  density = 1,
}: KzParticleFieldProps): React.ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dens = Math.min(1.5, Math.max(0.5, density));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Per-dot buffers, rebuilt on resize. */
    let count = 0;
    let baseX = new Float32Array(0);
    let baseY = new Float32Array(0);
    let ampX = new Float32Array(0);
    let ampY = new Float32Array(0);
    let phase = new Float32Array(0);
    let bright = new Float32Array(0);
    let radius = new Float32Array(0);
    let family = new Uint8Array(0);

    const bucketCount = KZ_FAMILIES * KZ_ALPHA_STEPS;
    const buckets: number[][] = Array.from({ length: bucketCount }, () => []);
    const fills: string[] = new Array(bucketCount).fill("");

    let cssW = 0;
    let cssH = 0;
    let beamY = 0;
    let convX = 0;
    let glowR = 0;
    let beamGrad: CanvasGradient | null = null;
    let glowGrad: CanvasGradient | null = null;

    const build = () => {
      const rect = host.getBoundingClientRect();
      cssW = Math.max(1, Math.round(rect.width));
      cssH = Math.max(1, Math.round(rect.height));
      const mobile = cssW < KZ_MOBILE_W;

      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const styles = getComputedStyle(host);
      const acc = kzParseRgb(styles.getPropertyValue("--acc"), KZ_ACC_FALLBACK);
      const acc2 = kzParseRgb(styles.getPropertyValue("--acc2"), KZ_ACC2_FALLBACK);
      /* The convergence family is lifted toward white so the beam reads as a
         glow rather than a second hue when --acc2 is a violet token. */
      const hot = kzMix(acc2, [255, 255, 255], 0.45);

      for (let f = 0; f < KZ_FAMILIES; f++) {
        const rgb = f === 0 ? acc : hot;
        for (let s = 0; s < KZ_ALPHA_STEPS; s++) {
          const a = (((s + 0.75) / KZ_ALPHA_STEPS) * KZ_DOT_ALPHA).toFixed(3);
          fills[f * KZ_ALPHA_STEPS + s] = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
        }
      }

      const scale = Math.sqrt(dens);
      const cols = Math.max(12, Math.round((mobile ? KZ_COLS_MOBILE : KZ_COLS_DESKTOP) * scale));
      const rows = Math.max(6, Math.round((mobile ? KZ_ROWS_MOBILE : KZ_ROWS_DESKTOP) * scale));
      count = cols * rows;

      baseX = new Float32Array(count);
      baseY = new Float32Array(count);
      ampX = new Float32Array(count);
      ampY = new Float32Array(count);
      phase = new Float32Array(count);
      bright = new Float32Array(count);
      radius = new Float32Array(count);
      family = new Uint8Array(count);

      beamY = cssH * KZ_BEAM_Y;
      convX = cssW * KZ_CONV_X;

      const x0 = cssW * 0.05;
      const xSpan = convX - x0;
      const rise = cssH * 0.22;
      const spread = cssH * 0.26;
      const bend = cssH * 0.1;
      const shear = cssW * 0.035;
      const dotBase = mobile ? 1.15 : 1.05;

      let i = 0;
      for (let c = 0; c < cols; c++) {
        const t = cols === 1 ? 0 : c / (cols - 1);
        /* Eased so columns bunch up as they approach the beam: the spacing
           itself sells the convergence, not just the vertical collapse. */
        const u = 1 - Math.pow(1 - t, 1.35);
        /* s is the collapse factor, 1 at the wide left edge and 0 on the beam.
           Every offset below is scaled by it, so the final column lands exactly
           on beamY and the line stays razor thin. */
        const s = Math.pow(1 - u, 1.55);
        const cx = x0 + u * xSpan;
        const cy = beamY - rise * s * (0.55 + 0.45 * s);

        for (let r = 0; r < rows; r++) {
          const v = rows === 1 ? 0 : (r / (rows - 1)) * 2 - 1;

          baseX[i] = cx + v * s * shear;
          /* v*v - 1/3 arcs each row without shifting its mean, giving the sheet
             its curved-surface read instead of a flat fan. */
          baseY[i] = cy + v * s * spread + (v * v - 1 / 3) * s * bend;

          ampX[i] = mobile ? 0 : cssW * 0.01 * s;
          ampY[i] = cssH * 0.038 * s;
          phase[i] = u * 6.2 + v * 2.2;

          const jitter = 0.55 + 0.45 * kzHash(i * 2 + 1);
          let b = jitter * (1 - 0.3 * v * v) * (0.38 + 0.62 * u);
          b += 0.45 * Math.pow(u, 7);
          bright[i] = Math.min(1, b);

          radius[i] = dotBase * (0.62 + 0.5 * kzHash(i * 2)) * (0.82 + 0.32 * u);
          family[i] = u > 0.78 ? 1 : 0;
          i++;
        }
      }

      beamGrad = ctx.createLinearGradient(cssW * 0.2, 0, cssW, 0);
      beamGrad.addColorStop(0, `rgba(${hot[0]},${hot[1]},${hot[2]},0)`);
      beamGrad.addColorStop(0.5, `rgba(${hot[0]},${hot[1]},${hot[2]},0.18)`);
      beamGrad.addColorStop(0.85, `rgba(${hot[0]},${hot[1]},${hot[2]},0.6)`);
      beamGrad.addColorStop(0.956, `rgba(${hot[0]},${hot[1]},${hot[2]},1)`);
      beamGrad.addColorStop(1, `rgba(${hot[0]},${hot[1]},${hot[2]},0.7)`);

      glowR = Math.max(60, cssW * 0.14);
      glowGrad = ctx.createRadialGradient(convX, beamY, 0, convX, beamY, glowR);
      glowGrad.addColorStop(0, `rgba(${hot[0]},${hot[1]},${hot[2]},0.5)`);
      glowGrad.addColorStop(0.35, `rgba(${hot[0]},${hot[1]},${hot[2]},0.18)`);
      glowGrad.addColorStop(1, `rgba(${hot[0]},${hot[1]},${hot[2]},0)`);
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, cssW, cssH);

      const pulse = 0.72 + 0.28 * Math.sin(time * 0.9);
      const haloH = Math.max(10, cssH * 0.045);
      const midH = Math.max(3, cssH * 0.012);

      if (glowGrad) {
        ctx.globalAlpha = pulse;
        ctx.fillStyle = glowGrad;
        ctx.fillRect(convX - glowR, beamY - glowR, glowR * 2, glowR * 2);
      }

      if (beamGrad) {
        ctx.fillStyle = beamGrad;
        ctx.globalAlpha = 0.1 * pulse;
        ctx.fillRect(0, beamY - haloH, cssW, haloH * 2);
        ctx.globalAlpha = 0.26 * pulse;
        ctx.fillRect(0, beamY - midH, cssW, midH * 2);
      }

      ctx.globalAlpha = 1;

      for (let b = 0; b < bucketCount; b++) buckets[b].length = 0;

      const wave = time * KZ_WAVE_SPEED;
      for (let i = 0; i < count; i++) {
        const ph = phase[i] - wave;
        const sn = Math.sin(ph);
        const a = bright[i] * (0.34 + 0.66 * (0.5 + 0.5 * sn));

        let step = (a * KZ_ALPHA_STEPS) | 0;
        if (step < 0) step = 0;
        else if (step >= KZ_ALPHA_STEPS) step = KZ_ALPHA_STEPS - 1;

        const bucket = buckets[family[i] * KZ_ALPHA_STEPS + step];
        /* Cosine on x only where the budget allows: on mobile ampX is 0, so the
           second trig call per dot is skipped entirely. */
        bucket.push(ampX[i] === 0 ? baseX[i] : baseX[i] + ampX[i] * Math.cos(ph));
        bucket.push(baseY[i] + ampY[i] * sn);
        bucket.push(radius[i]);
      }

      for (let b = 0; b < bucketCount; b++) {
        const arr = buckets[b];
        if (arr.length === 0) continue;
        ctx.fillStyle = fills[b];
        ctx.beginPath();
        for (let k = 0; k < arr.length; k += 3) {
          const x = arr[k];
          const y = arr[k + 1];
          const r = arr[k + 2];
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, KZ_TAU);
        }
        ctx.fill();
      }

      if (beamGrad) {
        ctx.globalAlpha = 0.95 * pulse;
        ctx.fillStyle = beamGrad;
        ctx.fillRect(0, beamY - 0.7, cssW, 1.4);
        ctx.globalAlpha = 1;
      }
    };

    build();

    /* Reduced motion: one static frame, and deliberately no observers or
       listeners at all, so nothing here can ever schedule work. */
    if (reduced) {
      render(0);
      return;
    }

    let frame = 0;
    let clock = 0;
    let last = 0;
    let inView = false;
    let running = false;

    const loop = (now: number) => {
      frame = 0;
      /* Clamped so a long pause (tab restore, scroll back) resumes smoothly
         instead of jumping the wave forward by whole seconds. */
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += dt;
      render(clock);
      if (running) frame = requestAnimationFrame(loop);
    };

    const sync = () => {
      const next = inView && !document.hidden;
      if (next === running) return;
      running = next;
      if (running) {
        last = performance.now();
        if (!frame) frame = requestAnimationFrame(loop);
      } else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[entries.length - 1].isIntersecting;
        sync();
      },
      { threshold: 0 }
    );
    io.observe(host);

    document.addEventListener("visibilitychange", sync, { passive: true });

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        build();
        if (!running) render(clock);
      }, 160);
    });
    ro.observe(host);

    return () => {
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      clearTimeout(resizeTimer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [height, density]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={className}
      style={{
        /* Height is pure CSS so there is no first-paint jump: it tracks the
           viewport on phones and caps at the requested desktop height. */
        height: `clamp(${Math.round(height * 0.5)}px, 60vw, ${height}px)`,
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
