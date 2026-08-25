"use client";

import {
  useId,
  type CSSProperties,
  type ReactNode,
} from "react";

export type KzSpatialKind =
  | "robot"
  | "chip"
  | "code"
  | "neural"
  | "database"
  | "cloud"
  | "shield"
  | "mobile"
  | "pipeline"
  | "cube";

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
  transform-style: preserve-3d;
  perspective: 700px;
}
.kz3-object::after {
  content: "";
  position: absolute;
  z-index: -1;
  left: 16%;
  right: 10%;
  bottom: 1%;
  height: 13%;
  border-radius: 50%;
  background: color-mix(in srgb, var(--kz3-a) 42%, transparent);
  filter: blur(7px);
  opacity: .44;
  transform: rotate(-5deg);
}
.kz3-object > svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  transform: rotateX(2deg) rotateY(-3deg);
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
@keyframes kz3-float {
  0% { transform: translate3d(0, 3px, 0) rotate(-1.4deg); }
  55% { transform: translate3d(2px, -5px, 0) rotate(1.1deg); }
  100% { transform: translate3d(-2px, -1px, 0) rotate(-.4deg); }
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
.kz3-pin::before {
  content: "";
  position: absolute;
  inset: 12% -8px 12% 34%;
  z-index: -1;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg2) 84%, transparent);
  box-shadow: 0 14px 36px -24px var(--accglow);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}
.kz3-pin-label {
  padding: 0 12px 0 0;
  font-family: var(--font-mono);
  font-size: .56rem;
  line-height: 1.15;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--mut);
  white-space: nowrap;
}
.kz-tech-pin {
  right: 0;
  top: clamp(52px, 8vw, 84px);
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
  filter: drop-shadow(0 6px 7px color-mix(in srgb, var(--acc) 22%, transparent));
  transition: transform 320ms cubic-bezier(.22,1,.36,1);
}
.kz3-token[data-tone="1"] { --kz3-token-a: var(--acc2); --kz3-token-b: var(--acc3); }
.kz3-token[data-tone="2"] { --kz3-token-a: var(--acc3); --kz3-token-b: var(--acc); }
.kz3-token[data-tone="0"] { --kz3-token-a: var(--acc); --kz3-token-b: var(--acc2); }
.kz3-token-face { fill: color-mix(in srgb, var(--bg2) 76%, var(--kz3-token-a) 24%); }
.kz3-token-top { fill: color-mix(in srgb, var(--kz3-token-b) 62%, white 12%); }
.kz3-token-side { fill: color-mix(in srgb, var(--kz3-token-a) 48%, var(--bg) 52%); }
.kz3-token-grid { stroke: color-mix(in srgb, var(--kz3-token-a) 32%, transparent); }
.kz3-token text {
  fill: var(--ink);
  font-family: var(--font-mono);
  font-size: 8.2px;
  font-weight: 700;
  letter-spacing: -.04em;
  text-anchor: middle;
}
.kz3-title-pin {
  display: inline-flex;
  margin-inline-start: .24em;
  vertical-align: -.2em;
  transform: translateY(.02em);
}
.kz3-title-pin .kz3-token {
  filter: saturate(.9);
}

.kz3-atlas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr));
  gap: 16px;
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
  line-height: 1.2;
  color: var(--mut);
  overflow-wrap: anywhere;
}

.kz3-hero-scene {
  position: relative;
  min-height: 118px;
  width: 100%;
  isolation: isolate;
}
.kz3-hero-scene::before {
  content: "";
  position: absolute;
  left: 8%;
  right: 4%;
  bottom: 9%;
  height: 42%;
  border: 1px solid var(--line);
  border-radius: 50%;
  background:
    radial-gradient(ellipse, color-mix(in srgb, var(--acc) 16%, transparent), transparent 70%);
  transform: rotateX(68deg) rotateZ(-7deg);
  box-shadow: 0 0 44px -24px var(--acc);
}
.kz3-hero-primary {
  position: absolute;
  left: 50%;
  bottom: 3%;
  margin-left: -56px;
}
.kz3-hero-secondary {
  position: absolute;
  left: 8%;
  top: 3%;
}
.kz3-hero-tertiary {
  position: absolute;
  right: 5%;
  top: 18%;
}
.kz3-hero-wire {
  position: absolute;
  left: 17%;
  right: 18%;
  top: 52%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--acc), transparent);
  opacity: .48;
}
.kz3-hero-wire::before,
.kz3-hero-wire::after {
  content: "";
  position: absolute;
  top: -3px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--acc3);
  box-shadow: 0 0 12px var(--acc3);
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
  .kz3-pin-label { display: none; }
  .kz3-pin::before { display: none; }
  .kz3-title-pin {
    margin-inline-start: .16em;
    vertical-align: -.18em;
  }
}

