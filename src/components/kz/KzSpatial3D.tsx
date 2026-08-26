"use client";

import {
  useId,
  type CSSProperties,
  type ReactNode,
} from "react";

export type KzSpatialKind =
  /* The original ten. */
  | "robot"
  | "chip"
  | "code"
  | "neural"
  | "database"
  | "cloud"
  | "shield"
  | "mobile"
  | "pipeline"
  | "cube"
  /* Added so the pages stop collapsing onto the "chip" fallback: the mapping
     in kindForLabel below had ten silhouettes to describe a stack, a factory,
     a studio and a security posture, and most labels landed on the same one.
     Each of these is drawn to the same three-plane lighting model. */
  | "server"
  | "gpu"
  | "globe"
  | "gear"
  | "flask"
  | "rocket"
  | "brain"
  | "terminal"
  | "chart"
  | "layers"
  | "lock"
  | "network"
  | "studio"
  | "power"
  | "satellite";

type KzVars = CSSProperties & Record<`--${string}`, string | number>;

const KZ_SPATIAL_CSS = `
.kz3-object {
  --kz3-size: 72px;
  --kz3-delay: 0s;
  --kz3-a: var(--acc3);
  --kz3-b: var(--acc);
  --kz3-c: var(--acc2);
  position: relative;
  display: inline-grid;
  width: var(--kz3-size);
  min-width: var(--kz3-size);
  aspect-ratio: 1;
  place-items: center;
  isolation: isolate;
  /* No perspective and no preserve-3d. They bought about five degrees of
     skew and cost a full-texture rasterise-and-resample of every icon on the
     page: the browser drew the SVG once into a bitmap, then sampled that
     bitmap through the 3D transform. The isometry is authored into the path
     data, so the geometry loses nothing and every edge gets drawn at the
     device's own resolution instead of at the texture's. */
}
/* Two grounds, not one. The old single soft ellipse read as haze; a tight,
   dark contact patch under the object plus a wide accent bloom behind it is
   what actually seats geometry on a surface. */
.kz3-object::after {
  content: "";
  position: absolute;
  z-index: -1;
  left: 21%;
  right: 15%;
  bottom: 2%;
  height: 8%;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(0, 0, 0, .88), rgba(0, 0, 0, .34) 56%, transparent 74%);
  filter: blur(2.5px);
  opacity: .9;
  transform: rotate(-4deg);
}
.kz3-object::before {
  content: "";
  position: absolute;
  z-index: -2;
  inset: 14% 6% 4%;
  border-radius: 50%;
  background: radial-gradient(ellipse at 50% 72%, color-mix(in srgb, var(--kz3-b) 30%, transparent), transparent 68%);
  filter: blur(9px);
  opacity: .7;
}
.kz3-object > svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  /* The geometry is drawn isometric already. The old rotateX/rotateY promoted
     every icon to a 3D-transformed layer, which the compositor then resampled
     — a couple of degrees of tilt bought at the cost of every edge in the
     drawing. Sharpness wins. */
  shape-rendering: geometricPrecision;
}
.kz3-object[data-float="true"] {
  animation: kz3-float 5.6s cubic-bezier(.45,0,.55,1) var(--kz3-delay) infinite alternate;
}
.kz3-object[data-tone="violet"] {
  --kz3-a: var(--acc2);
  --kz3-b: var(--acc3);
  --kz3-c: var(--acc);
}
.kz3-object[data-tone="blue"] {
  --kz3-a: var(--acc);
  --kz3-b: var(--acc2);
  --kz3-c: var(--acc3);
}
/* Whole-pixel translation only. The old keyframes carried a 1-2 degree
   rotation, which forces the compositor to resample the layer every frame and
   leaves every edge in the drawing permanently soft. */
@keyframes kz3-float {
  0% { transform: translate3d(0, 3px, 0); }
  55% { transform: translate3d(0, -5px, 0); }
  100% { transform: translate3d(0, -1px, 0); }
}

.kz3-pin {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  pointer-events: none;
  color: var(--ink);
}
/* The capsule IS the label. It used to be a ::before on the pin inset by
   12% -8px 12% 34% — a left edge measured as a percentage of the WHOLE pin,
   icon included. That only lines up at one label length: "Agent channel /
   ready" made the pin wide enough that 34% landed past the start of the text,
   so the first characters sat outside the capsule while dead space opened at
   its right end. Bordering the label instead makes the capsule wrap the words
   exactly, at any label length and any icon size, with no magic number. */
.kz3-pin-label {
  padding: 5px 13px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg2) 84%, transparent);
  box-shadow: 0 14px 36px -24px var(--accglow);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  font-family: var(--font-mono);
  font-size: .56rem;
  line-height: 1.15;
  letter-spacing: .16em;
  /* The tracking is added AFTER the last glyph too, so without this the text
     sits visibly off-centre in its own capsule. */
  text-indent: .16em;
  text-transform: uppercase;
  color: var(--mut);
  white-space: nowrap;
}
.kz-tech-pin {
  right: 0;
  top: clamp(52px, 8vw, 84px);
}
/* The generic form. A section that wants a marker sets position:relative on
   its header block and drops one of these in; it parks in the right-hand
   whitespace beside the section title, where every page already has room. */
.kz-section-pin {
  right: 0;
  top: clamp(4px, 2vw, 18px);
}
.kz-section-pin--low {
  top: auto;
  bottom: clamp(4px, 2vw, 20px);
}
.kz-home-terminal-pin {
  right: 12px;
  top: -32px;
  opacity: .82;
}
.kz-home-cta-pin {
  right: clamp(20px, 8vw, 130px);
  top: clamp(28px, 5vw, 58px);
}

.kz3-token {
  --kz3-token-size: 40px;
  position: relative;
  display: inline-grid;
  flex: 0 0 var(--kz3-token-size);
  width: var(--kz3-token-size);
  height: var(--kz3-token-size);
  place-items: center;
  transform-style: preserve-3d;
}
.kz3-token svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  shape-rendering: geometricPrecision;
  /* Tight and dark, then a small accent bloom. A single 7px accent blur at
     22% was all haze and no contact. */
  filter:
    drop-shadow(0 2px 1.5px rgba(0, 0, 0, .5))
    drop-shadow(0 5px 9px color-mix(in srgb, var(--acc) 34%, transparent));
  transition: transform 320ms cubic-bezier(.22,1,.36,1);
}
.kz3-token[data-tone="1"] { --kz3-token-a: var(--acc2); --kz3-token-b: var(--acc3); }
.kz3-token[data-tone="2"] { --kz3-token-a: var(--acc3); --kz3-token-b: var(--acc); }
.kz3-token[data-tone="0"] { --kz3-token-a: var(--acc); --kz3-token-b: var(--acc2); }
/* Wider spread between the three planes than before: a top that is genuinely
   lit, a face that sits in half light and a side in shade is what makes a
   30px cube read as a solid rather than as a flat rounded square. */
.kz3-token-face { fill: color-mix(in srgb, var(--bg2) 62%, var(--kz3-token-a) 38%); }
.kz3-token-top { fill: color-mix(in srgb, var(--kz3-token-b) 70%, white 26%); }
.kz3-token-side { fill: color-mix(in srgb, var(--kz3-token-a) 40%, black 42%); }
.kz3-token-grid {
  stroke: color-mix(in srgb, var(--kz3-token-b) 58%, transparent);
  /* Same reasoning as .kz3-token-edge: an authored 0.55 in a 42-unit viewBox
     rendered at 30px is a fifth of a device pixel. */
  vector-effect: non-scaling-stroke;
}
/* Non-scaling: the token renders at 22-40px from a 42-unit viewBox, so an
   authored 0.55 stroke would land at a fifth of a device pixel and vanish.
   This pins every silhouette edge at a hairline on screen instead. */
.kz3-token-edge {
  fill: none;
  stroke: color-mix(in srgb, var(--kz3-token-b) 78%, white 22%);
  stroke-width: 1;
  stroke-opacity: .62;
  vector-effect: non-scaling-stroke;
}
.kz3-token text {
  fill: var(--ink);
  font-family: var(--font-mono);
  /* The monogram is the smallest type on the site and was set at 8.2px in a
     42-unit viewBox rendered at 30px — about 5.9 CSS px on screen. */
  font-size: 11.5px;
  font-weight: 640;
  letter-spacing: -.045em;
  text-anchor: middle;
  paint-order: stroke;
  stroke: color-mix(in srgb, var(--bg) 88%, transparent);
  stroke-width: 2.2px;
  stroke-linejoin: round;
}
/* Sized in em so the marker tracks the heading it sits beside, from the 1rem
   card headings up to the 2.9rem section titles, instead of being a fixed
   30px tile that dwarfs the small ones and vanishes next to the large. */
.kz3-title-pin {
  display: inline-flex;
  margin-inline-start: .22em;
  vertical-align: -.24em;
}
.kz3-title-pin .kz3-object {
  --kz3-size: 1.15em;
  min-width: 1.15em;
}
/* The pin is punctuation, not an illustration: it must not out-shout the
   words it follows. */
.kz3-title-pin .kz3-object::before {
  display: none;
}
.kz3-title-pin .kz3-object::after {
  opacity: .55;
}

.kz3-atlas {
  display: grid;
  /* 340, not 290. At 290 the four resulting columns left each tool cell about
     55px of text width, so "TypeScript" and "Weaviate" broke mid-word. Three
     wider cards read better and give the category object room to be seen. */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
  gap: 16px;
  /* Cards take their own height. Stretched to the row — the grid default —
     the three-tool Mobile card was drawn the same height as the eight-tool
     Cloud card beside it, so it carried five rows of empty bordered space.
     A ragged bottom edge is the honest shape of the data. */
  align-items: start;
}
.kz3-atlas-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 18px;
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--card2) 88%, transparent), var(--card));
  box-shadow: 0 18px 60px -48px var(--accglow);
  padding: clamp(18px, 3vw, 24px);
  transition:
    transform 360ms cubic-bezier(.22,1,.36,1),
    border-color 240ms ease,
    box-shadow 360ms ease;
}
.kz3-atlas-card::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--acc) 12%, transparent) 1px, transparent 1px),
    linear-gradient(color-mix(in srgb, var(--acc) 10%, transparent) 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: .18;
  -webkit-mask-image: linear-gradient(to bottom right, #000, transparent 76%);
  mask-image: linear-gradient(to bottom right, #000, transparent 76%);
}
.kz3-atlas-head {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  padding-bottom: 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--line);
}
.kz3-atlas-head h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.04rem, 2.3vw, 1.3rem);
  line-height: 1.08;
  letter-spacing: -.035em;
  color: var(--ink);
}
.kz3-atlas-count {
  display: block;
  margin-top: 5px;
  font-family: var(--font-mono);
  font-size: .57rem;
  letter-spacing: .15em;
  text-transform: uppercase;
  color: var(--dim);
}
.kz3-tool-list {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.kz3-tool {
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 5px 9px 5px 5px;
  border: 1px solid color-mix(in srgb, var(--line) 82%, transparent);
  border-radius: 11px;
  background: color-mix(in srgb, var(--bg2) 72%, transparent);
  transition: border-color 220ms ease, background 220ms ease, transform 280ms cubic-bezier(.22,1,.36,1);
}
.kz3-tool-name {
  min-width: 0;
  font-size: clamp(.72rem, 2.5vw, .82rem);
  line-height: 1.25;
  color: var(--mut);
  /* break-word, not anywhere: anywhere also shrinks the min-content
     contribution, which lets a grid track collapse below the word and then
     breaks the word to fit the track it just caused. These are product names —
     they break only when there is genuinely no room. */
  overflow-wrap: break-word;
  hyphens: none;
}

.kz3-hero-scene {
  position: relative;
  min-height: 118px;
  width: 100%;
  isolation: isolate;
  /* The objects inside are sized in cq units so the scene composes the same
     way in the 250px hero column and in a 560px one. */
  container-type: inline-size;
}
/* The ground. A ruled isometric plate rather than the old blurred ellipse:
   objects need something to sit ON, and a plane with perspective in it says
   "space" where a soft glow only says "light". */
.kz3-hero-scene::before {
  content: "";
  position: absolute;
  left: 4%;
  right: 2%;
  bottom: 4%;
  height: 46%;
  border-radius: 50%;
  background:
    radial-gradient(ellipse at 50% 60%, color-mix(in srgb, var(--acc) 22%, transparent), transparent 68%);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--acc) 22%, transparent);
  transform: perspective(320px) rotateX(66deg) rotateZ(-6deg);
}
.kz3-hero-scene::after {
  content: "";
  position: absolute;
  left: 10%;
  right: 8%;
  bottom: 6%;
  height: 38%;
  pointer-events: none;
  background-image:
    linear-gradient(color-mix(in srgb, var(--acc) 34%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--acc) 34%, transparent) 1px, transparent 1px);
  background-size: 22px 22px;
  transform: perspective(320px) rotateX(66deg) rotateZ(-6deg);
  -webkit-mask-image: radial-gradient(ellipse at 50% 60%, #000, transparent 68%);
  mask-image: radial-gradient(ellipse at 50% 60%, #000, transparent 68%);
  opacity: .5;
}
.kz3-hero-primary {
  position: absolute;
  left: 50%;
  bottom: 2%;
  translate: -50% 0;
  z-index: 3;
}
.kz3-hero-secondary {
  position: absolute;
  left: 3%;
  top: 4%;
  z-index: 2;
}
.kz3-hero-tertiary {
  position: absolute;
  right: 2%;
  top: 12%;
  z-index: 2;
}
/* A fourth, small and far: three objects read as a row, four with one of them
   set back reads as a scene. */
.kz3-hero-quaternary {
  position: absolute;
  right: 22%;
  top: 2%;
  z-index: 1;
  opacity: .72;
}
.kz3-hero-wire {
  position: absolute;
  left: 14%;
  right: 15%;
  top: 54%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--acc3), var(--acc), transparent);
  opacity: .62;
}
.kz3-hero-wire:nth-of-type(2) {
  left: 26%;
  right: 8%;
  top: 32%;
  opacity: .34;
}
.kz3-hero-wire::before,
.kz3-hero-wire::after {
  content: "";
  position: absolute;
  top: -2px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--acc3);
  /* Tight, so it reads as a lit node rather than as a smudge. */
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--acc3) 55%, transparent), 0 0 7px var(--acc3);
}
.kz3-hero-wire::before { left: 20%; }
.kz3-hero-wire::after { right: 10%; }

@media (hover: hover) {
  .kz3-atlas-card:hover {
    transform: translateY(-5px);
    border-color: var(--line2);
    box-shadow: 0 24px 70px -44px var(--accglow);
  }
  .kz3-tool:hover {
    transform: translateY(-2px);
    border-color: var(--line2);
    background: var(--card2);
  }
  .kz3-tool:hover .kz3-token svg {
    transform: translate3d(0, -2px, 0) rotateY(-8deg);
  }
}

@media (max-width: 520px) {
  .kz3-tool-list { grid-template-columns: 1fr; }
  .kz3-atlas-card { border-radius: 15px; }
  /* Hiding the label now takes the capsule with it — they are one element. */
  .kz3-pin-label { display: none; }
  .kz3-title-pin {
    margin-inline-start: .16em;
    vertical-align: -.18em;
  }
}

/* Every pin is decoration parked in desktop whitespace. On a phone there is no
   whitespace to park in, so they go rather than fight the copy for room. */
@media (max-width: 900px) {
  .kz-tech-pin,
  .kz-home-terminal-pin,
  .kz-home-cta-pin,
  .kz-section-pin { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .kz3-object[data-float="true"] { animation: none; }
  .kz3-token svg,
  .kz3-atlas-card,
  .kz3-tool { transition: none; }
}
`;

