"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { KzEyebrow, KzSectionTitle } from "./primitives";
import { KzReveal } from "./KzReveal";
import { KzIcon, type KzIconKey } from "./KzIcon";

export interface KzLifecycleStageDetail {
  key: string;
  label: string;
  title: string;
  lead: string;
  points: { lead: string; rest: string }[];
  links?: { label: string; href: string }[];
  icon?: KzIconKey;
}

export interface KzLifecycleRingProps {
  stages: KzLifecycleStageDetail[];
  eyebrow?: string;
  title: React.ReactNode;
}

/* The wide composition (giant off-canvas circle + pinned panel) needs both the
   horizontal room and a scrollbar long enough to turn the ring, so it starts at
   the tablet breakpoint. Below it the section is a rail plus a stacked panel. */
const KZLR_WIDE = "(min-width: 900px)";
const KZLR_REDUCED = "(prefers-reduced-motion: reduce)";

/* Fraction of a segment spent turning; the rest is dwell on the stage, so the
   ring reads as "advance, hold, advance" rather than a constant crawl. */
const KZLR_TURN_START = 0.22;
const KZLR_TURN_SPAN = 0.56;

/* The site header is fixed at this height (see KzHeader). One constant feeds
   both the stylesheet and the scroll driver: the panel pins below the header
   rather than under it, and scroll depth is measured from that same line, so
   the two can never drift apart and clip the panel's opening lines. */
const KZLR_HEAD = 72;

function mediaSubscriber(query: string) {
  return (onChange: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  };
}

const kzlrSubWide = mediaSubscriber(KZLR_WIDE);
const kzlrSubReduced = mediaSubscriber(KZLR_REDUCED);
const kzlrGetWide = () => window.matchMedia(KZLR_WIDE).matches;
const kzlrGetReduced = () => window.matchMedia(KZLR_REDUCED).matches;
/* A static export has no viewport, so both queries resolve false on the server.
   The markup is identical either way — the queries only decide which effects
   run — so there is nothing for hydration to disagree about. */
const kzlrGetFalse = () => false;

function useKzlrMedia(subscribe: (cb: () => void) => () => void, snapshot: () => boolean) {
  return useSyncExternalStore(subscribe, snapshot, kzlrGetFalse);
}

/* Custom properties are not part of React's CSSProperties surface. */
function kzlrVars(entries: Record<string, string | number>): CSSProperties {
  return entries as CSSProperties;
}

function kzlrSegmentEase(t: number) {
  const u = Math.min(1, Math.max(0, (t - KZLR_TURN_START) / KZLR_TURN_SPAN));
  return u * u * (3 - 2 * u);
}

function kzlrOrdinal(index: number) {
  return String(index + 1).padStart(2, "0");
}

