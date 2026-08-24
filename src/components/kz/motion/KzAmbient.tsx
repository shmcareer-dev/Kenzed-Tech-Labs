"use client";

/* ============================================================================
   KzAmbient — AMBIENT (category 3) + SURFACE (category 6) kits.

   USAGE LIMIT — READ BEFORE WIRING ANY OF THESE UP
   ------------------------------------------------
   These primitives run CONTINUOUSLY. They have no trigger and no end state, so
   they compete with the content for attention every second the page is open.
   TWO OR THREE AMBIENT EFFECTS PER PAGE IS PLENTY — more and the page feels
   restless. Count a whole section's worth as one: an aurora behind the hero
   plus a grain overlay plus a marquee strip is already the page's full budget.
   The catalogue's rule stands — eight effects executed well beat eighty.

   Suggested pairings, one row per page, not one row per section:
     hero             KzAurora + KzGrain            (grain hides gradient banding)
     logo / tech bar  KzMarquee                     (alone; it is loud already)
     feature card     KzGradientBorder or KzShimmer (never both on one card)
     data / status    KzRadarPing or KzOrbitDots    (one, on the focal element)
     section ground   KzGridPattern + KzVignette    (the vignette is what makes
                                                     the grid calm rather than
                                                     busy — they ship together)

   HOW THESE BEHAVE
   ----------------
   - Every primitive renders paused on the server and on first paint. Nothing
     animates above the fold before hydration, so Largest Contentful Paint is
     never charged for motion.
   - Each root carries data-kz-run. An IntersectionObserver plus the page
     visibility API flip it to "1" only while the element is on screen AND the
     tab is foregrounded; everything inside is animation-play-state: paused
     otherwise. Nothing burns a frame off screen or in a background tab.
   - prefers-reduced-motion: reduce holds data-kz-run at "0" and the stylesheet
     hard-kills animation and transition inside .kza. The effects degrade to
     their static composition — they never simply disappear.
   - will-change is scoped to data-kz-run="1", so paused layers hand their
     compositor memory back.
   - Overlay primitives (aurora, grid, grain, beams) are absolutely positioned
     and pointer-events: none. Give the parent position: relative.

   EASING LANGUAGE
   ---------------
   One language, the same one the rest of the site speaks.
     --kza-ease-enter  cubic-bezier(0.22, 1, 0.36, 1)   sweeps, sheens, fades
     --kza-ease-amb    cubic-bezier(0.45, 0, 0.55, 1)   symmetric breathing loops
     linear                                             seamless loops only
                                                        (marquee, orbit, spin)
   The 200-800ms duration rule governs entrances and interactions. A continuous
   loop is a different animal — it is measured in seconds and reads as texture,
   not as a transition — so loop defaults sit between 3s and 40s.

   PROPERTY BUDGET
   ---------------
   Everything animates transform and opacity only, with two deliberate, minimal
   exceptions that have no cheaper implementation:
     KzGradientBorder animates one registered --kza-angle on a thin ring.
     KzBlobMorph animates the SVG d property on a single small path.
   Both are small, isolated layers on slow loops. Do not extend the exception.
   ========================================================================== */

import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

/* Custom properties are how every primitive is parameterised, so the style
   objects need the index signature CSSProperties does not carry. */
type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* -------------------------------------------------------------------------
   Grain tile. Built once at module scope: one string, one data URI, so the
   browser decodes the turbulence raster a single time and reuses it for every
   KzGrain on the site. 96px keeps the decoded tile tiny while staying large
   enough that the repeat is not legible.
   ------------------------------------------------------------------------- */
const GRAIN_TILE =
  "<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'>" +
  "<filter id='n' x='0' y='0' width='100%' height='100%'>" +
  "<feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/>" +
  "<feColorMatrix type='saturate' values='0'/>" +
  "</filter>" +
  "<rect width='96' height='96' filter='url(#n)'/>" +
  "</svg>";

const GRAIN_URL = `url("data:image/svg+xml,${encodeURIComponent(GRAIN_TILE)}")`;

/* Blob keyframe shapes. Same command structure in all three (M, 4x C, Z) —
   a morph between paths that do not match segment for segment is undefined. */
const BLOB_A =
  "M 100 30 C 140 30 172 58 172 100 C 172 142 140 172 100 172 C 60 172 28 142 28 100 C 28 58 60 30 100 30 Z";

/* -------------------------------------------------------------------------
   @property registration for the gradient-border angle.

   Registering from JS rather than writing an @property block does double duty:
   it IS the feature test (the CSS at-rule and CSS.registerProperty shipped
   together in every engine), and it keeps the stylesheet free of angle
   brackets, which a JSX text child would otherwise escape into entities.
   ------------------------------------------------------------------------- */
let angleSupport: boolean | null = null;

function ensureAngleProperty(): boolean {
  if (angleSupport !== null) return angleSupport;
  if (typeof CSS === "undefined" || !("registerProperty" in CSS)) {
    angleSupport = false;
    return angleSupport;
  }
  try {
    CSS.registerProperty({
      name: "--kza-angle",
      syntax: "<angle>",
      inherits: false,
      initialValue: "0deg",
    });
    angleSupport = true;
  } catch {
    /* Only this module ever registers the name and the result is memoised, so
       a throw on the first attempt is a genuine rejection, not a duplicate. */
    angleSupport = false;
  }
  return angleSupport;
}

