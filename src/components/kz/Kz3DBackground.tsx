"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { useKz3D, type KzPage } from "./Kz3DProvider";
import { useKzTheme } from "./KzThemeProvider";

/* ==========================================================================
   Kenzed scroll narrative
   --------------------------------------------------------------------------
   Four scenes on one track, driven by how far down the page you are:

     0  WORKSTATION  a developer rig — dual displays running live code, a
                     glass-sided tower with spinning fans, keyboard, mouse,
                     mug, and extruded code glyphs orbiting the setup.
     1  DATA CENTRE  a cold aisle: two rows of racks with per-bay drive LEDs,
                     overhead cable trays carrying flowing data, ceiling
                     strips, and haze at the end of the corridor.
     2  AI BOT       a friendly floating assistant — visor, lit eyes that
                     blink, antenna, a detached waving arm, wrapped in a
                     neural lattice with pulses running its edges.
     3  ROBOT        a chrome endoskeleton bust. Deliberately friendly: warm
                     cyan optics rather than red, an upturned jaw line, soft
                     cranial plates, breathing neck pistons, a lit chest core.

   Only one act is ever on screen. Acts hand off at the midpoint between their
   stations — the outgoing one sinks and dissolves while the incoming one
   rises — so the two never sit on top of each other and muddy the frame.

   Shading:
     - a PMREM-filtered RoomEnvironment supplies image-based lighting, without
       which every metalness above ~0.2 renders as dead grey: a metal with
       nothing to reflect has nothing to show.
     - ACES filmic tone mapping plus an explicit sRGB output space, so the
       specular highlights roll off instead of clipping to flat white.
     - every map is a runtime-painted CanvasTexture — machined plate albedo,
       brushed roughness, two Sobel-derived normal maps (machined and hex
       perforation), emissive circuitry, a syntax-coloured code screen, a
       server rack face with its own LED emissive pass, and scrolling conduit
       packets. No external image assets, so an offline export still works.

   Geometry is built once per theme/layout. Changing tab only re-aims the
   camera. One act draws at a time, so the per-frame cost is roughly a quarter
   of the resident triangle budget.
   ========================================================================== */

function pathnameToPage(pathname: string): KzPage {
  if (pathname.startsWith("/services")) return "services";
  if (pathname.startsWith("/product-studio")) return "services";
  if (pathname.startsWith("/live-projects")) return "process";
  if (pathname.startsWith("/technology")) return "technology";
  if (pathname.startsWith("/infrastructure")) return "infrastructure";
  if (pathname.startsWith("/process")) return "process";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/contact")) return "contact";
  return "home";
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/* ---------------------------------------------------------------- palette */

interface Palette {
  deck: number;
  deckTop: number;
  frame: number;
  chrome: number;
  shell: number;
  dark: number;
  accent: number;
  accent2: number;
  accent3: number;
  warm: number;
  sky: number;
  ground: number;
  key: number;
  ambient: number;
  keyIntensity: number;
  glow: number;
  glass: number;
  floorAlpha: number;
  hazeAlpha: number;
  shadowAlpha: number;
  /** Strength of the image-based lighting the RoomEnvironment provides. */
  envIntensity: number;
  /** ACES exposure. Light needs more headroom than dark to stay crisp. */
  exposure: number;
  /* CSS colours consumed by the procedural texture painters */
  texBase: string;
  texMinor: string;
  texMajor: string;
  texMark: string;
  texTrace: string;
  texTrace2: string;
  texTrace3: string;
  texWarm: string;
  /* Code-editor palette for the display maps */
  codeBg: string;
  codeGutter: string;
  codeIdent: string;
  codeComment: string;
}

/* Structural greys, sky/ground and light tints have no CSS-token equivalent —
   they are scene materials, not UI surfaces — so they live here. The accent
   triple is read from --acc/--acc2/--acc3 at build time, with these values as
   the fallback if the custom property cannot be resolved. */
const PALETTE: Record<"light" | "dark", Palette> = {
  light: {
    deck: 0xdde3ef,
    deckTop: 0xf6f8fc,
    frame: 0xc6cfdf,
    chrome: 0xe3e9f4,
    shell: 0xf4f7fd,
    dark: 0x2a3346,
    accent: 0x1c50e0,
    accent2: 0x5a35e6,
    accent3: 0x008f86,
    warm: 0xe8a13a,
    sky: 0xffffff,
    ground: 0xbcc6da,
    key: 0xfff6e8,
    ambient: 0.3,
    keyIntensity: 1.55,
    glow: 0.85,
    glass: 0.2,
    floorAlpha: 0.34,
    hazeAlpha: 0.2,
    shadowAlpha: 0.11,
    envIntensity: 1.05,
    exposure: 1.12,
    texBase: "#eef1f7",
    texMinor: "rgba(28,80,224,0.13)",
    texMajor: "rgba(12,20,36,0.22)",
    texMark: "rgba(90,53,230,0.38)",
    texTrace: "#1c50e0",
    texTrace2: "#5a35e6",
    texTrace3: "#008f86",
    texWarm: "#e8a13a",
    codeBg: "#0f1728",
    codeGutter: "rgba(226,234,250,0.3)",
    codeIdent: "#dce6fb",
    codeComment: "rgba(150,168,200,0.72)",
  },
  dark: {
    deck: 0x18213a,
    deckTop: 0x223052,
    frame: 0x6c7b98,
    chrome: 0xaebbd4,
    shell: 0xdfe8f7,
    dark: 0x0a1020,
    accent: 0x66b0ff,
    accent2: 0xa38bff,
    accent3: 0x4ce8dd,
    warm: 0xffcf7a,
    sky: 0x33456b,
    ground: 0x040711,
    key: 0xd6e4ff,
    ambient: 0.24,
    keyIntensity: 1.15,
    glow: 1.5,
    glass: 0.15,
    floorAlpha: 0.5,
    hazeAlpha: 0.42,
    shadowAlpha: 0.3,
    envIntensity: 0.55,
    exposure: 1.0,
    texBase: "#111a2e",
    texMinor: "rgba(102,176,255,0.18)",
    texMajor: "rgba(163,139,255,0.3)",
    texMark: "rgba(76,232,221,0.44)",
    texTrace: "#66b0ff",
    texTrace2: "#a38bff",
    texTrace3: "#4ce8dd",
    texWarm: "#ffcf7a",
    codeBg: "#080e1c",
    codeGutter: "rgba(150,180,230,0.34)",
    codeIdent: "#e6eeff",
    codeComment: "rgba(122,145,186,0.7)",
  },
};

/** Resolve a design token to a THREE hex, falling back to the palette value. */
function tokenHex(name: string, fallback: number): number {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!raw) return fallback;
    return new THREE.Color().setStyle(raw).getHex();
  } catch {
    return fallback;
  }
}

const hexCss = (v: number) => `#${v.toString(16).padStart(6, "0")}`;

/** The brand hues come from the stylesheet, so the scene can never drift. */
function resolvePalette(theme: string): Palette {
  const base = PALETTE[theme === "dark" ? "dark" : "light"];
  const accent = tokenHex("--acc", base.accent);
  const accent2 = tokenHex("--acc2", base.accent2);
  const accent3 = tokenHex("--acc3", base.accent3);
  return {
    ...base,
    accent,
    accent2,
    accent3,
    texTrace: hexCss(accent),
    texTrace2: hexCss(accent2),
    texTrace3: hexCss(accent3),
  };
}

/* ------------------------------------------------------------------ acts */

type Layout = "desktop" | "mobile";
type ActKind = "workstation" | "datacenter" | "aibot" | "robot";

interface Shot {
  /** Camera azimuth and elevation in radians, and an orthographic zoom. */
  az: number;
  el: number;
  zoom: number;
  target: [number, number, number];
  /** Smallest world span that must stay inside the frustum. */
  fitW: number;
  fitH: number;
  /** Fraction of the half-width the camera is pushed sideways, to clear copy. */
  shift: number;
}

interface ActSpec {
  kind: ActKind;
  desktop: Shot;
  mobile: Shot;
}

/* On desktop the scene lives to the right of the copy column, so every act
   carries a positive shift. On mobile it sits behind the column at low opacity
   and stays centred — and `fitW` is kept small there deliberately, so the
   portrait `fitH` is what sizes the frustum and the subject fills the phone
   instead of shrinking to fit an aspect it will never have. */
const ACTS: ActSpec[] = [
  {
    kind: "workstation",
    desktop: { az: 0.7, el: 0.34, zoom: 1, target: [0, 0.95, 0], fitW: 12.6, fitH: 8.4, shift: 0.66 },
    mobile: { az: 0.66, el: 0.32, zoom: 1, target: [0, 1.1, 0], fitW: 5.2, fitH: 9.6, shift: 0 },
  },
  {
    kind: "datacenter",
    desktop: { az: 1.31, el: 0.16, zoom: 1, target: [0, 2.15, 0], fitW: 13, fitH: 9.6, shift: 0.55 },
    mobile: { az: 1.46, el: 0.13, zoom: 1, target: [0, 2.15, 0], fitW: 5.8, fitH: 11, shift: 0 },
  },
  {
    kind: "aibot",
    desktop: { az: 0.86, el: 0.2, zoom: 1, target: [0, 1.9, 0], fitW: 10.4, fitH: 8.2, shift: 0.62 },
    mobile: { az: 0.78, el: 0.17, zoom: 1, target: [0, 2, 0], fitW: 4.6, fitH: 10, shift: 0 },
  },
  {
    kind: "robot",
    desktop: { az: 0.74, el: 0.12, zoom: 1, target: [0, 2.15, 0], fitW: 8, fitH: 6.3, shift: 0.62 },
    mobile: { az: 0.68, el: 0.1, zoom: 1, target: [0, 2.2, 0], fitW: 3.6, fitH: 7.8, shift: 0 },
  },
];

const LAST_ACT = ACTS.length - 1;

/* Per-tab camera nudge, layered on top of whichever act the scroll position
   has selected. Navigation re-aims the shot; it never changes the act. */
const PAGE_SHOT: Record<KzPage, { az: number; el: number; zoom: number }> = {
  home: { az: 0, el: 0, zoom: 1 },
  services: { az: 0.24, el: -0.04, zoom: 1.04 },
  technology: { az: -0.2, el: 0.07, zoom: 1.07 },
  infrastructure: { az: 0.32, el: -0.09, zoom: 0.95 },
  process: { az: -0.28, el: 0.02, zoom: 1.02 },
  about: { az: 0.15, el: 0.08, zoom: 1.05 },
  contact: { az: -0.33, el: -0.03, zoom: 1.09 },
};

/* ------------------------------------------------------------ tessellation */

interface Detail {
  /** Radial segments for load-bearing cylinders. */
  radial: number;
  /** Radial segments for hardware small enough to read as a dot. */
  radialSmall: number;
  /** Sphere segments for the heads and joints, which must never facet. */
  sphereW: number;
  sphereH: number;
  ringTube: number;
  ringTubeThin: number;
  ringArc: number;
  orbitArc: number;
  gem: number;
  cage: number;
  tubePath: number;
  tubeSides: number;
  /** Arc segments per rounded box corner, and chamfer rings per end. */
  boxCurve: number;
  boxBevel: number;
  /** Racks per side in the data-centre aisle. */
  racks: number;
  /** Keys on the keyboard, and floating code glyphs. */
  keys: number;
  glyphs: number;
}

/* Mobile gets its own, lower row on every axis. The curved silhouettes still
   read as smooth at phone pixel density because the whole scene sits well
   below full opacity behind the copy. */
const DETAIL: Record<Layout, Detail> = {
  desktop: {
    radial: 40,
    radialSmall: 20,
    sphereW: 48,
    sphereH: 32,
    ringTube: 12,
    ringTubeThin: 8,
    ringArc: 44,
    orbitArc: 120,
    gem: 2,
    cage: 1,
    tubePath: 64,
    tubeSides: 10,
    boxCurve: 4,
    boxBevel: 2,
    racks: 7,
    keys: 60,
    glyphs: 9,
  },
  mobile: {
    radial: 22,
    radialSmall: 12,
    sphereW: 28,
    sphereH: 18,
    ringTube: 8,
    ringTubeThin: 6,
    ringArc: 26,
    orbitArc: 64,
    gem: 1,
    cage: 0,
    tubePath: 28,
    tubeSides: 6,
    boxCurve: 2,
    boxBevel: 1,
    racks: 4,
    keys: 30,
    glyphs: 5,
  },
};

/* The component owns opacity and mask outright — they are inline styles, so a
   `.kz-scene` rule in the stylesheet could never win against them. Keep the
   values here and here only. */
const VEIL: Record<Layout, { opacity: number; mask: string }> = {
  desktop: {
    opacity: 0.95,
    mask:
      "linear-gradient(to right, transparent 0%, transparent 38%, rgba(0,0,0,0.35) 52%, #000 68%, #000 100%)",
  },
  mobile: {
    // On a phone the scene shares the column with the copy instead of sitting
    // beside it, so it has to read as background texture. The vignette is also
    // pushed below centre to clear the hero paragraph and buttons.
    opacity: 0.28,
    mask:
      "radial-gradient(120% 62% at 58% 70%, #000 0%, rgba(0,0,0,0.55) 46%, transparent 82%)",
  },
};

const MOBILE_QUERY = "(max-width: 900px)";

function subscribeLayout(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function readLayout(): Layout {
  return window.matchMedia(MOBILE_QUERY).matches ? "mobile" : "desktop";
}

function serverLayout(): Layout {
  return "desktop";
}

/* -------------------------------------------------- procedural texturing */

/** Deterministic LCG, so every build paints byte-identical textures. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

/** Bilinear sampler over a wrapped random lattice, so the field tiles. */
function tilingNoise(rand: () => number, n: number) {
  const cells = new Float32Array(n * n);
  for (let i = 0; i < cells.length; i++) cells[i] = rand();
  return (u: number, v: number) => {
    const fx = u * n;
    const fy = v * n;
    const x0 = Math.floor(fx) % n;
    const y0 = Math.floor(fy) % n;
    const x1 = (x0 + 1) % n;
    const y1 = (y0 + 1) % n;
    const tx = fx - Math.floor(fx);
    const ty = fy - Math.floor(fy);
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);
    const top = cells[y0 * n + x0] + (cells[y0 * n + x1] - cells[y0 * n + x0]) * sx;
    const bottom = cells[y1 * n + x0] + (cells[y1 * n + x1] - cells[y1 * n + x0]) * sx;
    return top + (bottom - top) * sy;
  };
}

/**
 * Differentiate a wrapped height field into a tangent-space normal map.
 *
 * The green channel takes +dy because the texture is uploaded with flipY,
 * which reverses canvas rows against v — the usual cause of relief that lights
 * from the wrong side.
 */