const KZLR_CSS = `
.kzlr{
  position:relative;
  --kzlr-head:${KZLR_HEAD}px;
  --kzlr-d:clamp(420px,min(48vw,66svh),700px);
  --kzlr-r:calc(var(--kzlr-d) / 2);
  --kzlr-step:56svh;
  --kzlr-band:clamp(16px,1.8vw,28px);
  --kzlr-node:clamp(54px,4vw,62px);
  /* Viewport-to-content inset. Subtracting it below puts the wheel's centre
     on the left edge of the screen, leaving one clean half-circle visible. */
  --kzlr-edge:max(clamp(18px,4.5vw,36px),calc((100vw - var(--container-site))/2 + 36px));
  /* Pills ride the centreline of the band rather than its outer edge, so they
     read as sitting ON the arc instead of floating beside it. */
  --kzlr-pr:calc(var(--kzlr-r) - var(--kzlr-band) / 2);
  --kzlr-glow:color-mix(in srgb,var(--acc) 74%,transparent);
  --kzlr-rim:color-mix(in srgb,var(--acc2) 92%,transparent);
  /* A dark halo punched around each pill so a label reading over the lit band
     never fights the band for the same pixels. */
  --kzlr-cut:color-mix(in srgb,var(--bg) 78%,transparent);
  --kzlr-lead:color-mix(in srgb,var(--acc) 68%,var(--ink));
  /* One easing language across the whole section. */
  --kzlr-ease:cubic-bezier(.22,1,.36,1);
  --kzlr-mask:radial-gradient(farthest-side,#0000 calc(100% - var(--kzlr-band)),#000 calc(100% - var(--kzlr-band) + 1px));
  padding-block:clamp(38px,6vw,76px);
}
/* Unpinned the section is ordinary flow, so only the horizontal bleed needs
   containing; the pinned rule below swaps in a full clip for the giant circle. */
.kzlr-sticky{position:relative;overflow-x:clip}
.kzlr-inner{position:relative;display:grid;gap:clamp(20px,3vw,34px)}
.kzlr-head{max-width:34ch;position:relative;z-index:1}

.kzlr-rail{
  position:relative;z-index:1;
  display:flex;gap:8px;overflow-x:auto;padding:2px 2px 6px;margin:0 -2px;
  scroll-snap-type:x proximity;scrollbar-width:none;overscroll-behavior-x:contain;
  scroll-padding-inline: 16px;
}
.kzlr-rail::-webkit-scrollbar{display:none}
.kzlr-tab{
  flex:none;scroll-snap-align:center;display:inline-flex;align-items:center;gap:9px;
  min-height:44px;padding:0 16px;border-radius:999px;border:1px solid var(--line);
  background:transparent;color:var(--mut);cursor:pointer;
  font-family:var(--font-mono);font-size:.68rem;font-weight:500;letter-spacing:.13em;
  text-transform:uppercase;text-align:left;
  transition:color .25s var(--kzlr-ease),border-color .25s var(--kzlr-ease),
    background .25s var(--kzlr-ease),transform .25s var(--kzlr-ease);
}
.kzlr-tab-n{opacity:.5}
.kzlr-tab[aria-current="step"]{
  color:var(--acc);
  border-color:color-mix(in srgb,var(--acc) 55%,transparent);
  background:color-mix(in srgb,var(--acc) 11%,transparent);
}
.kzlr-tab[aria-current="step"] .kzlr-tab-n{opacity:.8}

/* z-index:0 makes the stage its own layer, so the dial's wide bloom is
   confined below the heading and the rail instead of washing across them. */
.kzlr-stage{position:relative;z-index:0;display:grid;gap:clamp(22px,4vw,40px)}
.kzlr-ringwrap{
  position:relative;width:var(--kzlr-d);height:var(--kzlr-d);
  justify-self:center;flex:none;pointer-events:none;
}
/* Three concentric strokes plus one halo turn the band into an instrument
   instead of the near-invisible smudge a --bg2 border made of it on a
   near-black canvas. None of this chrome animates, so the glow costs one
   composited paint and never a frame during the scrub. */
.kzlr-ringwrap::before,
.kzlr-ringwrap::after{content:"";position:absolute;border-radius:50%}
.kzlr-ringwrap::before{
  inset:0;border:1px solid var(--kzlr-rim);
  box-shadow:
    0 0 0 1px color-mix(in srgb,var(--acc) 30%,transparent),
    0 0 16px -1px var(--kzlr-glow),
    0 0 clamp(46px,7vw,150px) -14px var(--kzlr-glow);
}
.kzlr-ringwrap::after{
  inset:var(--kzlr-band);
  border:1px solid color-mix(in srgb,var(--acc2) 66%,transparent);
  box-shadow:0 0 22px -6px var(--kzlr-glow);
}
.kzlr-arc{
  position:absolute;inset:0;border-radius:50%;
  background:
    conic-gradient(from 90deg,
      color-mix(in srgb,var(--acc2) 96%,transparent) 0deg,
      color-mix(in srgb,var(--acc3) 76%,transparent) 96deg,
      color-mix(in srgb,var(--acc) 38%,transparent) 208deg,
      color-mix(in srgb,var(--acc2) 72%,transparent) 302deg,
      color-mix(in srgb,var(--acc2) 96%,transparent) 360deg),
    var(--bg2);
  -webkit-mask:var(--kzlr-mask);
  mask:var(--kzlr-mask);
}
.kzlr-orbit{
  position:absolute;inset:calc(var(--kzlr-band) + clamp(9px,1.2vw,20px));
  border-radius:50%;border:1px dashed color-mix(in srgb,var(--acc) 40%,transparent);
  animation:kzOrbit 120s linear infinite;
}
.kzlr-ring{position:absolute;inset:0;z-index:1}
/* will-change is a standing promise to keep a compositor layer alive, so the
   scroll driver hands it over only while the section is on screen and scroll can
   actually turn the ring. Unconditionally, as it was, the layer's GPU memory was
   held for the life of the page — and on a phone the ring only moves on a rail
   tap, where the transition below promotes it for its own duration anyway. */
.kzlr-ring[data-turning="true"]{will-change:transform}
.kzlr-pill{
  position:absolute;left:50%;top:50%;
  display:inline-flex;align-items:center;justify-content:center;
  min-height:40px;padding:0 15px;white-space:nowrap;border-radius:999px;
  border:1px solid color-mix(in srgb,var(--acc2) 46%,var(--line2));
  background:var(--bg2);color:var(--ink);
  box-shadow:0 0 0 5px var(--kzlr-cut);
  font-family:var(--font-mono);font-size:.68rem;letter-spacing:.13em;
  text-transform:uppercase;text-align:left;
  transform:translate(-50%,-50%) rotate(var(--kzlr-a)) translateX(var(--kzlr-pr)) translateX(var(--kzlr-shift,0px));
  transition:opacity .25s var(--kzlr-ease),color .35s var(--kzlr-ease),border-color .35s var(--kzlr-ease),
    background .35s var(--kzlr-ease),box-shadow .35s var(--kzlr-ease),
    transform .45s var(--kzlr-ease);
}
.kzlr-pill.is-on{
  color:var(--bg);
  border-color:color-mix(in srgb,var(--acc) 92%,transparent);
  background:color-mix(in srgb,var(--acc) 92%,var(--bg2));
  box-shadow:0 0 0 5px var(--kzlr-cut),0 0 30px -2px var(--kzlr-glow);
}
.kzlr-node{
  position:absolute;left:calc(100% - var(--kzlr-band) / 2);top:50%;z-index:2;
  min-width:clamp(132px,11vw,164px);height:var(--kzlr-node);padding:0 16px;border-radius:999px;
  display:flex;align-items:center;justify-content:center;gap:10px;
  background:radial-gradient(circle at 50% 34%,color-mix(in srgb,var(--acc) 40%,var(--bg2)),var(--bg2) 74%);
  border:1px solid var(--kzlr-rim);
  box-shadow:
    0 0 0 6px color-mix(in srgb,var(--acc) 20%,transparent),
    0 0 44px 0 var(--kzlr-glow),
    inset 0 0 20px -8px color-mix(in srgb,var(--acc) 80%,transparent);
  transform:translate(-50%,-50%);
}
.kzlr-node::after{
  content:"";position:absolute;inset:-10px;border-radius:999px;
  border:1px solid color-mix(in srgb,var(--acc2) 66%,transparent);
  animation:kzPulse 2.6s ease-in-out infinite;
}
.kzlr-focus{display:grid;gap:1px;min-width:0;text-align:left}
.kzlr-focus small{
  color:var(--acc3);font:600 .56rem var(--font-mono);letter-spacing:.14em;
}
.kzlr-focus b{
  overflow:hidden;text-overflow:ellipsis;color:var(--ink);
  font:650 .73rem var(--font-mono);letter-spacing:.12em;text-transform:uppercase;
}
.kzlr-hub{
  position:absolute;inset:0;display:none;place-content:center;justify-items:center;gap:3px;
  font-family:var(--font-mono);text-transform:uppercase;
}
.kzlr-hub b{color:var(--ink);font-size:.72rem;letter-spacing:.13em}
.kzlr-hub small{color:var(--mut);font-size:.56rem;letter-spacing:.15em}

.kzlr-panel{position:relative;z-index:1;min-width:0}
.kzlr-body{display:grid;gap:clamp(11px,1.5vw,17px);min-width:0;--kzlr-from:20px}
.kzlr-body[data-dir="-1"]{--kzlr-from:-20px}
.kzlr-body :is(.kzlr-kicker,.kzlr-title,.kzlr-lead,.kzlr-points,.kzlr-links){
  animation:kzlrIn .52s var(--kzlr-ease) both;
}
.kzlr-body .kzlr-title{animation-delay:.05s}
.kzlr-body .kzlr-lead{animation-delay:.1s}
.kzlr-body .kzlr-points{animation-delay:.15s}
.kzlr-body .kzlr-links{animation-delay:.2s}
@keyframes kzlrIn{
  from{opacity:0;transform:translate3d(0,var(--kzlr-from),0)}
  to{opacity:1;transform:none}
}
.kzlr-kicker{
  font-family:var(--font-mono);font-size:.66rem;letter-spacing:.2em;
  text-transform:uppercase;text-align:left;color:var(--acc);
}
.kzlr-title{
  margin:0;font-family:var(--font-display);font-weight:600;
  font-size:clamp(1.5rem,3.6vw,2.6rem);line-height:1.06;letter-spacing:-.045em;
  color:var(--ink);text-align:left;
}
.kzlr-lead{margin:0;max-width:56ch;color:var(--kzlr-lead);font-size:clamp(.97rem,1.3vw,1.1rem)}
.kzlr-points{list-style:none;margin:0;padding:0;display:grid;gap:10px;max-width:62ch}
.kzlr-points li{
  position:relative;padding-left:23px;color:var(--mut);font-size:.94rem;
}
.kzlr-points li::before{
  content:"";position:absolute;left:0;top:.58em;width:7px;height:7px;
  border-radius:50%;border:1px solid var(--acc);
}
.kzlr-points b{color:var(--ink);font-weight:600}
.kzlr-links{display:flex;flex-wrap:wrap;gap:10px;margin-top:5px}
.kzlr-link{
  display:inline-flex;align-items:center;gap:10px;min-height:44px;padding:0 20px;
  border-radius:999px;border:1px solid var(--line2);color:var(--ink);
  font-family:var(--font-mono);font-size:.69rem;font-weight:600;letter-spacing:.11em;
  text-transform:uppercase;text-align:left;
  transition:transform .25s var(--kzlr-ease),border-color .25s var(--kzlr-ease),
    color .25s var(--kzlr-ease);
}

.kzlr-all{
  position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;
  overflow:hidden;clip-path:inset(50%);white-space:nowrap;list-style:none;
}
.kzlr-all .kzlr-body :is(.kzlr-kicker,.kzlr-title,.kzlr-lead,.kzlr-points,.kzlr-links){
  animation:none;
}

@media (hover:hover){
  .kzlr-tab:hover{color:var(--ink);border-color:var(--line2);transform:translateY(-2px)}
  .kzlr-link:hover{transform:translateY(-2px);border-color:var(--acc);color:var(--acc)}
}

/* Phone: no pinning and no giant circle. A compact centred dial sits above a
   full-width panel, and the rail above it is the control. */
@media (max-width:899px){
  /* Was min(230px,62vw), which spent ~256px of an 844px viewport — 30% of the
     screen — on a disc containing about 34px of ink, and that ink repeated the
     stage name shown by the highlighted pill directly above it and by the
     kicker directly below. Two thirds the diameter keeps it legible as an
     instrument without asking for a screenful. */
  .kzlr{--kzlr-d:min(158px,42vw);--kzlr-band:9px;--kzlr-node:36px}
  /* The node straddles twelve o'clock and its halo reaches further still, so
     the dial needs headroom the rail above it will not fill. */
  .kzlr-ringwrap{margin-top:18px}
  .kzlr-ring{transition:transform .7s var(--kzlr-ease)}
  .kzlr-pill{min-height:0;width:9px;height:9px;padding:0;border-radius:50%;box-shadow:none}
  .kzlr-pill.is-on{box-shadow:0 0 14px -1px var(--kzlr-glow)}
  .kzlr-pill span{display:none}
  .kzlr-node{
    left:50%;top:calc(var(--kzlr-band) / 2);min-width:var(--kzlr-node);width:var(--kzlr-node);
    padding:0;border-radius:50%;
  }
  .kzlr-node::after{inset:-10px;border-radius:50%}
  .kzlr-focus{display:none}
  .kzlr-hub{display:grid}
}

@media (min-width:900px){
  /* The wheel's centre sits on the viewport edge, making the visible shape a
     true half-circle with the active readout at its middle focus point. */
  .kzlr-ringwrap{
    position:absolute;left:calc(var(--kzlr-edge) * -1);top:50%;
    transform:translate(-50%,-50%);
  }
  .kzlr-stage{
    grid-template-columns:max(0px,calc(var(--kzlr-r) - var(--kzlr-edge) + clamp(64px,6vw,94px))) minmax(0,1fr);
    align-items:center;
  }
  .kzlr-panel{grid-column:2}
  /* The focus capsule owns the active word at three o'clock, so the matching
     orbit pill fades instead of duplicating the same label underneath it. */
  .kzlr-pill.is-on{opacity:0}
}

@media (min-width:900px) and (prefers-reduced-motion:no-preference){
  .kzlr{padding-block:0;height:calc(100vh - var(--kzlr-head) + (var(--kzlr-n) - 1) * var(--kzlr-step))}
  .kzlr{height:calc(100svh - var(--kzlr-head) + (var(--kzlr-n) - 1) * var(--kzlr-step))}
  /* The pinned frame owns clipping and vertical centring. The compact wheel
     size above already responds to both viewport width and height. */
  .kzlr-sticky{
    position:sticky;top:var(--kzlr-head);
    height:calc(100vh - var(--kzlr-head));
    height:calc(100svh - var(--kzlr-head));
    /* The circle bleeds far outside the panel; clip it here so it can never
       widen the document. */
    overflow:hidden;
    /* Stretch, never centre: a content-sized box centred in the frame is what
       left the void. The frame is handed to .kzlr-inner whole and the grid
       below distributes it. */
    display:flex;align-items:stretch;
  }
  /* The wrap fills the pinned viewport and the stage row absorbs every spare
     pixel, so the composition is vertically composed rather than stacked at
     the top edge over a void. */
  .kzlr-inner{
    width:100%;height:100%;
    grid-template-rows:auto auto minmax(0,1fr);
    gap:clamp(16px,2vw,26px);
    padding-block:clamp(8px,1.6vh,20px);
  }
  .kzlr-stage{min-height:0}
  /* Fit first: the tightened scale below puts the tallest stage inside a
     900px-tall window with room to spare. If a shorter window or a larger
     text size still overflows, the panel scrolls itself rather than being
     silently cut off by the sticky clip — and scroll chaining is left alone
     so reaching its end hands the wheel straight back to the page and the
     ring keeps turning. */
  .kzlr-panel{
    max-height:100%;min-height:0;padding-block:4px;
    overflow:hidden auto;scrollbar-width:thin;scrollbar-gutter:stable;
  }
  .kzlr-body{gap:clamp(10px,1.1vw,14px);--kzlr-from:14px}
  .kzlr-body[data-dir="-1"]{--kzlr-from:-14px}
  .kzlr-title{font-size:clamp(1.45rem,2.5vw,2.05rem)}
  .kzlr-lead{font-size:clamp(.95rem,1.05vw,1.02rem);max-width:60ch}
  .kzlr-points{gap:8px;max-width:68ch}
  .kzlr-points li{font-size:.9rem;line-height:1.55}
}

@media (prefers-reduced-motion:reduce){
  /* React drops the ring, rail and panel once it knows the preference; this
     keeps the exported HTML from showing them for that first paint. */
  .kzlr-rail,.kzlr-stage{display:none}
  .kzlr-all{
    position:static;width:auto;height:auto;margin:clamp(20px,4vw,32px) 0 0;
    overflow:visible;clip-path:none;white-space:normal;
    display:grid;gap:clamp(14px,2.6vw,22px);
  }
  .kzlr-all>li{
    border:1px solid var(--line);border-radius:16px;background:var(--card);
    padding:clamp(18px,3.4vw,28px);
  }
}
`;