function KzSpatialStyles() {
  return (
    <style
      href="kz-spatial-3d"
      precedence="medium"
      dangerouslySetInnerHTML={{ __html: KZ_SPATIAL_CSS }}
    />
  );
}

/* ── The lighting model ───────────────────────────────────────────────────
   Every object in this file is lit from the upper left and drawn as three
   planes: a TOP that catches the key light, a FRONT in half light, and a SIDE
   in shade. Holding that order — top lightest, side darkest, and a wide gap
   between them — is the whole reason flat vector shapes read as solids.

   Four things arrived when the geometry was sharpened:
   - `-edge`, a bright rim used with vector-effect="non-scaling-stroke" so a
     silhouette stays a hairline at 30px and at 130px alike;
   - `-spec`, a specular band for the one highlight per object;
   - `-cavity`, an occlusion wash for recessed faces (screens, grilles);
   - a two-part shadow — a tight dark contact term plus a wide accent bloom —
     replacing the single soft accent blur, which read as haze rather than as
     light.

   The texture is per-kind rather than one shared hatch: a circuit trace under
   silicon, a scanline under a screen, a node mesh under a model. `textureFor`
   keys those off the kind, which is what makes each object look like its own
   material instead of the same material cut into different silhouettes. */
type KzTextureSpec = { tile: number; body: ReactNode };

function textureFor(kind: KzSpatialKind): KzTextureSpec {
  switch (kind) {
    /* Circuit traces — silicon. */
    case "chip":
    case "gpu":
      return {
        tile: 7,
        body: (
          <>
            <path
              d="M0 3.5h2.6M4.4 3.5H7M3.5 0v2.6M3.5 4.4V7"
              stroke="var(--kz3-c)"
              strokeOpacity=".5"
              strokeWidth=".55"
            />
            <circle cx="3.5" cy="3.5" r=".72" fill="var(--kz3-c)" fillOpacity=".62" />
          </>
        ),
      };
    /* Scanlines — anything with a display. */
    case "code":
    case "mobile":
    case "terminal":
    case "chart":
      return {
        tile: 3,
        body: <path d="M0 .6h3M0 2.1h3" stroke="var(--kz3-c)" strokeOpacity=".34" strokeWidth=".5" />,
      };
    /* Node mesh — anything that is a network or a model. */
    case "neural":
    case "network":
    case "brain":
      return {
        tile: 8,
        body: (
          <>
            <path d="M0 0 8 8M8 0 0 8" stroke="var(--kz3-c)" strokeOpacity=".3" strokeWidth=".5" />
            <circle cx="4" cy="4" r=".85" fill="var(--kz3-c)" fillOpacity=".55" />
          </>
        ),
      };
    /* Rack louvres — server metal. */
    case "server":
      return {
        tile: 4,
        body: <path d="M.4 0v4M2.4 0v4" stroke="var(--kz3-c)" strokeOpacity=".4" strokeWidth=".6" />,
      };
    /* Stacked platters — storage. */
    case "database":
    case "layers":
      return {
        tile: 5,
        body: <path d="M0 1h5M0 3.5h5" stroke="var(--kz3-c)" strokeOpacity=".33" strokeWidth=".55" />,
      };
    /* Graticule — anything global or atmospheric. */
    case "globe":
    case "cloud":
    case "satellite":
      return {
        tile: 9,
        body: (
          <>
            <circle cx="4.5" cy="4.5" r="3.4" fill="none" stroke="var(--kz3-c)" strokeOpacity=".3" strokeWidth=".5" />
            <path d="M1.1 4.5h6.8M4.5 1.1v6.8" stroke="var(--kz3-c)" strokeOpacity=".24" strokeWidth=".45" />
          </>
        ),
      };
    /* Brushed metal — machined parts. */
    case "gear":
    case "pipeline":
    case "rocket":
    case "power":
      return {
        tile: 4,
        body: <path d="M0 0 4 4" stroke="var(--kz3-c)" strokeOpacity=".34" strokeWidth=".5" />,
      };
    /* Cross-hatched plate — armour. */
    case "shield":
    case "lock":
      return {
        tile: 6,
        body: (
          <path
            d="M0 6 6 0M-1.5 1.5 1.5-1.5M4.5 7.5 7.5 4.5"
            stroke="var(--kz3-c)"
            strokeOpacity=".34"
            strokeWidth=".6"
          />
        ),
      };
    /* Fine dot grid — studio and lab volumes, and the default solid. */
    default:
      return {
        tile: 6,
        body: (
          <>
            <path d="M0 6 6 0" stroke="var(--kz3-c)" strokeOpacity=".26" strokeWidth=".55" />
            <circle cx="1.5" cy="1.5" r=".6" fill="var(--kz3-a)" fillOpacity=".46" />
          </>
        ),
      };
  }
}