/* -------------------------------------------------------------------------
   The run gate. Returns a ref for the primitive's root; the effect drives
   data-kz-run on that node directly, so gaining or losing visibility never
   costs a React render.
   ------------------------------------------------------------------------- */
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

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[entries.length - 1].isIntersecting;
        sync();
      },
      /* A margin means the loop is already at speed by the time the element is
         genuinely visible, so nothing appears to start on entry. */
      { rootMargin: "160px 0px" }
    );
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, [active]);

  return ref;
}

/* -------------------------------------------------------------------------
   The shared stylesheet. React 19 hoists and de-duplicates a keyed style tag,
   so every primitive can render it and exactly one lands in the document —
   present in the static export's HTML, which keeps the effects from flashing
   unstyled before hydration.

   The text stays free of the characters JSX escapes in a text child.
   ------------------------------------------------------------------------- */
const AMBIENT_CSS = `
.kza {
  --kza-ease-enter: cubic-bezier(0.22, 1, 0.36, 1);
  --kza-ease-amb: cubic-bezier(0.45, 0, 0.55, 1);
}

/* The run gate. One rule pauses every loop in the subtree. */
[data-kz-run="0"],
[data-kz-run="0"] * {
  animation-play-state: paused !important;
}

/* Compositor memory is only claimed while the layer is actually running. */
[data-kz-run="1"] .kza-w,
[data-kz-run="1"].kza-w {
  will-change: transform;
}
[data-kz-run="1"] .kza-wo,
[data-kz-run="1"].kza-wo {
  will-change: transform, opacity;
}

/* Overlay primitives never intercept a tap and never enter the a11y tree. */
.kza-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
}

/* ---------- KzMarquee ---------- */
.kza-marq {
  position: relative;
  overflow: hidden;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--kza-row-gap);
}
.kza-marq-row {
  display: flex;
  overflow: hidden;
  max-width: 100%;
}
.kza-marq-track {
  display: flex;
  flex: none;
  width: max-content;
  animation: kzaMarq var(--kza-dur) linear infinite;
}
.kza-marq-b .kza-marq-track {
  animation-direction: reverse;
}
.kza-marq-copy {
  display: flex;
  align-items: center;
  flex: none;
  white-space: nowrap;
}
.kza-marq-item {
  display: inline-flex;
  align-items: center;
  flex: none;
  padding-inline: calc(var(--kza-gap) / 2);
}
.kza-marq-sep {
  display: inline-flex;
  align-items: center;
  margin-inline-start: calc(var(--kza-gap) / 2);
  color: var(--acc);
  opacity: 0.75;
}
@media (hover: hover) {
  .kza-marq-hover:hover .kza-marq-track {
    animation-play-state: paused;
  }
}
@keyframes kzaMarq {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
}

/* ---------- KzAurora ---------- */
.kza-aurora {
  overflow: hidden;
  isolation: isolate;
  opacity: var(--kza-o);
}
.kza-aurora-inner {
  position: absolute;
  inset: calc(var(--kza-blur) * -1);
  filter: blur(var(--kza-blur));
}
.kza-aurora-blob {
  position: absolute;
  width: var(--kza-blob);
  height: var(--kza-blob);
  border-radius: 50%;
  mix-blend-mode: screen;
  animation-duration: var(--kza-dur);
  animation-timing-function: var(--kza-ease-amb);
  animation-iteration-count: infinite;
}
.kza-aurora-0 { top: -14%; left: -10%; animation-name: kzaDriftA; }
.kza-aurora-1 { top: 2%; right: -16%; animation-name: kzaDriftB; }
.kza-aurora-2 { bottom: -22%; left: 20%; animation-name: kzaDriftC; }
.kza-aurora-3 { bottom: -10%; right: 6%; animation-name: kzaDriftA; }
@keyframes kzaDriftA {
  0%, 100% { transform: translate3d(-6%, -4%, 0) scale(1); }
  50% { transform: translate3d(10%, 8%, 0) scale(1.22); }
}
@keyframes kzaDriftB {
  0%, 100% { transform: translate3d(8%, 6%, 0) scale(1.14); }
  50% { transform: translate3d(-9%, -7%, 0) scale(0.92); }
}
@keyframes kzaDriftC {
  0%, 100% { transform: translate3d(-4%, 7%, 0) scale(0.96); }
  50% { transform: translate3d(9%, -6%, 0) scale(1.18); }
}
/* Mobile fidelity: halving the blur radius is the single biggest saving here,
   and at 360px the clouds are small enough that the softness still reads. */
@media (max-width: 640px) {
  .kza-aurora-inner { filter: blur(calc(var(--kza-blur) / 2)); }
}

/* ---------- KzGradientBorder ---------- */
.kza-gb {
  position: relative;
  border-radius: var(--kza-r);
  padding: var(--kza-t);
  isolation: isolate;
}
.kza-gb-ring {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background:
    conic-gradient(
      from var(--kza-angle),
      transparent 0deg,
      var(--kza-c1) 32deg,
      var(--kza-c2) 74deg,
      transparent 128deg,
      transparent 360deg
    ),
    var(--kza-track);
}
.kza-gb-inner {
  position: relative;
  z-index: 1;
  height: 100%;
  border-radius: calc(var(--kza-r) - var(--kza-t));
  background: var(--kza-fill);
}
/* Without a registered angle there is no interpolation, so the ring stays a
   static sweep rather than snapping between two positions. */
[data-kza-prop="1"] .kza-gb-ring {
  animation: kzaAngle var(--kza-dur) linear infinite;
}
@keyframes kzaAngle {
  from { --kza-angle: 0deg; }
  to { --kza-angle: 360deg; }
}

/* ---------- KzShimmer ---------- */
.kza-shimmer {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
.kza-shimmer-sheen {
  position: absolute;
  top: -60%;
  left: 0;
  z-index: 1;
  width: 55%;
  height: 220%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, var(--kza-sheen), transparent);
  transform: translate3d(-180%, 0, 0) rotate(var(--kza-tilt));
  animation: kzaSheen var(--kza-dur) var(--kza-ease-enter) infinite;
}
.kza-shimmer-body {
  position: relative;
  z-index: 0;
}
/* The sweep occupies just over half the cycle; the rest is deliberate rest, so
   the effect punctuates instead of strobing. */
@keyframes kzaSheen {
  0% { transform: translate3d(-180%, 0, 0) rotate(var(--kza-tilt)); }
  55%, 100% { transform: translate3d(320%, 0, 0) rotate(var(--kza-tilt)); }
}

/* ---------- KzBreathingGlow ---------- */
.kza-glow {
  position: relative;
  isolation: isolate;
}
.kza-glow-halo {
  position: absolute;
  inset: calc(var(--kza-spread) * -1);
  pointer-events: none;
  z-index: 0;
  border-radius: inherit;
  background: radial-gradient(closest-side, var(--kza-c1), transparent 76%);
  opacity: var(--kza-min);
  transform: scale(0.94);
  animation: kzaBreath var(--kza-dur) var(--kza-ease-amb) infinite;
}
.kza-glow-body {
  position: relative;
  z-index: 1;
}
@keyframes kzaBreath {
  0%, 100% { opacity: var(--kza-min); transform: scale(0.94); }
  50% { opacity: var(--kza-max); transform: scale(1.07); }
}

/* ---------- KzFloat ---------- */
.kza-float {
  animation: kzaFloat var(--kza-dur) var(--kza-ease-amb) infinite;
  animation-delay: var(--kza-delay);
}
@keyframes kzaFloat {
  0%, 100% { transform: translate3d(0, calc(var(--kza-dist) * -1), 0); }
  50% { transform: translate3d(0, var(--kza-dist), 0); }
}

/* ---------- KzOrbitDots ---------- */
.kza-orbit {
  position: relative;
  width: var(--kza-size);
  height: var(--kza-size);
  flex: none;
}
/* The motion path is authored in a fixed 200px box and the whole box is scaled,
   because path() cannot read a custom property. */
.kza-orbit-stage {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  margin: -100px 0 0 -100px;
  transform: scale(calc(var(--kza-size) / 200));
}
.kza-orbit-arm {
  position: absolute;
  inset: 0;
  animation: kzaSpin var(--kza-dur) linear infinite;
  animation-direction: var(--kza-dir);
}
.kza-orbit-dot {
  position: absolute;
  top: 20px;
  left: 50%;
  width: var(--kza-dot);
  height: var(--kza-dot);
  margin: calc(var(--kza-dot) / -2) 0 0 calc(var(--kza-dot) / -2);
  border-radius: 50%;
  background: var(--kza-c1);
  box-shadow: 0 0 calc(var(--kza-dot) * 1.6) var(--kza-c2);
}
/* Preferred path: the dot rides the curve itself and the arm does nothing.
   The rotating-arm rule above is the fallback, and it is what browsers without
   offset-path keep. */
@supports (offset-path: path("M 0 0")) {
  .kza-orbit-arm { animation: none; }
  .kza-orbit-dot {
    top: 0;
    left: 0;
    margin: 0;
    offset-path: path("M 100 20 A 80 80 0 1 0 100 180 A 80 80 0 1 0 100 20");
    offset-rotate: 0deg;
    animation: kzaOrbit var(--kza-dur) linear infinite;
    animation-direction: var(--kza-dir);
  }
}
@keyframes kzaSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes kzaOrbit {
  from { offset-distance: 0%; }
  to { offset-distance: 100%; }
}

/* ---------- KzGridPattern ---------- */
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
/* Exactly one cell of travel, so the loop point is invisible. */
@keyframes kzaGridDrift {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(var(--kza-cell), var(--kza-cell), 0); }
}

/* ---------- KzGrain ---------- */
.kza-grain {
  overflow: hidden;
  opacity: var(--kza-o);
  mix-blend-mode: var(--kza-blend);
}
.kza-grain-layer {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background-image: ${GRAIN_URL};
  background-repeat: repeat;
}
.kza-grain-anim {
  animation: kzaGrain var(--kza-dur) steps(1, end) infinite;
}
/* Eight discrete jumps of under one tile. Nothing interpolates, so each step is
   a compositor translate of an already-decoded raster, never a repaint. */
@keyframes kzaGrain {
  0% { transform: translate3d(0, 0, 0); }
  12.5% { transform: translate3d(-6%, 3%, 0); }
  25% { transform: translate3d(4%, -5%, 0); }
  37.5% { transform: translate3d(-3%, -4%, 0); }
  50% { transform: translate3d(5%, 4%, 0); }
  62.5% { transform: translate3d(-5%, 6%, 0); }
  75% { transform: translate3d(6%, -3%, 0); }
  87.5% { transform: translate3d(-4%, -6%, 0); }
  100% { transform: translate3d(0, 0, 0); }
}
/* Grain is per-pixel work over the whole viewport. On a phone the tile is
   nearly invisible anyway, so it drops weight rather than costing the same. */
@media (max-width: 640px) {
  .kza-grain { opacity: calc(var(--kza-o) * 0.6); }
}

/* ---------- KzLightBeams ---------- */
.kza-beams {
  overflow: hidden;
}
.kza-beam {
  position: absolute;
  top: -50%;
  left: 0;
  width: var(--kza-beam-w);
  height: 200%;
  background: linear-gradient(to bottom, transparent, var(--kza-c1), transparent);
  filter: blur(var(--kza-blur));
  opacity: 0;
  transform: rotate(var(--kza-tilt)) translate3d(-40%, 0, 0);
  animation: kzaBeam var(--kza-dur) var(--kza-ease-enter) infinite;
}
@keyframes kzaBeam {
  0% { opacity: 0; transform: rotate(var(--kza-tilt)) translate3d(-40%, 0, 0); }
  18%, 78% { opacity: var(--kza-o); }
  100% { opacity: 0; transform: rotate(var(--kza-tilt)) translate3d(160%, 0, 0); }
}
/* One beam is atmosphere on a 360px screen; three are a light show. */
@media (max-width: 640px) {
  .kza-beam { filter: blur(calc(var(--kza-blur) / 2)); }
  .kza-beam-extra { display: none; }
}

/* ---------- KzBlobMorph ---------- */
.kza-blob {
  display: block;
  width: var(--kza-size);
  max-width: 100%;
  height: auto;
}
/* Without d-property animation the blob is simply the first shape, which is a
   finished composition on its own. */
@supports (d: path("M 0 0")) {
  .kza-blob-path {
    animation: kzaBlob var(--kza-dur) var(--kza-ease-amb) infinite;
  }
}
@keyframes kzaBlob {
  0%, 100% { d: path("M 100 30 C 140 30 172 58 172 100 C 172 142 140 172 100 172 C 60 172 28 142 28 100 C 28 58 60 30 100 30 Z"); }
  33% { d: path("M 104 26 C 148 34 180 66 172 108 C 164 150 132 178 92 172 C 52 166 24 136 30 96 C 36 56 60 18 104 26 Z"); }
  66% { d: path("M 96 34 C 138 22 178 54 176 96 C 174 138 146 168 104 176 C 62 184 30 148 26 106 C 22 64 54 46 96 34 Z"); }
}

/* ---------- KzRadarPing ---------- */
.kza-ping {
  position: relative;
  width: var(--kza-size);
  height: var(--kza-size);
  flex: none;
  display: grid;
  place-items: center;
}
.kza-ping-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid var(--kza-c1);
  opacity: 0;
  transform: scale(0.2);
  animation: kzaPing var(--kza-dur) var(--kza-ease-enter) infinite;
}
.kza-ping-core {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
}
@keyframes kzaPing {
  0% { opacity: var(--kza-o); transform: scale(0.2); }
  100% { opacity: 0; transform: scale(1); }
}

/* ---------- KzGlassPanel ---------- */
.kza-glass {
  position: relative;
  border-radius: var(--kza-r);
  background: var(--kza-fill);
  -webkit-backdrop-filter: blur(var(--kza-blur)) saturate(var(--kza-sat));
  backdrop-filter: blur(var(--kza-blur)) saturate(var(--kza-sat));
}
.kza-glass-bordered {
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
}
/* Opaque fallback: translucent glass over an unblurred background is a contrast
   failure, not a cosmetic downgrade. */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .kza-glass { background: var(--card2); }
}
/* Backdrop blur is the most expensive surface effect on mobile GPUs. */
@media (max-width: 640px) {
  .kza-glass {
    -webkit-backdrop-filter: blur(calc(var(--kza-blur) / 2)) saturate(var(--kza-sat));
    backdrop-filter: blur(calc(var(--kza-blur) / 2)) saturate(var(--kza-sat));
  }
}

/* ---------- KzVignette ---------- */
.kza-vig-radial {
  -webkit-mask-image: radial-gradient(ellipse at center, black var(--kza-hold), transparent 100%);
  mask-image: radial-gradient(ellipse at center, black var(--kza-hold), transparent 100%);
}
.kza-vig-vertical {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black var(--kza-hold), black calc(100% - var(--kza-hold)), transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, black var(--kza-hold), black calc(100% - var(--kza-hold)), transparent 100%);
}
.kza-vig-horizontal {
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black var(--kza-hold), black calc(100% - var(--kza-hold)), transparent 100%);
  mask-image: linear-gradient(to right, transparent 0%, black var(--kza-hold), black calc(100% - var(--kza-hold)), transparent 100%);
}

/* ---------- KzSpotlight ---------- */
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
/* A pointer-tracking highlight is information a touch user can never reach, so
   it is never rendered for them. */
@media (hover: none), (pointer: coarse) {
  .kza-spot-layer { display: none; }
}

/* ---------- reduced motion ----------
   Inert, not absent: every loop stops at its composed first frame and the
   pointer-tracked layer is removed outright. */
@media (prefers-reduced-motion: reduce) {
  .kza,
  .kza * {
    animation: none !important;
    transition: none !important;
  }
  .kza-spot-layer { display: none; }
}
`;