function heightToNormal(height: Float32Array, size: number, strength: number) {
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const at = (x: number, y: number) =>
    height[(((y % size) + size) % size) * size + (((x % size) + size) % size)];

  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const gy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const inv = 1 / Math.hypot(gx, gy, 1);
      const i = (y * size + x) * 4;
      img.data[i] = Math.round((-gx * inv * 0.5 + 0.5) * 255);
      img.data[i + 1] = Math.round((gy * inv * 0.5 + 0.5) * 255);
      img.data[i + 2] = Math.round((inv * 0.5 + 0.5) * 255);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/** Graph paper: 1px minor grid, heavier major cells, register crosshairs. */
function paintGrid(size: number, pal: Palette): HTMLCanvasElement | null {
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = pal.texBase;
  ctx.fillRect(0, 0, size, size);

  const minor = size / 32;
  ctx.strokeStyle = pal.texMinor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 32; i++) {
    const p = Math.round(i * minor) + 0.5;
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
  }
  ctx.stroke();

  const major = size / 8;
  ctx.strokeStyle = pal.texMajor;
  ctx.lineWidth = Math.max(1.5, size / 340);
  ctx.beginPath();
  for (let i = 0; i <= 8; i++) {
    const p = Math.round(i * major) + 0.5;
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
  }
  ctx.stroke();

  const arm = size / 84;
  ctx.strokeStyle = pal.texMark;
  ctx.lineWidth = Math.max(1.5, size / 256);
  ctx.beginPath();
  for (let x = 0; x <= 8; x++) {
    for (let y = 0; y <= 8; y++) {
      const px = x * major;
      const py = y * major;
      ctx.moveTo(px - arm, py);
      ctx.lineTo(px + arm, py);
      ctx.moveTo(px, py - arm);
      ctx.lineTo(px, py + arm);
    }
  }
  ctx.stroke();

  return canvas;
}

/** Brushed metal: two octaves of tiling value noise plus lateral streaks. */
function paintBrushed(size: number): HTMLCanvasElement | null {
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const rand = rng(0x5eed);
  const coarse = tilingNoise(rand, 8);
  const fine = tilingNoise(rand, 24);
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const base = coarse(u, v);
      const streak = Math.sin(v * Math.PI * 36 + base * 6) * 0.06;
      const value = base * 0.6 + fine(u, v) * 0.28 + streak;
      const g = Math.max(0, Math.min(255, Math.round(118 + value * 124)));
      const i = (y * size + x) * 4;
      img.data[i] = g;
      img.data[i + 1] = g;
      img.data[i + 2] = g;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  return canvas;
}

/** Machined panel relief: tiling noise, lathe lines and seam grooves. */
function paintMachinedNormal(size: number): HTMLCanvasElement | null {
  const rand = rng(0x11c3f0);
  const coarse = tilingNoise(rand, 8);
  const fine = tilingNoise(rand, 32);
  const seam = size / 4;
  const groove = Math.max(2, size / 96);

  const height = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;
      let h = coarse(u, v) * 0.34 + fine(u, v) * 0.18;
      h += Math.sin(v * Math.PI * 128) * 0.03;
      const dx = Math.min(x % seam, seam - (x % seam));
      const dy = Math.min(y % seam, seam - (y % seam));
      const near = Math.min(dx, dy);
      if (near < groove) {
        const k = 1 - near / groove;
        h -= k * k * 0.55;
      }
      height[y * size + x] = h;
    }
  }

  return heightToNormal(height, size, 8);
}

/**
 * Hex perforation relief, for vents, grilles and armour underlay.
 *
 * Hex centres come from a staggered lattice; the height falls off with the
 * distance to the nearest centre, so the holes read as drilled rather than
 * printed. Tiles because the row offset repeats on an even row count.
 */
function paintHexNormal(size: number): HTMLCanvasElement | null {
  const cols = 12;
  const rows = 14;
  const cw = size / cols;
  const rh = size / rows;
  const radius = Math.min(cw, rh) * 0.42;

  /* Odd rows are offset by half a cell, which is what makes it a hex lattice
     rather than a square one. Wrapping the row index keeps the offset pattern
     continuous across the seam, so the map still tiles. */
  const rowOffset = (r: number) => ((((r % rows) + rows) % rows) % 2 === 0 ? 0 : cw * 0.5);

  const height = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    const row = Math.floor(y / rh);
    for (let x = 0; x < size; x++) {
      // Distance to the nearest centre on this row or either neighbour.
      let best = Infinity;
      for (let dr = -1; dr <= 1; dr++) {
        const r2 = row + dr;
        const cy = (r2 + 0.5) * rh;
        const off = rowOffset(r2);
        const col = Math.round((x - off) / cw - 0.5);
        for (let dc = 0; dc <= 1; dc++) {
          const cx = (col + dc + 0.5) * cw + off;
          const d = Math.hypot(x - cx, y - cy);
          if (d < best) best = d;
        }
      }
      const k = clamp01(1 - best / radius);
      height[y * size + x] = -k * k * 0.9;
    }
  }

  return heightToNormal(height, size, 6);
}

/**
 * Machined plate albedo: seams, fasteners and metal grain.
 *
 * Deliberately greyscale — this map multiplies the material colour, so the
 * theme keeps control of the hue and the texture only supplies the detail.
 */
function paintPlate(size: number, grain: HTMLCanvasElement | null): HTMLCanvasElement | null {
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  if (grain) {
    ctx.globalAlpha = 0.2;
    ctx.drawImage(grain, 0, 0, size, size);
    ctx.globalAlpha = 1;
  }

  const panel = size / 4;
  const line = Math.max(1, size / 380);
  for (let i = 0; i <= 4; i++) {
    const p = Math.round(i * panel) + 0.5;
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = line;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
    // A highlight one texel below each seam reads as a lit machined edge.
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p + line, 0);
    ctx.lineTo(p + line, size);
    ctx.moveTo(0, p + line);
    ctx.lineTo(size, p + line);
    ctx.stroke();
  }

  const inset = panel * 0.16;
  const head = Math.max(1.5, size / 150);
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      const px = x * panel + inset;
      const py = y * panel + inset;
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath();
      ctx.arc(px, py, head, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.arc(px - head * 0.25, py - head * 0.25, head * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return canvas;
}

/** Emissive circuitry: Manhattan traces, vias, and a data read-out band. */
function paintCircuit(size: number, pal: Palette): HTMLCanvasElement | null {
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Black emits nothing, so unpainted areas stay matte.
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);

  const rand = rng(0xc1c001);
  const step = size / 16;
  const inks = [pal.texTrace, pal.texTrace2, pal.texTrace3];
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let t = 0; t < 14; t++) {
    const ink = inks[t % inks.length];
    let x = Math.round(rand() * 16) * step;
    let y = Math.round(rand() * 16) * step;
    const points: [number, number][] = [[x, y]];
    let horizontal = rand() > 0.5;
    const legs = 3 + Math.floor(rand() * 4);
    for (let l = 0; l < legs; l++) {
      const run = (1 + Math.floor(rand() * 3)) * step * (rand() > 0.5 ? 1 : -1);
      if (horizontal) x = Math.max(0, Math.min(size, x + run));
      else y = Math.max(0, Math.min(size, y + run));
      points.push([x, y]);
      horizontal = !horizontal;
    }

    const trace = (width: number, alpha: number) => {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = ink;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let p = 1; p < points.length; p++) ctx.lineTo(points[p][0], points[p][1]);
      ctx.stroke();
    };
    trace(size / 40, 0.15);
    trace(size / 128, 1);
    ctx.globalAlpha = 1;

    for (const [px, py] of [points[0], points[points.length - 1]]) {
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.arc(px, py, size / 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(px, py, size / 148, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let row = 0; row < 3; row++) {
    const y = size - (row + 1) * (size / 22);
    for (let i = 0; i < 30; i++) {
      if (rand() > 0.5) continue;
      ctx.globalAlpha = 0.35 + rand() * 0.65;
      ctx.fillStyle = inks[(i + row) % inks.length];
      ctx.fillRect(i * (size / 30) + 2, y, size / 54, size / 96);
    }
  }
  ctx.globalAlpha = 1;

  return canvas;
}

/** Conduit packet strip: soft-edged dashes on black, scrolled at runtime. */
function paintFlow(w: number, h: number, pal: Palette): HTMLCanvasElement | null {
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);

  const dashes = 6;
  const span = w / dashes;
  const dash = span * 0.7;
  for (let i = 0; i < dashes; i++) {
    const x = i * span;
    const grad = ctx.createLinearGradient(x, 0, x + dash, 0);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.42, pal.texTrace);
    grad.addColorStop(0.6, pal.texTrace2);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x, h * 0.3, dash, h * 0.4);
  }

  return canvas;
}

/** Ground plate: radar rings, spokes and grid, faded out at the rim. */
function paintFloor(size: number, pal: Palette): HTMLCanvasElement | null {
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const c = size / 2;
  const cell = size / 48;

  ctx.strokeStyle = pal.texMinor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 48; i++) {
    const p = Math.round(i * cell) + 0.5;
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
  }
  ctx.stroke();

  ctx.strokeStyle = pal.texMajor;
  ctx.lineWidth = Math.max(1.5, size / 700);
  ctx.beginPath();
  for (let r = 1; r <= 5; r++) {
    ctx.moveTo(c + (c * r) / 5.4, c);
    ctx.arc(c, c, (c * r) / 5.4, 0, Math.PI * 2);
  }
  ctx.stroke();

  ctx.strokeStyle = pal.texMark;
  ctx.lineWidth = Math.max(1, size / 900);
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.moveTo(c + Math.cos(a) * cell * 3, c + Math.sin(a) * cell * 3);
    ctx.lineTo(c + Math.cos(a) * c, c + Math.sin(a) * c);
  }
  ctx.stroke();

  // Fade the plate to nothing so it has no visible square edge.
  ctx.globalCompositeOperation = "destination-in";
  const fade = ctx.createRadialGradient(c, c, 0, c, c, c);
  fade.addColorStop(0, "rgba(0,0,0,1)");
  fade.addColorStop(0.5, "rgba(0,0,0,0.8)");
  fade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "source-over";

  return canvas;
}

/** Soft radial falloff, used additively for light spill and hover glow. */
function paintGlow(size: number): HTMLCanvasElement | null {
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const c = size / 2;
  const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.26, "rgba(255,255,255,0.55)");
  grad.addColorStop(0.62, "rgba(255,255,255,0.13)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return canvas;
}

/**
 * A code editor, painted as glyph-shaped bars rather than real text.
 *
 * Real text would need a font asset and would be illegible at the size this
 * ever renders. Token-coloured bars at the right rhythm read unmistakably as
 * source code from two metres away, which is the whole job. The layout — tab
 * strip, line-number gutter, indented syntax-coloured tokens, a selection
 * band, a caret and a minimap — is what sells it.
 */
function paintCode(
  w: number,
  h: number,
  pal: Palette,
  seed: number,
  /* Drop the editor chrome and leave only the code body. That variant is set to
     repeat and scrolled at runtime as a live log — a tab strip sliding past
     with the code would read as a bug rather than as a feed. */
  plain: boolean
): HTMLCanvasElement | null {
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const rand = rng(seed);
  const inks = [pal.texTrace, pal.texTrace2, pal.texTrace3, pal.texWarm];

  ctx.fillStyle = pal.codeBg;
  ctx.fillRect(0, 0, w, h);

  /* tab strip */
  const barH = plain ? 0 : h * 0.062;
  if (!plain) {
  ctx.fillStyle = "rgba(255,255,255,0.045)";
  ctx.fillRect(0, 0, w, barH);
  for (let i = 0; i < 3; i++) {
    const tw = w * 0.15;
    const tx = w * 0.03 + i * (tw + w * 0.012);
    ctx.fillStyle = i === 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)";
    ctx.fillRect(tx, barH * 0.16, tw, barH * 0.68);
    ctx.fillStyle = i === 0 ? pal.texTrace : pal.codeComment;
    ctx.fillRect(tx + tw * 0.12, barH * 0.44, tw * 0.62, Math.max(1, h * 0.006));
  }
  ctx.fillStyle = pal.texTrace;
  ctx.fillRect(w * 0.03, barH - Math.max(1, h * 0.005), w * 0.15, Math.max(1, h * 0.005));
  }

  /* gutter */
  const gutter = w * 0.062;
  ctx.fillStyle = "rgba(255,255,255,0.025)";
  ctx.fillRect(0, barH, gutter, h - barH);

  /* lines */
  const rows = 22;
  const lineH = (h - barH) / rows;
  const glyph = w * 0.0125;
  const bodyLeft = gutter + w * 0.028;
  const bodyRight = plain ? w * 0.955 : w * 0.845;
  const active = 9;

  for (let r = 0; r < rows; r++) {
    const y = barH + r * lineH;
    const mid = y + lineH * 0.5;

    if (r === active) {
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(gutter, y, w - gutter, lineH);
    }

    /* line number */
    ctx.fillStyle = r === active ? pal.codeIdent : pal.codeGutter;
    const digits = r < 9 ? 1 : 2;
    for (let d = 0; d < digits; d++) {
      ctx.fillRect(
        gutter - w * 0.014 - d * glyph * 0.85,
        mid - lineH * 0.16,
        glyph * 0.5,
        lineH * 0.32
      );
    }

    if (rand() < 0.1) continue; // a blank line, for rhythm

    const indent = Math.floor(rand() * 4) * glyph * 2.2;
    let x = bodyLeft + indent;

    /* a comment line every so often, in one flat dim colour */
    if (rand() < 0.14) {
      const len = (0.28 + rand() * 0.4) * (bodyRight - x);
      ctx.fillStyle = pal.codeComment;
      ctx.fillRect(x, mid - lineH * 0.13, len, lineH * 0.26);
      continue;
    }

    const tokens = 2 + Math.floor(rand() * 5);
    for (let t = 0; t < tokens && x < bodyRight; t++) {
      const kind = rand();
      const ink =
        kind < 0.24
          ? inks[1] /* keyword  */
          : kind < 0.44
            ? inks[2] /* string   */
            : kind < 0.56
              ? inks[0] /* call     */
              : kind < 0.63
                ? inks[3] /* number   */
                : pal.codeIdent; /* identifier */
      const len = glyph * (1.6 + rand() * 6.4);
      const draw = Math.min(len, bodyRight - x);
      ctx.fillStyle = ink;
      ctx.globalAlpha = ink === pal.codeIdent ? 0.82 : 1;
      ctx.fillRect(x, mid - lineH * 0.15, draw, lineH * 0.3);
      ctx.globalAlpha = 1;
      x += draw + glyph * 0.9;
    }

    /* caret on the active line */
    if (r === active) {
      ctx.fillStyle = pal.texTrace3;
      ctx.fillRect(x + glyph * 0.2, mid - lineH * 0.26, glyph * 0.45, lineH * 0.52);
    }
  }

  if (plain) return canvas;

  /* minimap */
  const mapX = w * 0.868;
  const mapW = w * 0.104;
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.fillRect(mapX, barH, mapW, h - barH);
  for (let r = 0; r < rows * 3; r++) {
    if (rand() < 0.22) continue;
    const y = barH + (r / (rows * 3)) * (h - barH);
    ctx.fillStyle = inks[Math.floor(rand() * inks.length)];
    ctx.globalAlpha = 0.28 + rand() * 0.42;
    ctx.fillRect(mapX + mapW * 0.1, y, mapW * (0.2 + rand() * 0.7), Math.max(1, h * 0.0038));
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.fillRect(mapX, barH + (h - barH) * 0.3, mapW, (h - barH) * 0.16);

  return canvas;
}

/**
 * A server rack face, painted twice from one seed.
 *
 * `albedo` carries the chassis: bay bevels, drive handles, mesh panels. `leds`
 * carries only the indicators on black, so it can drive emissive without the
 * chassis itself glowing. Sharing the seed keeps every LED on the emissive
 * pass sitting exactly over its socket on the albedo pass.
 */