function spatialDefs(kind: KzSpatialKind, id: string): ReactNode {
  const texture = textureFor(kind);
  return (
    <>
      {/* Every stop is opaque and none of them is the page background. The
          previous ladder ran each face from an accent down to `--bg`, so the
          canvas showed through the far end of a surface that is meant to be
          solid — and the drop from lit to shaded WITHIN one face was larger
          than the difference BETWEEN two faces, which is precisely why the
          objects read as a gradient blob instead of as three planes. The
          three ranges below are deliberately narrow and deliberately far
          apart. */}
      <linearGradient id={`${id}-front`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="color-mix(in srgb, var(--kz3-b) 74%, #0d2135)" />
        <stop offset=".55" stopColor="color-mix(in srgb, var(--kz3-b) 52%, #0d2135)" />
        <stop offset="1" stopColor="color-mix(in srgb, var(--kz3-a) 34%, #0b1c2e)" />
      </linearGradient>
      <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="color-mix(in srgb, var(--kz3-b) 24%, #08121e)" />
        <stop offset=".7" stopColor="#071019" />
        <stop offset="1" stopColor="#050b12" />
      </linearGradient>
      <linearGradient id={`${id}-top`} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="color-mix(in srgb, var(--kz3-c) 88%, white 12%)" />
        <stop offset=".5" stopColor="color-mix(in srgb, var(--kz3-c) 66%, white 34%)" />
        <stop offset="1" stopColor="color-mix(in srgb, var(--kz3-c) 44%, white 56%)" />
      </linearGradient>
      <radialGradient id={`${id}-orb`} cx=".33" cy=".26" r=".8">
        <stop offset="0" stopColor="white" />
        <stop offset=".1" stopColor="color-mix(in srgb, var(--kz3-c) 55%, white 45%)" />
        <stop offset=".38" stopColor="var(--kz3-c)" />
        <stop offset=".72" stopColor="color-mix(in srgb, var(--kz3-a) 78%, #0a1726)" />
        <stop offset="1" stopColor="#060f1a" />
      </radialGradient>
      <linearGradient id={`${id}-edge`} x1="0" y1="0" x2=".8" y2="1">
        <stop offset="0" stopColor="white" stopOpacity=".82" />
        <stop offset=".5" stopColor="var(--kz3-c)" stopOpacity=".6" />
        <stop offset="1" stopColor="var(--kz3-a)" stopOpacity=".3" />
      </linearGradient>
      <linearGradient id={`${id}-spec`} x1="0" y1="0" x2=".35" y2="1">
        <stop offset="0" stopColor="white" stopOpacity=".58" />
        <stop offset=".42" stopColor="white" stopOpacity=".1" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${id}-cavity`} x1="0" y1="0" x2=".2" y2="1">
        <stop offset="0" stopColor="black" stopOpacity=".62" />
        <stop offset=".55" stopColor="var(--bg)" stopOpacity=".82" />
        <stop offset="1" stopColor="var(--kz3-a)" stopOpacity=".14" />
      </linearGradient>
      <pattern
        id={`${id}-texture`}
        width={texture.tile}
        height={texture.tile}
        patternUnits="userSpaceOnUse"
      >
        {texture.body}
      </pattern>
      {/* Contact first, bloom second. A single wide accent-flooded blur — what
          this used to be — is haze: it lightens the ground under the object
          instead of darkening it, so nothing looks like it is resting on
          anything. */}
      <filter id={`${id}-shadow`} x="-40%" y="-40%" width="185%" height="200%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="1.5" floodColor="#000" floodOpacity=".6" />
        <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="var(--kz3-a)" floodOpacity=".26" />
      </filter>
    </>
  );
}

/* Shared silhouette stroke. Non-scaling so a 30px atlas marker and a 130px
   hero object both get a one-device-pixel rim, rather than a rim that thins to
   nothing as the object shrinks. */
function edge(id: string, opacity = 0.7) {
  return {
    fill: "none" as const,
    stroke: `url(#${id}-edge)`,
    strokeOpacity: opacity,
    strokeWidth: 1,
    vectorEffect: "non-scaling-stroke" as const,
  };
}

function geometry(kind: KzSpatialKind, id: string): ReactNode {
  const front = `url(#${id}-front)`;
  const side = `url(#${id}-side)`;
  const top = `url(#${id}-top)`;
  const orb = `url(#${id}-orb)`;
  const texture = `url(#${id}-texture)`;

  if (kind === "robot") {
    return (
      <g filter={`url(#${id}-shadow)`}>
        <rect x="23" y="25" width="57" height="45" rx="13" fill={side} transform="translate(4 5)" />
        <path d="M28 25 35 18h45l-6 7Z" fill={top} />
        <path d="m80 25 6-7v43l-6 9Z" fill={side} />
        <rect x="20" y="25" width="60" height="45" rx="13" fill={front} stroke="var(--kz3-a)" strokeOpacity=".55" />
        <rect x="27" y="33" width="46" height="28" rx="9" fill="var(--bg)" opacity=".82" />
        <rect x="27" y="33" width="46" height="28" rx="9" fill={texture} opacity=".48" />
        <ellipse cx="39" cy="47" rx="5" ry="7" fill="var(--kz3-c)" />
        <ellipse cx="61" cy="47" rx="5" ry="7" fill="var(--kz3-a)" />
        <path d="M43 57q7 5 14 0" fill="none" stroke="var(--kz3-b)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M50 25V15" stroke="var(--kz3-a)" strokeWidth="2.5" />
        <circle cx="50" cy="12" r="4" fill={orb} />
        <path d="M20 40h-6v16h6M80 40h6v16h-6" fill={side} stroke="var(--kz3-a)" strokeOpacity=".5" />
        <path {...edge(id)} d="M28 25 35 18h45l6-7v43l-6 9" />
        <rect {...edge(id, 0.55)} x="20" y="25" width="60" height="45" rx="13" />
      </g>
    );
  }

  if (kind === "chip") {
    const pins = [28, 40, 52, 64];
    return (
      <g filter={`url(#${id}-shadow)`}>
        {pins.map((p) => (
          <g key={p} stroke="var(--kz3-a)" strokeWidth="3" strokeLinecap="round">
            <path d={`M${p} 18v-8M${p} 78v8`} />
            <path d={`M18 ${p}h-8M78 ${p}h8`} />
          </g>
        ))}
        <rect x="23" y="23" width="57" height="57" rx="10" fill={side} transform="translate(4 5)" />
        <path d="M23 23 30 16h54l-7 7Z" fill={top} />
        <path d="m77 23 7-7v55l-7 7Z" fill={side} />
        <rect x="19" y="23" width="58" height="55" rx="10" fill={front} stroke="var(--kz3-a)" strokeOpacity=".6" />
        <rect x="28" y="32" width="40" height="37" rx="8" fill="var(--bg)" opacity=".72" />
        <rect x="28" y="32" width="40" height="37" rx="8" fill={texture} opacity=".6" />
        <path d="M36 51h8l5-9 7 18 5-9h7" fill="none" stroke="var(--kz3-c)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="49" cy="42" r="3" fill="var(--kz3-a)" />
        <circle cx="56" cy="60" r="3" fill="var(--kz3-b)" />
        <path {...edge(id)} d="M23 23 30 16h54l-7 7Z" />
        <path {...edge(id, 0.5)} d="m77 23 7-7v55l-7 7" />
        <rect {...edge(id, 0.6)} x="19" y="23" width="58" height="55" rx="10" />
        <rect x="28" y="32" width="40" height="37" rx="8" fill={`url(#${id}-spec)`} opacity=".3" />
      </g>
    );
  }

  if (kind === "code") {
    return (
      <g filter={`url(#${id}-shadow)`}>
        <rect x="19" y="22" width="61" height="52" rx="8" fill={side} transform="translate(5 6)" />
        <path d="M19 22 26 15h60l-7 7Z" fill={top} />
        <path d="m79 22 7-7v52l-7 7Z" fill={side} />
        <rect x="15" y="22" width="64" height="52" rx="8" fill={front} stroke="var(--kz3-a)" strokeOpacity=".55" />
        <path d="M15 34h64" stroke="var(--kz3-a)" strokeOpacity=".35" />
        <circle cx="23" cy="28" r="2.2" fill="var(--kz3-c)" />
        <circle cx="30" cy="28" r="2.2" fill="var(--kz3-b)" />
        <circle cx="37" cy="28" r="2.2" fill="var(--kz3-a)" />
        <rect x="21" y="39" width="52" height="28" rx="4" fill="var(--bg)" opacity=".68" />
        <rect x="21" y="39" width="52" height="28" rx="4" fill={texture} opacity=".52" />
        <path d="m37 47-8 7 8 7M57 47l8 7-8 7M51 45l-6 18" fill="none" stroke="var(--kz3-a)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path {...edge(id)} d="M15 22 26 15h60l-7 7Z" />
        <path {...edge(id, 0.5)} d="m79 22 7-7v52l-7 7" />
        <rect {...edge(id, 0.6)} x="15" y="22" width="64" height="52" rx="8" />
        <path d="M15 30h64v-8l11-7H26l-11 7Z" fill={`url(#${id}-spec)`} opacity=".34" />
      </g>
    );
  }

  if (kind === "neural") {
    const nodes = [
      [50, 18], [72, 30], [79, 54], [64, 75], [38, 78], [18, 58], [23, 32],
    ];
    return (
      <g filter={`url(#${id}-shadow)`}>
        <circle cx="49" cy="49" r="29" fill={orb} stroke="var(--kz3-a)" strokeOpacity=".45" />
        <ellipse cx="49" cy="49" rx="38" ry="17" fill="none" stroke="var(--kz3-b)" strokeOpacity=".38" transform="rotate(-18 49 49)" />
        <ellipse cx="49" cy="49" rx="17" ry="38" fill="none" stroke="var(--kz3-a)" strokeOpacity=".32" transform="rotate(28 49 49)" />
        {nodes.map(([x, y], index) => (
          <g key={index}>
            <path d={`M49 49L${x} ${y}`} stroke="var(--kz3-a)" strokeOpacity=".45" />
            <circle cx={x} cy={y} r={index % 2 ? 4 : 3} fill={index % 3 ? "var(--kz3-b)" : "var(--kz3-c)"} />
          </g>
        ))}
        <circle cx="49" cy="49" r="10" fill={front} stroke="var(--kz3-c)" strokeWidth="2" />
        <circle cx="49" cy="49" r="29" fill={`url(#${id}-spec)`} opacity=".4" />
        <circle {...edge(id, 0.55)} cx="49" cy="49" r="29" />
        <circle cx="46" cy="45" r="3" fill="white" opacity=".8" />
      </g>
    );
  }

  if (kind === "database") {
    return (
      <g filter={`url(#${id}-shadow)`}>
        <path d="M22 28v45c0 8 13 14 29 14s29-6 29-14V28Z" fill={side} />
        <ellipse cx="51" cy="28" rx="29" ry="13" fill={top} stroke="var(--kz3-a)" strokeOpacity=".6" />
        <path d="M22 43c0 8 13 14 29 14s29-6 29-14M22 58c0 8 13 14 29 14s29-6 29-14" fill="none" stroke="var(--kz3-a)" strokeOpacity=".5" />
        <ellipse cx="51" cy="28" rx="20" ry="8" fill={orb} opacity=".75" />
        <path d="M37 28h28M42 24h18M42 32h18" stroke="var(--kz3-c)" strokeWidth="1.4" strokeLinecap="round" opacity=".75" />
        <path d="M22 28v45c0 8 13 14 29 14s29-6 29-14V28Z" fill={texture} opacity=".4" />
        <path d="M22 28v45c0 8 13 14 29 14s29-6 29-14V28Z" fill={`url(#${id}-spec)`} opacity=".26" />
        <path {...edge(id)} d="M22 28v45c0 8 13 14 29 14s29-6 29-14V28" />
        <ellipse {...edge(id)} cx="51" cy="28" rx="29" ry="13" />
      </g>
    );
  }

  if (kind === "cloud") {
    return (
      <g filter={`url(#${id}-shadow)`}>
        <path d="m24 66 8 8h43l8-8-8-10H33Z" fill={side} opacity=".86" />
        <circle cx="35" cy="50" r="16" fill={front} />
        <circle cx="51" cy="39" r="22" fill={orb} />
        <circle cx="69" cy="51" r="17" fill={front} />
        <rect x="30" y="48" width="45" height="19" rx="9" fill={front} />
        <path d="M37 58h9l5-8 7 13 5-7h8" fill="none" stroke="var(--kz3-c)" strokeWidth="2.3" strokeLinecap="round" />
        <circle cx="37" cy="58" r="2.4" fill="var(--kz3-a)" />
        <circle cx="71" cy="56" r="2.4" fill="var(--kz3-b)" />
        <circle cx="51" cy="39" r="22" fill={texture} opacity=".34" />
        <path {...edge(id)} d="M24 66a16 16 0 0 1 11-16 22 22 0 0 1 34-11 17 17 0 0 1 14 27" />
        <path {...edge(id, 0.45)} d="m24 66 8 8h43l8-8" />
      </g>
    );
  }

  if (kind === "shield") {
    return (
      <g filter={`url(#${id}-shadow)`}>
        <path d="M54 13c11 8 21 10 30 11v25c0 20-12 31-30 40-18-9-30-20-30-40V24c9-1 19-3 30-11Z" fill={side} transform="translate(4 3)" />
        <path d="M50 10c11 8 21 10 30 11v25c0 20-12 31-30 40-18-9-30-20-30-40V21c9-1 19-3 30-11Z" fill={front} stroke="var(--kz3-a)" strokeOpacity=".65" />
        <path d="M50 18v59c13-7 22-16 22-31V28c-7-1-14-4-22-10Z" fill={texture} opacity=".56" />
        <rect x="38" y="43" width="24" height="20" rx="5" fill="var(--bg)" opacity=".74" />
        <path d="M43 43v-6a7 7 0 0 1 14 0v6" fill="none" stroke="var(--kz3-c)" strokeWidth="3" />
        <circle cx="50" cy="52" r="3" fill="var(--kz3-a)" />
        <path d="M50 54v5" stroke="var(--kz3-a)" strokeWidth="2" />
        <path d="M50 10c11 8 21 10 30 11v25c0 20-12 31-30 40-18-9-30-20-30-40V21c9-1 19-3 30-11Z" fill={`url(#${id}-spec)`} opacity=".3" />
        <path {...edge(id)} d="M50 10c11 8 21 10 30 11v25c0 20-12 31-30 40-18-9-30-20-30-40V21c9-1 19-3 30-11Z" />
        <path {...edge(id, 0.42)} d="M50 18v59" />
      </g>
    );
  }

  if (kind === "mobile") {
    return (
      <g filter={`url(#${id}-shadow)`}>
        <rect x="29" y="12" width="43" height="74" rx="11" fill={side} transform="translate(5 4)" />
        <path d="M29 12 35 7h42l-6 5Z" fill={top} />
        <path d="m71 12 6-5v73l-6 6Z" fill={side} />
        <rect x="25" y="12" width="46" height="74" rx="11" fill={front} stroke="var(--kz3-a)" strokeOpacity=".55" />
        <rect x="30" y="21" width="36" height="53" rx="6" fill="var(--bg)" opacity=".76" />
        <rect x="30" y="21" width="36" height="53" rx="6" fill={texture} opacity=".52" />
        <path d="M37 55 47 43l7 8 6-7" fill="none" stroke="var(--kz3-a)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="48" cy="80" r="2.5" fill="var(--kz3-c)" />
        <rect x="43" y="16" width="10" height="2" rx="1" fill="var(--kz3-b)" />
        <path {...edge(id)} d="M29 12 35 7h42l6 5v73l-6 6" />
        <rect {...edge(id, 0.6)} x="25" y="12" width="46" height="74" rx="11" />
        <rect x="30" y="21" width="36" height="53" rx="6" fill={`url(#${id}-spec)`} opacity=".3" />
      </g>
    );
  }

  if (kind === "pipeline") {
    const hex = (cx: number, cy: number, radius = 12) =>
      Array.from({ length: 6 }, (_, index) => {
        const angle = ((index * 60 - 30) * Math.PI) / 180;
        return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
      }).join(" ");
    return (
      <g filter={`url(#${id}-shadow)`}>
        <path d="M23 63 49 47 73 30" fill="none" stroke={side} strokeWidth="9" strokeLinecap="round" />
        <path d="M23 59 49 43 73 26" fill="none" stroke="var(--kz3-a)" strokeWidth="3" strokeLinecap="round" />
        {[[23, 59], [49, 43], [73, 26]].map(([x, y], index) => (
          <g key={index}>
            <polygon points={hex(x + 3, y + 4)} fill={side} />
            <polygon points={hex(x, y)} fill={index === 1 ? orb : front} stroke="var(--kz3-c)" strokeOpacity=".55" />
            <circle cx={x} cy={y} r="3.5" fill="var(--kz3-c)" />
          </g>
        ))}
        <path d="m43 66 8 8 18-20" fill="none" stroke="var(--kz3-b)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {[[23, 59], [49, 43], [73, 26]].map(([x, y], index) => (
          <polygon key={`e${index}`} {...edge(id, index === 1 ? 0.85 : 0.6)} points={hex(x, y)} />
        ))}
      </g>
    );
  }

  if (kind === "network") {
    const spec = `url(#${id}-spec)`;
    const cavity = `url(#${id}-cavity)`;
    const nodes: [number, number, number, boolean][] = [
      [22, 62, 3.5, false],
      [74, 60, 3.7, false],
      [19, 72, 4.3, false],
      [78, 70, 4.4, false],
      [31, 80, 5.2, true],
      [66, 79, 5.4, true],
    ];
    const link = (x1: number, y1: number, x2: number, y2: number) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const flip = dx > 0 ? -1 : 1;
      const nx = (-dy / len) * 1.5 * flip;
      const ny = (dx / len) * 1.5 * flip;
      return {
        base: `M${x1} ${y1}L${x2} ${y2}`,
        lit: `M${(x1 + nx).toFixed(1)} ${(y1 + ny).toFixed(1)}L${(x2 + nx).toFixed(1)} ${(y2 + ny).toFixed(1)}`,
      };
    };
    const struts = [
      ...nodes.map(([x, y]) => ({ line: link(48, 54, x, y), w: 5 })),
      { line: link(19, 72, 31, 80), w: 3.6 },
      { line: link(78, 70, 66, 79), w: 3.6 },
    ];
    const node = ([x, y, r, lit]: [number, number, number, boolean]) => (
      <g key={`${x}-${y}`}>
        <ellipse cx={x + 1.2} cy={y + r} rx={r} ry={r / 3} fill="var(--bg)" opacity=".55" />
        <circle cx={x} cy={y} r={r} fill={lit ? orb : front} />
        <circle cx={x} cy={y} r={r} fill="none" stroke="var(--kz3-c)" strokeOpacity={lit ? 0.8 : 0.42} />
        {lit ? <circle cx={x - r * 0.32} cy={y - r * 0.36} r={r * 0.28} fill="white" opacity=".55" /> : null}
      </g>
    );
    return (
      <g filter={`url(#${id}-shadow)`}>
        <ellipse cx="48" cy="70" rx="33" ry="13" fill={side} opacity=".45" />
        <ellipse cx="48" cy="70" rx="33" ry="13" {...edge(id, 0.3)} />
        <ellipse cx="48" cy="70" rx="21" ry="8" {...edge(id, 0.16)} />
        {struts.map(({ line, w }) => (
          <g key={line.base} fill="none" strokeLinecap="round">
            <path d={line.base} stroke={side} strokeWidth={w} />
            <path d={line.base} stroke={front} strokeWidth={w * 0.52} />
            <path d={line.lit} stroke="var(--kz3-c)" strokeOpacity=".8" strokeWidth={w * 0.25} />
          </g>
        ))}
        {nodes.slice(0, 4).map(node)}
        <path d="M35 55v9c0 2.9 5.8 5.2 13 5.2V55Z" fill={front} />
        <path d="M61 55v9c0 2.9-5.8 5.2-13 5.2V55Z" fill={side} />
        <path d="M35 55v9c0 2.9 5.8 5.2 13 5.2s13-2.3 13-5.2v-9" {...edge(id, 0.4)} />
        <ellipse cx="48" cy="55" rx="13" ry="5.2" fill={top} />
        <ellipse cx="48" cy="55" rx="13" ry="5.2" {...edge(id, 0.6)} />
        <path d="M39.5 58.8v4.4M44 59.6v4.8M52 59.6v4.8M56.5 58.8v4.4" stroke={cavity} strokeWidth="1.9" strokeLinecap="round" />
        <path d="M35.6 57.6c3 1.8 7.4 2.9 12.4 2.9s9.4-1.1 12.4-2.9" fill="none" stroke="white" strokeOpacity=".16" />
        <ellipse cx="48" cy="55" rx="7" ry="2.8" fill={cavity} opacity=".55" />
        <circle cx="48" cy="40" r="14" fill={orb} />
        <circle cx="48" cy="40" r="14" fill={texture} opacity=".45" />
        <path d="M34 40q14 9 28 0M37.7 30.5q10.3 6 20.6 0M37.7 49.5q10.3 6 20.6 0" fill="none" stroke="var(--kz3-c)" strokeOpacity=".38" strokeWidth=".9" />
        <path d="M41 32 55 35 57.5 46 44 47.5Z" fill="none" stroke="var(--kz3-c)" strokeOpacity=".5" />
        <path d="M41 32 57.5 46M55 35 44 47.5" fill="none" stroke="var(--kz3-c)" strokeOpacity=".28" strokeWidth=".8" />
        <circle cx="48" cy="40" r="14" fill={spec} />
        <circle cx="41" cy="32" r="2" fill="var(--kz3-c)" />
        <circle cx="55" cy="35" r="1.8" fill="var(--kz3-c)" />
        <circle cx="57.5" cy="46" r="1.6" fill="var(--kz3-b)" />
        <circle cx="44" cy="47.5" r="1.8" fill="var(--kz3-a)" />
        <circle cx="41" cy="32" r="1" fill="white" opacity=".8" />
        <circle cx="48" cy="40" r="14" {...edge(id, 0.75)} />
        {nodes.slice(4).map(node)}
      </g>
    );
  }

  if (kind === "layers") {
    const spec = `url(#${id}-spec)`;
    const cavity = `url(#${id}-cavity)`;
    const slabs: [number, number][] = [[64, 0.5], [52, 0.34], [40, 0.18], [28, 0]];
    return (
      <g filter={`url(#${id}-shadow)`}>
        {slabs.map(([cy, dim], index) => {
          const lead = index === slabs.length - 1;
          const apex = cy - 11;
          const bot = cy + 11;
          const foot = cy + 16;
          const face = `M18 ${cy} 48 ${apex} 78 ${cy} 48 ${bot}Z`;
          const shell = `M18 ${cy} 48 ${apex} 78 ${cy}v5L48 ${foot} 18 ${cy + 5}Z`;
          return (
            <g key={cy}>
              <path d={`M18 ${cy}v5L48 ${foot}V${bot}Z`} fill={front} />
              <path d={`M78 ${cy}v5L48 ${foot}V${bot}Z`} fill={side} />
              <path d={face} fill={top} />
              {lead ? <path d={face} fill={texture} opacity=".5" /> : null}
              {lead ? <path d={face} fill={spec} /> : null}
              <path d={`M18 ${cy + 2.4}L48 ${foot - 2.6}L78 ${cy + 2.4}`} fill="none" stroke="var(--bg)" strokeOpacity=".5" />
              <path d={`M18 ${cy + 3.4}L48 ${foot - 1.6}L78 ${cy + 3.4}`} fill="none" stroke="white" strokeOpacity=".14" />
              <path d={`M25 ${cy} 48 ${cy - 8.4} 71 ${cy} 48 ${cy + 8.4}Z`} fill="none" stroke="var(--kz3-c)" strokeOpacity=".3" strokeWidth=".9" />
              {dim ? <path d={shell} fill="var(--bg)" opacity={dim} /> : null}
              <path d={shell} {...edge(id, lead ? 0.75 : 0.4)} />
              <path d={`M18 ${cy} 48 ${apex} 78 ${cy}`} fill="none" stroke="white" strokeOpacity={lead ? 0.35 : 0.16} />
            </g>
          );
        })}
        <ellipse cx="48" cy="28" rx="6.5" ry="2.4" fill={cavity} />
        <ellipse cx="48" cy="28" rx="6.5" ry="2.4" fill="none" stroke="var(--kz3-c)" strokeOpacity=".65" />
        <rect x="44.4" y="28" width="7.2" height="54" fill="var(--kz3-c)" opacity=".12" />
        <rect x="46.4" y="28" width="3.2" height="54" fill="var(--kz3-c)" opacity=".32" />
        <path d="M48 28v54" stroke="white" strokeOpacity=".55" />
        <path d="M46.2 15.5h1.8v13h-1.8Z" fill={front} />
        <path d="M48 15.5h1.8v13H48Z" fill={side} />
        <path d="M46.2 15.5h3.6v13h-3.6Z" {...edge(id, 0.5)} />
        <ellipse cx="48" cy="15.5" rx="5" ry="1.9" fill={top} />
        <ellipse cx="48" cy="15.5" rx="5" ry="1.9" {...edge(id, 0.7)} />
        <ellipse cx="48" cy="82" rx="7.5" ry="2.4" fill="var(--kz3-c)" opacity=".22" />
      </g>
    );
  }

  if (kind === "chart") {
    const spec = `url(#${id}-spec)`;
    const cavity = `url(#${id}-cavity)`;
    const deck = "M14 65 48 49 82 65 48 81Z";
    const trend = "M26 46 40 37 54 30 68 22";
    const bars: [number, number, number][] = [[26, 66, 14], [40, 65, 22], [54, 64, 28], [68, 63, 35]];
    const pts: [number, number][] = [[26, 46], [40, 37], [54, 30], [68, 22]];
    return (
      <g filter={`url(#${id}-shadow)`}>
        <path d="M14 65v4L48 85V81Z" fill={front} />
        <path d="M82 65v4L48 85V81Z" fill={side} />
        <path d={deck} fill={top} />
        <path d={deck} fill="var(--bg)" opacity=".26" />
        <path d={deck} fill={texture} opacity=".5" />
        <path d={deck} fill={spec} />
        <path d="M22.5 69 56.5 53M31 73 65 57M39.5 77 73.5 61M22.5 61 56.5 77M31 57 65 73M39.5 53 73.5 69" fill="none" stroke="var(--kz3-c)" strokeOpacity=".3" strokeWidth=".8" />
        <path d={deck} {...edge(id, 0.55)} />
        <path d="M14 65 48 49 82 65v4L48 85 14 69Z" {...edge(id, 0.7)} />
        {[...bars].reverse().map(([cx, cy, h]) => (
          <g key={cx}>
            <path d={`M${cx - 7.6} ${cy} ${cx} ${cy - 3.6} ${cx + 7.6} ${cy} ${cx} ${cy + 3.6}Z`} fill={cavity} opacity=".8" />
            <path d={`M${cx - 6} ${cy - h} ${cx} ${cy - h + 2.8} ${cx} ${cy + 2.8} ${cx - 6} ${cy}Z`} fill={front} />
            <path d={`M${cx + 6} ${cy - h} ${cx} ${cy - h + 2.8} ${cx} ${cy + 2.8} ${cx + 6} ${cy}Z`} fill={side} />
            <path d={`M${cx - 6} ${cy - h} ${cx} ${cy - h - 2.8} ${cx + 6} ${cy - h} ${cx} ${cy - h + 2.8}Z`} fill={top} />
            <path d={`M${cx} ${cy - h + 2.8}V${cy + 2.8}`} stroke="white" strokeOpacity=".28" />
            <path d={`M${cx - 6} ${cy - h + 5} ${cx} ${cy - h + 7.8} ${cx + 6} ${cy - h + 5}`} fill="none" stroke="var(--bg)" strokeOpacity=".4" />
            <path d={`M${cx - 6} ${cy - h} ${cx} ${cy - h - 2.8} ${cx + 6} ${cy - h}V${cy}L${cx} ${cy + 2.8} ${cx - 6} ${cy}Z`} {...edge(id, 0.6)} />
          </g>
        ))}
        {pts.map(([x, y], index) => (
          <path key={x} d={`M${x} ${y}V${bars[index][1] - bars[index][2] - 3}`} stroke="var(--kz3-c)" strokeOpacity=".35" />
        ))}
        <path d={trend} fill="none" stroke={side} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={trend} fill="none" stroke="var(--kz3-b)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M25.4 44.6 39.4 35.6 53.4 28.6 67.4 20.6" fill="none" stroke="var(--kz3-c)" strokeOpacity=".9" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x, y], index) => (
          <g key={x}>
            <circle cx={x} cy={y} r={index === pts.length - 1 ? 4.2 : 3.2} fill={orb} />
            <circle cx={x} cy={y} r={index === pts.length - 1 ? 4.2 : 3.2} fill="none" stroke="var(--kz3-c)" strokeOpacity=".8" />
          </g>
        ))}
      </g>
    );
  }

  if (kind === "terminal") {
    const cavity = `url(#${id}-cavity)`;
    const vents = Array.from({ length: 11 }, (_, i) => `M${23.5 + i * 4} 70.3v3`).join("");
    return (
      <g filter={`url(#${id}-shadow)`}>
        <rect x="13" y="25" width="63" height="55" rx="7" fill={side} transform="translate(5 5)" />
        <path d="M13 25 20 18h63l-7 7Z" fill={top} />
        <path d="M13 25 20 18h63l-7 7Z" fill={`url(#${id}-spec)`} opacity=".5" />
        <path d="m76 25 7-7v55l-7 7Z" fill={side} />
        <path d="M79.5 21.5v55" stroke="var(--kz3-c)" strokeOpacity=".22" />
        <rect x="13" y="25" width="63" height="55" rx="7" fill={front} />
        <path d="M17 28.5h55" stroke="var(--kz3-c)" strokeOpacity=".3" />
        <rect x="19" y="31" width="51" height="36" rx="5" fill={side} />
        <rect x="20" y="32" width="49" height="34" rx="4" fill={cavity} />
        <rect x="20" y="32" width="49" height="34" rx="4" fill={texture} opacity=".5" />
        <g fill="none" stroke="var(--kz3-c)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m24.5 36.5 3.5 3.5-3.5 3.5" />
          <path d="M31.5 40h23" />
          <path d="m24.5 52.5 3.5 3.5-3.5 3.5" />
        </g>
        <path d="M31.5 48h18" stroke="var(--kz3-a)" strokeOpacity=".85" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M31.5 56h11" stroke="var(--kz3-b)" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="45" y="52" width="5.5" height="8" fill="var(--kz3-c)" />
        <path d="M22 66.2h45" stroke="var(--kz3-c)" strokeOpacity=".3" />
        <rect x="20" y="69" width="44" height="5.5" rx="2.5" fill={cavity} />
        <path d={vents} stroke="var(--kz3-c)" strokeOpacity=".45" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="68.5" cy="71.8" r="1.7" fill="var(--kz3-c)" />
        <circle cx="72.6" cy="71.8" r="1.7" fill="var(--kz3-b)" />
        <rect {...edge(id, 0.45)} x="20" y="32" width="49" height="34" rx="4" />
        <path {...edge(id, 0.55)} d="M13 25 20 18h63l-7 7Z" />
        <rect {...edge(id, 0.7)} x="13" y="25" width="63" height="55" rx="7" />
      </g>
    );
  }

  if (kind === "brain") {
    const cavity = `url(#${id}-cavity)`;
    const near = "M48 20C39 12 24 14 20 25 11 28 9 39 15 45 10 52 14 64 23 67 26 76 39 80 48 74 44 62 44 32 48 20Z";
    const far = "M48 20C57 12 71 14 76 25 84 28 86 39 80 45 85 52 81 63 72 66 66 74 55 77 48 71Z";
    const crown = "M48 20C39 12 24 14 20 25 18 31 23 35 29 32 33 24 40 20 48 25Z";
    const farGyri = "M53 31C59 28 66 31 72 28M54 47C61 43 68 48 76 43M55 60C61 57 67 60 72 57";
    const gyri = [
      "M19 36C26 32 33 36 41 31",
      "M16 45C24 41 32 46 41 41",
      "M17 55C25 51 33 56 42 51",
      "M21 64C28 60 35 64 43 59",
      "M29 71C35 68 40 71 46 66",
    ];
    return (
      <g filter={`url(#${id}-shadow)`}>
        <path d={far} fill={side} />
        <g fill="none" strokeLinecap="round">
          <path d={farGyri} transform="translate(.8 1.9)" stroke="black" strokeOpacity=".35" strokeWidth="2.4" />
          <path d={farGyri} stroke="var(--kz3-c)" strokeOpacity=".3" strokeWidth="1.3" />
        </g>
        <ellipse cx="63" cy="67" rx="12.5" ry="9" fill={side} transform="rotate(-12 63 67)" />
        <path d="M53 69c6 4 14 4 20-2M55 74c5 3 11 3 15-1" fill="none" stroke="var(--kz3-c)" strokeOpacity=".22" strokeWidth="1.4" strokeLinecap="round" />
        <path d={near} fill={front} />
        <path d={near} fill={texture} opacity=".5" />
        <path d={crown} fill={top} />
        <path d={crown} fill={`url(#${id}-spec)`} opacity=".5" />
        <path d="M48 20C44 32 44 62 48 74 52 62 52 32 48 20Z" fill={cavity} />
        <path d="M48 20C44 32 44 62 48 74" fill="none" stroke="var(--kz3-c)" strokeOpacity=".5" strokeWidth="1.2" />
        {gyri.map((d) => (
          <g key={d} fill="none" strokeLinecap="round">
            <path d={d} transform="translate(.8 1.9)" stroke="black" strokeOpacity=".4" strokeWidth="2.6" />
            <path d={d} stroke="var(--kz3-c)" strokeOpacity=".5" strokeWidth="1.4" />
          </g>
        ))}
        <g stroke="var(--kz3-c)" strokeOpacity=".85" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M27 45h-7l-3 3" />
          <path d="M38 57h5l2.5 2.5" />
          <path d="M33 34h-7l-3-3" />
        </g>
        <circle cx="27" cy="45" r="2.8" fill="var(--kz3-c)" />
        <circle cx="38" cy="57" r="2.4" fill="var(--kz3-a)" />
        <circle cx="33" cy="34" r="2.2" fill="var(--kz3-b)" />
        <path {...edge(id, 0.5)} d={far} />
        <path {...edge(id, 0.5)} d={crown} />
        <path {...edge(id, 0.7)} d={near} />
      </g>
    );
  }

  if (kind === "studio") {
    const cavity = `url(#${id}-cavity)`;
    const cap = "M34.8 20.6A13 13 0 0 1 56.2 15.8 33 33 0 0 0 34.8 20.6Z";
    const barrel = "M37 36v14c0 2.2 4.5 4 10 4s10-1.8 10-4V36Z";
    return (
      <g filter={`url(#${id}-shadow)`}>
        <rect x="17" y="70" width="50" height="9.5" rx="3.5" fill={side} transform="translate(5 4)" />
        <ellipse cx="47" cy="28" rx="19" ry="17" fill="none" stroke={side} strokeWidth="5" />
        <ellipse cx="46" cy="27" rx="19" ry="17" fill="none" stroke={front} strokeWidth="2.6" />
        <ellipse cx="45.4" cy="26.4" rx="19" ry="17" fill="none" stroke="var(--kz3-c)" strokeOpacity=".45" strokeWidth="1" />
        <circle cx="28" cy="28" r="3" fill={orb} />
        <circle cx="66" cy="28" r="3" fill={orb} />
        <g stroke="var(--kz3-a)" strokeOpacity=".7" strokeWidth="1.8" strokeLinecap="round">
          <path d="M30.5 21 35 23" />
          <path d="M63.5 21 59 23" />
          <path d="M31 36 37 39" />
          <path d="M63 36 57 39" />
        </g>
        <rect x="43.5" y="52" width="7" height="16" fill={front} />
        <path d="M50.5 52 54 48.5v16l-3.5 3.5Z" fill={side} />
        <path d={barrel} fill={side} stroke="var(--kz3-a)" strokeOpacity=".5" />
        <path d="M37 36v14c0 2.1 4 3.8 9 4V36Z" fill={front} />
        <ellipse cx="47" cy="36" rx="10" ry="4" fill={top} />
        <path d={barrel} fill={texture} opacity=".5" />
        <path d="M37 41a10 4 0 0 0 20 0M37 47a10 4 0 0 0 20 0" fill="none" stroke="var(--kz3-c)" strokeOpacity=".32" />
        <circle cx="42" cy="45" r="1.8" fill="var(--kz3-c)" />
        <circle cx="47" cy="25" r="13" fill={side} />
        <path d="M47 12a13 13 0 0 0 0 26Z" fill={front} />
        <path d={cap} fill={top} />
        <path d={cap} fill={`url(#${id}-spec)`} opacity=".55" />
        <circle cx="47" cy="25" r="10" fill={cavity} opacity=".55" />
        <circle cx="47" cy="25" r="10" fill="none" stroke="var(--kz3-a)" strokeOpacity=".5" />
        <g fill="none" stroke="var(--kz3-c)" strokeOpacity=".45" strokeWidth=".9">
          <ellipse cx="47" cy="25" rx="3.5" ry="10" />
          <ellipse cx="47" cy="25" rx="7" ry="10" />
          <path d="M47 15v20" />
          <path d="M38.1 20.5a8.9 3.2 0 0 0 17.8 0" />
          <path d="M37 25a10 3.5 0 0 0 20 0" />
          <path d="M38.1 29.5a8.9 3.2 0 0 0 17.8 0" />
        </g>
        <circle {...edge(id, 0.65)} cx="47" cy="25" r="13" />
        <path d="M17 70 24 63h50l-7 7Z" fill={top} />
        <path d="M67 70 74 63v9.5l-7 7Z" fill={side} />
        <rect x="17" y="70" width="50" height="9.5" rx="3.5" fill={front} />
        <path d="M21 75.5h42" stroke="var(--kz3-c)" strokeOpacity=".28" />
        <path {...edge(id, 0.5)} d="M17 70 24 63h50l-7 7Z" />
        <rect {...edge(id, 0.7)} x="17" y="70" width="50" height="9.5" rx="3.5" />
      </g>
    );
  }

  if (kind === "gear") {
    const spec = `url(#${id}-spec)`;
    const cavity = `url(#${id}-cavity)`;
    const cog = (cx: number, cy: number, tipR: number, rootR: number, teeth: number, phase = 0) => {
      const step = 360 / teeth;
      const p = (radius: number, deg: number) => {
        const angle = ((deg + phase) * Math.PI) / 180;
        return `${(cx + Math.cos(angle) * radius).toFixed(1)} ${(cy + Math.sin(angle) * radius).toFixed(1)}`;
      };
      return `${Array.from({ length: teeth }, (_, index) => {
        const a = index * step - 90;
        return `${index ? "L" : "M"}${p(tipR, a - step * 0.2)}L${p(tipR, a + step * 0.2)}L${p(rootR, a + step * 0.3)}L${p(rootR, a + step * 0.7)}`;
      }).join("")}Z`;
    };
    const bigCog = cog(44, 51, 28, 21.5, 10);
    const smallCog = cog(69, 26.5, 13, 9.4, 8, 22);
    const bolts = [45, 135, 225, 315];
    return (
      <g filter={`url(#${id}-shadow)`}>
        <path d={smallCog} fill={side} transform="translate(2 4)" />
        <path d={smallCog} fill={top} opacity=".45" transform="translate(-1 -1.5)" />
        <path d={smallCog} fill={front} opacity=".8" />
        <path d={smallCog} fill={cavity} opacity=".28" />
        <path d={smallCog} {...edge(id, 0.45)} />
        <circle cx="69" cy="26.5" r="4.4" fill={cavity} />
        <circle cx="69" cy="26.5" r="4.4" fill="none" stroke="var(--kz3-a)" strokeOpacity=".5" />
        <path d={bigCog} fill={side} transform="translate(2 5)" />
        <path d={bigCog} fill={top} transform="translate(-1.5 -2.5)" />
        <path d={bigCog} fill={front} />
        <path d={bigCog} fill={texture} opacity=".5" />
        <path d={bigCog} {...edge(id)} />
        <circle cx="44" cy="51" r="21.5" fill={spec} opacity=".5" stroke="var(--kz3-c)" strokeOpacity=".4" />
        {bolts.map((deg) => {
          const angle = (deg * Math.PI) / 180;
          const bx = +(44 + Math.cos(angle) * 14.6).toFixed(1);
          const by = +(51 + Math.sin(angle) * 14.6).toFixed(1);
          return (
            <g key={deg}>
              <circle cx={bx} cy={by} r="3.8" fill={cavity} />
              <circle cx={bx} cy={by} r="3.8" fill="none" stroke="var(--kz3-a)" strokeOpacity=".45" />
            </g>
          );
        })}
        <circle cx="42.5" cy="49" r="11" fill={top} opacity=".7" />
        <circle cx="44" cy="51" r="11" fill={front} stroke="var(--kz3-a)" strokeOpacity=".55" />
        <circle cx="44" cy="51" r="6" fill={cavity} />
        <circle cx="44" cy="51" r="6" {...edge(id, 0.6)} />
        <circle cx="42.2" cy="49.2" r="2.1" fill="var(--kz3-c)" opacity=".5" />
      </g>
    );
  }

  if (kind === "flask") {
    const spec = `url(#${id}-spec)`;
    const cavity = `url(#${id}-cavity)`;
    const body = "M38.5 34C37 45 26 65 20 75A27 6.5 0 0 0 74 75C68 65 57 45 55.5 34Z";
    const liquid = "M29.5 58A17.5 4.5 0 0 0 64.5 58C68 65 70.5 71 72.5 74.5A25.5 6 0 0 1 21.5 74.5C23.5 71 26 65 29.5 58Z";
    return (
      <g filter={`url(#${id}-shadow)`}>
        <path d={body} fill={side} opacity=".5" transform="translate(3 4)" />
        <path d={body} fill="var(--bg)" opacity=".6" />
        <path d={body} fill={front} opacity=".42" />
        <path d={body} fill={texture} opacity=".45" />
        <path d="M55.5 34C57 45 68 65 74 75L69.5 75C63.5 65 52.5 45 51 34Z" fill={side} opacity=".9" />
        <path d={liquid} fill={orb} opacity=".95" />
        <path d={liquid} fill="var(--kz3-c)" opacity=".2" />
        <ellipse cx="47" cy="58" rx="17.5" ry="4.5" fill={top} opacity=".92" />
        <ellipse cx="47" cy="58" rx="17.5" ry="4.5" {...edge(id, 0.55)} />
        <circle cx="41" cy="67" r="2.4" fill={orb} opacity=".9" />
        <circle cx="52.5" cy="70.5" r="1.7" fill={orb} opacity=".8" />
        <circle cx="45.5" cy="63.5" r="1.3" fill={orb} opacity=".85" />
        <path d="M38.5 34C37 45 26 65 20 75L24.5 75C30.5 65 41.5 45 43 34Z" fill={front} opacity=".85" />
        <path d="M31 63h6M29 68h6M27 73h6" stroke="var(--kz3-c)" strokeOpacity=".5" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M38.5 34C37 45 26 65 20 75" fill="none" stroke="white" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" />
        <path d="M55.5 34C57 45 68 65 74 75" fill="none" stroke={cavity} strokeOpacity=".8" strokeWidth="2.2" strokeLinecap="round" />
        <path d={body} fill={spec} opacity=".5" />
        <path d={body} {...edge(id)} />
        <path d="M38.5 15V34H47V15Z" fill={front} />
        <path d="M47 15V34H55.5V15Z" fill={side} />
        <ellipse cx="47" cy="30" rx="10.5" ry="3.8" fill={side} />
        <ellipse cx="47" cy="28" rx="10.5" ry="3.8" fill={top} opacity=".9" stroke="var(--kz3-c)" strokeOpacity=".45" />
        <ellipse cx="47" cy="15" rx="8.5" ry="3.2" fill={top} />
        <ellipse cx="47" cy="15.6" rx="6" ry="2.1" fill={cavity} />
        <ellipse cx="47" cy="15" rx="8.5" ry="3.2" {...edge(id, 0.6)} />
      </g>
    );
  }

  if (kind === "rocket") {
    const spec = `url(#${id}-spec)`;
    const cavity = `url(#${id}-cavity)`;
    const tubeLit = "M35 28V55A13 5 0 0 0 52 59.8V28Z";
    const tubeShade = "M52 28V59.8A13 5 0 0 0 61 55V28Z";
    return (
      <g filter={`url(#${id}-shadow)`}>
        <path d="M60 45C62 53 67 61 75 68L69 71C65 67 61 62 59 57Z" fill={side} />
        <path d={tubeShade} fill={side} />
        <path d={tubeLit} fill={front} />
        <path d={tubeLit} fill={texture} opacity=".45" />
        <path d={tubeLit} fill={spec} opacity=".5" />
        <path d="M35 51A13 5 0 0 0 61 51" fill="none" stroke="var(--kz3-a)" strokeOpacity=".45" />
        <path d="M36 45C34 53 29 62 21 69L28 72C32 68 36 63 37.5 57Z" fill={front} />
        <path d="M36 45C34 53 29 62 21 69L23.5 70.2C29.5 63 34 54 36.3 46.5Z" fill={top} opacity=".8" />
        <circle cx="45" cy="44.5" r="7.8" fill={side} />
        <circle cx="45" cy="44.5" r="6.2" fill={cavity} />
        <circle cx="45" cy="44.5" r="5" fill={orb} />
        <path d="M41.5 42.5a4.5 4.5 0 0 1 4.3-2.5" fill="none" stroke="white" strokeOpacity=".7" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="45" cy="44.5" r="7.8" {...edge(id, 0.55)} />
        <path d="M35 28A13 5 0 0 0 61 28L61 31A13 5 0 0 1 35 31Z" fill={top} opacity=".9" />
        <path d="M48 11C53 18 58 23 61 28A13 5 0 0 1 52 32.8Z" fill={front} />
        <path d="M48 11C43 18 38 23 35 28A13 5 0 0 0 52 32.8Z" fill={top} />
        <path d="M48 11C43 18 38 23 35 28V55A13 5 0 0 0 61 55V28C58 23 53 18 48 11" {...edge(id)} />
        <path d="M35 55A13 5 0 0 0 61 55L58 66A11 4.5 0 0 1 38 66Z" fill={side} />
        <path d="M35 55A13 5 0 0 0 48 60V70.5A11 4.5 0 0 1 38 66Z" fill={front} />
        <ellipse cx="48" cy="66" rx="8" ry="3" fill={cavity} />
        <ellipse cx="48" cy="65.5" rx="6" ry="2.2" fill={orb} />
        <path d="M39 65.5A9 3.6 0 0 0 57 65.5C57 74 52.5 81 48 86C43.5 81 39 74 39 65.5Z" fill="var(--kz3-a)" opacity=".58" />
        <path d="M42.5 66A5.5 2.2 0 0 0 53.5 66C53.5 72 51 77 48 81C45 77 42.5 72 42.5 66Z" fill="var(--kz3-c)" opacity=".7" />
        <path d="M44.8 66.4A3.2 1.4 0 0 0 51.2 66.4C51.2 70 49.5 73.5 48 76C46.5 73.5 44.8 70 44.8 66.4Z" fill={top} opacity=".95" />
      </g>
    );
  }

  if (kind === "globe") {
    const spec = `url(#${id}-spec)`;
    const cavity = `url(#${id}-cavity)`;
    const landA = "M35.5 36.5c4-4.5 10.5-5.5 14-2.5s-1 7 1.5 9.5-3 7.5-8 6.5-9.5-3.5-10-7 .5-5 2.5-6.5Z";
    const landB = "M40 56c5-2 9 0 10 4s-2 8-6 9-8-2-8-6 1-6 4-7Z";
    return (
      <g filter={`url(#${id}-shadow)`}>
        <ellipse cx="48" cy="52" rx="38" ry="13.5" fill="none" stroke={side} strokeWidth="3.4" transform="rotate(-20 48 52)" />
        <ellipse cx="48" cy="52" rx="38" ry="13.5" fill="none" stroke="var(--kz3-b)" strokeOpacity=".45" strokeWidth="1.1" transform="rotate(-20 48 52)" />
        <circle cx="48" cy="48" r="26" fill={side} transform="translate(3 4)" />
        <circle cx="48" cy="48" r="26" fill={orb} />
        <circle cx="48" cy="48" r="26" fill={texture} opacity=".45" />
        <path d={landA} fill="var(--kz3-b)" opacity=".62" />
        <path d={landA} fill="none" stroke="var(--kz3-c)" strokeOpacity=".5" strokeWidth=".9" />
        <path d={landB} fill="var(--kz3-b)" opacity=".5" />
        <path d={landB} fill="none" stroke="var(--kz3-c)" strokeOpacity=".4" strokeWidth=".9" />
        <g transform="rotate(-18 48 48)">
          <ellipse cx="48" cy="29.2" rx="16.7" ry="5.5" fill={top} opacity=".8" />
          <ellipse {...edge(id, 0.5)} cx="48" cy="29.2" rx="16.7" ry="5.5" />
          <path d="M48 23.7A16.7 5.5 0 0 0 48 34.7M48 28.3A22.5 7.4 0 0 0 48 43.1M48 39.5A26 8.5 0 0 0 48 56.5M48 52.9A22.5 7.4 0 0 0 48 67.7" fill="none" stroke="var(--kz3-c)" strokeOpacity=".55" strokeWidth="1.1" />
          <path d="M48 23.7A16.7 5.5 0 0 1 48 34.7M48 28.3A22.5 7.4 0 0 1 48 43.1M48 39.5A26 8.5 0 0 1 48 56.5M48 52.9A22.5 7.4 0 0 1 48 67.7" fill="none" stroke="var(--kz3-b)" strokeOpacity=".3" strokeWidth="1" />
          <path d="M48 23.4V72.6M48 23.4A14 24.6 0 0 0 48 72.6M48 23.4A23 24.6 0 0 0 48 72.6" fill="none" stroke="var(--kz3-c)" strokeOpacity=".5" strokeWidth="1.1" />
          <path d="M48 23.4A14 24.6 0 0 1 48 72.6M48 23.4A23 24.6 0 0 1 48 72.6" fill="none" stroke="var(--kz3-b)" strokeOpacity=".28" strokeWidth="1" />
        </g>
        <path d="M67.9 31.3A26 26 0 0 1 28.1 64.7A46 40 0 0 0 67.9 31.3Z" fill={cavity} opacity=".55" />
        <path d="M23.6 39.1A26 26 0 0 1 64.7 28.1A40 34 0 0 0 23.6 39.1Z" fill={spec} opacity=".9" />
        <path {...edge(id, 0.85)} strokeWidth="1.6" d="M23.6 39.1A26 26 0 0 1 64.7 28.1" />
        <circle {...edge(id)} cx="48" cy="48" r="26" />
        <path d="M83.7 39A38 13.5 -20 0 1 12.3 65" fill="none" stroke={top} strokeWidth="3" strokeLinecap="round" />
        <path d="M75.7 48.6h-4M84.1 48.6h3.4" stroke="var(--kz3-a)" strokeOpacity=".85" strokeWidth="2" strokeLinecap="round" />
        <circle cx="79.9" cy="48.6" r="4.2" fill={orb} />
        <circle cx="79.9" cy="48.6" r="4.2" fill="none" stroke="var(--kz3-c)" strokeOpacity=".6" />
      </g>
    );
  }

  if (kind === "satellite") {
    const spec = `url(#${id}-spec)`;
    const cavity = `url(#${id}-cavity)`;
    return (
      <g filter={`url(#${id}-shadow)`}>
        <path d="M57 40.9 84 32.8v7L57 47.9Z" fill={front} opacity=".62" />
        <path d="M57 47.9 84 39.8v7L57 54.9Z" fill={side} />
        <path d="M57 54.9 84 46.8v3L57 57.9Z" fill={side} opacity=".85" />
        <path d="M64 38.8v14M71 36.7v14M78 34.6v14M57 44.4 84 36.3M57 51.4 84 43.3" fill="none" stroke="var(--kz3-c)" strokeOpacity=".34" strokeWidth=".9" />
        <path d="M57 40.9 84 32.8v14L57 54.9Z" fill="none" stroke="var(--kz3-b)" strokeOpacity=".5" />
        <rect x="36" y="40" width="31" height="30" rx="3" fill={side} transform="translate(3 4)" />
        <path d="M36 40 43 33h24l-7 7Z" fill={top} />
        <path d="M60 40 67 33v30l-7 7Z" fill={side} />
        <path {...edge(id, 0.55)} d="M36 40 43 33h24l-7 7Z" />
        <rect x="36" y="40" width="24" height="30" rx="3" fill={front} stroke="var(--kz3-a)" strokeOpacity=".6" />
        <rect x="36" y="40" width="24" height="30" rx="3" fill={texture} opacity=".5" />
        <rect x="39" y="44" width="18" height="12" rx="2" fill={cavity} />
        <path d="M42 47.5h12M42 50.5h12M42 53.5h8" stroke="var(--kz3-c)" strokeOpacity=".55" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="55.5" cy="53.5" r="1.6" fill="var(--kz3-c)" />
        <path d="M36 60h24" stroke="var(--kz3-a)" strokeOpacity=".45" />
        <circle cx="40" cy="65" r="2.2" fill={orb} />
        <circle cx="47" cy="65" r="2.2" fill={orb} />
        <path {...edge(id, 0.6)} d="M36 70V40l7-7h24v30l-7 7Z" />
        <path d="M12 54.4 39 46.3v7L12 61.4Z" fill={front} />
        <path d="M12 61.4 39 53.3v7L12 68.4Z" fill={side} />
        <path d="M12 68.4 39 60.3v3L12 71.4Z" fill={side} opacity=".85" />
        <path d="M19 52.3v14M26 50.2v14M33 48.1v14M12 57.9 39 49.8M12 64.9 39 56.8" fill="none" stroke="var(--kz3-c)" strokeOpacity=".5" strokeWidth=".9" />
        <path d="M12 54.4 39 46.3v7L12 61.4Z" fill={spec} opacity=".7" />
        <path {...edge(id, 0.7)} d="M12 54.4 39 46.3v14L12 68.4Z" />
        <path d="M51 38 46 25" stroke="var(--kz3-b)" strokeWidth="4.2" strokeLinecap="round" />
        <path d="M49.7 37.6 44.7 24.6" stroke="var(--kz3-c)" strokeOpacity=".7" strokeWidth="1.3" strokeLinecap="round" />
        <g transform="rotate(-28 44 22)">
          <ellipse cx="46.4" cy="24.6" rx="13" ry="8" fill={side} />
          <ellipse cx="44" cy="22" rx="13" ry="8" fill={cavity} />
          <ellipse cx="44.3" cy="22.9" rx="11.6" ry="7" fill={top} opacity=".55" />
          <ellipse cx="44.8" cy="23.9" rx="9.4" ry="5.4" fill={cavity} />
          <ellipse cx="44.8" cy="23.9" rx="6" ry="3.4" fill="none" stroke="var(--kz3-c)" strokeOpacity=".4" strokeWidth="1" />
          <ellipse cx="44" cy="22" rx="13" ry="8" fill="none" stroke="var(--kz3-c)" strokeOpacity=".5" strokeWidth="1.2" />
          <ellipse {...edge(id, 0.8)} cx="44" cy="22" rx="13" ry="8" />
        </g>
        <path d="M40.3 14.9 53.5 15" stroke="var(--kz3-a)" strokeOpacity=".6" strokeWidth="1.1" />
        <path d="M44 22 52 16" stroke="var(--kz3-a)" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="53.5" cy="15" r="3.2" fill={orb} />
        <path d="M60.4 10.9A8 8 0 0 1 60.4 19.1" fill="none" stroke="var(--kz3-c)" strokeOpacity=".85" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M65 8.9A13 13 0 0 1 65 21.1" fill="none" stroke="var(--kz3-c)" strokeOpacity=".55" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M70.4 8.8A18 18 0 0 1 70.4 21.2" fill="none" stroke="var(--kz3-c)" strokeOpacity=".32" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    );
  }

  if (kind === "lock") {
    const spec = `url(#${id}-spec)`;
    const cavity = `url(#${id}-cavity)`;
    const shackle = "M35 48V30a16 16 0 0 1 32 0v18h-8V30a8 8 0 0 0-16 0v18Z";
    const shackleLit = "M35 48V30a16 16 0 0 1 32 0v18h-3V30a13 13 0 0 0-26 0v18Z";
    return (
      <g filter={`url(#${id}-shadow)`}>
        <path d={shackle} fill={side} transform="translate(3 4)" />
        <path d={shackle} fill={front} />
        <path d={shackleLit} fill={top} opacity=".72" />
        <path d={shackleLit} fill={spec} opacity=".85" />
        <path d="M43 48V30a8 8 0 0 1 16 0v18h3V30a11 11 0 0 0-22 0v18Z" fill={side} opacity=".92" />
        <path {...edge(id, 0.6)} d="M35 44V30a16 16 0 0 1 32 0v14" />
        <rect x="26" y="44" width="51" height="34" rx="6" fill={side} transform="translate(3 4)" />
        <path d="M26 44 33 37h44l-7 7Z" fill={top} />
        <path d="M70 44 77 37v34l-7 7Z" fill={side} />
        <ellipse cx="39" cy="40.6" rx="4.5" ry="2" fill={cavity} />
        <ellipse cx="63" cy="40.6" rx="4.5" ry="2" fill={cavity} />
        <path d="M35 37h8v3.6h-8ZM59 37h8v3.6h-8Z" fill="var(--kz3-b)" opacity=".85" />
        <path d="M35.6 37v3.6M59.6 37v3.6" stroke="var(--kz3-c)" strokeOpacity=".75" strokeWidth="1.1" />
        <path d="M42.4 37v3.6M66.4 37v3.6" stroke={side} strokeWidth="1.4" />
        <path d="M34.5 40.6A4.5 2 0 0 1 43.5 40.6ZM58.5 40.6A4.5 2 0 0 1 67.5 40.6Z" fill={cavity} />
        <path d="M34.5 40.6A4.5 2 0 0 0 43.5 40.6M58.5 40.6A4.5 2 0 0 0 67.5 40.6" fill="none" stroke="var(--kz3-c)" strokeOpacity=".55" />
        <path {...edge(id, 0.55)} d="M26 44 33 37h44l-7 7Z" />
        <rect x="26" y="44" width="44" height="34" rx="6" fill={front} stroke="var(--kz3-a)" strokeOpacity=".6" />
        <rect x="26" y="44" width="44" height="34" rx="6" fill={texture} opacity=".5" />
        <rect x="29.5" y="47.5" width="37" height="27" rx="4" fill="none" stroke="var(--kz3-a)" strokeOpacity=".3" />
        <rect x="38" y="48" width="20" height="26" rx="9" fill={cavity} />
        <rect x="38" y="48" width="20" height="26" rx="9" fill="none" stroke="var(--kz3-a)" strokeOpacity=".35" />
        <circle cx="48" cy="57" r="5" fill="var(--bg)" opacity=".88" />
        <path d="M45.4 60.5 43.4 70h9.2l-2-9.5Z" fill="var(--bg)" opacity=".88" />
        <circle cx="48" cy="57" r="5" fill="none" stroke="var(--kz3-c)" strokeOpacity=".7" strokeWidth="1.2" />
        <path d="M45.4 60.5 43.4 70h9.2l-2-9.5" fill="none" stroke="var(--kz3-c)" strokeOpacity=".5" strokeWidth="1.1" strokeLinejoin="round" />
        <circle cx="31.5" cy="73" r="2.4" fill={orb} />
        <circle cx="64.5" cy="73" r="2.4" fill={orb} />
        <path {...edge(id, 0.65)} d="M26 78V44l7-7h44v34l-7 7Z" />
      </g>
    );
  }

  if (kind === "power") {
    const cav = `url(#${id}-cavity)`;
    const spec = `url(#${id}-spec)`;
    const face = "M20 36h46v44H20Z";
    const plate = "M25.7 31.4 31 26.2h37.7l-5.2 5.2Z";
    const bolt = "M48 42 34 59h9.5l-4 13L53 55.5h-10z";
    return (
      <g filter={`url(#${id}-shadow)`}>
        <path d="M20 36 30 26h46v44l-10 10H20Z" fill={side} transform="translate(4 5)" />
        <path d="M20 36 30 26h46l-10 10Z" fill={top} />
        <path d="M66 36 76 26v44l-10 10Z" fill={side} />
        <path d="M67.5 43 74.5 36v3.6l-7 7Z" fill="var(--kz3-a)" opacity=".5" />
        {[51, 59, 67].map((y) => (
          <path key={y} d={`M67.5 ${y} 74.5 ${y - 7}v3.6l-7 7Z`} fill={cav} />
        ))}
        <path d={face} fill={front} />
        <path d={face} fill={texture} opacity=".5" />
        <path d={face} fill={spec} opacity=".4" />
        <path d="M20.8 37.3h44.4" fill="none" stroke="var(--kz3-c)" strokeOpacity=".32" strokeWidth="1.2" strokeLinecap="round" />
        <rect x="25" y="39" width="18" height="6.5" rx="2" fill="var(--bg)" opacity=".55" />
        <rect x="25" y="39" width="18" height="6.5" rx="2" fill={cav} />
        <rect x="27.5" y="40.7" width="13" height="3.1" rx="1.5" fill="var(--kz3-a)" opacity=".75" />
        <circle cx="56" cy="42.5" r="4.6" fill={cav} />
        <circle cx="56" cy="42.5" r="3.2" fill={orb} />
        <rect x="25" y="49.5" width="36" height="14" rx="3" fill="var(--bg)" opacity=".8" />
        <rect x="25" y="49.5" width="36" height="14" rx="3" fill={cav} />
        {[26.5, 33.4, 40.3, 47.2, 54.1].map((sx, i) => (
          <rect key={sx} x={sx} y="52" width="5.4" height="9" rx="1.4" fill={i < 3 ? "var(--kz3-c)" : "var(--kz3-a)"} opacity={i < 3 ? 0.92 : 0.3} />
        ))}
        <rect {...edge(id, 0.55)} x="25" y="49.5" width="36" height="14" rx="3" />
        {[25, 49].map((vx) => (
          <g key={vx}>
            <rect x={vx} y="65.5" width="12" height="8.5" rx="2.4" fill="var(--bg)" opacity=".5" />
            <rect x={vx} y="65.5" width="12" height="8.5" rx="2.4" fill={cav} />
            {[1.5, 5, 8.5].map((dx) => (
              <rect key={dx} x={vx + dx} y="67" width="2.2" height="5.5" rx="1.1" fill="var(--kz3-a)" opacity=".45" />
            ))}
          </g>
        ))}
        <rect x="20" y="76" width="46" height="4" fill={side} />
        <path d="M66 76 76 66v4l-10 10Z" fill={cav} />
        <path d="M20.8 76h44.4" fill="none" stroke="var(--kz3-c)" strokeOpacity=".25" strokeWidth="1.2" strokeLinecap="round" />
        <path d={bolt} fill="var(--bg)" stroke="var(--bg)" strokeWidth="3.2" strokeLinejoin="round" opacity=".78" />
        <path d={bolt} fill="var(--kz3-b)" opacity=".85" transform="translate(1.6 1.8)" />
        <path d={bolt} fill="var(--kz3-c)" />
        <path {...edge(id)} d="M20 36 30 26h46v44l-10 10H20ZM20 36h46v44M66 36 76 26" />
        <path d="M25.7 31.4h37.8v3H25.7Z" fill={front} />
        <path d="M63.5 31.4 68.7 26.2v3l-5.2 5.2Z" fill={side} />
        <path d={plate} fill={top} />
        <path d={plate} fill="var(--kz3-a)" opacity=".18" />
        <path d="M32.4 27.3h35.2" fill="none" stroke="var(--kz3-c)" strokeOpacity=".3" strokeWidth="1" strokeLinecap="round" />
        <path {...edge(id, 0.65)} d={plate} />
        {[38, 56.5].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy="28.8" rx="5.6" ry="2.5" fill={cav} />
            <path d={`M${cx - 5} 21.8v7a5 2.6 0 0 0 10 0v-7Z`} fill={front} />
            <path d={`M${cx} 21.8h5v7a5 2.6 0 0 1-5 2.6Z`} fill={side} />
            <ellipse cx={cx} cy="21.8" rx="5" ry="2.6" fill={orb} stroke="var(--kz3-b)" strokeOpacity=".55" strokeWidth="1" />
            <ellipse cx={cx} cy="21.8" rx="2.3" ry="1.2" fill="var(--kz3-c)" opacity=".78" />
          </g>
        ))}
      </g>
    );
  }

  if (kind === "server") {
    const cav = `url(#${id}-cavity)`;
    const bays = [28, 41, 54, 67];
    const rackHoles = [30, 39, 48, 57, 66, 75];
    const lidSlats = [42, 46, 50, 54, 58, 62];
    const sideSlats = [30, 37, 44, 51, 58, 65];
    return (
      <g filter={`url(#${id}-shadow)`}>
        <rect x="18" y="26" width="52" height="54" rx="3" fill={side} transform="translate(4 4)" />
        <path d="M16 80 24 72h56l-8 8Z" fill={top} />
        <path d="M72 80 80 72v4l-8 8Z" fill={side} />
        <rect x="16" y="80" width="56" height="4" rx="1" fill={front} />
        <path d="M17.6 81h52.8" fill="none" stroke="var(--bg)" strokeOpacity=".5" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M17.6 82.8h52.8" fill="none" stroke="white" strokeOpacity=".14" strokeWidth="1" strokeLinecap="round" />
        <path d="M18 24 26 16h52l-8 8Z" fill={top} />
        <path d="M21.2 22.8 26.8 17.2h48l-5.6 5.6Z" fill="none" stroke="white" strokeOpacity=".18" strokeWidth="1" />
        <path d="M40 22 44 18h24l-4 4Z" fill={cav} />
        <path d="M40 22 44 18h24l-4 4Z" fill={texture} opacity=".5" />
        {lidSlats.map((x) => (
          <path key={x} d={`M${x} 22l4-4`} fill="none" stroke="var(--kz3-c)" strokeOpacity=".42" strokeWidth="1.2" strokeLinecap="round" />
        ))}
        <path d="M70 24 78 16v56l-8 8Z" fill={side} />
        <path d="M71.2 27.2 76.8 21.6v46l-5.6 5.6Z" fill={cav} opacity=".45" />
        {sideSlats.map((y) => (
          <path key={y} d={`M71.2 ${y}l5.6-5.6`} fill="none" stroke="var(--kz3-a)" strokeOpacity=".7" strokeWidth="1.2" strokeLinecap="round" />
        ))}
        <path d="M77.4 17.4v54.4" fill="none" stroke="white" strokeOpacity=".16" strokeWidth="1" />
        <rect x="18" y="24" width="52" height="56" rx="2" fill={front} stroke="var(--kz3-a)" strokeOpacity=".55" />
        <path d="M70 25v54" fill="none" stroke="white" strokeOpacity=".2" strokeWidth="1" />
        <rect x="18.8" y="26.6" width="5.2" height="51.2" rx="1.4" fill={cav} opacity=".55" />
        <rect x="64" y="26.6" width="5.2" height="51.2" rx="1.4" fill={cav} opacity=".55" />
        <path d="M68.6 28v48.4" fill="none" stroke="white" strokeOpacity=".14" strokeWidth="1" />
        {rackHoles.map((y) => (
          <rect key={y} x="20" y={y} width="2.2" height="2.2" rx=".6" fill="var(--bg)" opacity=".85" />
        ))}
        <rect x="26.4" y="24.6" width="13.6" height="2.6" rx="1.3" fill="var(--kz3-c)" opacity=".78" />
        <circle cx="59.8" cy="25.9" r="1.7" fill="none" stroke="var(--kz3-c)" strokeOpacity=".9" strokeWidth="1" />
        {bays.map((y) => (
          <g key={y} transform={`translate(0 ${y})`}>
            <rect x="24.8" y="0" width="38.4" height="11" rx="1.6" fill="var(--bg)" opacity=".3" />
            <rect x="24.8" y="0" width="38.4" height="11" rx="1.6" fill={cav} opacity=".45" />
            <path d="M25.8 .9h36.4" fill="none" stroke="white" strokeOpacity=".2" strokeWidth="1" strokeLinecap="round" />
            <rect x="27.4" y="2.4" width="17.6" height="6.4" rx=".8" fill={cav} />
            <path d="M28.6 4h15.2M28.6 6h15.2M28.6 8h15.2" fill="none" stroke="var(--kz3-a)" strokeOpacity=".75" strokeWidth="1.1" strokeLinecap="round" />
            <rect x="48.2" y="2.8" width="9.4" height="5.4" rx="1.4" fill={front} />
            <path d="M49.2 3.7h7.4" fill="none" stroke="white" strokeOpacity=".24" strokeWidth="1" strokeLinecap="round" />
            <path d="M48.6 8.7h8.6" fill="none" stroke="var(--bg)" strokeOpacity=".45" strokeWidth="1" strokeLinecap="round" />
            <circle cx="60.6" cy="5.5" r="1.3" fill="var(--kz3-c)" />
          </g>
        ))}
        <rect x="18" y="24" width="52" height="56" rx="2" fill={`url(#${id}-spec)`} opacity=".22" />
        {bays.map((y) => (
          <g key={y} transform={`translate(0 ${y})`}>
            <circle cx="66.6" cy="3.2" r="1.4" fill="var(--kz3-c)" />
            <circle cx="66.6" cy="7.6" r="1.4" fill="var(--kz3-a)" opacity=".85" />
          </g>
        ))}
        <path {...edge(id, 0.5)} d="M23.6 27.6h40.8v50.8H23.6Z" />
        <path {...edge(id)} d="M18 24 26 16h52l-8 8Z" />
        <path {...edge(id)} d="M16 84v-4l2-2V24l8-8h52v56h2v4l-8 8Z" />
      </g>
    );
  }

  if (kind === "gpu") {
    const cav = `url(#${id}-cavity)`;
    const fins = [38, 44, 50, 56, 62, 68];
    const blades = [0, 60, 120, 180, 240, 300];
    const pins = [25, 28.5, 32, 35.5];
    const ports = ["M75 42 80 37v4l-5 5Z", "M75 49 80 44v4l-5 5Z", "M75 56 80 51v4l-5 5Z"];
    const vents = ["M75 62 80 57v3l-5 5Z", "M75 69 80 64v3l-5 5Z"];
    const fingers = [21, 24, 33.5, 37, 40.5, 44, 47.5, 51, 54];
    const smd: [number, number][] = [[22, 5], [29, 3], [50, 5], [57, 3]];
    return (
      <g filter={`url(#${id}-shadow)`}>
        <rect x="13" y="30" width="58" height="34" fill={side} transform="translate(4 4)" />
        <path d="M13 30 20 23h58l-7 7Z" fill={top} />
        <g fill="none" stroke="var(--kz3-b)" strokeOpacity=".5" strokeWidth="1.1" strokeLinecap="round">
          {fins.map((x) => (
            <path key={x} d={`M${x} 30 ${x + 7} 23`} />
          ))}
        </g>
        <path d="M13 30 20 23h58l-7 7Z" fill={`url(#${id}-spec)`} opacity=".45" />
        <path d="M71 30 78 23v34l-7 7Z" fill={side} />
        <rect x="13" y="30" width="58" height="34" fill={front} />
        <path {...edge(id)} d="M13 64V30l7-7h58v34l-7 7ZM13 30h58v34" />
        <rect x="14.6" y="40" width="3" height="14" rx="1.5" fill="var(--bg)" opacity=".7" />
        <rect x="14.6" y="40" width="3" height="14" rx="1.5" fill={cav} />
        <rect x="67" y="40" width="3" height="14" rx="1.5" fill="var(--bg)" opacity=".7" />
        <rect x="67" y="40" width="3" height="14" rx="1.5" fill={cav} />
        <path d="M22 21 26 17h16l-4 4Z" fill={top} />
        <path d="M38 21 42 17v7l-4 4Z" fill={side} />
        <rect x="22" y="21" width="16" height="7" fill={front} />
        <g fill="none" stroke={cav} strokeWidth="1.3" strokeLinecap="round">
          {pins.map((x) => (
            <path key={x} d={`M${x} 21 ${x + 4} 17`} />
          ))}
        </g>
        <path d="M22 28V21l4-4h16v7l-4 4Z" fill="none" stroke="var(--kz3-b)" strokeOpacity=".6" strokeWidth="1" />
        <path d="M19 36 22 33h44l-3 3Z" fill={top} />
        <path d="M63 36 66 33v22l-3 3Z" fill={side} />
        <rect x="19" y="36" width="44" height="22" fill={front} />
        <rect x="19" y="36" width="44" height="22" fill={texture} opacity=".5" />
        <path {...edge(id, 0.6)} d="M19 58V36l3-3h44v22l-3 3ZM19 36h44v22" />
        <path d="M20 59.4h42" fill="none" stroke="var(--bg)" strokeOpacity=".35" strokeWidth="1.6" strokeLinecap="round" />
        {[30, 52].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="47" r="9.2" fill="var(--bg)" opacity=".85" />
            <circle cx={cx} cy="47" r="9.2" fill={cav} />
            <g transform={`translate(${cx} 47)`}>
              {blades.map((a) => (
                <path key={a} transform={`rotate(${a})`} d="M2.6 -1.7 8.2 -3.2 8.2 1.5 3 2.5Z" fill="var(--kz3-a)" fillOpacity=".92" />
              ))}
            </g>
            <circle cx={cx} cy="47" r="3.2" fill="var(--kz3-c)" />
            <circle cx={cx} cy="47" r="1.2" fill="var(--bg)" fillOpacity=".7" />
            <circle cx={cx} cy="47" r="9.2" fill="none" stroke="var(--kz3-c)" strokeOpacity=".5" strokeWidth="1.1" />
          </g>
        ))}
        <g fill="none" strokeLinecap="round">
          <path d="M40.3 37.8v18.4" stroke="var(--kz3-b)" strokeOpacity=".55" strokeWidth="1.6" />
          <path d="M41.6 37.8v18.4" stroke="var(--kz3-c)" strokeOpacity=".3" strokeWidth="1" />
        </g>
        <g fill="var(--kz3-b)" fillOpacity=".6">
          {smd.map(([x, w]) => (
            <rect key={x} x={x} y="60" width={w} height="2.4" rx="1" />
          ))}
        </g>
        <path d="M56 64h3v4l-3 3Z" fill={side} />
        <rect x="18" y="64" width="38" height="7" fill="var(--kz3-c)" fillOpacity=".88" />
        <g fill="none" stroke="var(--bg)" strokeOpacity=".55" strokeWidth="1">
          {fingers.map((x) => (
            <path key={x} d={`M${x} 65.4V71`} />
          ))}
        </g>
        <rect x="27" y="65" width="3.5" height="6" fill="var(--bg)" opacity=".85" />
        <rect x="27" y="65" width="3.5" height="6" fill={cav} />
        <path d="M18 64.6h38" fill="none" stroke="var(--bg)" strokeOpacity=".4" strokeWidth="1.2" />
        <path d="M71 38 78 31h3l-7 7Z" fill={top} />
        <path d="M74 38 81 31v40l-7 7Z" fill={side} />
        <rect x="71" y="38" width="3" height="40" fill={front} />
        {ports.map((d) => (
          <g key={d}>
            <path d={d} fill="var(--bg)" opacity=".85" />
            <path d={d} fill={cav} stroke="var(--kz3-c)" strokeOpacity=".4" strokeWidth="1" />
          </g>
        ))}
        {vents.map((d) => (
          <g key={d}>
            <path d={d} fill="var(--bg)" opacity=".8" />
            <path d={d} fill={cav} />
          </g>
        ))}
        <path {...edge(id)} d="M71 38 78 31h3v40l-7 7h-3ZM74 38 81 31M74 38v40" />
      </g>
    );
  }

  return (
    <g filter={`url(#${id}-shadow)`}>
      <polygon points="48,10 82,29 48,48 14,29" fill={top} />
      <polygon points="14,29 48,48 48,86 14,66" fill={side} />
      <polygon points="48,48 82,29 82,66 48,86" fill={front} />
      <polygon points="48,48 82,29 82,66 48,86" fill={texture} opacity=".54" />
      <polygon points="48,10 82,29 48,48 14,29" fill={`url(#${id}-spec)`} opacity=".42" />
      <path d="M24 35 48 48l24-13M48 48v27M57 53l16-9M57 62l16-9" fill="none" stroke="var(--kz3-c)" strokeOpacity=".68" strokeWidth="1.5" />
      {/* Outer silhouette, then the three seams meeting at the near vertex —
          the fallback solid used to carry no stroke whatsoever. */}
      <path {...edge(id)} d="M48 10 82 29v37L48 86 14 66V29Z" />
      <path {...edge(id, 0.5)} d="M48 48 14 29M48 48l34-19M48 48v38" />
      <circle cx="48" cy="48" r="4" fill="var(--kz3-c)" />
    </g>
  );
}

