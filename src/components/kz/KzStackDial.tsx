"use client";

import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type RefObject,
} from "react";
import { KzTechToken3D } from "@/components/kz/KzSpatial3D";

export interface KzStackDialProps {
  groups: readonly (readonly [string, readonly string[]])[];
}

/* ── Instrument geometry ───────────────────────────────────────────────────
   A 400×400 viewBox. Every radius below is measured from KZSD_C, and the
   sweep arm rotates about those same user coordinates, so the layout does not
   depend on where the viewBox happens to start. Nothing may reach past
   r = 200. */
const KZSD_C = 200;
const KZSD_R_BEZEL = 192;
const KZSD_R_BAND_OUT = 190;
const KZSD_R_LABEL = 173;
const KZSD_R_BAND_IN = 156;
const KZSD_R_MAJOR_OUT = 152;
const KZSD_R_MINOR = 146;
const KZSD_R_MAJOR_IN = 140;
const KZSD_R_RING3 = 134;
const KZSD_R_RING2 = 118;
const KZSD_R_RING1 = 100;
const KZSD_R_HUB = 82;

/* One dashed circle draws every minor tick: six per layer, evenly spaced, so
   the dash period is the arc between two ticks and the dash itself the tick. */
const KZSD_MINOR_TICKS = 66;
const KZSD_TICK_SEG = (2 * Math.PI * KZSD_R_MINOR) / KZSD_MINOR_TICKS;
const KZSD_TICK_DASH = `1.4 ${(KZSD_TICK_SEG - 1.4).toFixed(3)}`;

/* Head and tail of the viewport pass spent parked on the first and last layer,
   so the ring is not still turning while the dial is half off-screen. */
const KZSD_ENTER = 0.18;
const KZSD_EXIT = 0.18;
const KZSD_ACTIVE_SPAN = 1 - KZSD_ENTER - KZSD_EXIT;

/* The SVG scales with its box, so a fixed user-unit type size would render at
   8px on a phone and 15px on a desktop. Instead the label size is solved back
   from a constant on-screen target, clamped so it never gets absurd, and the
   character budget follows from whatever size that lands on. */
const KZSD_LABEL_PX = 11.6;
const KZSD_LABEL_MIN = 10.2;
const KZSD_LABEL_MAX = 13.6;
/* Arc available to one label, minus a gutter, at r = KZSD_R_LABEL. */
const KZSD_LABEL_ARC = 88;

/* Matches the .kzsd-ghost fade-out below — the outgoing layer stays mounted
   for exactly as long as it takes to fade. */
const KZSD_GHOST_MS = 260;

const KZSD_SWEEP_GRAD = "kzsd-sweep-grad";
const KZSD_REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(KZSD_REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useKzReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(KZSD_REDUCED_MOTION).matches,
    () => false
  );
}

function useKzWidth<T extends Element>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setWidth(entries[0]?.contentRect.width ?? 0));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}

function wrapLines(text: string, maxChars: number, maxLines: number) {
  const words = text.split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (!line || next.length <= maxChars) {
      line = next;
      continue;
    }
    lines.push(line);
    if (lines.length === maxLines) {
      line = "";
      break;
    }
    line = word;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (!lines.length) lines.push(text.slice(0, maxChars));

  const dropped = lines.join(" ") !== words.join(" ");
  return lines.map((entry, i) => {
    const clipped =
      entry.length > maxChars ? `${entry.slice(0, maxChars - 1).trimEnd()}…` : entry;
    return dropped && i === lines.length - 1 && clipped === entry ? `${entry}…` : clipped;
  });
}

function normAngle(deg: number) {
  return ((deg % 360) + 360) % 360;
}

function isFlipped(screenAngle: number) {
  const a = normAngle(screenAngle);
  return a > 90 && a < 270;
}

/* The slot sitting closest to twelve o'clock is the active one, so the readout
   follows from the rotation instead of being tracked separately. */