function paintRack(
  w: number,
  h: number,
  pal: Palette,
  seed: number
): { albedo: HTMLCanvasElement | null; leds: HTMLCanvasElement | null } {
  const albedo = makeCanvas(w, h);
  const leds = makeCanvas(w, h);
  const a = albedo.getContext("2d");
  const l = leds.getContext("2d");
  if (!a || !l) return { albedo: null, leds: null };

  const rand = rng(seed);
  const inks = [pal.texTrace, pal.texTrace3, pal.texWarm, pal.texTrace2];

  a.fillStyle = "#2b3346";
  a.fillRect(0, 0, w, h);
  l.fillStyle = "#000000";
  l.fillRect(0, 0, w, h);

  const bays = 22;
  const bayH = h / bays;
  const inset = w * 0.06;

  for (let b = 0; b < bays; b++) {
    const y = b * bayH;
    const kind = rand();

    /* chassis face, with a lit top edge and a shadowed bottom edge */
    a.fillStyle = kind < 0.24 ? "#232a3a" : "#39435a";
    a.fillRect(inset, y + bayH * 0.1, w - inset * 2, bayH * 0.8);
    a.fillStyle = "rgba(255,255,255,0.16)";
    a.fillRect(inset, y + bayH * 0.1, w - inset * 2, Math.max(1, bayH * 0.05));
    a.fillStyle = "rgba(0,0,0,0.4)";
    a.fillRect(inset, y + bayH * 0.86, w - inset * 2, Math.max(1, bayH * 0.05));

    if (kind < 0.24) {
      /* perforated mesh panel */
      a.fillStyle = "rgba(0,0,0,0.5)";
      const dot = Math.max(1, w * 0.012);
      for (let px = inset * 2; px < w - inset * 2; px += dot * 2.4) {
        for (let py = y + bayH * 0.24; py < y + bayH * 0.78; py += dot * 2.4) {
          a.beginPath();
          a.arc(px, py, dot * 0.62, 0, Math.PI * 2);
          a.fill();
        }
      }
      continue;
    }

    /* drive sleds: handle bars down the left of the bay */
    const sleds = 2 + Math.floor(rand() * 3);
    const sledW = (w - inset * 2.6) / sleds;
    for (let s = 0; s < sleds; s++) {
      const sx = inset * 1.3 + s * sledW;
      a.fillStyle = "rgba(0,0,0,0.32)";
      a.fillRect(sx + sledW * 0.06, y + bayH * 0.24, sledW * 0.55, bayH * 0.5);
      a.fillStyle = "rgba(255,255,255,0.1)";
      a.fillRect(sx + sledW * 0.06, y + bayH * 0.24, sledW * 0.55, Math.max(1, bayH * 0.05));

      /* indicator, on both passes */
      const ink = inks[rand() < 0.72 ? (rand() < 0.7 ? 1 : 0) : rand() < 0.6 ? 2 : 3];
      const lx = sx + sledW * 0.72;
      const ly = y + bayH * 0.4;
      const lw = sledW * 0.16;
      const lh = bayH * 0.2;
      a.fillStyle = ink;
      a.fillRect(lx, ly, lw, lh);
      l.globalAlpha = 0.4 + rand() * 0.6;
      l.fillStyle = ink;
      l.fillRect(lx, ly, lw, lh);
      /* a soft bloom around the indicator so it does not read as a hard pixel */
      l.globalAlpha *= 0.32;
      l.fillRect(lx - lw, ly - lh * 0.6, lw * 3, lh * 2.2);
      l.globalAlpha = 1;
    }
  }

  /* PDU strip along the bottom: a dense run of tiny status lights */
  const pduY = h - h * 0.028;
  a.fillStyle = "#1b2130";
  a.fillRect(0, pduY, w, h * 0.028);
  for (let i = 0; i < 26; i++) {
    const x = (i + 0.5) * (w / 26);
    const ink = inks[i % inks.length];
    a.fillStyle = ink;
    a.fillRect(x - w * 0.008, pduY + h * 0.008, w * 0.016, h * 0.012);
    l.globalAlpha = 0.35 + rand() * 0.65;
    l.fillStyle = ink;
    l.fillRect(x - w * 0.008, pduY + h * 0.008, w * 0.016, h * 0.012);
  }
  l.globalAlpha = 1;

  return { albedo, leds };
}

interface TextureOptions {
  /** Only albedo and emissive are colour. See the note in `toTexture`. */
  srgb?: boolean;
  rx?: number;
  ry?: number;
  /** Clamp instead of repeat, for maps that fill a face exactly once. */
  clamp?: boolean;
  rotation?: number;
  aniso: number;
}

function toTexture(
  canvas: HTMLCanvasElement | null,
  opts: TextureOptions
): THREE.CanvasTexture | null {
  if (!canvas) return null;
  const tex = new THREE.CanvasTexture(canvas);
  const wrap = opts.clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  tex.wrapS = wrap;
  tex.wrapT = wrap;
  tex.repeat.set(opts.rx ?? 1, opts.ry ?? 1);
  if (opts.rotation) {
    tex.center.set(0.5, 0.5);
    tex.rotation = opts.rotation;
  }
  tex.anisotropy = opts.aniso;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  /* Roughness and normal maps are measurements, not colour. Tagging them sRGB
     applies a decode curve to data that was never encoded, which lifts the
     mid-tones and washes the whole surface out. */
  tex.colorSpace = opts.srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  return tex;
}

/* ---------------------------------------------------------- geometry kit */

/**
 * A box with rounded vertical corners and chamfered caps, extruded along Z.
 *
 * Raw BoxGeometry corners catch the key light as a hard white line; a chamfer
 * turns that into a highlight the eye reads as machined.
 */
function roundedBox(
  w: number,
  h: number,
  d: number,
  radius: number,
  curve: number,
  bevelSegments: number
) {
  const r = Math.min(radius, w / 2 - 1e-4, h / 2 - 1e-4);
  const bevel = Math.min(r * 0.6, d * 0.35);
  const x = w / 2 - r;
  const y = h / 2 - r;
  const shape = new THREE.Shape();
  shape.moveTo(-x - r, -y);
  shape.lineTo(-x - r, y);
  shape.quadraticCurveTo(-x - r, y + r, -x, y + r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x + r, y + r, x + r, y);
  shape.lineTo(x + r, -y);
  shape.quadraticCurveTo(x + r, -y - r, x, -y - r);
  shape.lineTo(-x, -y - r);
  shape.quadraticCurveTo(-x - r, -y - r, -x - r, -y);
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: d - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: 0,
    bevelSegments,
    curveSegments: curve,
    steps: 1,
  });
  // ExtrudeGeometry runs from -bevel to depth+bevel; re-centre on the origin.
  g.translate(0, 0, -(d / 2 - bevel));
  g.computeVertexNormals();
  return g;
}

/** The same solid, but lying flat: thin axis on Y, like a shelf. */
function roundedSlab(
  w: number,
  h: number,
  d: number,
  radius: number,
  curve: number,
  bevelSegments: number
) {
  const g = roundedBox(w, d, h, radius, curve, bevelSegments);
  g.rotateX(Math.PI / 2);
  return g;
}

/**
 * A round-stroked path through 2D points, extruded as a tube on the XY plane.
 *
 * `path` is rounded because TubeGeometry indexes its Frenet frames by integer
 * segment: a fractional count builds one fewer frame than it asks for and the
 * final segment reads past the end of the array.
 */
function strokeGlyph(points: [number, number][], radius: number, path: number, sides: number) {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, y]) => new THREE.Vector3(x, y, 0)),
    false,
    "catmullrom",
    0.4
  );
  return new THREE.TubeGeometry(curve, Math.round(path), radius, sides, false);
}

/* The floating source-code glyphs. Drawn as round strokes rather than extruded
   letterforms so they need no font asset, and so the ends read as soft rather
   than as cut plastic. */
const GLYPH_PATHS: Record<string, [number, number][]> = {
  lt: [
    [0.34, 0.44],
    [-0.02, 0.2],
    [-0.26, 0],
    [-0.02, -0.2],
    [0.34, -0.44],
  ],
  gt: [
    [-0.34, 0.44],
    [0.02, 0.2],
    [0.26, 0],
    [0.02, -0.2],
    [-0.34, -0.44],
  ],
  slash: [
    [0.26, 0.5],
    [0, 0],
    [-0.26, -0.5],
  ],
  braceL: [
    [0.3, 0.54],
    [0.06, 0.46],
    [0.05, 0.16],
    [-0.2, 0],
    [0.05, -0.16],
    [0.06, -0.46],
    [0.3, -0.54],
  ],
  braceR: [
    [-0.3, 0.54],
    [-0.06, 0.46],
    [-0.05, 0.16],
    [0.2, 0],
    [-0.05, -0.16],
    [-0.06, -0.46],
    [-0.3, -0.54],
  ],
  parenL: [
    [0.24, 0.52],
    [-0.08, 0.24],
    [-0.16, 0],
    [-0.08, -0.24],
    [0.24, -0.52],
  ],
  parenR: [
    [-0.24, 0.52],
    [0.08, 0.24],
    [0.16, 0],
    [0.08, -0.24],
    [-0.24, -0.52],
  ],
  arrow: [
    [-0.36, 0],
    [0.36, 0],
  ],
  bar: [
    [0, 0.46],
    [0, -0.46],
  ],
};

const GLYPH_ORDER = [
  "lt",
  "slash",
  "gt",
  "braceL",
  "arrow",
  "braceR",
  "parenL",
  "bar",
  "parenR",
];

/* ---------------------------------------------------------- material kit */

interface Tx {
  plate: THREE.Texture | null;
  plateFine: THREE.Texture | null;
  grid: THREE.Texture | null;
  rough: THREE.Texture | null;
  roughFine: THREE.Texture | null;
  roughConduit: THREE.Texture | null;
  normal: THREE.Texture | null;
  normalFine: THREE.Texture | null;
  normalConduit: THREE.Texture | null;
  hex: THREE.Texture | null;
  circuit: THREE.Texture | null;
  flow: THREE.Texture | null;
  floor: THREE.Texture | null;
  glow: THREE.Texture | null;
  code: THREE.Texture | null;
  codeSide: THREE.Texture | null;
  rack: THREE.Texture | null;
  rackLeds: THREE.Texture | null;
}

interface Kit {
  all: THREE.Material[];
  deck: THREE.MeshStandardMaterial;
  deckTop: THREE.MeshStandardMaterial;
  frame: THREE.MeshStandardMaterial;
  chrome: THREE.MeshStandardMaterial;
  chromeDark: THREE.MeshStandardMaterial;
  shell: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  rubber: THREE.MeshStandardMaterial;
  vent: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  panel: THREE.MeshStandardMaterial;
  screen: THREE.MeshStandardMaterial;
  screenSide: THREE.MeshStandardMaterial;
  rack: THREE.MeshStandardMaterial;
  conduit: THREE.MeshStandardMaterial;
  glowA: THREE.MeshStandardMaterial;
  glowB: THREE.MeshStandardMaterial;
  glowC: THREE.MeshStandardMaterial;
  glowWarm: THREE.MeshStandardMaterial;
  neonA: THREE.MeshBasicMaterial;
  neonB: THREE.MeshBasicMaterial;
  neonC: THREE.MeshBasicMaterial;
  neonWarm: THREE.MeshBasicMaterial;
  wire: THREE.LineBasicMaterial;
  hazeA: THREE.MeshBasicMaterial;
  hazeB: THREE.MeshBasicMaterial;
  hazeC: THREE.MeshBasicMaterial;
  floor: THREE.MeshBasicMaterial;
  shadow: THREE.ShadowMaterial;
  /** Emissive materials whose intensity the act loops modulate. */
  pulse: THREE.MeshStandardMaterial[];
}

/**
 * One complete material set.
 *
 * Every act gets its own set so that act opacity can be driven independently
 * during a handoff — materials are the only place three.js exposes per-object
 * alpha, and sharing them would fade all four acts together. The textures
 * underneath are shared, so the extra cost is a few dozen small objects and no
 * extra GPU memory. Identical parameter sets also share a compiled program.
 */
