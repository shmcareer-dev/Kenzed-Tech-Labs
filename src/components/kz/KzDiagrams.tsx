"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

export interface KzLifecycleStage {
  label: string;
  caption?: string;
}

export interface KzFlowNode {
  label: string;
  kind?: "input" | "process" | "store" | "output";
}

export interface KzDonutSlice {
  label: string;
  value: number;
}

export interface KzLifecycleWheelProps {
  stages: KzLifecycleStage[];
  size?: number;
}

export interface KzWebFlowProps {
  nodes: KzFlowNode[];
  title?: string;
}

export interface KzDonutProps {
  slices: KzDonutSlice[];
  title?: string;
  centerLabel?: string;
}

const KZ_SERIES = ["var(--acc)", "var(--acc2)", "var(--acc3)"];

/* A series longer than the three brand accents re-uses them at a lower weight,
   so neighbours always differ in hue and no colour outside the palette appears. */
function seriesTone(index: number) {
  const tier = Math.floor(index / KZ_SERIES.length);
  return {
    color: KZ_SERIES[index % KZ_SERIES.length],
    opacity: Math.max(0.44, 1 - tier * 0.26),
  };
}

function formatValue(value: number) {
  return Number.isInteger(value)
    ? value.toLocaleString("en-IN")
    : value.toLocaleString("en-IN", { maximumFractionDigits: 1 });
}

function formatPercent(part: number, total: number) {
  const pct = total > 0 ? (part / total) * 100 : 0;
  return `${pct >= 10 ? Math.round(pct) : Math.round(pct * 10) / 10}%`;
}

function wrapLines(text: string, maxChars: number, maxLines: number) {
  const words = text.split(" ").filter(Boolean);
  const normalised = words.join(" ");
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
  if (!lines.length) return [normalised.slice(0, maxChars)];

  const dropped = lines.join(" ") !== normalised;
  return lines.map((entry, i) => {
    const clipped = entry.length > maxChars ? entry.slice(0, maxChars - 1).trimEnd() : entry;
    const isLast = i === lines.length - 1;
    return clipped !== entry || (isLast && dropped) ? `${clipped}…` : entry;
  });
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return {
    x: Number((cx + r * Math.cos(rad)).toFixed(2)),
    y: Number((cy + r * Math.sin(rad)).toFixed(2)),
  };
}

function sectorPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  from: number,
  to: number
) {
  const large = to - from > 180 ? 1 : 0;
  const o0 = polar(cx, cy, rOuter, from);
  const o1 = polar(cx, cy, rOuter, to);
  const i1 = polar(cx, cy, rInner, to);
  const i0 = polar(cx, cy, rInner, from);
  return `M${o0.x} ${o0.y}A${rOuter} ${rOuter} 0 ${large} 1 ${o1.x} ${o1.y}L${i1.x} ${i1.y}A${rInner} ${rInner} 0 ${large} 0 ${i0.x} ${i0.y}Z`;
}