@media (max-width: 900px) {
  .kz-tech-pin,
  .kz-home-terminal-pin,
  .kz-home-cta-pin { display: none; }
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
        <circle cx="46" cy="45" r="3" fill="white" opacity=".65" />
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
      </g>
    );
  }

  return (
    <g filter={`url(#${id}-shadow)`}>
      <polygon points="48,10 82,29 48,48 14,29" fill={top} />
      <polygon points="14,29 48,48 48,86 14,66" fill={side} />
      <polygon points="48,48 82,29 82,66 48,86" fill={front} />
      <polygon points="48,48 82,29 82,66 48,86" fill={texture} opacity=".54" />
      <path d="M24 35 48 48l24-13M48 48v27M57 53l16-9M57 62l16-9" fill="none" stroke="var(--kz3-c)" strokeOpacity=".68" strokeWidth="1.5" />
      <circle cx="48" cy="48" r="4" fill="var(--kz3-c)" />
    </g>
  );
}

export interface KzSpatialIcon3DProps {
  kind: KzSpatialKind;
  size?: number;
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
          "--kz3-size": `${size}px`,
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
        <defs>
          <linearGradient id={`${id}-front`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--kz3-a)" stopOpacity=".92" />
            <stop offset=".45" stopColor="var(--kz3-b)" stopOpacity=".72" />
            <stop offset="1" stopColor="var(--bg2)" />
          </linearGradient>
          <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--kz3-b)" stopOpacity=".62" />
            <stop offset="1" stopColor="var(--bg)" />
          </linearGradient>
          <linearGradient id={`${id}-top`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="var(--kz3-a)" stopOpacity=".58" />
            <stop offset=".55" stopColor="var(--kz3-c)" stopOpacity=".88" />
            <stop offset="1" stopColor="white" stopOpacity=".38" />
          </linearGradient>
          <radialGradient id={`${id}-orb`} cx=".34" cy=".28" r=".72">
            <stop offset="0" stopColor="white" stopOpacity=".9" />
            <stop offset=".18" stopColor="var(--kz3-c)" stopOpacity=".88" />
            <stop offset=".62" stopColor="var(--kz3-a)" stopOpacity=".72" />
            <stop offset="1" stopColor="var(--bg)" />
          </radialGradient>
          <pattern id={`${id}-texture`} width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M0 8 8 0M-2 2 2-2M6 10 10 6" stroke="var(--kz3-c)" strokeOpacity=".25" strokeWidth=".7" />
            <circle cx="2" cy="2" r=".65" fill="var(--kz3-a)" fillOpacity=".42" />
          </pattern>
          <filter id={`${id}-shadow`} x="-35%" y="-35%" width="180%" height="190%">
            <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="var(--kz3-a)" floodOpacity=".24" />
          </filter>
        </defs>
        {geometry(kind, id)}
      </svg>
    </span>
  );
}

export function kindForCategory(category: string): KzSpatialKind {
  if (/language|frontend/i.test(category)) return "code";
  if (/ai|llm|agent|mlops/i.test(category)) return "neural";
  if (/vector|data|database/i.test(category)) return "database";
  if (/cloud|devops/i.test(category)) return "cloud";
  if (/backend|security/i.test(category)) return "shield";
  if (/mobile/i.test(category)) return "mobile";
  return "chip";
}

export function kindForLabel(label: string): KzSpatialKind {
  if (/security|oauth|rbac|encrypt|secret|owasp/i.test(label)) return "shield";
  if (/mobile|flutter|react native|pwa/i.test(label)) return "mobile";
  if (/database|postgres|mysql|mongo|redis|sql|vector|faiss|pinecone/i.test(label)) return "database";
  if (/cloud|aws|azure|gcp|docker|kubernetes|terraform/i.test(label)) return "cloud";
  if (/agent|llm|model|ml|pytorch|tensorflow|lang|neural/i.test(label)) return "neural";
  if (/pipeline|ci\/cd|workflow|airflow|actions|monitor/i.test(label)) return "pipeline";
  if (/code|web|react|next|typescript|javascript|python|java|rust|go|c\+\+/i.test(label)) return "code";
  if (/robot|voice/i.test(label)) return "robot";
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

export function KzPageHeroScene({
  primary,
  secondary,
}: {
  primary: KzSpatialKind;
  secondary: KzSpatialKind;
}) {
  return (
    <div className="kz3-hero-scene" aria-hidden="true">
      <KzSpatialStyles />
      <span className="kz3-hero-wire" />
      <KzSpatialIcon3D
        kind={primary}
        size={112}
        className="kz3-hero-primary"
        tone="blue"
      />
      <KzSpatialIcon3D
        kind={secondary}
        size={58}
        delay={-1.8}
        className="kz3-hero-secondary"
        tone="violet"
      />
      <KzSpatialIcon3D
        kind="cube"
        size={38}
        delay={-3.1}
        className="kz3-hero-tertiary"
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