export interface KzSpatialIcon3DProps {
  kind: KzSpatialKind;
  /** px when a number. A string is used verbatim, so a caller can pass a
      clamp() and let the object scale with the viewport instead of being
      pinned to one size across every breakpoint. */
  size?: number | string;
  float?: boolean;
  delay?: number;
  tone?: "cyan" | "violet" | "blue";
  className?: string;
  style?: CSSProperties;
  title?: string;
}

/** Textured vector geometry: visually 3D without a per-icon WebGL canvas. */
export function KzSpatialIcon3D({
  kind,
  size = 72,
  float = true,
  delay = 0,
  tone = "cyan",
  className = "",
  style,
  title,
}: KzSpatialIcon3DProps) {
  const id = `kz3-${useId().replace(/:/g, "")}`;

  return (
    <span
      className={`kz3-object ${className}`.trim()}
      data-float={float ? "true" : "false"}
      data-tone={tone}
      style={
        {
          "--kz3-size": typeof size === "number" ? `${size}px` : size,
          "--kz3-delay": `${delay}s`,
          ...style,
        } as KzVars
      }
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : "true"}
    >
      <KzSpatialStyles />
      <svg viewBox="0 0 96 96" focusable="false" aria-hidden="true">
        <defs>{spatialDefs(kind, id)}</defs>
        {geometry(kind, id)}
      </svg>
    </span>
  );
}