function makeKit(pal: Palette, tx: Tx, glow: number): Kit {
  const all: THREE.Material[] = [];
  const track = <T extends THREE.Material>(m: T): T => {
    // Remember the design opacity so act fades can scale it rather than clobber it.
    m.userData.baseOpacity = m.opacity;
    all.push(m);
    return m;
  };

  const std = (params: THREE.MeshStandardMaterialParameters) =>
    track(new THREE.MeshStandardMaterial(params));

  const emissiveStd = (color: number, intensity: number) =>
    std({
      color,
      roughness: 0.3,
      metalness: 0.6,
      roughnessMap: tx.rough,
      emissive: 0xffffff,
      emissiveMap: tx.circuit,
      emissiveIntensity: glow * intensity,
      envMapIntensity: 1.15,
    });

  const neon = (color: number) =>
    track(new THREE.MeshBasicMaterial({ color, toneMapped: false }));

  const haze = (color: number, opacity: number) =>
    track(
      new THREE.MeshBasicMaterial({
        color,
        map: tx.glow,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      })
    );

  const glowA = emissiveStd(pal.accent, 1);
  const glowB = emissiveStd(pal.accent2, 1);
  const glowC = emissiveStd(pal.accent3, 1);
  const glowWarm = emissiveStd(pal.warm, 0.9);

  const rack = std({
    color: 0xffffff,
    map: tx.rack,
    roughness: 0.62,
    metalness: 0.4,
    normalMap: tx.hex,
    normalScale: new THREE.Vector2(0.18, 0.18),
    emissive: 0xffffff,
    emissiveMap: tx.rackLeds,
    emissiveIntensity: glow * 1.15,
    envMapIntensity: 0.9,
  });

  const screen = std({
    color: 0xffffff,
    map: tx.code,
    roughness: 0.14,
    metalness: 0,
    emissive: 0xffffff,
    emissiveMap: tx.code,
    emissiveIntensity: glow * 0.95,
    envMapIntensity: 0.35,
    /* A display is a light source, not a lit surface. Letting the filmic curve
       compress it turns the syntax colours to mud. */
    toneMapped: false,
  });

  const screenSide = std({
    color: 0xffffff,
    map: tx.codeSide,
    roughness: 0.14,
    metalness: 0,
    emissive: 0xffffff,
    emissiveMap: tx.codeSide,
    emissiveIntensity: glow * 0.8,
    envMapIntensity: 0.35,
    toneMapped: false,
  });

  const conduit = std({
    color: pal.frame,
    roughness: 0.2,
    metalness: 0.95,
    roughnessMap: tx.roughConduit,
    normalMap: tx.normalConduit,
    normalScale: new THREE.Vector2(0.4, 0.4),
    emissive: 0xffffff,
    emissiveMap: tx.flow,
    emissiveIntensity: glow * 0.9,
    envMapIntensity: 1.2,
  });

  return {
    all,
    deck: std({
      color: pal.deck,
      map: tx.plate,
      roughness: 0.55,
      metalness: 0.35,
      roughnessMap: tx.rough,
      normalMap: tx.normal,
      normalScale: new THREE.Vector2(0.55, 0.55),
      envMapIntensity: 0.85,
    }),
    /* The graph-paper map already carries the theme's deck colour, so the
       material colour stays white and lets the texture speak. */
    deckTop: std({
      color: 0xffffff,
      map: tx.grid,
      roughness: 0.66,
      metalness: 0.14,
      roughnessMap: tx.rough,
      normalMap: tx.normal,
      normalScale: new THREE.Vector2(0.3, 0.3),
      envMapIntensity: 0.7,
    }),
    frame: std({
      color: pal.frame,
      map: tx.plateFine,
      roughness: 0.26,
      metalness: 0.92,
      roughnessMap: tx.rough,
      normalMap: tx.normal,
      normalScale: new THREE.Vector2(0.7, 0.7),
      envMapIntensity: 1.1,
    }),
    /* Polished chrome: almost no roughness, so it is carried entirely by the
       environment reflection. The faint normal keeps it from looking like a
       perfect CG mirror. */
    chrome: std({
      color: pal.chrome,
      roughness: 0.11,
      metalness: 1,
      roughnessMap: tx.roughFine,
      normalMap: tx.normalFine,
      normalScale: new THREE.Vector2(0.16, 0.16),
      envMapIntensity: 1.5,
    }),
    chromeDark: std({
      color: pal.frame,
      roughness: 0.3,
      metalness: 1,
      roughnessMap: tx.roughFine,
      normalMap: tx.normalFine,
      normalScale: new THREE.Vector2(0.3, 0.3),
      envMapIntensity: 1.2,
    }),
    /* Glossy moulded plastic for the assistant: dielectric, near-white, with
       just enough roughness to keep a soft highlight instead of a hot spot. */
    shell: std({
      color: pal.shell,
      roughness: 0.24,
      metalness: 0.04,
      roughnessMap: tx.roughFine,
      envMapIntensity: 1.05,
    }),
    dark: std({
      color: pal.dark,
      roughness: 0.42,
      metalness: 0.2,
      roughnessMap: tx.rough,
      envMapIntensity: 0.7,
    }),
    rubber: std({
      color: pal.dark,
      roughness: 0.92,
      metalness: 0,
      roughnessMap: tx.roughConduit,
      envMapIntensity: 0.35,
    }),
    vent: std({
      color: pal.frame,
      roughness: 0.5,
      metalness: 0.85,
      roughnessMap: tx.rough,
      normalMap: tx.hex,
      normalScale: new THREE.Vector2(1.1, 1.1),
      envMapIntensity: 1,
    }),
    /* Near-mirror roughness plus a hot environment reads as glass far more
       cheaply than transmission, which would cost a second scene pass. */
    glass: std({
      color: pal.deckTop,
      roughness: 0.06,
      metalness: 0.1,
      transparent: true,
      opacity: pal.glass,
      depthWrite: false,
      side: THREE.DoubleSide,
      envMapIntensity: 2.4,
    }),
    panel: std({
      color: 0xffffff,
      map: tx.circuit,
      roughness: 0.22,
      metalness: 0.35,
      emissive: 0xffffff,
      emissiveMap: tx.circuit,
      emissiveIntensity: glow * 0.8,
      envMapIntensity: 1.3,
    }),
    screen,
    screenSide,
    rack,
    conduit,
    glowA,
    glowB,
    glowC,
    glowWarm,
    neonA: neon(pal.accent),
    neonB: neon(pal.accent2),
    neonC: neon(pal.accent3),
    neonWarm: neon(pal.warm),
    wire: track(
      new THREE.LineBasicMaterial({
        color: pal.accent,
        transparent: true,
        opacity: 0.5,
        toneMapped: false,
      })
    ),
    hazeA: haze(pal.accent, pal.hazeAlpha),
    hazeB: haze(pal.accent2, pal.hazeAlpha * 0.8),
    hazeC: haze(pal.accent3, pal.hazeAlpha * 0.9),
    floor: track(
      new THREE.MeshBasicMaterial({
        map: tx.floor,
        transparent: true,
        opacity: pal.floorAlpha,
        depthWrite: false,
        toneMapped: false,
      })
    ),
    shadow: track(new THREE.ShadowMaterial({ opacity: pal.shadowAlpha })),
    pulse: [glowA, glowB, glowC, glowWarm, rack, screen, conduit],
  };
}

/**
 * Fade a whole act by scaling every material's design opacity.
 *
 * `transparent` is toggled rather than left on, because a fully opaque act
 * should render in the opaque pass — sorting a hundred opaque meshes into the
 * transparent queue costs correctness at every intersection.
 *
 * The toggle MUST set `needsUpdate`. three bakes `#define OPAQUE` into the
 * compiled program for a non-transparent material and that define clamps the
 * fragment alpha to 1, so flipping the flag alone changes the blend state while
 * the shader keeps discarding the alpha — the whole act stays at full strength
 * and the hand-off between acts becomes a hard cut. The inequality guard is
 * load-bearing: recompiling every material every frame would stall the loop.
 */
function setKitOpacity(kit: Kit, w: number) {
  for (const m of kit.all) {
    const base = (m.userData.baseOpacity as number) ?? 1;
    const o = base * w;
    m.opacity = o;
    const transparent = o < 0.995;
    if (m.transparent !== transparent) {
      m.transparent = transparent;
      m.needsUpdate = true;
    }
  }
}

/* ------------------------------------------------------------- act build */

interface BuildCtx {
  pal: Palette;
  D: Detail;
  kit: Kit;
  tx: Tx;
  isMobile: boolean;
  /** Cached geometry. Keys are namespaced per act, since shapes rarely match. */
  g: (key: string, make: () => THREE.BufferGeometry) => THREE.BufferGeometry;
  box: (key: string, w: number, h: number, d: number, r: number) => THREE.BufferGeometry;
  slab: (key: string, w: number, h: number, d: number, r: number) => THREE.BufferGeometry;
  /** Register an act-local material so it fades and disposes with the rest. */
  own: <T extends THREE.Material>(m: T) => T;
  /** Register an act-local texture clone for disposal. */
  ownTex: <T extends THREE.Texture>(t: T) => T;
  cast: (m: THREE.Mesh) => THREE.Mesh;
  /** An additive billboard-ish glow quad, for light spill and bloom. */
  haze: (w: number, h: number, m: THREE.Material) => THREE.Mesh;
}

interface Act {
  group: THREE.Group;
  update: (t: number, dt: number, px: number, py: number) => void;
}

/* ------------------------------------------------------- act 0: the rig */

function buildWorkstation(ctx: BuildCtx): Act {
  const { D, kit, tx, g, box, slab, cast, haze, own } = ctx;
  const group = new THREE.Group();

  /* ---- desk ---- */
  const desk = cast(new THREE.Mesh(box("ws:desk", 7.4, 0.16, 3.4, 0.08), kit.deck));
  desk.position.y = -0.08;
  desk.receiveShadow = true;
  group.add(desk);

  const legGeo = box("ws:leg", 0.14, 1.8, 2.7, 0.05);
  [-3.4, 3.4].forEach((x) => {
    const leg = cast(new THREE.Mesh(legGeo, kit.frame));
    leg.position.set(x, -1.06, 0);
    group.add(leg);
  });
  const rail = cast(new THREE.Mesh(box("ws:rail", 6.7, 0.34, 0.12, 0.04), kit.frame));
  rail.position.set(0, -0.62, -1.5);
  group.add(rail);

  /* A desk mat under the input devices, so the keyboard is not floating on a
     bare plate. The graph deck reads as a grid mat at this scale. */
  const mat = new THREE.Mesh(g("ws:mat", () => new THREE.PlaneGeometry(4.1, 1.6)), kit.deckTop);
  mat.rotation.x = -Math.PI / 2;
  mat.position.set(0.6, 0.006, 0.92);
  mat.receiveShadow = true;
  group.add(mat);

  /* ---- main display ---- */
  const monitor = new THREE.Group();
  monitor.position.set(0, 0, -1.15);
  monitor.rotation.x = -0.05;
  group.add(monitor);

  const bezel = cast(new THREE.Mesh(box("ws:bezel", 3.72, 2.16, 0.13, 0.07), kit.frame));
  bezel.position.y = 1.64;
  monitor.add(bezel);

  const screen = new THREE.Mesh(
    g("ws:screen", () => new THREE.PlaneGeometry(3.46, 1.9)),
    kit.screen
  );
  screen.position.set(0, 1.64, 0.072);
  monitor.add(screen);

  const sheen = new THREE.Mesh(g("ws:screen", () => new THREE.PlaneGeometry(3.46, 1.9)), kit.glass);
  sheen.position.set(0, 1.64, 0.078);
  monitor.add(sheen);

  const hump = cast(new THREE.Mesh(box("ws:hump", 2.3, 1.24, 0.26, 0.12), kit.frame));
  hump.position.set(0, 1.64, -0.13);
  monitor.add(hump);

  const neck = cast(new THREE.Mesh(box("ws:neck", 0.28, 1.06, 0.2, 0.08), kit.frame));
  neck.position.set(0, 0.62, -0.02);
  monitor.add(neck);

  const foot = cast(new THREE.Mesh(slab("ws:foot", 1.65, 0.09, 0.74, 0.18), kit.frame));
  foot.position.y = 0.1;
  monitor.add(foot);

  /* Light the display throws onto the desk. Additive, unlit, flat on the deck —
     the cheapest honest way to say "that panel is emitting". */
  const spill = haze(5.2, 3.4, kit.hazeA);
  spill.rotation.x = -Math.PI / 2;
  spill.position.set(0, 0.015, 0.15);
  group.add(spill);

  /* ---- portrait display ---- */
  const side = new THREE.Group();
  side.position.set(2.62, 0, -0.72);
  side.rotation.set(-0.04, -0.62, 0);
  group.add(side);

  const sideBezel = cast(new THREE.Mesh(box("ws:sbezel", 1.58, 2.32, 0.11, 0.06), kit.frame));
  sideBezel.position.y = 1.52;
  side.add(sideBezel);

  const sideScreen = new THREE.Mesh(
    g("ws:sscreen", () => new THREE.PlaneGeometry(1.4, 2.12)),
    kit.screenSide
  );
  sideScreen.position.set(0, 1.52, 0.061);
  side.add(sideScreen);

  const sideNeck = cast(new THREE.Mesh(box("ws:sneck", 0.2, 0.86, 0.16, 0.06), kit.frame));
  sideNeck.position.y = 0.5;
  side.add(sideNeck);
  const sideFoot = cast(new THREE.Mesh(slab("ws:sfoot", 0.9, 0.07, 0.56, 0.14), kit.frame));
  sideFoot.position.y = 0.08;
  side.add(sideFoot);

  /* ---- tower ---- */
  const tower = new THREE.Group();
  tower.position.set(-2.72, 0, -0.5);
  group.add(tower);

  const chassis = cast(new THREE.Mesh(box("ws:case", 1.02, 2.12, 1.96, 0.07), kit.deck));
  chassis.position.y = 1.06;
  tower.add(chassis);

  const glassPanel = new THREE.Mesh(
    g("ws:glass", () => new THREE.PlaneGeometry(0.9, 1.92)),
    kit.glass
  );
  glassPanel.rotation.y = Math.PI / 2;
  glassPanel.position.set(0.516, 1.06, 0);
  tower.add(glassPanel);

  const board = new THREE.Mesh(
    g("ws:board", () => new THREE.PlaneGeometry(1.72, 1.84)),
    kit.panel
  );
  board.rotation.y = Math.PI / 2;
  board.position.set(-0.34, 1.06, 0);
  tower.add(board);

  const gpu = cast(new THREE.Mesh(box("ws:gpu", 1.48, 0.22, 0.44, 0.04), kit.frame));
  gpu.rotation.y = Math.PI / 2;
  gpu.position.set(0.02, 0.94, 0);
  tower.add(gpu);

  const gpuStrip = new THREE.Mesh(box("ws:gpustrip", 1.3, 0.05, 0.06, 0.02), kit.glowB);
  gpuStrip.rotation.y = Math.PI / 2;
  gpuStrip.position.set(0.26, 0.94, 0);
  tower.add(gpuStrip);

  /* Two intake fans on the face turned toward the camera. The blade group is
     what spins; the shroud and hub stay put, which is what makes the rotation
     legible instead of the whole assembly appearing to wobble. */
  const fans: THREE.Group[] = [];
  const shroudGeo = g(
    "ws:shroud",
    () => new THREE.TorusGeometry(0.25, 0.03, D.ringTubeThin, D.ringArc)
  );
  const hubGeo = g(
    "ws:hub",
    () => new THREE.CylinderGeometry(0.07, 0.07, 0.06, D.radialSmall)
  );
  const bladeGeo = box("ws:blade", 0.17, 0.02, 0.075, 0.008);
  [0.52, 1.6].forEach((y, i) => {
    const fan = new THREE.Group();
    fan.position.set(0.04, y, 0.99);
    tower.add(fan);

    const shroud = new THREE.Mesh(shroudGeo, i ? kit.glowA : kit.glowC);
    fan.add(shroud);

    const hub = new THREE.Mesh(hubGeo, kit.dark);
    hub.rotation.x = Math.PI / 2;
    fan.add(hub);

    const blades = new THREE.Group();
    for (let b = 0; b < 7; b++) {
      const blade = new THREE.Mesh(bladeGeo, kit.dark);
      const a = (b / 7) * Math.PI * 2;
      blade.position.set(Math.cos(a) * 0.13, Math.sin(a) * 0.13, 0);
      blade.rotation.set(0, 0, a);
      blade.rotateX(0.5);
      blades.add(blade);
    }
    fan.add(blades);
    fans.push(blades);
  });

  const vent = new THREE.Mesh(slab("ws:vent", 0.92, 0.035, 1.8, 0.03), kit.vent);
  vent.position.y = 2.14;
  tower.add(vent);

  const led = new THREE.Mesh(
    g("ws:led", () => new THREE.SphereGeometry(0.036, 12, 8)),
    kit.neonC
  );
  led.position.set(0.42, 2.02, 0.9);
  tower.add(led);

  /* ---- keyboard ---- */
  const keyboard = new THREE.Group();
  keyboard.position.set(0.2, 0, 0.98);
  keyboard.rotation.set(-0.035, 0.06, 0);
  group.add(keyboard);

  const kbBase = cast(new THREE.Mesh(slab("ws:kb", 2.62, 0.075, 0.94, 0.05), kit.frame));
  kbBase.position.y = 0.05;
  keyboard.add(kbBase);

  const cols = Math.max(6, Math.round(D.keys / 4));
  const rows = 4;
  const count = cols * rows;
  const keys = new THREE.InstancedMesh(
    slab("ws:key", 0.148, 0.05, 0.148, 0.028),
    own(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.44,
        metalness: 0.18,
        envMapIntensity: 0.8,
      })
    ),
    count
  );
  keys.castShadow = !ctx.isMobile;
  const slot = new THREE.Object3D();
  const keyTint = new THREE.Color();
  const pitchX = 2.36 / cols;
  const pitchZ = 0.7 / rows;
  for (let i = 0; i < count; i++) {
    const cx = i % cols;
    const cz = Math.floor(i / cols);
    slot.position.set(
      (cx - (cols - 1) / 2) * pitchX,
      0.105,
      (cz - (rows - 1) / 2) * pitchZ
    );
    slot.scale.set(pitchX / 0.166, 1, pitchZ / 0.175);
    slot.updateMatrix();
    keys.setMatrixAt(i, slot.matrix);
    // A handful of accent caps, so the deck is not a uniform grey field.
    const hot = cz === 1 && cx > 1 && cx < 5;
    keys.setColorAt(i, keyTint.setHex(hot ? ctx.pal.accent : ctx.pal.deckTop));
  }
  if (keys.instanceColor) keys.instanceColor.needsUpdate = true;
  keyboard.add(keys);

  /* ---- mouse and mug ---- */
  const mouse = new THREE.Group();
  mouse.position.set(2.0, 0, 0.92);
  group.add(mouse);
  const mouseBody = cast(
    new THREE.Mesh(
      g("ws:mouse", () => new THREE.SphereGeometry(0.24, D.sphereW, D.sphereH, 0, Math.PI * 2, 0, Math.PI / 2)),
      kit.dark
    )
  );
  mouseBody.scale.set(0.8, 0.62, 1.34);
  mouseBody.position.y = 0.02;
  mouse.add(mouseBody);
  const wheel = new THREE.Mesh(
    g("ws:wheel", () => new THREE.TorusGeometry(0.045, 0.016, 6, 16)),
    kit.glowA
  );
  wheel.rotation.y = Math.PI / 2;
  wheel.position.set(0, 0.15, 0.05);
  mouse.add(wheel);

  const mug = new THREE.Group();
  mug.position.set(2.9, 0, 0.02);
  group.add(mug);
  const mugBody = cast(
    new THREE.Mesh(
      g("ws:mug", () => new THREE.CylinderGeometry(0.23, 0.2, 0.44, D.radial, 1, true)),
      kit.deckTop
    )
  );
  mugBody.position.y = 0.22;
  mug.add(mugBody);
  const brew = new THREE.Mesh(
    g("ws:brew", () => new THREE.CircleGeometry(0.22, D.radial)),
    kit.dark
  );
  brew.rotation.x = -Math.PI / 2;
  brew.position.y = 0.37;
  mug.add(brew);
  const handle = new THREE.Mesh(
    g("ws:handle", () => new THREE.TorusGeometry(0.13, 0.034, D.ringTubeThin, D.ringArc)),
    kit.deckTop
  );
  handle.rotation.y = Math.PI / 2;
  handle.position.set(0.24, 0.24, 0);
  mug.add(handle);

  /* ---- floating code ---- */
  const glyphs = new THREE.Group();
  glyphs.position.set(-0.1, 2.5, -0.1);
  group.add(glyphs);

  const glyphMats = [kit.glowA, kit.glowB, kit.glowC, kit.glowWarm];
  /* `baseY` exists so the bob can be written as an absolute offset. Adding a
     sine to position.y each frame integrates it instead of oscillating: the
     average of sin over a partial period is not zero, so the whole floating
     layer creeps away over a session — and it creeps further whenever the act
     is hidden and `t` keeps advancing without the object being redrawn. */
  const floaters: { obj: THREE.Object3D; baseY: number; phase: number; spin: number }[] = [];
  const n = D.glyphs;
  for (let i = 0; i < n; i++) {
    const name = GLYPH_ORDER[i % GLYPH_ORDER.length];
    const shape = new THREE.Mesh(
      g(`ws:glyph:${name}`, () =>
        strokeGlyph(GLYPH_PATHS[name], 0.052, Math.max(24, D.tubePath / 2), D.tubeSides)
      ),
      glyphMats[i % glyphMats.length]
    );
    const a = (i / n) * Math.PI * 2;
    shape.position.set(Math.cos(a) * 3.2, Math.sin(a * 2) * 0.5, Math.sin(a) * 1.7 - 0.4);
    shape.scale.setScalar(0.85 + (i % 3) * 0.16);
    glyphs.add(shape);
    floaters.push({ obj: shape, baseY: shape.position.y, phase: i * 1.7, spin: 0.2 + (i % 3) * 0.12 });
  }

  /* Two snippet cards, so the floating layer is not only punctuation. */
  const cardGeo = box("ws:card", 1.0, 0.64, 0.045, 0.05);
  [
    { p: [-2.95, 0.72, 0.9] as const, m: kit.screen, r: 0.42 },
    { p: [2.7, 0.34, 1.5] as const, m: kit.screenSide, r: -0.5 },
  ].forEach((c, i) => {
    const card = new THREE.Mesh(cardGeo, c.m);
    card.position.set(c.p[0], c.p[1], c.p[2]);
    card.rotation.set(0.1, c.r, 0);
    glyphs.add(card);
    floaters.push({ obj: card, baseY: card.position.y, phase: 3.1 + i * 2.2, spin: 0.05 });
  });

  const update = (t: number, dt: number, px: number) => {
    for (const f of fans) f.rotation.z -= dt * 6.2;
    glyphs.rotation.y = Math.sin(t * 0.11) * 0.28 + px * 0.06;
    for (const f of floaters) {
      f.obj.position.y = f.baseY + Math.sin(t * 0.7 + f.phase) * 0.34;
      f.obj.rotation.y += dt * f.spin;
      f.obj.rotation.z = Math.sin(t * 0.4 + f.phase) * 0.14;
    }
    // The portrait panel is a log feed, so it scrolls. The landscape editor
    // holds still and only breathes — a live panel never sits perfectly flat,
    // but code that scrolls on its own reads as a screensaver.
    if (tx.codeSide) tx.codeSide.offset.y -= dt * 0.045;
    kit.screen.emissiveIntensity = ctx.pal.glow * (0.95 + Math.sin(t * 2.3) * 0.05);
    kit.screenSide.emissiveIntensity = ctx.pal.glow * (0.8 + Math.sin(t * 1.7 + 1) * 0.06);
  };

  return { group, update };
}