function activeIndexAt(angle: number, count: number) {
  const step = 360 / count;
  return ((Math.round(-angle / step) % count) + count) % count;
}

/* Degrees measured clockwise from twelve o'clock, the way the dial is read. */
function kzsdPoint(r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [KZSD_C + r * Math.cos(rad), KZSD_C + r * Math.sin(rad)] as const;
}

function kzsdSector(rIn: number, rOut: number, a0: number, a1: number) {
  const [x0, y0] = kzsdPoint(rOut, a0);
  const [x1, y1] = kzsdPoint(rOut, a1);
  const [x2, y2] = kzsdPoint(rIn, a1);
  const [x3, y3] = kzsdPoint(rIn, a0);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return [
    `M${x0.toFixed(2)} ${y0.toFixed(2)}`,
    `A${rOut} ${rOut} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`,
    `L${x2.toFixed(2)} ${y2.toFixed(2)}`,
    `A${rIn} ${rIn} 0 ${large} 0 ${x3.toFixed(2)} ${y3.toFixed(2)}`,
    "Z",
  ].join("");
}

function kzsdWedge(r: number, a0: number, a1: number) {
  const [x0, y0] = kzsdPoint(r, a0);
  const [x1, y1] = kzsdPoint(r, a1);
  return `M${KZSD_C} ${KZSD_C}L${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 0 1 ${x1.toFixed(
    2
  )} ${y1.toFixed(2)}Z`;
}

function kzsdPad(n: number) {
  return String(n).padStart(2, "0");
}

interface KzDialFaceProps {
  categories: readonly string[];
  labelSize: number;
  maxChars: number;
  reduced: boolean;
  ringRef: RefObject<SVGGElement | null>;
  arcRef: RefObject<SVGCircleElement | null>;
  segRefs: RefObject<(SVGGElement | null)[]>;
  labelRefs: RefObject<(SVGGElement | null)[]>;
}

/* Memoised on purpose. The scroll driver writes `transform`, `stroke-dashoffset`
   and `data-on` straight onto these nodes; if React re-rendered the face every
   time the active layer changed it would reset those attributes to their
   at-rest values and the ring would snap back to zero for a frame. Nothing in
   here depends on the active index — the fixed reticle at twelve o'clock and a
   `data-on` attribute carry the highlight instead. */