/* Both mappers are ordered MOST SPECIFIC FIRST and fall through to the last
   line. That ordering is load-bearing: a broad test placed early swallows every
   label a later, narrower test was written for.

   Before the kind set was widened these two functions were the reason the site
   looked like it had one 3D icon repeated. Every one of the eight industries,
   all six process steps and eight of the ten infrastructure cards fell past all
   the tests and returned "chip" — and in the technology atlas, three of eleven
   category cards resolved to the same neural orb. The geometry was never the
   problem; the routing to it was. */

export function kindForCategory(category: string): KzSpatialKind {
  /* Cloud before MLOps: /ops$/ matches "Cloud & DevOps" too, and testing it
     first sent two of the eleven cards to the same geometry. */
  if (/cloud|devops/i.test(category)) return "cloud";
  if (/mlops|ops$/i.test(category)) return "pipeline";
  if (/language/i.test(category)) return "code";
  /* The one category whose subject IS the geometry. */
  if (/frontend|3d|webgl/i.test(category)) return "cube";
  if (/ui|design|experience/i.test(category)) return "layers";
  if (/llm|agent/i.test(category)) return "neural";
  if (/ai|ml|model/i.test(category)) return "brain";
  if (/vector/i.test(category)) return "layers";
  if (/data|database/i.test(category)) return "database";
  if (/backend|api|server/i.test(category)) return "server";
  if (/security/i.test(category)) return "shield";
  if (/mobile/i.test(category)) return "mobile";
  return "chip";
}