/* -------------------------------------------------- act 1: the cold aisle */

function buildDatacenter(ctx: BuildCtx): Act {
  const { D, kit, tx, g, box, slab, cast, haze, own, ownTex } = ctx;
  const group = new THREE.Group();

  const perSide = D.racks;
  const pitch = 1.62;
  const span = (perSide - 1) * pitch;

  /* ---- raised floor ---- */
  const tileTex = tx.grid ? ownTex(tx.grid.clone()) : null;
  if (tileTex) tileTex.repeat.set(9, 9);
  /* Unlit, on purpose.
     An orthographic camera views a ground plane along one constant, very
     shallow direction, so Fresnel sits at grazing incidence across the whole
     plane at once rather than only near the horizon. As a lit surface the floor
     came back as a pale grey slab brighter than the racks standing on it, at
     every roughness and with the environment switched off entirely — the sheen
     was specular from the key light, which no albedo can darken. Unlit keeps
     the tile map exactly as painted, and a separate shadow catcher just above
     it puts the contact shadows back. */
  const tile = own(
    new THREE.MeshBasicMaterial({ color: 0xffffff, map: tileTex, toneMapped: false })
  );
  const floor = new THREE.Mesh(g("dc:floor", () => new THREE.PlaneGeometry(54, 54)), tile);
  floor.rotation.x = -Math.PI / 2;
  group.add(floor);

  if (!ctx.isMobile) {
    const catcher = new THREE.Mesh(
      g("dc:catcher", () => new THREE.PlaneGeometry(54, 54)),
      kit.shadow
    );
    catcher.rotation.x = -Math.PI / 2;
    catcher.position.y = 0.006;
    catcher.receiveShadow = true;
    group.add(catcher);
  }

  const aisle = haze(4.4, span + 6, kit.hazeC);
  aisle.rotation.x = -Math.PI / 2;
  aisle.position.y = 0.02;
  group.add(aisle);

  /* ---- racks ---- */
  /* Three face variants, made by offsetting one painted pair rather than
     painting three. The LED rows land in different places on each, which is all
     the variation a row of racks needs to stop looking cloned. */
  const faceMats = [0, 0.31, 0.67].map((offset, i) => {
    if (i === 0) return kit.rack;
    const m = own(kit.rack.clone());
    if (tx.rack) {
      const c = ownTex(tx.rack.clone());
      c.offset.y = offset;
      m.map = c;
    }
    if (tx.rackLeds) {
      const c = ownTex(tx.rackLeds.clone());
      c.offset.y = offset;
      m.emissiveMap = c;
    }
    return m;
  });

  const bodyGeo = box("dc:body", 1.46, 4.2, 1.5, 0.06);
  const faceGeo = g("dc:face", () => new THREE.PlaneGeometry(1.34, 3.9));
  const ventGeo = slab("dc:vent", 1.3, 0.045, 1.36, 0.03);
  const plinthGeo = box("dc:plinth", 1.52, 0.22, 1.56, 0.03);
  const beaconGeo = g("dc:beacon", () => new THREE.SphereGeometry(0.05, 12, 8));
  const beacons: THREE.Mesh[] = [];

  for (let sideIndex = 0; sideIndex < 2; sideIndex++) {
    for (let i = 0; i < perSide; i++) {
      const rack = new THREE.Group();
      rack.position.set(sideIndex ? 2.45 : -2.45, 0, (i - (perSide - 1) / 2) * pitch);
      // The far row is the same rack turned to face back down the aisle.
      rack.rotation.y = sideIndex ? Math.PI : 0;
      group.add(rack);

      const body = cast(new THREE.Mesh(bodyGeo, kit.frame));
      body.position.y = 2.2;
      rack.add(body);

      const face = new THREE.Mesh(faceGeo, faceMats[(i + sideIndex * 2) % faceMats.length]);
      face.rotation.y = Math.PI / 2;
      face.position.set(0.738, 2.2, 0);
      rack.add(face);

      const top = new THREE.Mesh(ventGeo, kit.vent);
      top.position.y = 4.32;
      rack.add(top);

      const plinth = new THREE.Mesh(plinthGeo, kit.dark);
      plinth.position.y = 0.11;
      rack.add(plinth);

      const beacon = new THREE.Mesh(beaconGeo, i % 3 === 0 ? kit.neonC : kit.neonA);
      beacon.position.set(0.5, 4.42, 0.5);
      rack.add(beacon);
      beacons.push(beacon);
    }
  }

  /* ---- overhead trays and cable bundles ---- */
  const trayLen = span + 5;
  const trayFloorGeo = box("dc:trayfloor", 0.62, 0.06, trayLen, 0.02);
  const trayRailGeo = box("dc:trayrail", 0.05, 0.18, trayLen, 0.02);
  const bundleMats = [kit.conduit, kit.glowB, kit.conduit];

  [-1.62, 1.62].forEach((x, side) => {
    const tray = new THREE.Group();
    tray.position.set(x, 5.3, 0);
    group.add(tray);

    const base = new THREE.Mesh(trayFloorGeo, kit.frame);
    tray.add(base);
    [-0.3, 0.3].forEach((rx) => {
      const railMesh = new THREE.Mesh(trayRailGeo, kit.frame);
      railMesh.position.set(rx, 0.1, 0);
      tray.add(railMesh);
    });

    for (let b = 0; b < 3; b++) {
      const off = (b - 1) * 0.18;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(off, 0.14, -trayLen / 2),
        new THREE.Vector3(off, 0.06, -trayLen / 6),
        new THREE.Vector3(off, 0.04, trayLen / 6),
        new THREE.Vector3(off, 0.14, trayLen / 2),
      ]);
      const bundle = new THREE.Mesh(
        g(`dc:bundle:${side}:${b}`, () =>
          new THREE.TubeGeometry(curve, D.tubePath, 0.05, D.tubeSides, false)
        ),
        bundleMats[b]
      );
      tray.add(bundle);
    }
  });

  /* Drops from the tray into the top of every third rack, so the cabling has
     somewhere to go instead of running to nowhere. */
  const dropMat = kit.rubber;
  for (let sideIndex = 0; sideIndex < 2; sideIndex++) {
    for (let i = 0; i < perSide; i += 2) {
      const z = (i - (perSide - 1) / 2) * pitch;
      const x0 = sideIndex ? 1.62 : -1.62;
      const x1 = sideIndex ? 2.45 : -2.45;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x0, 5.28, z),
        new THREE.Vector3((x0 + x1) / 2, 4.86, z),
        new THREE.Vector3(x1, 4.44, z),
      ]);
      const drop = new THREE.Mesh(
        g(`dc:drop:${sideIndex}:${i}`, () =>
          new THREE.TubeGeometry(curve, Math.max(12, Math.round(D.tubePath / 3)), 0.055, D.tubeSides, false)
        ),
        dropMat
      );
      group.add(drop);
    }
  }

  /* ---- ceiling strips ---- */
  /* Near-white rather than accent: a fitting is the source of the light, not a
     coloured panel, and a saturated slab at this size reads as a floating tile. */
  const stripMat = own(new THREE.MeshBasicMaterial({ color: 0xe6f1ff, toneMapped: false }));
  const stripGeo = box("dc:strip", 0.42, 0.05, 1.1, 0.02);
  const strips = Math.max(3, perSide - 2);
  for (let i = 0; i < strips; i++) {
    const z = (i - (strips - 1) / 2) * (pitch * 1.7);
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.position.set(0, 5.78, z);
    group.add(strip);

    const bloom = haze(2.1, 2.1, kit.hazeA);
    bloom.rotation.x = Math.PI / 2;
    bloom.position.set(0, 5.62, z);
    group.add(bloom);
  }

  /* ---- depth ---- */
  const far = haze(11, 8, kit.hazeA);
  far.position.set(0, 3, -(span / 2 + 5));
  group.add(far);

  const near = haze(11, 8, kit.hazeB);
  near.position.set(0, 3, span / 2 + 5);
  near.rotation.y = Math.PI;
  group.add(near);

  const update = (t: number, dt: number) => {
    if (tx.flow) tx.flow.offset.x -= dt * 0.42;
    // Each variant breathes on its own phase, so the rows do not blink in unison.
    faceMats.forEach((m, i) => {
      m.emissiveIntensity = ctx.pal.glow * (1.05 + Math.sin(t * (1.4 + i * 0.45) + i) * 0.22);
    });
    beacons.forEach((b, i) => {
      const k = 0.6 + Math.sin(t * 2.4 + i * 0.9) * 0.4;
      b.scale.setScalar(0.7 + k * 0.6);
    });
    // A slow dolly along the aisle, which is what makes the corridor read as deep.
    group.position.z = Math.sin(t * 0.09) * 1.4;
  };

  return { group, update };
}

/* --------------------------------------------------- act 2: the assistant */