function KzlrStageBody({
  stage,
  index,
  count,
  dir,
  withLinks,
}: {
  stage: KzLifecycleStageDetail;
  index: number;
  count: number;
  dir: 1 | -1;
  withLinks: boolean;
}) {
  return (
    <div className="kzlr-body" data-dir={dir}>
      <p className="kzlr-kicker">
        Stage {kzlrOrdinal(index)} / {kzlrOrdinal(count - 1)} — {stage.label}
      </p>
      <h3 className="kzlr-title">{stage.title}</h3>
      <p className="kzlr-lead">{stage.lead}</p>
      {stage.points.length > 0 && (
        <ul className="kzlr-points">
          {stage.points.map((point) => (
            <li key={point.lead}>
              <b>{point.lead}</b> {point.rest}
            </li>
          ))}
        </ul>
      )}
      {withLinks && stage.links && stage.links.length > 0 && (
        <div className="kzlr-links">
          {stage.links.map((link) =>
            link.href.startsWith("/") ? (
              <Link key={link.href} href={link.href} className="kzlr-link">
                {link.label}
                <span aria-hidden="true">↗</span>
              </Link>
            ) : (
              <a key={link.href} href={link.href} className="kzlr-link">
                {link.label}
                <span aria-hidden="true">↗</span>
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
}

export function KzLifecycleRing({
  stages,
  eyebrow,
  title,
}: KzLifecycleRingProps): React.ReactElement {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const [stage, setStage] = useState<{ index: number; dir: 1 | -1 }>({ index: 0, dir: 1 });

  const wide = useKzlrMedia(kzlrSubWide, kzlrGetWide);
  const reduced = useKzlrMedia(kzlrSubReduced, kzlrGetReduced);

  const count = stages.length;
  const step = count > 0 ? 360 / count : 0;
  const pinned = wide && !reduced && count > 1;
  const active = Math.min(stage.index, Math.max(0, count - 1));

  /* Scroll driver. The section is (count - 1) viewport-steps tall and its only
     child pins for that whole span, so depth through the section maps linearly
     onto a continuous ring angle and, once a segment passes its midpoint, onto
     the next stage. Scrolling back up runs the same map in reverse. The pin
     line sits KZLR_HEAD below the viewport top, so depth is measured from
     there rather than from zero. */
  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const ring = ringRef.current;
    if (!section || !sticky || !ring || !pinned) return;

    let raf = 0;
    let visible = false;
    let last = -1;

    const frame = () => {
      raf = 0;
      const total = section.offsetHeight - sticky.offsetHeight;
      if (total <= 0) return;
      const depth = KZLR_HEAD - section.getBoundingClientRect().top;
      const progress = Math.min(1, Math.max(0, depth / total));
      const travelled = progress * (count - 1);
      const from = Math.min(count - 2, Math.floor(travelled));
      const eased = kzlrSegmentEase(travelled - from);

      ring.style.transform = `rotate(${(-(from + eased) * step).toFixed(3)}deg)`;

      const next = eased < 0.5 ? from : from + 1;
      if (next === last) return;
      const dir: 1 | -1 = next > last ? 1 : -1;
      last = next;
      setStage({ index: next, dir });
    };

    /* Passive listeners only ever queue a frame, and at most one is ever in
       flight, so scrolling never forces a synchronous layout. */
    const schedule = () => {
      if (raf || !visible) return;
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) ring.dataset.turning = "true";
      else delete ring.dataset.turning;
      schedule();
    });
    io.observe(section);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      io.disconnect();
      delete ring.dataset.turning;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pinned, count, step]);

  /* Unpinned (phone, or a narrow desktop window): the dial answers to the rail
     instead of to scroll and CSS transitions the same transform. Twelve o'clock
     is the phone dial's active slot, three o'clock the wide ring's. */
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring || pinned || count < 2) return;
    ring.style.transform = `rotate(${(wide ? 0 : -90) - active * step}deg)`;
  }, [pinned, wide, active, count, step]);

  /* Keep the active control in sight while the rail is a scrolling strip.
     This deliberately scrolls the rail's own scrollLeft rather than calling
     scrollIntoView: scrollIntoView walks up to the nearest scrollable ancestor
     and will scroll the DOCUMENT to reach the element, which on mount threw the
     visitor ~1200px past the hero. A rail-local scroll can never move the page. */
  useEffect(() => {
    if (pinned || reduced) return;
    const rail = railRef.current;
    const item = rail?.children[active] as HTMLElement | undefined;
    if (!rail || !item) return;
    const left = item.offsetLeft - (rail.clientWidth - item.offsetWidth) / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [pinned, reduced, active]);

  const select = useCallback(
    (index: number) => {
      const section = sectionRef.current;
      const sticky = stickyRef.current;
      if (pinned && section && sticky) {
        const total = section.offsetHeight - sticky.offsetHeight;
        const top =
          window.scrollY +
          section.getBoundingClientRect().top -
          KZLR_HEAD +
          (total * index) / (count - 1);
        /* The scroll driver reads the new stage back off the position itself. */
        window.scrollTo({ top, behavior: "smooth" });
        return;
      }
      setStage((prev) => ({ index, dir: index >= prev.index ? 1 : -1 }));
    },
    [pinned, count]
  );

  const current = stages[active];

  return (
    <section className="kzlr" ref={sectionRef} style={kzlrVars({ "--kzlr-n": Math.max(count, 2) })}>
      {/* Raw markup: React escapes ">" in element children, which would corrupt
          the child selectors. The sheet is a module constant, never user data. */}
      <style href="kzlr" precedence="default" dangerouslySetInnerHTML={{ __html: KZLR_CSS }} />

      <div className="kzlr-sticky" ref={stickyRef}>
        <div className="kz-wrap kzlr-inner">
          <KzReveal>
            <div className="kzlr-head">
              {eyebrow && <KzEyebrow>{eyebrow}</KzEyebrow>}
              <KzSectionTitle>{title}</KzSectionTitle>
            </div>
          </KzReveal>

          {!reduced && count > 0 && (
            <>
              <div className="kzlr-rail" ref={railRef}>
                {stages.map((entry, i) => (
                  <button
                    key={entry.key}
                    type="button"
                    className="kzlr-tab"
                    aria-current={i === active ? "step" : undefined}
                    onClick={() => select(i)}
                  >
                    <span className="kzlr-tab-n">{kzlrOrdinal(i)}</span>
                    {entry.label}
                  </button>
                ))}
              </div>

              <div className="kzlr-stage">
                <div className="kzlr-ringwrap" aria-hidden="true">
                  <span className="kzlr-orbit" />
                  <div className="kzlr-ring" ref={ringRef}>
                    <span className="kzlr-arc" />
                    {stages.map((entry, i) => (
                      <span
                        key={entry.key}
                        className={`kzlr-pill${i === active ? " is-on" : ""}`}
                        style={kzlrVars({ "--kzlr-a": `${i * step}deg` })}
                      >
                        <span>{entry.label}</span>
                      </span>
                    ))}
                  </div>
                  <span className="kzlr-node">
                    <KzIcon name={current?.icon ?? "bld"} size={20} />
                    <span className="kzlr-focus">
                      <small>{kzlrOrdinal(active)}</small>
                      <b>{current?.label}</b>
                    </span>
                  </span>
                  <span className="kzlr-hub">
                    <b>{current?.label}</b>
                    <small>{kzlrOrdinal(active)} / {kzlrOrdinal(count - 1)}</small>
                  </span>
                </div>

                <div className="kzlr-panel">
                  {current && (
                    <KzlrStageBody
                      key={current.key}
                      stage={current}
                      index={active}
                      count={count}
                      dir={stage.dir}
                      withLinks
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {/* Every stage stays in the document for assistive tech and crawlers.
              While clipped it carries no focusable links, so it is never a
              keyboard trap; under reduced motion this list is the whole
              section, and then it renders the links too. */}
          <ol className="kzlr-all">
            {stages.map((entry, i) => (
              <li key={entry.key}>
                <KzlrStageBody stage={entry} index={i} count={count} dir={1} withLinks={reduced} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