export function kindForLabel(label: string): KzSpatialKind {
  /* Named tools first — these are exact and must not be caught by the
     thematic tests below. */
  if (/mobile|flutter|react native|pwa|progressive web/i.test(label)) return "mobile";
  if (/database|postgres|mysql|mongo|redis|elastic|\bsql\b/i.test(label)) return "database";
  if (/vector|faiss|pinecone|weaviate|milvus|pgvector|embedding|rag\b/i.test(label)) return "layers";
  if (/cloud|aws|azure|gcp|docker|kubernetes|terraform/i.test(label)) return "cloud";
  if (/pipeline|ci\/cd|workflow|airflow|actions|monitor|drift|registry|mlops/i.test(label)) return "pipeline";

  /* Hardware and the facility. */
  if (/gpu|cuda|nvidia|rtx|compute|inference|on-prem/i.test(label)) return "gpu";
  if (/power|\bups\b|generator|battery|continuity|uninterrupt|redundan/i.test(label)) return "power";
  if (/server|rack|nas|san\b|storage|hardware|workstation|data ?cent/i.test(label)) return "server";
  if (/network|connectiv|leased|failover|internet|bandwidth|mesh/i.test(label)) return "network";
  if (/satellite|relay|remote|distributed|edge/i.test(label)) return "satellite";

  /* Security splits: a posture is a shield, a control is a lock. */
  if (/cctv|biometric|access control|physical|vault|encrypt|secret|key/i.test(label)) return "lock";
  if (/security|oauth|sso|rbac|owasp|complian|govern|privacy|audit/i.test(label)) return "shield";

  /* People, places and practice. */
  if (/studio|media|voice|audio|podcast|\bpr\b|communicat|brand/i.test(label)) return "studio";
  if (/globe|world|global|location|kolkata|durgapur|public sector|sovereign|govern|industr/i.test(label)) return "globe";
  if (/research|discovery|feasib|experiment|\blab\b|prototype|r&d|health|clinic|pharma|science/i.test(label)) return "flask";
  if (/launch|deploy|release|ship|mvp|scale|growth|go.?live|startup/i.test(label)) return "rocket";
  if (/maintenance|automat|operat|manufactur|logistic|process|gear|tuning|optimi/i.test(label)) return "gear";
  if (/analytic|metric|report|forecast|dashboard|insight|finance|fintech|retail|commerce|revenue|kpi/i.test(label)) return "chart";
  if (/architect|stack|platform|erp|layer|system design|modul/i.test(label)) return "layers";
  if (/terminal|console|\bcli\b|shell|command|devtool|script/i.test(label)) return "terminal";

  /* Models and agents. */
  if (/agent|llm|fine.?tun|prompt|transformer|\bgpt\b|\bnlp\b|lang(chain|graph)/i.test(label)) return "neural";
  if (/educat|edtech|school|college|university|student|tutor|curricul|\blms\b/i.test(label)) return "brain";
  if (/brain|cognit|reason|intelligen|learning|training|neural|\bml\b|\bai\b/i.test(label)) return "brain";
  if (/robot|assistant|chatbot|conversat|speech/i.test(label)) return "robot";

  /* Languages and the web, last: these patterns are short and greedy. */
  if (/code|web|react|next|typescript|javascript|python|java|rust|\bgo\b|c\+\+|api|graphql|grpc|node|django|fastapi|nest|develop|engineer|build|sprint/i.test(label)) return "code";
  if (/test|\bqa\b|quality|debug|review/i.test(label)) return "terminal";
  if (/design|ux|\bui\b|interface|adaptive|three|webgl|gsap|tailwind/i.test(label)) return "layers";

  /* Section headings, last of all. These are prose, not labels, and the words
     below are common enough that testing them any earlier would hijack real
     technical strings — "value" inside a metrics label, "run" inside "runtime".
     Down here they only ever catch what nothing above claimed, which is what
     stopped eight of the site's seventeen section titles rendering the same
     silicon die. */
  if (/value|princip|belief|culture|ethos|honest|trust/i.test(label)) return "shield";
  if (/discipline|under one|one roof|together|whole team|end to end/i.test(label)) return "network";
  if (/deliver|handover|outcome|what we|ship/i.test(label)) return "rocket";
  if (/matter|benefit|impact|result|performer|portfolio|showcase/i.test(label)) return "chart";
  if (/apply|join|career|hiring|intern|opening/i.test(label)) return "flask";
  if (/engagement|contract|agreement|onboard|runs?|journey|programme/i.test(label)) return "gear";
  if (/related|explore|browse|more from|next step/i.test(label)) return "globe";

  /* Facility items with no technical reading take the neutral solid. A
     canteen drawn as a silicon die is worse than a canteen drawn as a box. */
  if (/accommodat|canteen|food|facility|staff|office|campus|welfare|resident/i.test(label)) return "cube";
  return "chip";
}