function arcPath(cx: number, cy: number, r: number, from: number, to: number, reverse = false) {
  const p0 = polar(cx, cy, r, reverse ? to : from);
  const p1 = polar(cx, cy, r, reverse ? from : to);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M${p0.x} ${p0.y}A${r} ${r} 0 ${large} ${reverse ? 0 : 1} ${p1.x} ${p1.y}`;
}

const KZ_REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(KZ_REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useKzReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(KZ_REDUCED_MOTION).matches,
    () => false
  );
}

function useKzInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          setInView(true);
        });
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function useKzDrawIn(duration = 950) {
  const { ref, inView } = useKzInView<SVGSVGElement>(0.25);
  const reduced = useKzReducedMotion();
  const [drawn, setDrawn] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setDrawn(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, duration]);

  return { ref, progress: reduced ? 1 : drawn };
}

function KzFigCaption({ children }: { children: string }) {
  return (
    <figcaption
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.66rem",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--acc)",
        marginBottom: 16,
      }}
    >
      {children}
    </figcaption>
  );
}

const KZ_WHEEL_DWELL = 3200;

export function KzLifecycleWheel({ stages, size = 420 }: KzLifecycleWheelProps) {
  const { ref, inView } = useKzInView<HTMLDivElement>(0.3);
  const reduced = useKzReducedMotion();
  const [active, setActive] = useState(0);
  const uid = useId().replace(/:/g, "");

  const count = stages.length;

  useEffect(() => {
    if (reduced || !inView || count < 2) return;
    const id = window.setTimeout(() => setActive((active + 1) % count), KZ_WHEEL_DWELL);
    return () => window.clearTimeout(id);
  }, [active, count, inView, reduced]);

  if (!count) return null;

  const cx = 200;
  const cy = 200;
  const rOuter = 162;
  const rInner = 112;
  const rLabel = (rOuter + rInner) / 2;
  const span = 360 / count;
  const gap = count > 6 ? 2 : 2.6;
  /* Clamped so a shrinking `stages` prop can never point past the end. */
  const index = Math.min(active, count - 1);
  const current = stages[index];
  const centreLabel = wrapLines(current.label, 20, 2);
  const centreCaption = current.caption ? wrapLines(current.caption, 28, 2) : [];
  const activeTone = seriesTone(index);
  const summary = `Lifecycle wheel with ${count} stages: ${stages
    .map((stage) => stage.label)
    .join(", ")}.`;

  return (
    <div ref={ref} style={{ width: "100%", maxWidth: size, marginInline: "auto" }}>
      <svg
        viewBox="0 0 400 400"
        width={400}
        height={400}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={summary}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title>{summary}</title>

        <circle
          cx={cx}
          cy={cy}
          r={186}
          fill="none"
          stroke="var(--line)"
          strokeWidth={1}
          strokeDasharray="1 7"
        />

        {stages.map((stage, i) => {
          const from = i * span + gap;
          const to = (i + 1) * span - gap;
          const mid = (from + to) / 2;
          const isActive = i === index;
          const tone = seriesTone(i);
          const flip = mid > 90 && mid < 270;
          const arcChars = Math.floor((((to - from) / 360) * 2 * Math.PI * rLabel) / 6.6);

          return (
            <g key={`${i}-${stage.label}`}>
              <path
                d={sectorPath(cx, cy, rOuter, rInner, from, to)}
                fill={tone.color}
                fillOpacity={isActive ? 0.22 : 0.07}
                stroke={isActive ? tone.color : "var(--line)"}
                strokeOpacity={isActive ? tone.opacity : 1}
                strokeWidth={isActive ? 1.6 : 1}
              />
              <path id={`${uid}-arc-${i}`} d={arcPath(cx, cy, rLabel, from, to, flip)} fill="none" />
              <text
                fontFamily="var(--font-mono)"
                fontSize={11}
                letterSpacing="0.08em"
                fontWeight={isActive ? 600 : 400}
                fill={isActive ? tone.color : "var(--mut)"}
                fillOpacity={isActive ? tone.opacity : 0.85}
                dominantBaseline="middle"
              >
                <textPath href={`#${uid}-arc-${i}`} startOffset="50%" textAnchor="middle">
                  {wrapLines(stage.label.toUpperCase(), Math.max(6, arcChars), 1)[0]}
                </textPath>
              </text>
            </g>
          );
        })}

        {!reduced && inView && count > 1 && (
          <path
            key={index}
            d={arcPath(cx, cy, 174, index * span + gap, (index + 1) * span - gap)}
            fill="none"
            stroke={activeTone.color}
            strokeOpacity={activeTone.opacity}
            strokeWidth={2.6}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1}
          >
            <animate
              attributeName="stroke-dashoffset"
              from="1"
              to="0"
              dur={`${KZ_WHEEL_DWELL}ms`}
              fill="freeze"
            />
          </path>
        )}

        <circle cx={cx} cy={cy} r={100} fill="var(--bg2)" stroke="var(--line)" strokeWidth={1} />

        <text
          x={cx}
          y={cy - 52}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={9.5}
          letterSpacing="0.2em"
          fill={activeTone.color}
          fillOpacity={activeTone.opacity}
        >
          {`STAGE ${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`}
        </text>

        {centreLabel.map((line, i) => (
          <text
            key={line}
            x={cx}
            y={(centreLabel.length === 1 ? cy - 6 : cy - 18) + i * 21}
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontWeight={600}
            fontSize={17}
            fill="var(--ink)"
          >
            {line}
          </text>
        ))}

        {centreCaption.map((line, i) => (
          <text
            key={line}
            x={cx}
            y={cy + 26 + i * 14}
            textAnchor="middle"
            fontFamily="var(--font-sans)"
            fontSize={10.5}
            fill="var(--mut)"
          >
            {line}
          </text>
        ))}
      </svg>

      <div
        role="group"
        aria-label="Choose a lifecycle stage"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 8,
          marginTop: "clamp(16px, 3vw, 26px)",
        }}
      >
        {stages.map((stage, i) => {
          const tone = seriesTone(i);
          const isActive = i === index;
          return (
            <button
              key={`${i}-${stage.label}`}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={isActive}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                minHeight: 44,
                maxWidth: "100%",
                padding: "8px 15px",
                borderRadius: 999,
                border: `1px solid ${isActive ? tone.color : "var(--line)"}`,
                background: isActive ? "var(--card2)" : "transparent",
                color: isActive ? "var(--ink)" : "var(--mut)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textAlign: "left",
                cursor: "pointer",
                transition: "border-color .25s, color .25s, background .25s",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: tone.color,
                  opacity: tone.opacity,
                  flexShrink: 0,
                }}
              />
              {stage.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const KZ_FLOW_KINDS = {
  input: { accent: "var(--acc3)", fill: 0.06, dashed: true },
  process: { accent: "var(--acc)", fill: 0.06, dashed: false },
  store: { accent: "var(--acc2)", fill: 0.06, dashed: false },
  output: { accent: "var(--acc3)", fill: 0.18, dashed: false },
} as const;

export function KzWebFlow({ nodes, title }: KzWebFlowProps) {
  const reduced = useKzReducedMotion();
  const wrapRef = useRef<HTMLElement | null>(null);
  const [stacked, setStacked] = useState(false);
  const uid = useId().replace(/:/g, "");

  /* Measured on the container, not the viewport, so a flow dropped into a narrow
     grid cell stacks for the same reason a phone does. */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setStacked(width > 0 && width < 640);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!nodes.length) return null;

  const pad = 10;
  const nodeW = stacked ? 268 : 152;
  const nodeH = stacked ? 80 : 86;
  const gap = stacked ? 42 : 48;
  const vbW = stacked ? nodeW + pad * 2 : pad * 2 + nodes.length * nodeW + (nodes.length - 1) * gap;
  const vbH = stacked ? pad * 2 + nodes.length * nodeH + (nodes.length - 1) * gap : pad * 2 + nodeH;
  const maxChars = Math.floor((nodeW - 22) / 6.5);
  const summary = `${title ?? "Pipeline"}: ${nodes
    .map((node) => `${node.label} (${node.kind ?? "process"})`)
    .join(" then ")}.`;

  return (
    <figure ref={wrapRef} style={{ margin: 0 }}>
      {title && <KzFigCaption>{title}</KzFigCaption>}
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        width={vbW}
        height={vbH}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={summary}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title>{summary}</title>
        <defs>
          <marker
            id={`${uid}-arrow`}
            viewBox="0 0 8 8"
            refX={7}
            refY={4}
            markerWidth={7}
            markerHeight={7}
            orient="auto-start-reverse"
          >
            <path d="M0 0L8 4L0 8Z" fill="var(--line2)" />
          </marker>
        </defs>

        {nodes.slice(0, -1).map((node, i) => {
          const edge = pad + i * ((stacked ? nodeH : nodeW) + gap) + (stacked ? nodeH : nodeW);
          const cross = pad + (stacked ? nodeW : nodeH) / 2;
          const d = stacked
            ? `M${cross} ${edge + 6}V${edge + gap - 8}`
            : `M${edge + 6} ${cross}H${edge + gap - 8}`;
          return (
            <g key={`${i}-${node.label}`}>
              <path
                d={d}
                fill="none"
                stroke="var(--line2)"
                strokeWidth={1.2}
                markerEnd={`url(#${uid}-arrow)`}
              />
              <path
                d={d}
                fill="none"
                stroke="var(--acc)"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeDasharray="5 10"
                opacity={0.9}
              >
                {!reduced && (
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;-15"
                    dur="1.2s"
                    begin={`${i * 0.16}s`}
                    repeatCount="indefinite"
                  />
                )}
              </path>
            </g>
          );
        })}

        {nodes.map((node, i) => {
          const kind = node.kind ?? "process";
          const shape = KZ_FLOW_KINDS[kind];
          const x = stacked ? pad : pad + i * (nodeW + gap);
          const y = stacked ? pad + i * (nodeH + gap) : pad;
          const lines = wrapLines(node.label, maxChars, 2);
          const firstY = y + nodeH / 2 + (lines.length === 1 ? 10 : 3);

          return (
            <g key={`${i}-${node.label}`}>
              <rect
                x={x}
                y={y}
                width={nodeW}
                height={nodeH}
                rx={14}
                fill={shape.accent}
                fillOpacity={shape.fill}
                stroke={shape.accent}
                strokeWidth={1.4}
                strokeDasharray={shape.dashed ? "5 4" : undefined}
              />
              <text
                x={x + nodeW / 2}
                y={y + 22}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize={8.2}
                letterSpacing="0.15em"
                fill={shape.accent}
              >
                {kind.toUpperCase()}
              </text>
              {lines.map((line, li) => (
                <text
                  key={line}
                  x={x + nodeW / 2}
                  y={firstY + li * 15}
                  textAnchor="middle"
                  fontFamily="var(--font-sans)"
                  fontSize={12.5}
                  fill="var(--ink)"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

export function KzDonut({ slices, title, centerLabel }: KzDonutProps) {
  const { ref, progress } = useKzDrawIn();

  const total = slices.reduce((sum, slice) => sum + Math.max(0, slice.value), 0);
  if (!slices.length || total <= 0) return null;

  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  const revealed = circumference * progress;
  const centre = centerLabel ?? formatValue(total);
  const summary = `${title ?? "Share breakdown"}: ${slices
    .map((slice) => `${slice.label} ${formatPercent(slice.value, total)}`)
    .join(", ")}.`;
  const starts = slices.map(
    (_, i) =>
      (slices.slice(0, i).reduce((sum, slice) => sum + Math.max(0, slice.value), 0) / total) *
      circumference
  );

  return (
    <figure style={{ margin: 0 }}>
      {title && <KzFigCaption>{title}</KzFigCaption>}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
          gap: "clamp(18px, 4vw, 34px)",
          alignItems: "center",
        }}
      >
        <svg
          ref={ref}
          viewBox="0 0 200 200"
          width={200}
          height={200}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={summary}
          style={{
            width: "100%",
            maxWidth: 230,
            height: "auto",
            display: "block",
            marginInline: "auto",
          }}
        >
          <title>{summary}</title>
          <circle cx={100} cy={100} r={radius} fill="none" stroke="var(--card2)" strokeWidth={30} />
          <g transform="rotate(-90 100 100)">
            {slices.map((slice, i) => {
              const tone = seriesTone(i);
              const share = Math.max(0, slice.value) / total;
              const start = starts[i];
              const length = Math.max(0.5, share * circumference - 2.5);
              const drawn = Math.min(Math.max(revealed - start, 0), length);
              return (
                <circle
                  key={`${i}-${slice.label}`}
                  cx={100}
                  cy={100}
                  r={radius}
                  fill="none"
                  stroke={tone.color}
                  strokeOpacity={tone.opacity}
                  strokeWidth={30}
                  strokeDasharray={`${drawn} ${circumference - drawn}`}
                  strokeDashoffset={-start}
                />
              );
            })}
          </g>
          <text
            x={100}
            y={98}
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontWeight={600}
            fontSize={22}
            fill="var(--ink)"
          >
            {wrapLines(centre, 11, 1)[0]}
          </text>
          <text
            x={100}
            y={118}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={8.4}
            letterSpacing="0.2em"
            fill="var(--dim)"
          >
            {centerLabel ? `${slices.length} SEGMENTS` : "TOTAL"}
          </text>
        </svg>

        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
          {slices.map((slice, i) => {
            const tone = seriesTone(i);
            return (
              <li
                key={`${i}-${slice.label}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "10px 1fr auto",
                  alignItems: "center",
                  gap: 11,
                  paddingBottom: 10,
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: tone.color,
                    opacity: tone.opacity,
                  }}
                />
                <span style={{ fontSize: "0.9rem", color: "var(--mut)" }}>{slice.label}</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.76rem",
                    letterSpacing: "0.06em",
                    color: "var(--ink)",
                  }}
                >
                  {formatPercent(slice.value, total)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </figure>
  );
}