const KzDialFace = memo(function KzDialFace({
  categories,
  labelSize,
  maxChars,
  reduced,
  ringRef,
  arcRef,
  segRefs,
  labelRefs,
}: KzDialFaceProps) {
  const step = 360 / categories.length;

  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        <radialGradient
          id={KZSD_SWEEP_GRAD}
          gradientUnits="userSpaceOnUse"
          cx={KZSD_C}
          cy={KZSD_C}
          r={KZSD_R_RING3}
        >
          <stop offset="0" style={{ stopColor: "var(--acc)", stopOpacity: 0 }} />
          <stop offset="1" style={{ stopColor: "var(--acc)", stopOpacity: 0.24 }} />
        </radialGradient>
      </defs>

      {/* Radar field: concentric rings and a crosshair, all fixed. */}
      <circle cx={KZSD_C} cy={KZSD_C} r={KZSD_R_RING3} fill="none" stroke="var(--line)" />
      <circle cx={KZSD_C} cy={KZSD_C} r={KZSD_R_RING2} fill="none" stroke="var(--line)" />
      <circle
        cx={KZSD_C}
        cy={KZSD_C}
        r={KZSD_R_RING1}
        fill="none"
        stroke="var(--line)"
        strokeDasharray="2 6"
      />
      <g stroke="var(--line)" strokeDasharray="3 7" opacity={0.75}>
        <line x1={KZSD_C - KZSD_R_RING3} y1={KZSD_C} x2={KZSD_C + KZSD_R_RING3} y2={KZSD_C} />
        <line x1={KZSD_C} y1={KZSD_C - KZSD_R_RING3} x2={KZSD_C} y2={KZSD_C + KZSD_R_RING3} />
      </g>

      {!reduced && (
        <g>
          {/* The rotation centre is stated in user units, not as a percentage
              of a reference box. A CSS `transform-origin: 50% 50%` would be
              measured against the view-box, so padding the viewBox later would
              silently swing the arm off-centre; `rotate(a cx cy)` cannot drift,
              because cx/cy are the same coordinates the arm is drawn in. */}
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${KZSD_C} ${KZSD_C}`}
            to={`360 ${KZSD_C} ${KZSD_C}`}
            dur="8s"
            repeatCount="indefinite"
          />
          <path d={kzsdWedge(KZSD_R_RING3, -34, 0)} fill={`url(#${KZSD_SWEEP_GRAD})`} />
          <line
            x1={KZSD_C}
            y1={KZSD_C}
            x2={KZSD_C}
            y2={KZSD_C - KZSD_R_RING3}
            stroke="var(--acc)"
            strokeWidth={1.4}
            strokeOpacity={0.7}
          />
        </g>
      )}

      {/* Fixed reticle: the marker never moves, the ring moves under it. Drawn
          before the ring so the active label sits on top of it, not under. */}
      <path
        d={kzsdSector(KZSD_R_BAND_IN, KZSD_R_BAND_OUT, -step / 2, step / 2)}
        fill="var(--acc)"
        fillOpacity={0.1}
        stroke="var(--acc)"
        strokeOpacity={0.45}
      />

      {/* The layer ring — everything in here turns under the marker. */}
      <g ref={ringRef} className="kzsd-ring">
        <circle
          cx={KZSD_C}
          cy={KZSD_C}
          r={KZSD_R_MINOR}
          fill="none"
          stroke="var(--line2)"
          strokeWidth={5}
          strokeDasharray={KZSD_TICK_DASH}
          opacity={0.55}
        />
        {categories.map((category, i) => {
          const base = i * step;
          const lines = wrapLines(category, maxChars, 2);
          const lead = lines.length === 1 ? 0 : -(labelSize + 2) / 2;

          return (
            <g
              key={category}
              className="kzsd-seg"
              data-on={reduced && i === 0 ? "1" : undefined}
              ref={(node) => {
                segRefs.current[i] = node;
              }}
              transform={`rotate(${base.toFixed(3)} ${KZSD_C} ${KZSD_C})`}
            >
              <line
                x1={KZSD_C}
                y1={KZSD_C - KZSD_R_BAND_IN}
                x2={KZSD_C}
                y2={KZSD_C - KZSD_R_BAND_OUT}
                stroke="var(--line)"
                transform={`rotate(${(-step / 2).toFixed(3)} ${KZSD_C} ${KZSD_C})`}
              />
              <line
                className="kzsd-major"
                x1={KZSD_C}
                y1={KZSD_C - KZSD_R_MAJOR_IN}
                x2={KZSD_C}
                y2={KZSD_C - KZSD_R_MAJOR_OUT}
                strokeWidth={2}
                strokeLinecap="round"
              />
              <circle
                className="kzsd-dot"
                cx={KZSD_C}
                cy={KZSD_C - KZSD_R_RING3}
                r={3}
                strokeWidth={1.2}
              />
              <g transform={`translate(${KZSD_C} ${KZSD_C - KZSD_R_LABEL})`}>
                {/* Flipped so names on the lower half read the right way up.
                    The driver rewrites this attribute as the ring turns. */}
                <g
                  ref={(node) => {
                    labelRefs.current[i] = node;
                  }}
                  transform={`rotate(${isFlipped(base) ? 180 : 0})`}
                >
                  {lines.map((line, li) => (
                    <text
                      key={`${li}-${line}`}
                      x={0}
                      y={lead + li * (labelSize + 2)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontFamily="var(--font-mono)"
                      fontSize={labelSize}
                      letterSpacing="0.05em"
                    >
                      {line}
                    </text>
                  ))}
                </g>
              </g>
            </g>
          );
        })}
      </g>

      {/* Bezel, plus the accent arc that fills as the stack is stepped through. */}
      <circle
        cx={KZSD_C}
        cy={KZSD_C}
        r={KZSD_R_BEZEL}
        fill="none"
        stroke="var(--line)"
        strokeDasharray="1 7"
      />
      <circle
        ref={arcRef}
        cx={KZSD_C}
        cy={KZSD_C}
        r={KZSD_R_BEZEL}
        fill="none"
        stroke="var(--acc)"
        strokeWidth={2}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="100 100"
        strokeDashoffset={reduced ? 0 : 100}
        transform={`rotate(-90 ${KZSD_C} ${KZSD_C})`}
      />

      <path
        d={`M${KZSD_C} ${KZSD_C - KZSD_R_BAND_OUT + 7}L${KZSD_C - 7} ${
          KZSD_C - KZSD_R_BEZEL - 7
        }L${KZSD_C + 7} ${KZSD_C - KZSD_R_BEZEL - 7}Z`}
        fill="var(--acc)"
      />

      {/* Hub disc. The readout that sits on it is HTML — see .kzsd-hub. */}
      <circle cx={KZSD_C} cy={KZSD_C} r={KZSD_R_HUB} fill="var(--bg2)" stroke="var(--line)" />
      <circle
        cx={KZSD_C}
        cy={KZSD_C}
        r={KZSD_R_HUB - 5}
        fill="none"
        stroke="var(--acc)"
        strokeOpacity={0.28}
        strokeDasharray="1 5"
      />
    </svg>
  );
});

export function KzStackDial({ groups }: KzStackDialProps) {
  const reduced = useKzReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { ref: dialRef, width } = useKzWidth<HTMLElement>();
  const ringRef = useRef<SVGGElement | null>(null);
  const arcRef = useRef<SVGCircleElement | null>(null);
  const segRefs = useRef<(SVGGElement | null)[]>([]);
  const labelRefs = useRef<(SVGGElement | null)[]>([]);
  const activeRef = useRef(0);
  const sizerRef = useRef<HTMLUListElement | null>(null);
  const [active, setActive] = useState(0);
  const [ghost, setGhost] = useState<number | null>(null);
  const [deckHeight, setDeckHeight] = useState<number | null>(null);

  const count = groups.length;
  const categories = useMemo(() => groups.map(([category]) => category), [groups]);
  const totals = useMemo(() => groups.reduce((sum, [, items]) => sum + items.length, 0), [groups]);

  useEffect(() => {
    /* Track the DIAL, not the whole block. Below 980px the panel stacks under
       the dial, so the root's height is roughly double — the rotation would
       then finish its pass against a box that is still on screen long after the
       instrument itself has scrolled off the top, and the last few layers would
       turn where nobody can see them. */
    const el = dialRef.current ?? rootRef.current;
    if (!el || reduced || count < 2) return;

    const step = 360 / count;
    const sweep = step * (count - 1);
    let raf = 0;
    let visible = false;
    /* Last angle actually written. A scroll event that moves the dial by less
       than a fiftieth of a degree cannot change a pixel, and the whole body
       below — eleven label reads included — was running for it anyway. */
    let lastAngle = Number.NaN;

    const frame = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const travel = vh + rect.height;
      /* 0 as the block enters from the bottom, 1 as it leaves past the top. */
      const raw = travel > 0 ? (vh - rect.top) / travel : 0.5;
      const p = Math.min(1, Math.max(0, (raw - KZSD_ENTER) / KZSD_ACTIVE_SPAN));
      const angle = -p * sweep;

      if (Math.abs(angle - lastAngle) < 0.02) return;
      lastAngle = angle;

      /* A CSS transform, not the SVG `transform` attribute the ring used to
         carry. The attribute goes through SVG's own geometry path, so every
         frame re-rendered all eleven segments — line, tick, dot and label —
         from scratch. The CSS property lets the browser take the same rotation
         through its accelerated transform path instead. `transform-box` and
         `transform-origin` are declared on .kzsd-ring in the stylesheet so the
         centre of rotation stays the viewBox centre, exactly as the attribute's
         explicit `200 200` did. */
      if (ringRef.current) {
        ringRef.current.style.transform = `rotate(${angle.toFixed(2)}deg)`;
      }
      arcRef.current?.setAttribute("stroke-dashoffset", (100 - p * 100).toFixed(2));

      /* Only the labels whose flip state actually changed are touched. The
         previous version compared against the live attribute on all eleven
         every frame, which reads back from the DOM — and a read after the
         writes above is the shape that forces a synchronous style resolve. A
         re-render of the face resets `data-flip`, so the cache is stored on
         the node rather than in a closure and still self-heals. */
      const labels = labelRefs.current;
      for (let i = 0; i < labels.length; i++) {
        const node = labels[i];
        if (!node) continue;
        const flip = isFlipped(i * step + angle);
        const want = flip ? "1" : "0";
        if (node.dataset.flip === want) continue;
        node.dataset.flip = want;
        node.setAttribute("transform", flip ? "rotate(180)" : "rotate(0)");
      }

      const next = activeIndexAt(angle, count);
      const prev = activeRef.current;
      if (prev !== next) {
        activeRef.current = next;
        segRefs.current[prev]?.removeAttribute("data-on");
        setGhost(prev);
        setActive(next);
      }
      const on = segRefs.current[next];
      if (on && on.dataset.on !== "1") on.dataset.on = "1";
    };

    /* Coalesced: the passive listener only ever queues a frame, and every read
       and write happens inside it, so scrolling never forces a synchronous
       layout and the dial costs nothing while it is off-screen. */
    const schedule = () => {
      if (raf || !visible) return;
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      schedule();
    });
    io.observe(el);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
    // dialRef is the stable object from useRef; listing it satisfies the
    // exhaustive-deps rule without re-running the effect on every render.
  }, [reduced, count, dialRef]);

  useEffect(() => {
    if (ghost === null) return;
    const timer = window.setTimeout(() => setGhost(null), KZSD_GHOST_MS);
    return () => window.clearTimeout(timer);
  }, [ghost]);

  /* The panel used to be held open at the height of the LONGEST layer, so a
     five-tool layer left ~200px of dead card below its last row — invisible
     beside the 560px dial on a desktop, a plain hole on a phone where the
     panel is full width. The hidden sizer now carries the ACTIVE layer, which
     is the exact height the deck wants, and that height is transitioned rather
     than snapped so the card resizes instead of jumping. */
  useEffect(() => {
    const el = sizerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.height ?? 0;
      if (next > 0) setDeckHeight((prev) => (prev !== null && Math.abs(prev - next) < 0.5 ? prev : next));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!count) return null;

  const scale = width > 0 ? width / 400 : 1;
  const labelSize = Math.min(KZSD_LABEL_MAX, Math.max(KZSD_LABEL_MIN, KZSD_LABEL_PX / scale));
  /* 0.65em: the mono face advances 0.6em per glyph, plus the 0.05em tracking
     the labels carry below. */
  const maxChars = Math.min(14, Math.max(8, Math.floor(KZSD_LABEL_ARC / (labelSize * 0.65))));

  const index = Math.min(active, count - 1);
  const [category, items] = groups[index];

  return (
    <div className="kzsd" ref={rootRef}>
      <style
        href="kz-stack-dial"
        precedence="default"
        dangerouslySetInnerHTML={{ __html: KZSD_CSS }}
      />

      <figure className="kzsd-dial" ref={dialRef}>
        {/* Keyed on the motion mode: the OS setting can flip while the page is
            open, and remounting is the cheapest way to guarantee the driver's
            imperative rotation, arc and highlight cannot survive the change. */}
        <KzDialFace
          key={reduced ? "static" : "live"}
          categories={categories}
          labelSize={labelSize}
          maxChars={maxChars}
          reduced={reduced}
          ringRef={ringRef}
          arcRef={arcRef}
          segRefs={segRefs}
          labelRefs={labelRefs}
        />
        <figcaption className="kzsd-hub">
          {reduced ? (
            <>
              <span className="kzsd-hub-eyebrow">The stack</span>
              <strong className="kzsd-hub-name">{count} layers</strong>
              <span className="kzsd-hub-count">{totals} tools</span>
            </>
          ) : (
            <>
              <span className="kzsd-hub-eyebrow">
                Layer {kzsdPad(index + 1)} / {kzsdPad(count)}
              </span>
              <strong className="kzsd-hub-name" key={category}>
                {category}
              </strong>
              <span className="kzsd-hub-count">{items.length} tools</span>
            </>
          )}
        </figcaption>
      </figure>

      {reduced ? (
        /* Nothing moves, so the panel carries every layer at once rather than
           one at a time — the dial alone would only ever read out layer 01. */
        <div className="kzsd-panel">
          <header className="kzsd-head">
            <span className="kzsd-head-idx">{kzsdPad(count)} layers</span>
            <span className="kzsd-head-cat">The full stack</span>
            <span className="kzsd-head-num">{totals} tools</span>
            <span className="kzsd-head-static">Every layer, in full</span>
          </header>
          <ul className="kzsd-all">
            {groups.map(([name, tools]) => (
              <li key={name}>
                <span className="kzsd-all-cat">{name}</span>
                <span className="kzsd-all-tools">{tools.join(" · ")}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="kzsd-panel">
          <header className="kzsd-head">
            <span className="kzsd-head-idx">
              {kzsdPad(index + 1)} / {kzsdPad(count)}
            </span>
            <span className="kzsd-head-cat" key={category}>
              {category}
            </span>
            <span className="kzsd-head-num">{items.length} tools</span>
            <span className="kzsd-head-static">Tools in this layer</span>
          </header>

          <div
            className="kzsd-deck"
            data-measured={deckHeight === null ? undefined : "1"}
            style={
              deckHeight === null
                ? undefined
                : ({ "--kzsd-h": `${Math.round(deckHeight)}px` } as CSSProperties)
            }
          >
            {/* Mirrors the active layer with no tokens and no animation: it
                exists only so the deck has a height to lay out against, and
                the tokens would cost eleven extra SVG trees per turn. */}
            <ul className="kzsd-list kzsd-sizer" ref={sizerRef} aria-hidden="true">
              {items.map((tool, i) => (
                <li key={tool}>
                  <span className="kzsd-n">{kzsdPad(i + 1)}</span>
                  <span className="kzsd-token-slot" />
                  <span className="kzsd-t">{tool}</span>
                </li>
              ))}
            </ul>
            {ghost !== null && (
              <ul className="kzsd-list kzsd-layer kzsd-ghost" key={`ghost-${ghost}`}>
                {groups[ghost][1].map((tool, i) => (
                  <li key={tool}>
                    <span className="kzsd-n">{kzsdPad(i + 1)}</span>
                    <KzTechToken3D name={tool} category={groups[ghost][0]} size={30} />
                    <span className="kzsd-t">{tool}</span>
                  </li>
                ))}
              </ul>
            )}
            <ul className="kzsd-list kzsd-layer" key={category}>
              {items.map((tool, i) => (
                <li key={tool} style={{ animationDelay: `${i * 26}ms` }}>
                  <span className="kzsd-n">{kzsdPad(i + 1)}</span>
                  <KzTechToken3D name={tool} category={category} size={30} />
                  <span className="kzsd-t">{tool}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

const KZSD_CSS = `
.kzsd{
  display:grid;
  grid-template-columns:minmax(0,1fr);
  align-items:center;
  gap:clamp(14px,3vw,24px);
}
@media (min-width:980px){
  .kzsd{
    grid-template-columns:minmax(0,1.08fr) minmax(0,1fr);
    gap:clamp(28px,4vw,56px);
  }
  /* Side by side, the hub readout and the panel header were stating the same
     layer, index and tool count about 400px apart. The hub wins: it is the
     instrument's own display and it sits directly under the marker. The panel
     keeps a fixed label saying what the list is, which is the one thing the
     hub does not say. */
  /* Scoped to .kzsd so it outranks the default display:none below — a media
     query adds no specificity, and that rule is declared later in the sheet. */
  .kzsd .kzsd-head-idx,.kzsd .kzsd-head-cat,.kzsd .kzsd-head-num{display:none}
  .kzsd .kzsd-head-static{display:block}
}

.kzsd-dial{
  position:relative;
  margin:0;
  margin-inline:auto;
  width:100%;
  max-width:min(320px, 86vw);
  /* The hub readout is HTML laid over the SVG; cq units let its type track the
     dial's own width instead of the viewport's. */
  container-type:inline-size;
}
@media (min-width:768px){
  .kzsd-dial{
    max-width:560px;
  }
}
.kzsd-dial svg{display:block;width:100%;height:auto}
/* The scroll driver writes .kzsd-ring's rotation as a CSS transform. Without
   these two, a CSS rotation on an SVG group turns about the origin of the
   nearest viewport rather than about the dial's centre. */
.kzsd-ring{transform-box:view-box;transform-origin:200px 200px}

.kzsd-seg text{fill:var(--mut);transition:fill .28s ease}
.kzsd-seg .kzsd-major{stroke:var(--line2);opacity:.7;transition:stroke .28s ease,opacity .28s ease}
.kzsd-seg .kzsd-dot{fill:var(--bg2);stroke:var(--line2);transition:fill .28s ease,stroke .28s ease}
.kzsd-seg[data-on="1"] text{fill:var(--acc);font-weight:600}
.kzsd-seg[data-on="1"] .kzsd-major{stroke:var(--acc);opacity:1}
.kzsd-seg[data-on="1"] .kzsd-dot{fill:var(--acc);stroke:var(--acc)}

.kzsd-hub{
  position:absolute;
  inset:0;
  display:grid;
  align-content:center;
  justify-items:center;
  gap:.42em;
  margin:0;
  /* Leaves a 38% column of the dial for text; the hub disc is 41% across. */
  padding-inline:31%;
  text-align:center;
  pointer-events:none;
}
.kzsd-hub-eyebrow,.kzsd-hub-count{
  font-family:var(--font-mono);
  font-size:clamp(8.5px,2.5cqw,11px);
  letter-spacing:.15em;
  text-transform:uppercase;
  line-height:1.2;
}
.kzsd-hub-eyebrow{color:var(--dim)}
.kzsd-hub-count{color:var(--acc)}
.kzsd-hub-name{
  font-family:var(--font-display);
  /* 580: Geist's 600 reads a step heavier than the face it replaced inside
     the hub disc, and mixed case wants a touch of negative tracking. */
  font-weight:580;
  font-size:clamp(12px,4.3cqw,23px);
  line-height:1.04;
  letter-spacing:-.03em;
  color:var(--ink);
  overflow-wrap:anywhere;
}

.kzsd-panel{
  min-width:0;
  border:1px solid var(--line);
  border-radius:16px;
  background:var(--card);
  padding:clamp(14px,3vw,20px);
}
.kzsd-head{
  display:flex;
  align-items:baseline;
  flex-wrap:wrap;
  gap:4px 12px;
  padding-bottom:12px;
  margin-bottom:4px;
  border-bottom:1px solid var(--line);
}
.kzsd-head-idx,.kzsd-head-num{
  font-family:var(--font-mono);
  font-size:.62rem;
  letter-spacing:.16em;
  text-transform:uppercase;
}
.kzsd-head-idx{color:var(--acc)}
.kzsd-head-num{margin-left:auto;color:var(--dim)}
.kzsd-head-static{
  display:none;
  font-family:var(--font-mono);
  font-size:.62rem;
  letter-spacing:.16em;
  text-transform:uppercase;
  color:var(--dim);
}
.kzsd-head-cat{
  font-family:var(--font-display);
  font-weight:580;
  font-size:clamp(1.02rem,3.4vw,1.32rem);
  line-height:1.1;
  letter-spacing:-.03em;
  color:var(--ink);
  overflow-wrap:anywhere;
}

.kzsd-deck{
  position:relative;
  /* The deck is the one box on the page whose height changes mid-scroll; let
     the browser pick anything else as its scroll anchor. */
  overflow-anchor:none;
}
/* Before the first measurement the hidden sizer sits in flow and gives the
   deck its height, so the panel is correct on the server and without JS. From
   the first ResizeObserver callback on, the height is explicit and eased, and
   the sizer steps out of flow. */
.kzsd-deck[data-measured="1"]{
  height:var(--kzsd-h);
  transition:height 340ms cubic-bezier(.22,.61,.36,1);
}
.kzsd-deck[data-measured="1"] .kzsd-sizer{position:absolute;inset-inline:0;top:0}
.kzsd-list{list-style:none;margin:0;padding:0}
.kzsd-list li{
  display:flex;
  align-items:center;
  gap:9px;
  min-height:38px;
  padding:4px 2px;
  border-bottom:1px solid var(--line);
}
@media (min-width:768px){
  .kzsd-list li{
    min-height:44px;
    padding:6px 2px;
  }
}
.kzsd-list li:last-child{border-bottom:0}
/* Stands in for the token inside the hidden sizer so the row measures at the
   same height without instantiating a second SVG per tool. */
.kzsd-token-slot{flex:0 0 auto;width:30px;height:30px}
.kzsd-n{
  flex:0 0 auto;
  width:2.2em;
  font-family:var(--font-mono);
  font-size:.6rem;
  letter-spacing:.11em;
  color:var(--acc);
  opacity:.75;
}
.kzsd-t{
  min-width:0;
  font-size:clamp(.82rem,2.6vw,.95rem);
  line-height:1.45;
  color:var(--ink);
  overflow-wrap:anywhere;
}
/* Measured, never seen. visibility:hidden rather than display:none, because a
   display-none subtree has no height to measure. */
.kzsd-sizer{visibility:hidden;pointer-events:none}
/* Top-anchored rather than inset:0 so a layer keeps its natural height while
   the deck eases to it — an outgoing taller layer then fades out at full
   height instead of being squashed into the incoming one's box. */
.kzsd-layer{position:absolute;inset-inline:0;top:0}

@keyframes kzsd-row{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
@keyframes kzsd-out{from{opacity:1}to{opacity:0}}
.kzsd-layer li,.kzsd-head-cat,.kzsd-hub-name{
  animation:kzsd-row .34s cubic-bezier(.22,.61,.36,1) both;
}
.kzsd-ghost{animation:kzsd-out ${KZSD_GHOST_MS}ms ease forwards}
.kzsd-ghost li{animation:none;opacity:1}

.kzsd-all{list-style:none;margin:0;padding:0}
.kzsd-all li{
  display:grid;
  gap:2px;
  padding:11px 2px;
  border-bottom:1px solid var(--line);
}
.kzsd-all li:last-child{border-bottom:0}
.kzsd-all-cat{
  font-family:var(--font-mono);
  font-size:.62rem;
  letter-spacing:.15em;
  text-transform:uppercase;
  color:var(--acc);
}
.kzsd-all-tools{font-size:.82rem;line-height:1.55;color:var(--mut);overflow-wrap:anywhere}

@media (prefers-reduced-motion:reduce){
  .kzsd-seg text,.kzsd-seg .kzsd-major,.kzsd-seg .kzsd-dot{transition:none}
  .kzsd-layer li,.kzsd-head-cat,.kzsd-hub-name,.kzsd-ghost{animation:none}
  .kzsd-deck[data-measured="1"]{transition:none}
}
`;