function monogram(name: string) {
  const special: Record<string, string> = {
    TypeScript: "TS",
    JavaScript: "JS",
    "C++": "C++",
    "scikit-learn": "SK",
    "Hugging Face": "HF",
    "React Three Fiber": "R3F",
    "GitHub Actions": "GH",
    "Progressive Web Apps": "PWA",
    "OAuth / SSO": "SSO",
    "OWASP practices": "OW",
    "CI/CD": "CI",
    "Model registry": "MR",
    "Drift detection": "DD",
    "Secrets management": "SM",
  };
  if (special[name]) return special[name];
  const compact = name.replace(/[^a-zA-Z0-9+]/g, "");
  if (compact.length <= 3) return compact.toUpperCase();
  const words = name.split(/[^a-zA-Z0-9+]+/).filter(Boolean);
  if (words.length > 1) return words.slice(0, 3).map((word) => word[0]).join("").toUpperCase();
  return compact.slice(0, 2).toUpperCase();
}

export function KzTechToken3D({
  name,
  category,
  size = 40,
}: {
  name: string;
  category: string;
  size?: number;
}) {
  const tone = Math.abs(
    Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  ) % 3;
  return (
    <span
      className="kz3-token"
      data-tone={tone}
      data-category={category}
      style={{ "--kz3-token-size": `${size}px` } as KzVars}
      aria-hidden="true"
    >
      <KzSpatialStyles />
      <svg viewBox="0 0 42 42" focusable="false">
        <path className="kz3-token-side" d="M31 11 37 6v25l-6 6Z" />
        <path className="kz3-token-top" d="M6 11 12 6h25l-6 5Z" />
        <rect className="kz3-token-face" x="5" y="11" width="26" height="26" rx="5" />
        <g className="kz3-token-grid" fill="none" strokeWidth=".55" opacity=".8">
          <path d="M9 16h18M9 22h18M9 28h18M12 14v19M19 14v19M26 14v19" />
        </g>
        <rect x="8" y="15" width="20" height="18" rx="4" fill="var(--bg)" opacity=".62" />
        <text x="18" y="27">{monogram(name)}</text>
        <circle cx="28" cy="14" r="1.35" fill="var(--kz3-token-b)" />
      </svg>
    </span>
  );
}