function buildAiBot(ctx: BuildCtx): Act {
  const { D, kit, g, box, cast, haze, own } = ctx;
  const group = new THREE.Group();

  /* Turn the figure to face the camera for this act, so it is looking at the
     visitor rather than presenting a three-quarter shoulder. */
  const shot = ctx.isMobile ? ACTS[2].mobile : ACTS[2].desktop;
  const facing = Math.PI / 2 - shot.az;

  const bot = new THREE.Group();
  bot.position.y = 1.95;
  bot.rotation.y = facing;
  group.add(bot);

  /* ---- torso ---- */
  const body = cast(
    new THREE.Mesh(
      g("ai:body", () => new THREE.CapsuleGeometry(0.55, 0.34, 6, D.sphereW)),
      kit.shell
    )
  );
  body.scale.set(1, 0.82, 0.9);
  body.position.y = -0.26;
  bot.add(body);

  const chest = new THREE.Mesh(box("ai:chest", 0.62, 0.46, 0.07, 0.11), kit.panel);
  chest.position.set(0, -0.14, 0.5);
  bot.add(chest);

  const collar = new THREE.Mesh(
    g("ai:collar", () => new THREE.TorusGeometry(0.4, 0.032, D.ringTubeThin, D.ringArc)),
    kit.chromeDark
  );
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.28;
  bot.add(collar);

  /* The levitation column linking the floating head to the body. It is what
     tells you the head is held there rather than simply detached. */
  const column = new THREE.Mesh(
    g("ai:column", () => new THREE.CylinderGeometry(0.11, 0.16, 0.36, D.radialSmall, 1, true)),
    kit.glowA
  );
  column.position.y = 0.44;
  bot.add(column);

  /* ---- head ---- */
  const head = new THREE.Group();
  head.position.y = 1.28;
  bot.add(head);

  const skull = cast(
    new THREE.Mesh(
      g("ai:skull", () => new THREE.SphereGeometry(1, D.sphereW, D.sphereH)),
      kit.shell
    )
  );
  skull.scale.set(0.95, 0.82, 0.86);
  head.add(skull);

  /* A sphere patch just proud of the head, so the visor curves with the face
     instead of being a flat plate stuck on it. */
  const visor = new THREE.Mesh(
    g(
      "ai:visor",
      () =>
        new THREE.SphereGeometry(
          1.006,
          D.sphereW,
          D.sphereH,
          Math.PI / 2 - 0.74,
          1.48,
          0.68,
          0.98
        )
    ),
    kit.dark
  );
  visor.scale.copy(skull.scale);
  head.add(visor);

  const seam = new THREE.Mesh(
    g("ai:seam", () => new THREE.TorusGeometry(0.955, 0.018, D.ringTubeThin, D.ringArc)),
    kit.chromeDark
  );
  seam.rotation.x = Math.PI / 2;
  seam.scale.set(1, 1, 0.9);
  seam.position.y = 0.12;
  head.add(seam);

  const eyeGeo = g("ai:eye", () => new THREE.CapsuleGeometry(0.125, 0.17, 4, 14));
  const eyes = [-0.3, 0.3].map((x) => {
    const eye = new THREE.Mesh(eyeGeo, kit.neonC);
    eye.position.set(x, 0.08, 0.815);
    head.add(eye);

    const bloom = haze(0.72, 0.72, kit.hazeC);
    bloom.position.set(x, 0.08, 0.84);
    head.add(bloom);
    return eye;
  });

  /* The mouth arc is rotated so its open side faces up — the single detail
     that decides whether this reads as friendly or as a warning light. */
  const smileArc = Math.PI * 0.72;
  const smile = new THREE.Mesh(
    g("ai:smile", () => new THREE.TorusGeometry(0.24, 0.024, D.ringTubeThin, 24, smileArc)),
    kit.neonA
  );
  smile.rotation.z = -Math.PI / 2 - smileArc / 2;
  smile.scale.set(1, 0.62, 0.5);
  smile.position.set(0, -0.2, 0.79);
  head.add(smile);

  const antenna = new THREE.Mesh(
    g("ai:antenna", () => new THREE.CylinderGeometry(0.028, 0.034, 0.4, D.radialSmall)),
    kit.chromeDark
  );
  antenna.position.y = 0.96;
  head.add(antenna);

  const bulb = new THREE.Mesh(
    g("ai:bulb", () => new THREE.SphereGeometry(0.085, 16, 12)),
    kit.neonWarm
  );
  bulb.position.y = 1.19;
  head.add(bulb);

  const halo = new THREE.Mesh(
    g("ai:halo", () => new THREE.TorusGeometry(0.15, 0.014, D.ringTubeThin, 26)),
    kit.glowWarm
  );
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 1.19;
  head.add(halo);

  const earGeo = g(
    "ai:ear",
    () => new THREE.CylinderGeometry(0.17, 0.17, 0.11, D.radialSmall)
  );
  const earRingGeo = g(
    "ai:earring",
    () => new THREE.TorusGeometry(0.11, 0.019, D.ringTubeThin, 22)
  );
  [-1, 1].forEach((s) => {
    const ear = new THREE.Mesh(earGeo, kit.chromeDark);
    ear.rotation.z = Math.PI / 2;
    ear.position.set(s * 0.92, 0.02, 0);
    head.add(ear);

    const ring = new THREE.Mesh(earRingGeo, kit.glowB);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(s * 0.98, 0.02, 0);
    head.add(ring);
  });

  /* ---- arms ---- */
  const armGeo = g("ai:arm", () => new THREE.CapsuleGeometry(0.105, 0.32, 4, 14));
  const handGeo = g("ai:hand", () => new THREE.SphereGeometry(0.145, D.sphereW / 2, D.sphereH / 2));
  const arms = [-1, 1].map((s) => {
    const arm = new THREE.Group();
    arm.position.set(s * 0.78, 0.02, 0.06);
    bot.add(arm);

    const limb = cast(new THREE.Mesh(armGeo, kit.shell));
    limb.position.y = -0.16;
    arm.add(limb);

    const hand = cast(new THREE.Mesh(handGeo, kit.shell));
    hand.position.y = -0.42;
    arm.add(hand);
    return arm;
  });
  arms[0].rotation.z = 0.34;
  arms[1].rotation.z = -0.34;

  /* ---- neural lattice ---- */
  const latticeR = 2.55;
  const lattice = new THREE.Group();
  lattice.position.y = 2.1;
  group.add(lattice);

  const cage = new THREE.LineSegments(
    g("ai:cage", () => {
      const source = new THREE.IcosahedronGeometry(latticeR, D.cage);
      const edges = new THREE.EdgesGeometry(source);
      source.dispose();
      return edges;
    }),
    kit.wire
  );
  lattice.add(cage);

  /* One node marker per lattice vertex, instanced — a wireframe alone reads as
     a cage, and it is the nodes that make it read as a network. */
  const nodeSource = new THREE.IcosahedronGeometry(latticeR, D.cage);
  const nodePos = nodeSource.getAttribute("position");
  const seen = new Set<string>();
  const nodePoints: THREE.Vector3[] = [];
  for (let i = 0; i < nodePos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(nodePos, i);
    const key = `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    nodePoints.push(v);
  }
  nodeSource.dispose();

  const nodes = new THREE.InstancedMesh(
    g("ai:node", () => new THREE.OctahedronGeometry(0.07, 0)),
    kit.neonB,
    nodePoints.length
  );
  const nodeSlot = new THREE.Object3D();
  nodePoints.forEach((p, i) => {
    nodeSlot.position.copy(p);
    nodeSlot.updateMatrix();
    nodes.setMatrixAt(i, nodeSlot.matrix);
  });
  nodes.instanceMatrix.needsUpdate = true;
  lattice.add(nodes);

  const ringGeo = g(
    "ai:ring",
    () => new THREE.TorusGeometry(1, 0.016, D.ringTubeThin, D.orbitArc)
  );
  const rings = [
    { r: 2.05, tilt: 0.5, spin: 0.22, m: kit.glowA },
    { r: 1.65, tilt: -0.95, spin: -0.3, m: kit.glowC },
  ].map((o) => {
    const ring = new THREE.Mesh(ringGeo, o.m);
    ring.scale.setScalar(o.r);
    ring.rotation.set(Math.PI / 2 + o.tilt, 0, o.tilt * 0.5);
    ring.position.y = 2.1;
    group.add(ring);
    return { ring, spin: o.spin };
  });

  /* ---- data feeding into the head ---- */
  const curves = [0, 1, 2].map((i) => {
    const a = facing + Math.PI + (i - 1) * 0.95;
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(a) * 2.5, 0.5 + i * 0.4, Math.sin(a) * 2.5),
      new THREE.Vector3(Math.cos(a) * 1.6, 2.6, Math.sin(a) * 1.6),
      new THREE.Vector3(Math.cos(a) * 0.6, 3.2, Math.sin(a) * 0.6),
      new THREE.Vector3(0, 3.24, 0),
    ]);
  });
  curves.forEach((curve, i) => {
    const trace = new THREE.Mesh(
      g(`ai:trace:${i}`, () => new THREE.TubeGeometry(curve, D.tubePath, 0.022, D.tubeSides, false)),
      kit.conduit
    );
    group.add(trace);
  });

  const packetCount = ctx.isMobile ? 6 : 14;
  const packets = new THREE.InstancedMesh(
    g("ai:packet", () => new THREE.OctahedronGeometry(0.075, 0)),
    kit.neonA,
    packetCount
  );
  packets.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  packets.frustumCulled = false;
  group.add(packets);
  const riders = Array.from({ length: packetCount }, (_, i) => ({
    curve: i % curves.length,
    t: (i / packetCount) % 1,
    speed: 0.14 + (i % 4) * 0.03,
  }));
  const rider = new THREE.Object3D();

  /* ---- hover ---- */
  const pad = haze(3.4, 3.4, kit.hazeA);
  pad.rotation.x = -Math.PI / 2;
  pad.position.y = 0.02;
  group.add(pad);

  const pulseMat = own(kit.hazeC.clone());
  const pulseRings = [0, 1].map((i) => {
    const ring = new THREE.Mesh(
      g("ai:pulsering", () => new THREE.TorusGeometry(1, 0.02, 6, 40)),
      pulseMat
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    group.add(ring);
    return { ring, phase: i * 0.5 };
  });

  let blink = 2.4;
  let blinkFor = 0;

  const update = (t: number, dt: number, px: number, py: number) => {
    const bob = Math.sin(t * 0.9) * 0.11;
    bot.position.y = 1.95 + bob;

    // The head leads the body, which is what makes the float read as buoyant
    // rather than as one rigid object sliding up and down.
    head.position.y = 1.28 + Math.sin(t * 0.9 - 0.5) * 0.04;
    head.rotation.y = px * 0.34 + Math.sin(t * 0.24) * 0.12;
    head.rotation.x = py * 0.16 + Math.sin(t * 0.31) * 0.05;

    blink -= dt;
    if (blink <= 0) {
      blinkFor = 0.13;
      blink = 2.6 + (t % 1.7);
    }
    blinkFor = Math.max(0, blinkFor - dt);
    const lid = blinkFor > 0 ? 0.1 : 1;
    for (const eye of eyes) eye.scale.y += (lid - eye.scale.y) * Math.min(1, dt * 22);

    // One arm waves; the other keeps a relaxed idle sway.
    arms[1].rotation.z = -0.34 - Math.abs(Math.sin(t * 1.9)) * 0.9;
    arms[1].rotation.x = Math.sin(t * 3.8) * 0.16;
    arms[0].rotation.z = 0.34 + Math.sin(t * 0.8) * 0.06;

    halo.scale.setScalar(1 + Math.sin(t * 2.6) * 0.22);
    kit.glowWarm.emissiveIntensity = ctx.pal.glow * (0.9 + Math.sin(t * 2.6) * 0.35);

    lattice.rotation.y += dt * 0.07;
    lattice.rotation.x = Math.sin(t * 0.13) * 0.1;
    for (const r of rings) r.ring.rotation.z += dt * r.spin;

    riders.forEach((p, i) => {
      p.t = (p.t + dt * p.speed) % 1;
      curves[p.curve].getPointAt(p.t, rider.position);
      rider.rotation.set(t * 1.4 + i, t * 1.1 + i, 0);
      rider.updateMatrix();
      packets.setMatrixAt(i, rider.matrix);
    });
    packets.instanceMatrix.needsUpdate = true;

    /* Expanding ground rings. Their alpha is written to `baseOpacity` rather
       than to `opacity`, because the act fade multiplies that base every frame
       and would otherwise overwrite anything set here. */
    let alpha = 0;
    pulseRings.forEach((p, i) => {
      const k = (t * 0.42 + p.phase) % 1;
      p.ring.scale.setScalar(0.5 + k * 2.4);
      if (i === 0) alpha = (1 - k) * ctx.pal.hazeAlpha * 1.4;
    });
    pulseMat.userData.baseOpacity = alpha;
  };

  return { group, update };
}

/* ------------------------------------------------------ act 3: the bust */

function buildRobot(ctx: BuildCtx): Act {
  const { D, kit, g, box, cast, haze, own } = ctx;
  const group = new THREE.Group();

  const shot = ctx.isMobile ? ACTS[3].mobile : ACTS[3].desktop;
  const facing = Math.PI / 2 - shot.az;

  const bust = new THREE.Group();
  bust.rotation.y = facing;
  group.add(bust);

  /* ---- plinth ---- */
  const plinth = cast(
    new THREE.Mesh(
      g("rb:plinth", () => new THREE.CylinderGeometry(0.92, 1.12, 0.28, D.radial)),
      kit.deck
    )
  );
  plinth.position.y = 0.14;
  plinth.receiveShadow = !ctx.isMobile;
  bust.add(plinth);

  const plinthRim = new THREE.Mesh(
    g("rb:rim", () => new THREE.TorusGeometry(1.04, 0.028, D.ringTubeThin, D.ringArc)),
    kit.glowA
  );
  plinthRim.rotation.x = Math.PI / 2;
  plinthRim.position.y = 0.28;
  bust.add(plinthRim);

  /* A tapered stem carrying the chest down onto the plinth. Without it the
     torso ends in mid-air above the base and the whole thing reads as a
     floating ornament rather than as a bust on a mount. */
  const stem = cast(
    new THREE.Mesh(
      g("rb:stem", () => new THREE.CylinderGeometry(0.3, 0.46, 0.36, D.radial)),
      kit.chromeDark
    )
  );
  stem.position.y = 0.42;
  bust.add(stem);

  /* ---- torso ---- */
  /* Chamfered boxes, not capsules. Every rounded revolve tried here read as an
     egg from the front — a chest is a broad, shallow, flat-fronted volume, and
     the chamfer is what keeps it from looking like a crate. */
  const torso = cast(new THREE.Mesh(box("rb:torso", 1.72, 1.0, 0.74, 0.28), kit.chromeDark));
  torso.position.y = 1.62;
  bust.add(torso);

  const abdomen = cast(new THREE.Mesh(box("rb:abdomen", 1.02, 0.62, 0.58, 0.22), kit.chromeDark));
  abdomen.position.y = 0.86;
  bust.add(abdomen);

  /* A brighter chest shell sitting a hair outside the torso. Two chrome values
     with a visible parting line is what stops a metal figure reading as one
     extruded blob. */
  const chestPlate = new THREE.Mesh(
    g(
      "rb:chestplate",
      () =>
        new THREE.SphereGeometry(0.58, D.sphereW, D.sphereH, Math.PI / 2 - 0.86, 1.72, 0.6, 1.02)
    ),
    kit.chrome
  );
  chestPlate.scale.set(1.5, 0.86, 0.5);
  chestPlate.position.set(0, 1.66, 0.12);
  bust.add(chestPlate);

  const ribGeo = g(
    "rb:rib",
    () => new THREE.TorusGeometry(0.5, 0.03, D.ringTubeThin, D.ringArc, Math.PI * 0.56)
  );
  [1.06, 1.32, 1.58].forEach((y, i) => {
    const rib = new THREE.Mesh(ribGeo, kit.chromeDark);
    rib.rotation.z = -Math.PI / 2 - (Math.PI * 0.56) / 2;
    rib.scale.set(1.62 - i * 0.1, 0.36, 0.5);
    rib.position.set(0, y + 0.16, 0.36);
    bust.add(rib);
  });

  const core = new THREE.Mesh(
    g("rb:core", () => new THREE.TorusGeometry(0.2, 0.042, D.ringTube, D.ringArc)),
    kit.glowA
  );
  core.position.set(0, 1.88, 0.42);
  bust.add(core);

  const coreGem = new THREE.Mesh(
    g("rb:coregem", () => new THREE.SphereGeometry(0.13, D.sphereW / 2, D.sphereH / 2)),
    kit.neonA
  );
  coreGem.position.set(0, 1.88, 0.42);
  bust.add(coreGem);

  const coreBloom = haze(1.3, 1.3, kit.hazeA);
  coreBloom.position.set(0, 1.88, 0.5);
  bust.add(coreBloom);

  /* ---- shoulders ---- */
  const jointGeo = g("rb:joint", () => new THREE.SphereGeometry(0.33, D.sphereW, D.sphereH));
  const capGeo = g(
    "rb:cap",
    () => new THREE.SphereGeometry(0.41, D.sphereW, D.sphereH, 0, Math.PI * 2, 0, 0.95)
  );
  const pauldronGeo = box("rb:pauldron", 0.54, 0.34, 0.7, 0.15);
  [-1, 1].forEach((s) => {
    const joint = cast(new THREE.Mesh(jointGeo, kit.chromeDark));
    joint.position.set(s * 1.06, 1.94, 0);
    joint.scale.setScalar(0.86);
    bust.add(joint);

    /* A cap alone sat on the joint like an ear. The plate over it is what makes
       the shoulder read as armour bolted onto a mechanism. */
    const cap = cast(new THREE.Mesh(capGeo, kit.chrome));
    cap.position.set(s * 1.06, 1.94, 0);
    cap.scale.set(0.8, 0.62, 0.8);
    cap.rotation.z = s * 0.3;
    bust.add(cap);

    const pauldron = cast(new THREE.Mesh(pauldronGeo, kit.chrome));
    pauldron.position.set(s * 1.12, 2.02, 0);
    pauldron.rotation.z = s * 0.36;
    bust.add(pauldron);
  });

  const clavicle = new THREE.Mesh(
    g("rb:clavicle", () => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.04, 2.0, 0.04),
        new THREE.Vector3(-0.45, 2.16, 0.26),
        new THREE.Vector3(0.45, 2.16, 0.26),
        new THREE.Vector3(1.04, 2.0, 0.04),
      ]);
      return new THREE.TubeGeometry(curve, D.tubePath, 0.085, D.tubeSides, false);
    }),
    kit.chrome
  );
  bust.add(clavicle);

  /* ---- neck ---- */
  const neck = new THREE.Group();
  neck.position.y = 2.18;
  bust.add(neck);

  [
    { y: 0.08, r: 0.25 },
    { y: 0.26, r: 0.22 },
    { y: 0.44, r: 0.19 },
  ].forEach((v, i) => {
    const vertebra = new THREE.Mesh(
      g(`rb:vertebra:${i}`, () => new THREE.CylinderGeometry(v.r, v.r * 1.08, 0.13, D.radial)),
      kit.chromeDark
    );
    vertebra.position.y = v.y;
    neck.add(vertebra);
  });

  const sleeveGeo = g(
    "rb:sleeve",
    () => new THREE.CylinderGeometry(0.058, 0.058, 0.3, D.radialSmall)
  );
  const rodGeo = g("rb:rod", () => new THREE.CylinderGeometry(0.032, 0.032, 0.34, D.radialSmall));
  const pistons: THREE.Mesh[] = [];
  [
    [-0.3, 0.2],
    [0.3, 0.2],
    [-0.24, -0.24],
    [0.24, -0.24],
  ].forEach(([x, z], i) => {
    const sleeve = new THREE.Mesh(sleeveGeo, kit.chromeDark);
    sleeve.position.set(x, 0.1, z);
    sleeve.rotation.set(z * 0.5, 0, -x * 0.5);
    neck.add(sleeve);

    const rod = new THREE.Mesh(rodGeo, kit.chrome);
    rod.position.set(x * 0.92, 0.38, z * 0.92);
    rod.rotation.copy(sleeve.rotation);
    neck.add(rod);
    pistons.push(rod);
    void i;
  });

  /* Loom cables from the neck base into each shoulder. */
  [-1, 1].forEach((s) => {
    for (let c = 0; c < 2; c++) {
      const off = (c - 0.5) * 0.14;
      const cable = new THREE.Mesh(
        g(`rb:cable:${s}:${c}`, () => {
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(s * 0.18, 2.24 + off, -0.14),
            new THREE.Vector3(s * 0.62, 1.96 + off, -0.22),
            new THREE.Vector3(s * 1.02, 1.94 + off, -0.06),
          ]);
          return new THREE.TubeGeometry(
            curve,
            Math.max(14, Math.round(D.tubePath / 3)),
            0.032,
            D.tubeSides,
            false
          );
        }),
        kit.rubber
      );
      bust.add(cable);
    }
  });

  /* ---- skull ---- */
  const head = new THREE.Group();
  head.position.y = 3.18;
  /* The skull is authored around r = 0.62. Scaling the group rather than every
     feature keeps the jaw, sockets, brow and plates in proportion. */
  head.scale.setScalar(1.26);
  bust.add(head);

  const cranium = cast(
    new THREE.Mesh(
      g("rb:cranium", () => new THREE.SphereGeometry(0.62, D.sphereW, D.sphereH)),
      kit.chrome
    )
  );
  cranium.scale.set(0.9, 1, 1.02);
  head.add(cranium);

  /* Two cranial plates with a gap down the midline. The gap is the point: a
     seam is what separates an endoskeleton from a chrome egg. */
  const plateGeo = g(
    "rb:plate",
    () => new THREE.SphereGeometry(0.638, D.sphereW, D.sphereH, 0, 1.42, 0, 1.15)
  );
  [-1, 1].forEach((s) => {
    const plate = new THREE.Mesh(plateGeo, kit.chromeDark);
    plate.scale.set(0.9, 1, 1.02);
    plate.rotation.y = s > 0 ? Math.PI / 2 + 0.09 : -1.42 - 0.09 + Math.PI / 2;
    head.add(plate);
  });

  const crownSeam = new THREE.Mesh(
    g("rb:crownseam", () => new THREE.TorusGeometry(0.6, 0.014, D.ringTubeThin, D.ringArc)),
    kit.chromeDark
  );
  crownSeam.rotation.x = Math.PI / 2;
  crownSeam.scale.set(0.9, 1.02, 1);
  crownSeam.position.y = 0.16;
  head.add(crownSeam);

  const browArc = 1.5;
  const brow = new THREE.Mesh(
    g("rb:brow", () => new THREE.TorusGeometry(0.42, 0.048, D.ringTube, D.ringArc, browArc)),
    kit.chrome
  );
  brow.rotation.z = -Math.PI / 2 - browArc / 2 + Math.PI;
  brow.scale.set(1.08, 0.7, 1);
  brow.position.set(0, 0.18, 0.34);
  head.add(brow);

  const socketGeo = g(
    "rb:socket",
    () => new THREE.CylinderGeometry(0.155, 0.185, 0.18, D.radialSmall)
  );
  const opticGeo = g("rb:optic", () => new THREE.SphereGeometry(0.1, D.sphereW / 2, D.sphereH / 2));
  const optics = [-0.24, 0.24].map((x) => {
    const socket = new THREE.Mesh(socketGeo, kit.dark);
    socket.rotation.x = Math.PI / 2;
    socket.position.set(x, 0.02, 0.48);
    head.add(socket);

    /* Cyan, not red. The single strongest signal that this machine is on your
       side rather than hunting you. */
    const optic = new THREE.Mesh(opticGeo, kit.neonA);
    optic.position.set(x, 0.02, 0.55);
    head.add(optic);

    const bloom = haze(0.72, 0.72, kit.hazeA);
    bloom.position.set(x, 0.02, 0.6);
    head.add(bloom);
    return optic;
  });

  const cheekGeo = box("rb:cheek", 0.085, 0.4, 0.11, 0.03);
  [-1, 1].forEach((s) => {
    const cheek = new THREE.Mesh(cheekGeo, kit.chrome);
    cheek.position.set(s * 0.36, -0.19, 0.34);
    cheek.rotation.set(0.18, 0, s * 0.2);
    head.add(cheek);
  });

  const bridge = new THREE.Mesh(box("rb:bridge", 0.1, 0.24, 0.13, 0.04), kit.chrome);
  bridge.position.set(0, -0.06, 0.52);
  bridge.rotation.x = 0.18;
  head.add(bridge);

  const hingeGeo = g("rb:hinge", () => new THREE.CylinderGeometry(0.085, 0.085, 0.13, D.radialSmall));
  const earRingGeo = g("rb:earring", () => new THREE.TorusGeometry(0.06, 0.016, 6, 18));
  [-1, 1].forEach((s) => {
    const hinge = new THREE.Mesh(hingeGeo, kit.chromeDark);
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(s * 0.55, -0.14, 0.08);
    head.add(hinge);

    const ring = new THREE.Mesh(earRingGeo, kit.glowC);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(s * 0.61, -0.14, 0.08);
    head.add(ring);
  });

  /* ---- jaw ---- */
  const jaw = new THREE.Group();
  jaw.position.set(0, -0.26, 0.04);
  jaw.rotation.x = 0.16;
  head.add(jaw);

  const jawArc = Math.PI * 0.82;
  const jawScale = new THREE.Vector3(1.06, 0.72, 0.94);
  const mandible = new THREE.Mesh(
    g("rb:mandible", () => new THREE.TorusGeometry(0.42, 0.07, D.ringTube, D.ringArc, jawArc)),
    kit.chrome
  );
  mandible.rotation.z = -Math.PI / 2 - jawArc / 2;
  mandible.scale.copy(jawScale);
  jaw.add(mandible);

  const chin = new THREE.Mesh(box("rb:chin", 0.28, 0.16, 0.18, 0.06), kit.chrome);
  chin.position.set(0, -0.29, 0.3);
  jaw.add(chin);

  /* An even, blunt tooth row. Sized down deliberately — the same geometry with
     longer teeth is the difference between a grin and a threat display. */
  const teethCount = ctx.isMobile ? 8 : 12;
  const teeth = new THREE.InstancedMesh(
    box("rb:tooth", 0.055, 0.07, 0.05, 0.014),
    kit.deckTop,
    teethCount
  );
  const toothSlot = new THREE.Object3D();
  for (let i = 0; i < teethCount; i++) {
    const a = -Math.PI / 2 + ((i / (teethCount - 1)) - 0.5) * jawArc * 0.66;
    toothSlot.position.set(
      Math.cos(a) * 0.42 * jawScale.x,
      Math.sin(a) * 0.42 * jawScale.y + 0.07,
      0.28
    );
    toothSlot.rotation.set(0, 0, a + Math.PI / 2);
    toothSlot.updateMatrix();
    teeth.setMatrixAt(i, toothSlot.matrix);
  }
  teeth.instanceMatrix.needsUpdate = true;
  jaw.add(teeth);

  const halo = haze(3.2, 3.2, kit.hazeB);
  halo.position.set(0, 3.1, -1.0);
  bust.add(halo);

  const scanMat = own(kit.hazeC.clone());
  const scan = new THREE.Mesh(
    g("rb:scan", () => new THREE.TorusGeometry(1, 0.018, 6, 44)),
    scanMat
  );
  scan.rotation.x = -Math.PI / 2;
  group.add(scan);

  const update = (t: number, dt: number, px: number, py: number) => {
    void dt;
    /* A slow, deliberate look-around with the visitor's pointer layered on top.
       Machines that track you continuously read as predatory; the drift plus a
       long dwell reads as attentive. */
    const scanAngle = Math.sin(t * 0.19) * 0.42 + Math.sin(t * 0.07) * 0.18;
    head.rotation.y = scanAngle + px * 0.26;
    head.rotation.x = Math.sin(t * 0.26) * 0.07 + py * 0.12;
    head.rotation.z = Math.sin(t * 0.15) * 0.05;
    bust.rotation.y = facing + scanAngle * 0.16;

    // The pistons take up the head's motion, which is what makes the neck read
    // as mechanism rather than as a fixed post.
    const lift = Math.sin(t * 0.26) * 0.03;
    pistons.forEach((rod, i) => {
      rod.position.y = 0.38 + lift * (i < 2 ? 1 : -1);
    });

    // A slight, irregular jaw motion, as if mid-sentence.
    jaw.rotation.x = 0.16 + (Math.sin(t * 2.7) * 0.5 + 0.5) * Math.max(0, Math.sin(t * 0.5)) * 0.09;

    const pulse = 0.85 + Math.sin(t * 1.6) * 0.15;
    kit.glowA.emissiveIntensity = ctx.pal.glow * pulse;
    for (const optic of optics) optic.scale.setScalar(0.94 + pulse * 0.1);
    coreGem.scale.setScalar(0.9 + pulse * 0.16);

    const k = (t * 0.3) % 1;
    scan.scale.setScalar(0.8 + k * 2.6);
    scan.position.y = 0.06 + k * 0.1;
    scanMat.userData.baseOpacity = (1 - k) * ctx.pal.hazeAlpha;
  };

  return { group, update };
}

const BUILDERS: Record<ActKind, (ctx: BuildCtx) => Act> = {
  workstation: buildWorkstation,
  datacenter: buildDatacenter,
  aibot: buildAiBot,
  robot: buildRobot,
};

/* ================================================================ component */

/** Ground height per act. `null` where the act lays its own floor. */
const ACT_GROUND: (number | null)[] = [-1.96, null, 0, 0];

export function Kz3DBackground() {
  const { ref } = useKz3D();
  const { theme } = useKzTheme();
  const pathname = usePathname();
  const layout = useSyncExternalStore(subscribeLayout, readLayout, serverLayout);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /* Camera state outlives a rebuild, so toggling theme never snaps the framing. */
  const pageRef = useRef({ ...PAGE_SHOT.home });
  const easedRef = useRef({ ...PAGE_SHOT.home });
  /* Set by the build effect; called on navigation, when the document height
     changes out from under the scroll mapping. */
  const measureRef = useRef<(() => void) | null>(null);

  const morphTo = useCallback((page: KzPage) => {
    pageRef.current = { ...(PAGE_SHOT[page] ?? PAGE_SHOT.home) };
  }, []);

  useImperativeHandle(ref, () => ({ morphTo }), [morphTo]);

  /* ---------------------------------------------------------------- build */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const D = DETAIL[layout];
    const isMobile = layout === "mobile";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isMobile,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; // no WebGL: the page keeps its gradient background
    }

    const pal = resolvePalette(theme);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Filmic roll-off keeps the specular highlights from clipping to a flat
    // white blob, and the explicit output space keeps the accents true.
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = pal.exposure;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-10, 10, 10, -10, -80, 160);

    /* -------------------------------------------------------- environment */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envRT = pmrem.fromScene(room, 0.04);
    room.dispose();
    scene.environment = envRT.texture;
    scene.environmentIntensity = pal.envIntensity;

    /* ----------------------------------------------------------- textures */
    const aniso = renderer.capabilities.getMaxAnisotropy();
    const size = isMobile ? 256 : 512;
    const grainCanvas = paintBrushed(isMobile ? 128 : 256);
    const plateCanvas = paintPlate(size, grainCanvas);
    const gridCanvas = paintGrid(size, pal);
    const normalCanvas = paintMachinedNormal(size);
    const hexCanvas = paintHexNormal(isMobile ? 128 : 256);
    const circuitCanvas = paintCircuit(size, pal);
    const flowCanvas = paintFlow(256, 64, pal);
    const floorCanvas = paintFloor(isMobile ? 512 : 1024, pal);
    const glowCanvas = paintGlow(128);
    const codeCanvas = paintCode(isMobile ? 384 : 640, isMobile ? 240 : 400, pal, 0xc0de5, false);
    const logCanvas = paintCode(isMobile ? 224 : 352, isMobile ? 352 : 560, pal, 0x51de7, true);
    const rackPaint = paintRack(isMobile ? 128 : 256, isMobile ? 512 : 1024, pal, 0x9acc);

    const textures: THREE.Texture[] = [];
    /* Two textures over one canvas is deliberate: repeat lives on the texture,
       so a surface that needs a different tiling density needs its own. */
    const tex = (source: HTMLCanvasElement | null, opts: Omit<TextureOptions, "aniso">) => {
      const t = toTexture(source, { ...opts, aniso });
      if (t) textures.push(t);
      return t;
    };

    const tx: Tx = {
      plate: tex(plateCanvas, { srgb: true, rx: 2, ry: 2 }),
      plateFine: tex(plateCanvas, { srgb: true, rx: 3, ry: 3 }),
      grid: tex(gridCanvas, { srgb: true, rx: 3, ry: 3 }),
      rough: tex(grainCanvas, { rx: 4, ry: 4 }),
      roughFine: tex(grainCanvas, { rx: 8, ry: 8 }),
      roughConduit: tex(grainCanvas, { rx: 6, ry: 1 }),
      normal: tex(normalCanvas, { rx: 3, ry: 3 }),
      normalFine: tex(normalCanvas, { rx: 6, ry: 6 }),
      normalConduit: tex(normalCanvas, { rx: 6, ry: 1 }),
      hex: tex(hexCanvas, { rx: 4, ry: 4 }),
      circuit: tex(circuitCanvas, { srgb: true }),
      flow: tex(flowCanvas, { srgb: true, rx: 2 }),
      floor: tex(floorCanvas, { srgb: true, clamp: true }),
      glow: tex(glowCanvas, { srgb: true, clamp: true }),
      code: tex(codeCanvas, { srgb: true, clamp: true }),
      codeSide: tex(logCanvas, { srgb: true }),
      rack: tex(rackPaint.albedo, { srgb: true }),
      rackLeds: tex(rackPaint.leds, { srgb: true }),
    };

    /* ----------------------------------------------------------- lighting */
    /* The environment carries the ambient term, so the hemisphere light is a
       tint pass rather than the main source. */
    scene.add(new THREE.HemisphereLight(pal.sky, pal.ground, pal.ambient));

    const key = new THREE.DirectionalLight(pal.key, pal.keyIntensity);
    key.position.set(7, 13, 9);
    if (!isMobile) {
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 1;
      key.shadow.camera.far = 52;
      const d = 14;
      key.shadow.camera.left = -d;
      key.shadow.camera.right = d;
      key.shadow.camera.top = d;
      key.shadow.camera.bottom = -d;
      key.shadow.bias = -0.0012;
    }
    scene.add(key);

    const fill = new THREE.DirectionalLight(pal.accent, theme === "dark" ? 0.42 : 0.2);
    fill.position.set(-9, 5, -7);
    scene.add(fill);

    if (!isMobile) {
      const rim = new THREE.DirectionalLight(pal.accent2, theme === "dark" ? 0.36 : 0.14);
      rim.position.set(-2, 7, -11);
      scene.add(rim);
    }

    /* ------------------------------------------------------------- build */
    const geoCache = new Map<string, THREE.BufferGeometry>();
    const g = (key2: string, make: () => THREE.BufferGeometry) => {
      let geometry = geoCache.get(key2);
      if (!geometry) {
        geometry = make();
        geoCache.set(key2, geometry);
      }
      return geometry;
    };

    const kits: Kit[] = [];
    const ownedTextures: THREE.Texture[] = [];

    const acts = ACTS.map((spec) => {
      const kit = makeKit(pal, tx, pal.glow);
      kits.push(kit);

      const ctx: BuildCtx = {
        pal,
        D,
        kit,
        tx,
        isMobile,
        g,
        box: (k, w, h, d, r) => g(k, () => roundedBox(w, h, d, r, D.boxCurve, D.boxBevel)),
        slab: (k, w, h, d, r) => g(k, () => roundedSlab(w, h, d, r, D.boxCurve, D.boxBevel)),
        own: (m) => {
          m.userData.baseOpacity = m.opacity;
          kit.all.push(m);
          return m;
        },
        ownTex: (t) => {
          ownedTextures.push(t);
          return t;
        },
        cast: (m) => {
          m.castShadow = !isMobile;
          return m;
        },
        haze: (w, h, m) =>
          new THREE.Mesh(g(`haze:${w}x${h}`, () => new THREE.PlaneGeometry(w, h)), m),
      };

      const act = BUILDERS[spec.kind](ctx);
      scene.add(act.group);
      return act;
    });

    /* A radar plate and a shadow catcher for the acts that stand on open
       ground. The data centre lays its own raised floor and wants neither. */
    ACT_GROUND.forEach((y, i) => {
      if (y === null) return;
      const kit = kits[i];
      const plate = new THREE.Mesh(
        g("stage:plate", () => new THREE.PlaneGeometry(19, 19)),
        kit.floor
      );
      plate.rotation.x = -Math.PI / 2;
      plate.position.y = y;
      acts[i].group.add(plate);

      if (isMobile) return;
      const catcher = new THREE.Mesh(
        g("stage:catcher", () => new THREE.PlaneGeometry(44, 44)),
        kit.shadow
      );
      catcher.rotation.x = -Math.PI / 2;
      catcher.position.y = y - 0.02;
      catcher.receiveShadow = true;
      acts[i].group.add(catcher);
    });

    /* ------------------------------------------------------------ framing */
    let viewW = window.innerWidth;
    let viewH = window.innerHeight;

    const resize = () => {
      viewW = window.innerWidth;
      viewH = window.innerHeight;
      renderer.setSize(viewW, viewH, false);
    };
    resize();

    /* ------------------------------------------------------------- scroll */
    /* Position on the track, in act units. The document is the input because it
       is the one measure every route shares — a fixed pixel budget per act would
       strand the last act off the bottom of a short page. */
    /* Below this the page is effectively unscrollable, and dividing by the few
       stray pixels it does have would map one keypress onto the entire track —
       landing the visitor on the final act on a page they never scrolled. */
    const MIN_SPAN = 240;
    let docSpan = 0;
    const measure = () => {
      const span = document.documentElement.scrollHeight - window.innerHeight;
      docSpan = span >= MIN_SPAN ? span : 0;
    };
    measure();
    measureRef.current = measure;

    const readTrack = () => (docSpan ? clamp01(window.scrollY / docSpan) * LAST_ACT : 0);
    const track = { p: readTrack(), target: readTrack() };

    /* ------------------------------------------------------------ pointer */
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / viewW - 0.5) * 2;
      pointer.ty = (e.clientY / viewH - 0.5) * 2;
    };
    if (!isMobile) window.addEventListener("pointermove", onPointer, { passive: true });

    /* --------------------------------------------------------------- draw */
    const camTarget = new THREE.Vector3();
    const shot = {
      az: 0,
      el: 0,
      zoom: 1,
      tx: 0,
      ty: 0,
      tz: 0,
      fitW: 12,
      fitH: 9,
      shift: 0.5,
    };

    /** Interpolate the act stations, holding near each one and easing between. */
    const sampleTrack = (p: number) => {
      const i0 = Math.max(0, Math.min(LAST_ACT, Math.floor(p)));
      const i1 = Math.min(LAST_ACT, i0 + 1);
      const a = isMobile ? ACTS[i0].mobile : ACTS[i0].desktop;
      const b = isMobile ? ACTS[i1].mobile : ACTS[i1].desktop;
      const u = smoothstep(i0 + 0.18, i0 + 0.82, p);
      const mix = (x: number, y: number) => x + (y - x) * u;
      shot.az = mix(a.az, b.az);
      shot.el = mix(a.el, b.el);
      shot.zoom = mix(a.zoom, b.zoom);
      shot.tx = mix(a.target[0], b.target[0]);
      shot.ty = mix(a.target[1], b.target[1]);
      shot.tz = mix(a.target[2], b.target[2]);
      shot.fitW = mix(a.fitW, b.fitW);
      shot.fitH = mix(a.fitH, b.fitH);
      shot.shift = mix(a.shift, b.shift);
    };

    /**
     * Fade, lift and scale each act from the track position.
     *
     * The two acts either side of the current segment are weighted to sum to
     * exactly 1. An earlier version gave each act its own independent fade
     * window, which looked equivalent but was not: at the midpoint between two
     * stations both windows had decayed to ~0.03 and the canvas went blank for
     * the length of the crossing. Deriving both weights from one hand-off
     * parameter makes a gap arithmetically impossible.
     */
    const placeActs = (p: number) => {
      const seg = Math.max(0, Math.min(LAST_ACT - 1, Math.floor(p)));
      const handoff = smoothstep(0.34, 0.66, clamp01(p - seg));

      for (let i = 0; i < acts.length; i++) {
        const w = i === seg ? 1 - handoff : i === seg + 1 ? handoff : 0;
        const act = acts[i];
        const on = w > 0.004;
        act.group.visible = on;
        if (!on) continue;
        setKitOpacity(kits[i], w);
        // Outgoing acts sink, incoming acts rise, so during the crossing the two
        // occupy different bands of the frame instead of blending into mush.
        act.group.position.y = (1 - w) * (i === seg ? -2.6 : 2.6);
        act.group.scale.setScalar(0.94 + w * 0.06);
      }
    };

    const render = () => {
      const page = easedRef.current;
      const az = shot.az + page.az + pointer.x * 0.05;
      const el = Math.max(0.06, Math.min(1.3, shot.el + page.el - pointer.y * 0.035));
      const radius = 30;
      cam.position.set(
        Math.cos(az) * Math.cos(el) * radius,
        Math.sin(el) * radius,
        Math.sin(az) * Math.cos(el) * radius
      );

      const aspect = viewW / viewH;
      // Vertical world units in view: enough to hold both the act's height and
      // its width, so nothing crops on a wide screen.
      const frustum = Math.max(shot.fitH, shot.fitW / aspect);
      const halfV = frustum / 2;
      const halfH = (frustum * aspect) / 2;
      const offset = halfH * shot.shift;
      cam.left = -halfH - offset;
      cam.right = halfH - offset;
      cam.top = halfV;
      cam.bottom = -halfV;
      cam.zoom = shot.zoom * page.zoom;
      cam.updateProjectionMatrix();

      camTarget.set(shot.tx, shot.ty, shot.tz);
      cam.lookAt(camTarget);
      renderer.render(scene, cam);
    };

    /* --------------------------------------------------------------- loop */
    const clock = new THREE.Clock();
    let raf: number | null = null;
    let running = true;
    let t = 0;
    let frame = 0;

    const step = (dt: number) => {
      t += dt;

      // Re-measuring reads layout, so it happens on a slow beat rather than
      // every frame. Half a second is well inside the time it takes anyone to
      // scroll far enough for a stale span to be visible.
      if (frame++ % 30 === 0) measure();
      track.target = readTrack();
      track.p += (track.target - track.p) * (1 - Math.pow(0.002, dt));

      const page = easedRef.current;
      const want = pageRef.current;
      const k = 1 - Math.pow(0.0016, dt);
      page.az += (want.az - page.az) * k;
      page.el += (want.el - page.el) * k;
      page.zoom += (want.zoom - page.zoom) * k;

      const pk = 1 - Math.pow(0.002, dt);
      pointer.x += (pointer.tx - pointer.x) * pk;
      pointer.y += (pointer.ty - pointer.y) * pk;

      sampleTrack(track.p);
      placeActs(track.p);

      for (let i = 0; i < acts.length; i++) {
        if (acts[i].group.visible) acts[i].update(t, dt, pointer.x, pointer.y);
      }
    };

    const loop = () => {
      if (!running) {
        raf = null;
        return;
      }
      raf = requestAnimationFrame(loop);
      step(Math.min(clock.getDelta(), 0.05));
      render();
    };

    const onResize = () => {
      resize();
      measure();
      if (reduced) poseStatic();
    };
    window.addEventListener("resize", onResize);

    /* With reduced motion there is no loop, so scrolling has to draw its own
       frame — the act still has to change, it just does not animate.
       `update(0, 0, ...)` is not optional here: it is what writes the instanced
       packet matrices, the ring scales and the eye state. Without it an act
       reached by scrolling renders from identity matrices, which puts every
       packet at the origin in a heap. */
    const poseStatic = () => {
      track.p = readTrack();
      sampleTrack(track.p);
      placeActs(track.p);
      for (const act of acts) if (act.group.visible) act.update(0, 0, 0, 0);
      render();
    };

    const onScroll = () => {
      if (reduced) poseStatic();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onVisibility = () => {
      running = !document.hidden;
      if (running && raf === null && !reduced) {
        clock.getDelta(); // drop the hidden interval, or every act jumps
        loop();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) {
      poseStatic();
    } else {
      loop();
    }

    /* ------------------------------------------------------------ cleanup */
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      running = false;
      measureRef.current = null;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);

      // Tube and extrude geometries are built per act rather than all cached, so
      // the scene graph — not the cache — is the authority on what to free.
      const geos = new Set<THREE.BufferGeometry>();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) geos.add(mesh.geometry);
        const instanced = o as THREE.InstancedMesh;
        if (instanced.isInstancedMesh) instanced.dispose();
      });
      geoCache.forEach((geometry) => geos.add(geometry));
      geos.forEach((geometry) => geometry.dispose());
      /* A shadow map is a WebGLRenderTarget with a depth texture behind it, and
         it is owned by the light rather than by the scene graph — nothing above
         reaches it. renderer.dispose() does not free it either, and the canvas
         keeps its WebGL context across rebuilds, so without this every theme
         switch orphans a 1024x1024 colour + depth pair on the GPU. */
      scene.traverse((o) => {
        const light = o as THREE.Light & { shadow?: THREE.LightShadow };
        if (light.shadow) light.shadow.dispose();
      });
      for (const kit of kits) for (const m of kit.all) m.dispose();
      for (const texture of textures) texture.dispose();
      for (const texture of ownedTextures) texture.dispose();
      geoCache.clear();
      scene.environment = null;
      envRT.texture.dispose();
      envRT.dispose();
      pmrem.dispose();
      scene.clear();
      renderer.dispose();
    };
    // Rebuilt on theme change so every material and texture picks up the new
    // palette, and on layout change so each breakpoint gets its own scene.
  }, [theme, layout]);

  /* ------------------------------------------------- react to navigation */
  useEffect(() => {
    morphTo(pathnameToPage(pathname));
    // The new route is a different height, and the scroll mapping is derived
    // from it. Wait a frame so the document has actually laid out.
    const id = requestAnimationFrame(() => measureRef.current?.());
    return () => cancelAnimationFrame(id);
  }, [morphTo, pathname]);

  const veil = VEIL[layout];

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="kz-scene"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        opacity: veil.opacity,
        WebkitMaskImage: veil.mask,
        maskImage: veil.mask,
      }}
    />
  );
}