/* One hoisted, de-duplicated copy for the whole document. */
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

/* ==========================================================================
   AMBIENT
   ========================================================================== */

export interface KzMarqueeProps {
  /** Rendered once per row and duplicated for the seamless loop. */
  items: ReactNode[];
  /** Two rows travel in opposite directions. One row is the quieter choice. */
  rows?: 1 | 2;
  /** Seconds for one full pass of row A. Row B runs 18% slower. */
  speed?: number;
  /** Horizontal space between items, px. */
  gap?: number;
  /** Space between the two rows, px. */
  rowGap?: number;
  /** Decorative mark after each item. Pass null for none. */
  separator?: ReactNode;
  /** Pointer devices only — a tap would latch the pause on. */
  pauseOnHover?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Dual-direction marquee. Two opposing rows, each track duplicated so the
 * -50% translate loops seamlessly; the duplicate is hidden from screen
 * readers so the strip is announced once.
 */
export function KzMarquee({
  items,
  rows = 2,
  speed = 34,
  gap = 44,
  rowGap = 10,
  separator = "◆",
  pauseOnHover = true,
  className,
  style,
}: KzMarqueeProps) {
  const ref = useAmbientRun<HTMLDivElement>(true);

  /* Row B starts halfway through the list so the two rows never line up into
     an accidental column. */
  const half = Math.ceil(items.length / 2);
  const rowItems =
    rows === 2
      ? [items, [...items.slice(half), ...items.slice(0, half)]]
      : [items];

  return (
    <div
      ref={ref}
      data-kz-run="0"
      className={cx(
        "kza",
        "kza-marq",
        pauseOnHover && "kza-marq-hover",
        className
      )}
      style={
        {
          "--kza-gap": `${gap}px`,
          "--kza-row-gap": `${rowGap}px`,
          ...style,
        } as Vars
      }
    >
      <AmbientCSS />
      {rowItems.map((list, row) => (
        <div
          key={row}
          className={cx("kza-marq-row", row === 1 && "kza-marq-b")}
          style={
            { "--kza-dur": `${row === 1 ? speed * 1.18 : speed}s` } as Vars
          }
        >
          <div className="kza-marq-track kza-w">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="kza-marq-copy"
                aria-hidden={copy === 1 || undefined}
              >
                {list.map((item, i) => (
                  <span key={i} className="kza-marq-item">
                    {item}
                    {separator === null ? null : (
                      <span className="kza-marq-sep" aria-hidden="true">
                        {separator}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export interface KzAuroraProps {
  /** Cloud colours, cycled across the blobs. Defaults to the accent trio. */
  colors?: string[];
  /** 1-4. Three is the sweet spot; four starts to read as a wash. */
  count?: 1 | 2 | 3 | 4;
  /** Blur radius in px. Halved under 640px. */
  blur?: number;
  /** Layer opacity, 0-1. */
  opacity?: number;
  /** Seconds for one drift cycle of the first blob. */
  speed?: number;
  /** Blob diameter as a percentage of the container. */
  size?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Drifting mesh-gradient clouds. An absolutely positioned overlay — give the
 * parent position: relative. One of the two expensive primitives here: the
 * blur lives on a single wrapper so the GPU blurs once, not once per blob.
 */
export function KzAurora({
  colors,
  count = 3,
  blur = 70,
  opacity = 0.5,
  speed = 26,
  size = "62%",
  className,
  style,
}: KzAuroraProps) {
  const ref = useAmbientRun<HTMLDivElement>(true);
  const palette = colors ?? ["var(--acc)", "var(--acc3)", "var(--acc2)"];

  return (
    <div
      ref={ref}
      data-kz-run="0"
      aria-hidden="true"
      className={cx("kza", "kza-layer", "kza-aurora", className)}
      style={
        {
          "--kza-blur": `${blur}px`,
          "--kza-o": opacity,
          "--kza-blob": size,
          ...style,
        } as Vars
      }
    >
      <AmbientCSS />
      <div className="kza-aurora-inner">
        {Array.from({ length: count }, (_, i) => (
          <span
            key={i}
            className={cx("kza-aurora-blob", `kza-aurora-${i}`, "kza-w")}
            style={
              {
                background: `radial-gradient(circle at 50% 50%, ${
                  palette[i % palette.length]
                }, transparent 68%)`,
                "--kza-dur": `${speed * (1 + i * 0.22)}s`,
                /* Negative delays start each cloud mid-cycle, so the group
                   never pulses in unison. */
                animationDelay: `-${i * 4.5}s`,
              } as Vars
            }
          />
        ))}
      </div>
    </div>
  );
}

export interface KzGridPatternProps {
  /** Cell size in px. */
  cell?: number;
  /** Line colour. */
  color?: string;
  /** Layer opacity, 0-1. */
  opacity?: number;
  /** Which way the grid dissolves. */
  fade?: "center" | "top" | "bottom" | "none";
  /** Slow diagonal drift of exactly one cell per loop. Off by default. */
  drift?: boolean;
  /** Seconds per drift cycle. */
  speed?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Blueprint grid. Static by default — the fading mask is what makes it a
 * ground rather than a distraction, so it ships with one.
 */
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

export interface KzGrainProps {
  /** Layer opacity, 0-1. Scaled to 0.6x under 640px. */
  opacity?: number;
  /** Blend mode against the content beneath. */
  blend?: "overlay" | "soft-light" | "multiply" | "screen" | "normal";
  /** Film-grain jitter. Off by default — static grain costs nothing. */
  animated?: boolean;
  /** Seconds per eight-step jitter cycle. */
  speed?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * SVG turbulence overlay. The other expensive primitive: one 96px tile is
 * generated once at module scope and shared by every instance, so the browser
 * decodes the noise raster a single time for the whole site.
 */
export function KzGrain({
  opacity = 0.07,
  blend = "overlay",
  animated = false,
  speed = 1,
  className,
  style,
}: KzGrainProps) {
  const ref = useAmbientRun<HTMLDivElement>(animated);

  return (
    <div
      ref={ref}
      data-kz-run="0"
      aria-hidden="true"
      className={cx("kza", "kza-layer", "kza-grain", className)}
      style={
        {
          "--kza-o": opacity,
          "--kza-blend": blend,
          "--kza-dur": `${speed}s`,
          ...style,
        } as Vars
      }
    >
      <AmbientCSS />
      <div
        className={cx("kza-grain-layer", animated && "kza-grain-anim kza-w")}
      />
    </div>
  );
}

export interface KzLightBeamsProps {
  /** 1-4 beams. Beams past the first are hidden under 640px. */
  count?: number;
  /** Beam colour. */
  color?: string;
  /** Tilt in degrees. */
  tilt?: number;
  /** Beam width in px. */
  width?: number;
  /** Blur radius in px. Halved under 640px. */
  blur?: number;
  /** Peak opacity, 0-1. */
  opacity?: number;
  /** Seconds for one sweep. */
  speed?: number;
  className?: string;
  style?: CSSProperties;
}

/** Angled light beams sweeping across a surface. Overlay; parent must be relative. */
export function KzLightBeams({
  count = 3,
  color,
  tilt = -16,
  width = 90,
  blur = 40,
  opacity = 0.3,
  speed = 12,
  className,
  style,
}: KzLightBeamsProps) {
  const ref = useAmbientRun<HTMLDivElement>(true);

  return (
    <div
      ref={ref}
      data-kz-run="0"
      aria-hidden="true"
      className={cx("kza", "kza-layer", "kza-beams", className)}
      style={
        {
          "--kza-c1": color ?? "var(--acc2)",
          "--kza-tilt": `${tilt}deg`,
          "--kza-beam-w": `${width}px`,
          "--kza-blur": `${blur}px`,
          "--kza-o": opacity,
          ...style,
        } as Vars
      }
    >
      <AmbientCSS />
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={cx("kza-beam", "kza-wo", i > 0 && "kza-beam-extra")}
          style={
            {
              "--kza-dur": `${speed * (1 + i * 0.34)}s`,
              animationDelay: `-${i * (speed / count)}s`,
            } as Vars
          }
        />
      ))}
    </div>
  );
}

export interface KzFloatProps {
  children: ReactNode;
  /** Half the peak-to-peak travel, px. */
  distance?: number;
  /** Seconds per cycle. */
  speed?: number;
  /** Seconds. Stagger a cluster with 0, 0.6, 1.2… */
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

/** Slow vertical bob. Pure transform, so it never touches layout. */
export function KzFloat({
  children,
  distance = 6,
  speed = 5,
  delay = 0,
  className,
  style,
}: KzFloatProps) {
  const ref = useAmbientRun<HTMLDivElement>(true);

  return (
    <div
      ref={ref}
      data-kz-run="0"
      className={cx("kza", "kza-float", "kza-w", className)}
      style={
        {
          "--kza-dist": `${distance}px`,
          "--kza-dur": `${speed}s`,
          "--kza-delay": `${delay}s`,
          ...style,
        } as Vars
      }
    >
      {children}
      <AmbientCSS />
    </div>
  );
}

export interface KzOrbitDotsProps {
  /** Dots on the ring, spaced by negative animation delay. */
  count?: number;
  /** Ring diameter in px. */
  size?: number;
  /** Dot diameter in px. */
  dot?: number;
  /** Dot colour. */
  color?: string;
  /** Halo colour around each dot. */
  glow?: string;
  /** Seconds per revolution. */
  speed?: number;
  reverse?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Dots riding a circular offset-path. Browsers without offset-path fall back to
 * a rotating arm per dot, which is visually identical and equally cheap.
 */
export function KzOrbitDots({
  count = 3,
  size = 120,
  dot = 6,
  color,
  glow,
  speed = 10,
  reverse = false,
  className,
  style,
}: KzOrbitDotsProps) {
  const ref = useAmbientRun<HTMLDivElement>(true);

  return (
    <div
      ref={ref}
      data-kz-run="0"
      aria-hidden="true"
      className={cx("kza", "kza-orbit", className)}
      style={
        {
          "--kza-size": `${size}px`,
          "--kza-dot": `${dot}px`,
          "--kza-dur": `${speed}s`,
          "--kza-dir": reverse ? "reverse" : "normal",
          "--kza-c1": color ?? "var(--acc)",
          "--kza-c2": glow ?? "var(--accglow)",
          ...style,
        } as Vars
      }
    >
      <AmbientCSS />
      <div className="kza-orbit-stage">
        {Array.from({ length: count }, (_, i) => {
          /* The same negative delay goes on both nodes: whichever one the
             browser is actually animating picks it up. */
          const offset = { animationDelay: `-${(i / count) * speed}s` };
          return (
            <span key={i} className="kza-orbit-arm kza-w" style={offset}>
              <span className="kza-orbit-dot kza-w" style={offset} />
            </span>
          );
        })}
      </div>
    </div>
  );
}

export interface KzBlobMorphProps {
  /** CSS length for the rendered width. */
  size?: string;
  /** Gradient start colour. */
  from?: string;
  /** Gradient end colour. */
  to?: string;
  /** Fill opacity, 0-1. */
  opacity?: number;
  /** Seconds for the three-shape cycle. */
  speed?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Morphing SVG blob, three shapes on a slow loop. Where the d property is not
 * animatable the blob renders as its first shape and stays there.
 */
export function KzBlobMorph({
  size = "220px",
  from,
  to,
  opacity = 0.55,
  speed = 16,
  className,
  style,
}: KzBlobMorphProps) {
  const ref = useAmbientRun<SVGSVGElement>(true);
  /* useId can emit characters that are illegal in a bare id, so it is filtered
     rather than trusted. */
  const gradientId = `kza-blob-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    /* The stylesheet sits outside the svg: a style element inside SVG content
       is an SVGStyleElement, which is not hoisted or de-duplicated. React lifts
       it out of the fragment to the head either way. */
    <>
      <AmbientCSS />
      <svg
        ref={ref}
        data-kz-run="0"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 200 200"
        className={cx("kza", "kza-blob", className)}
        style={
          {
            "--kza-size": size,
            "--kza-dur": `${speed}s`,
            ...style,
          } as Vars
        }
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from ?? "var(--acc)"} />
            <stop offset="100%" stopColor={to ?? "var(--acc3)"} />
          </linearGradient>
        </defs>
        <path
          className="kza-blob-path"
          d={BLOB_A}
          fill={`url(#${gradientId})`}
          opacity={opacity}
        />
      </svg>
    </>
  );
}

export interface KzRadarPingProps {
  /** Outer diameter in px. Keep the tappable parent at 44px or more. */
  size?: number;
  /** Concurrent rings, evenly offset through the cycle. */
  rings?: number;
  /** Ring colour. */
  color?: string;
  /** Starting opacity of each ring, 0-1. */
  opacity?: number;
  /** Seconds for one ring to travel out and fade. */
  speed?: number;
  /** Whatever sits at the centre — a dot, a count, an icon. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Expanding rings. Scale plus opacity only — never width or height. */
export function KzRadarPing({
  size = 64,
  rings = 3,
  color,
  opacity = 0.55,
  speed = 3,
  children,
  className,
  style,
}: KzRadarPingProps) {
  const ref = useAmbientRun<HTMLSpanElement>(true);

  return (
    <span
      ref={ref}
      data-kz-run="0"
      className={cx("kza", "kza-ping", className)}
      style={
        {
          "--kza-size": `${size}px`,
          "--kza-c1": color ?? "var(--acc)",
          "--kza-o": opacity,
          "--kza-dur": `${speed}s`,
          ...style,
        } as Vars
      }
    >
      <AmbientCSS />
      {Array.from({ length: rings }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="kza-ping-ring kza-wo"
          style={{ animationDelay: `-${(i / rings) * speed}s` }}
        />
      ))}
      {children === undefined ? null : (
        <span className="kza-ping-core">{children}</span>
      )}
    </span>
  );
}

/* ==========================================================================
   SURFACE
   ========================================================================== */

export interface KzGradientBorderProps {
  children: ReactNode;
  /** Outer corner radius in px. */
  radius?: number;
  /** Border thickness in px. */
  thickness?: number;
  /** Seconds per revolution. */
  speed?: number;
  /** The two colours of the travelling light. */
  colors?: [string, string];
  /** The unlit remainder of the border. */
  track?: string;
  /** Background of the panel inside the border. */
  fill?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * A light travelling around a border: a conic gradient whose start angle is a
 * registered custom property. Registration happens from JS, which is also the
 * feature test — unsupported browsers keep a static sweep instead of a
 * two-frame snap.
 */
export function KzGradientBorder({
  children,
  radius = 16,
  thickness = 1,
  speed = 6,
  colors,
  track,
  fill,
  className,
  style,
}: KzGradientBorderProps) {
  const ref = useAmbientRun<HTMLDivElement>(true);

  useEffect(() => {
    const el = ref.current;
    if (el && ensureAngleProperty()) el.setAttribute("data-kza-prop", "1");
  }, [ref]);

  return (
    <div
      ref={ref}
      data-kz-run="0"
      className={cx("kza", "kza-gb", className)}
      style={
        {
          "--kza-r": `${radius}px`,
          "--kza-t": `${thickness}px`,
          "--kza-dur": `${speed}s`,
          "--kza-c1": colors?.[0] ?? "var(--acc)",
          "--kza-c2": colors?.[1] ?? "var(--acc3)",
          "--kza-track": track ?? "var(--line)",
          "--kza-fill": fill ?? "var(--card)",
          ...style,
        } as Vars
      }
    >
      <AmbientCSS />
      <span className="kza-gb-ring" aria-hidden="true" />
      <div className="kza-gb-inner">{children}</div>
    </div>
  );
}

export interface KzShimmerProps {
  children: ReactNode;
  /** Seconds for the full cycle — the sweep takes the first 55%, the rest rests. */
  speed?: number;
  /** Sheen tilt in degrees. */
  tilt?: number;
  /** Sheen colour. Defaults to a translucent tint of --ink. */
  color?: string;
  /** Seconds before the first sweep. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

/** Diagonal sheen sweeping across a surface. Transform only, clipped by overflow. */
export function KzShimmer({
  children,
  speed = 5,
  tilt = 18,
  color,
  delay = 0,
  className,
  style,
}: KzShimmerProps) {
  const ref = useAmbientRun<HTMLDivElement>(true);

  return (
    <div
      ref={ref}
      data-kz-run="0"
      className={cx("kza", "kza-shimmer", className)}
      style={
        {
          "--kza-dur": `${speed}s`,
          "--kza-tilt": `${tilt}deg`,
          "--kza-sheen":
            color ?? "color-mix(in srgb, var(--ink) 18%, transparent)",
          ...style,
        } as Vars
      }
    >
      <AmbientCSS />
      <span
        className="kza-shimmer-sheen kza-w"
        aria-hidden="true"
        style={{ animationDelay: `${delay}s` }}
      />
      <div className="kza-shimmer-body">{children}</div>
    </div>
  );
}

export interface KzBreathingGlowProps {
  children: ReactNode;
  /** Halo colour. */
  color?: string;
  /** How far the halo reaches past the content, px. */
  spread?: number;
  /** Seconds per breath. */
  speed?: number;
  /** Trough opacity, 0-1. */
  min?: number;
  /** Peak opacity, 0-1. */
  max?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * A halo that breathes. The pulse is opacity plus scale on a blurred gradient
 * layer, never an animated box-shadow — a shadow repaints the element and
 * everything under it on every frame.
 */
export function KzBreathingGlow({
  children,
  color,
  spread = 28,
  speed = 4.5,
  min = 0.25,
  max = 0.7,
  className,
  style,
}: KzBreathingGlowProps) {
  const ref = useAmbientRun<HTMLDivElement>(true);

  return (
    <div
      ref={ref}
      data-kz-run="0"
      className={cx("kza", "kza-glow", className)}
      style={
        {
          "--kza-c1": color ?? "var(--accglow)",
          "--kza-spread": `${spread}px`,
          "--kza-dur": `${speed}s`,
          "--kza-min": min,
          "--kza-max": max,
          ...style,
        } as Vars
      }
    >
      <AmbientCSS />
      <span className="kza-glow-halo kza-wo" aria-hidden="true" />
      <div className="kza-glow-body">{children}</div>
    </div>
  );
}

export interface KzGlassPanelProps {
  children: ReactNode;
  /** Backdrop blur radius in px. Halved under 640px. */
  blur?: number;
  /** Backdrop saturation multiplier. */
  saturate?: number;
  /** Corner radius in px. */
  radius?: number;
  /** Tint over the blurred backdrop. */
  fill?: string;
  /** Hairline border and the token shadow. */
  bordered?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Frosted panel. Where backdrop-filter is unsupported the fill goes opaque —
 * a translucent tint over an unblurred background is a contrast failure.
 */
export function KzGlassPanel({
  children,
  blur = 14,
  saturate = 1.4,
  radius = 16,
  fill,
  bordered = true,
  className,
  style,
}: KzGlassPanelProps) {
  return (
    <div
      className={cx(
        "kza",
        "kza-glass",
        bordered && "kza-glass-bordered",
        className
      )}
      style={
        {
          "--kza-blur": `${blur}px`,
          "--kza-sat": saturate,
          "--kza-r": `${radius}px`,
          "--kza-fill": fill ?? "var(--card)",
          ...style,
        } as Vars
      }
    >
      <AmbientCSS />
      {children}
    </div>
  );
}

export interface KzVignetteProps {
  children: ReactNode;
  /** Which way the content dissolves at its edges. */
  shape?: "radial" | "vertical" | "horizontal";
  /** Where the mask is still fully opaque — larger holds more, fades less. */
  hold?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Edge fade via mask-image. Wrap a scrolling strip, a grid or a 3D layer so it
 * dissolves instead of ending on a hard line. Static, and cheap: a mask is
 * composited, not repainted.
 */
export function KzVignette({
  children,
  shape = "radial",
  hold = "62%",
  className,
  style,
}: KzVignetteProps) {
  return (
    <div
      className={cx("kza", `kza-vig-${shape}`, className)}
      style={{ "--kza-hold": hold, ...style } as Vars}
    >
      <AmbientCSS />
      {children}
    </div>
  );
}

export interface KzSpotlightProps {
  children: ReactNode;
  /** Radius of the light in px. */
  size?: number;
  /** Light colour. */
  color?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * A radial highlight that follows the pointer, written to CSS custom properties
 * so React never re-renders while the pointer moves. Fine pointers only: on
 * touch the layer is not rendered at all, because a hover-only highlight is
 * information a touch user can never reach.
 */
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

    /* The layout read happens inside the frame callback, batched and always
       before the write, so a fast pointer cannot thrash the layout. */
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

    const io = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);

    return () => {
      io.disconnect();
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
          /* Centred until the pointer says otherwise, so the first frame after
             hover is never a corner flash. */
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