export function KzDecorPin({
  kind,
  label,
  size = 54,
  className = "",
  style,
  tone = "cyan",
}: {
  kind: KzSpatialKind;
  label: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
  tone?: "cyan" | "violet" | "blue";
}) {
  return (
    <span className={`kz3-pin ${className}`.trim()} style={style} aria-hidden="true">
      <KzSpatialIcon3D kind={kind} size={size} tone={tone} />
      <span className="kz3-pin-label">{label}</span>
    </span>
  );
}

/* The far object completes the trio without repeating either of the two the
   page already chose — a hero that shows `neural` twice reads as a mistake. */
function heroThird(primary: KzSpatialKind, secondary: KzSpatialKind): KzSpatialKind {
  const used = new Set([primary, secondary]);
  for (const candidate of ["cube", "layers", "network", "chip", "globe", "gear"] as const) {
    if (!used.has(candidate)) return candidate;
  }
  return "cube";
}

export function KzPageHeroScene({
  primary,
  secondary,
}: {
  primary: KzSpatialKind;
  secondary: KzSpatialKind;
}) {
  const third = heroThird(primary, secondary);
  const fourth = heroThird(primary, third);

  return (
    <div className="kz3-hero-scene" aria-hidden="true">
      <KzSpatialStyles />
      <span className="kz3-hero-wire" />
      <span className="kz3-hero-wire" />
      {/* cqw rather than a fixed px size, so the same composition holds in the
          250px hero column on a laptop and the full-width band on a phone. */}
      <KzSpatialIcon3D
        kind={primary}
        size="clamp(96px, 34cqw, 152px)"
        className="kz3-hero-primary"
        tone="blue"
      />
      <KzSpatialIcon3D
        kind={secondary}
        size="clamp(52px, 18cqw, 78px)"
        delay={-1.8}
        className="kz3-hero-secondary"
        tone="violet"
      />
      <KzSpatialIcon3D
        kind={third}
        size="clamp(38px, 13cqw, 58px)"
        delay={-3.1}
        className="kz3-hero-tertiary"
      />
      <KzSpatialIcon3D
        kind={fourth}
        size="clamp(24px, 8cqw, 36px)"
        delay={-4.4}
        className="kz3-hero-quaternary"
        tone="violet"
      />
    </div>
  );
}

export function KzTechAtlas3D({
  groups,
}: {
  groups: readonly (readonly [string, readonly string[]])[];
}) {
  return (
    <div className="kz3-atlas">
      <KzSpatialStyles />
      {groups.map(([category, tools], groupIndex) => (
        <article className="kz3-atlas-card" key={category}>
          <header className="kz3-atlas-head">
            <KzSpatialIcon3D
              kind={kindForCategory(category)}
              size={68}
              float={false}
              tone={groupIndex % 3 === 1 ? "violet" : groupIndex % 3 === 2 ? "blue" : "cyan"}
            />
            <div>
              <h3>{category}</h3>
              <span className="kz3-atlas-count">
                {String(groupIndex + 1).padStart(2, "0")} / {tools.length} technologies
              </span>
            </div>
          </header>
          <ul className="kz3-tool-list">
            {tools.map((tool) => (
              <li className="kz3-tool" key={tool}>
                <KzTechToken3D name={tool} category={category} />
                <span className="kz3-tool-name">{tool}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
