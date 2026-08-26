"use client";

/**
 * KzHeroStory — the scroll-story hero adapted from the v1 mockup
 * (kenzed-techlab-homepage-project-v1). The mechanism is the mockup's; every
 * word of copy is the site's own. A ~235svh section pins a 100svh stage; a
 * single rAF-coalesced scroll listener writes a lerped 0→1 progress into the
 * `--progress` custom property, and pure CSS derives every fade, drift and
 * scrub from it — so the main thread does one style write per frame no matter
 * how many layers move.
 *
 * House motion rules honoured here:
 *   - only transform / opacity / filter are animated (the mockup's scan line
 *     and meter animated `top`/`width`; both are re-expressed as transforms);
 *   - one easing curve, cubic-bezier(0.22, 1, 0.36, 1);
 *   - nothing above the fold animates on first paint: the h1 is server-painted
 *     at its final position and opacity, with no entrance attached;
 *   - `prefers-reduced-motion` collapses the story into normal flow — static
 *     art, stage 2 rendered below stage 1, no marquee, no parallax.
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { KzButton } from "@/components/kz/primitives";
import { KzMagnetic } from "@/components/kz/motion/KzPointer";
import { KzCountUp } from "@/components/kz/motion/KzFeedback";
import { kzStats } from "@/content/kz";
import { asset, site } from "@/content/site";

/** Capabilities repeated across the seamless hero ribbon. */
const KZ_RIBBON_ITEMS = [
  "Agentic AI",
  "RAG Pipelines",
  "LLM Fine-Tuning",
  "Voice AI",
  "MCP Integrations",
  "Computer Vision",
  "3D Web / WebGL",
  "On-Prem GPU Compute",
  "Enterprise Software",
  "Adaptive UI/UX",
  "MLOps · CI/CD",
  "Multi-Agent Systems",
];

/**
 * Particle positions are derived from the index, never Math.random — the
 * server HTML and the hydrated client must render identical markup, and a
 * random layout would tear on hydration.
 */
const KZ_PARTICLES = Array.from({ length: 20 }, (_, index) => ({
  left: `${5 + ((index * 17) % 90)}%`,
  top: `${7 + ((index * 29) % 80)}%`,
  delay: `${(index % 8) * -0.72}s`,
}));

/**
 * The phone layout query, shared by the stylesheet's phone block below and by
 * the scroll driver. The two must agree exactly: the phone block flattens the
 * story into ordinary flow and nothing there consumes `--progress`, so a
 * driver working from a different breakpoint would scrub a layout that has
 * already stopped listening.
 */
const KZ_PHONE_QUERY =
  "(max-width:767px), (max-width:920px) and (max-height:560px) and (pointer:coarse)";

/* ==========================================================================
   Styles. Injected the same way KzFeedback injects its sheet: React 19
   dedupes by href + precedence. Colours read from the theme tokens; the only
   hardcoded darks live in the art overlays, which are gated to the dark theme
   because the render they grade is intrinsically dark.
   ========================================================================== */

const KZ_HERO_STORY_CSS = `
.kzhs-story{
  --progress:0;--pointer-x:0;--pointer-y:0;
  --kzhs-ease:cubic-bezier(0.22,1,0.36,1);
  /* Matches the kz-wrap gutter: 1280px container, up to 36px inline padding. */
  --kzhs-inset:max(clamp(18px,4.5vw,36px),calc((100vw - var(--container-site))/2 + 36px));
  /* The scroll budget for the whole story. The sticky stage below is 100svh,
     so the travel that maps to progress 0→1 is this MINUS 100svh — at 235svh
     that was 135svh, a screen and a third of scrolling before the page moved
     on, which read as the hero refusing to end. 185svh puts it at 85svh.
     Every stage threshold is a fraction of progress, so the sequence keeps its
     proportions and simply plays over less scroll. */
  position:relative;height:185svh;background:var(--bg);
}
.kzhs-sticky{position:sticky;top:0;height:100svh;min-height:660px;overflow:hidden;isolation:isolate;background:var(--bg)}

/* --- Art: blur-up on load, scroll drift + pointer parallax on the frame. --- */
.kzhs-frame{
  position:absolute;z-index:-5;inset:-3%;
  opacity:0;filter:blur(18px) saturate(.7) brightness(.78);
  transform:translate3d(calc(var(--pointer-x)*-8px),calc((var(--progress)*-10vh) + (var(--pointer-y)*-5px)),0) scale(calc(1.015 + var(--progress)*.085));
  transition:opacity .7s var(--kzhs-ease),filter .8s var(--kzhs-ease);
}
/* The frame is the only layer worth promoting, but it scrubs for exactly the
   235svh the story occupies. An unconditional will-change kept a full-viewport
   composited layer — and the memory its blurred raster costs — alive for the
   whole life of the page, so the driver now flags it only while the story is
   on screen and actually being scrubbed. */
.kzhs-story[data-kzhs-live="true"] .kzhs-frame{will-change:transform}
.kzhs-frame.is-loaded{opacity:1;filter:blur(0) saturate(.83) contrast(1.07) brightness(.86)}
.kzhs-frame.is-loaded::after{content:'';position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(105deg,transparent 38%,rgba(255,255,255,.035) 46%,rgba(255,255,255,.045) 50%,rgba(255,255,255,.035) 54%,transparent 62%);background-size:250% 100%;mix-blend-mode:soft-light;animation:kzhsShimmer 60s linear infinite}
@keyframes kzhsShimmer{0%{background-position:250% center}100%{background-position:-250% center}}
.kzhs-scene{
  position:absolute;z-index:-4;inset:0;
  background:
    radial-gradient(circle at calc(68% + var(--pointer-x)*3%) calc(68% + var(--pointer-y)*2%),rgba(77,163,255,.1),transparent 38%),
    linear-gradient(90deg,rgba(2,6,10,.88) 0%,rgba(2,7,12,.62) 31%,rgba(2,7,12,.04) 66%),
    linear-gradient(180deg,rgba(3,7,12,.58) 0%,transparent 30%,transparent 67%,rgba(3,7,12,.8) 100%);
}
.kzhs-vignette{
  position:absolute;z-index:3;inset:0;pointer-events:none;
  box-shadow:inset 0 0 150px 45px rgba(0,0,0,.42);
  background:linear-gradient(180deg,rgba(1,5,9,.2),transparent 30%,transparent 72%,rgba(2,6,10,.55));
}
/* The 3D render and its grading gradients are intrinsically dark; over the
   light palette they would bury the copy, so — like the old LED block — they
   simply do not render there. Everything else reads from tokens and adapts. */
[data-kz-theme="light"] .kzhs-frame,
[data-kz-theme="light"] .kzhs-scene,
[data-kz-theme="light"] .kzhs-vignette{display:none}

/* --- Perspective floor grid, brightening as the story descends. --- */
.kzhs-grid{
  position:absolute;z-index:-3;inset:37% 0 0;
  opacity:calc(.05 + var(--progress)*.22);
  background-image:
    linear-gradient(color-mix(in srgb,var(--acc2) 24%,transparent) 1px,transparent 1px),
    linear-gradient(90deg,color-mix(in srgb,var(--acc2) 18%,transparent) 1px,transparent 1px);
  background-size:64px 64px;
  transform:perspective(500px) rotateX(61deg) scale(1.55) translateY(calc(var(--progress)*-28px));
  transform-origin:center top;
  -webkit-mask-image:linear-gradient(transparent,#000 20%,#000 70%,transparent);
  mask-image:linear-gradient(transparent,#000 20%,#000 70%,transparent);
}

/* --- Floating particles over the lower art. --- */
.kzhs-particles{position:absolute;z-index:2;inset:35% 0 0;pointer-events:none;opacity:clamp(0,calc((var(--progress) - .18)*3),.72)}
.kzhs-particles i{
  position:absolute;width:2px;height:2px;border-radius:50%;
  background:var(--acc2);box-shadow:0 0 10px 2px var(--acc);
  animation:kzhsParticle 5s ease-in-out infinite;
}
@keyframes kzhsParticle{0%,100%{transform:translate3d(0,8px,0);opacity:.2}50%{transform:translate3d(0,-18px,0);opacity:1}}

/* --- Surface marker between the visible product and the foundation. --- */
.kzhs-marker{
  position:absolute;z-index:5;top:36.2%;left:0;width:100%;
  display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;
  padding:0 var(--kzhs-inset);
  color:var(--dim);font:500 9px var(--font-mono);letter-spacing:.16em;
  opacity:clamp(0,calc(1 - var(--progress)*2.2),.7);pointer-events:none;
}
@media (max-width:1559px){.kzhs-marker span:first-child{visibility:hidden}}
.kzhs-marker i{
  height:1px;
  background:linear-gradient(90deg,color-mix(in srgb,var(--acc3) 14%,transparent),color-mix(in srgb,var(--acc3) 75%,transparent),color-mix(in srgb,var(--acc3) 14%,transparent));
  box-shadow:0 0 14px color-mix(in srgb,var(--acc) 30%,transparent);
}

/* --- Descending scan line. Scrubbed via transform, never top. --- */
.kzhs-scan{
  position:absolute;z-index:2;top:35%;left:0;width:100%;height:1px;
  transform:translateY(calc(var(--progress)*48svh));
  opacity:clamp(0,calc((var(--progress) - .06)*2),.42);
  background:linear-gradient(90deg,transparent 5%,color-mix(in srgb,var(--acc3) 16%,transparent),var(--acc3) 50%,color-mix(in srgb,var(--acc3) 16%,transparent),transparent 95%);
  box-shadow:0 0 22px color-mix(in srgb,var(--acc) 35%,transparent);
}
.kzhs-scan i{position:absolute;right:8%;top:-3px;width:7px;height:7px;border-radius:50%;background:var(--acc2);box-shadow:0 0 18px 4px var(--acc)}

/* --- Stage 1: the site's hero copy, fading out as the story descends. --- */
.kzhs-copy{
  position:absolute;z-index:10;left:var(--kzhs-inset);top:50%;
  width:min(730px,61vw);
  transform:translateY(calc(-50% + var(--progress)*-62px));
}
.kzhs-intro{opacity:clamp(0,calc(1 - var(--progress)*2.15),1)}
/* Once stage 2 owns the viewport the invisible CTAs must stop catching taps. */
.kzhs-story[data-kzhs-past="true"] .kzhs-intro{visibility:hidden}
.kzhs-eyebrow{
  display:flex;align-items:center;gap:10px;margin:0 0 21px;
  color:var(--mut);font:520 10px var(--font-mono);letter-spacing:.13em;text-transform:uppercase;
}
.kzhs-eyebrow > i{width:7px;height:7px;flex:none;border-radius:50%;background:var(--acc3);box-shadow:0 0 16px var(--acc3)}
.kzhs-title{
  margin:0;color:var(--ink);font-family:var(--font-display);
  font-size:clamp(2.6rem,6.7vw,6.5rem);line-height:.9;letter-spacing:-.06em;font-weight:560;
  text-wrap:balance;
}
.kzhs-lede{max-width:550px;margin:28px 0 0;color:var(--mut);font-size:clamp(16px,1.3vw,20px);line-height:1.56}
.kzhs-actions{display:flex;flex-wrap:wrap;gap:11px;margin-top:33px}

/* --- Stage 2: the foundation reveal, fading in past ~0.35 progress. --- */
.kzhs-reveal{
  position:absolute;z-index:10;right:var(--kzhs-inset);top:15%;
  width:min(610px,46vw);padding:clamp(20px,2vw,28px);
  border:1px solid color-mix(in srgb,var(--acc2) 28%,var(--line));
  border-radius:20px;
  background:linear-gradient(145deg,color-mix(in srgb,var(--bg) 86%,transparent),color-mix(in srgb,var(--bg2) 70%,transparent));
  box-shadow:0 28px 90px -46px color-mix(in srgb,var(--acc) 65%,transparent),inset 0 1px 0 color-mix(in srgb,var(--ink) 8%,transparent);
  backdrop-filter:blur(18px) saturate(120%);
  -webkit-backdrop-filter:blur(18px) saturate(120%);
  opacity:clamp(0,calc((var(--progress) - .34)*4.2),1);
  transform:translate3d(calc(var(--pointer-x)*7px),calc((1 - var(--progress))*42px),0);
  pointer-events:none;
}
.kzhs-reveal .kzhs-eyebrow{color:color-mix(in srgb,var(--acc3) 78%,var(--ink));font-weight:650}
.kzhs-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 18px;margin-top:10px}
.kzhs-stat{
  min-height:108px;padding:5px 10px 5px 18px;
  border-left:2px solid color-mix(in srgb,var(--acc2) 58%,var(--line2));
  background:linear-gradient(90deg,color-mix(in srgb,var(--acc) 7%,transparent),transparent 76%);
}
.kzhs-stat-num{
  color:var(--ink);font-family:var(--font-display);font-weight:600;
  font-size:clamp(2.55rem,4.15vw,4rem);line-height:.98;letter-spacing:-.05em;
  text-shadow:0 0 28px color-mix(in srgb,var(--acc) 24%,transparent);
  /* Class-set family bypasses the [style*="--font-display"] tabular catch-all
     in globals.css, so tabular figures are restated here — an animated stat in
     proportional figures visibly shoves its neighbours as it ticks. */
  font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1,"liga" 1,"calt" 1;
}
.kzhs-stat-label{
  margin-top:10px;max-width:22ch;color:color-mix(in srgb,var(--ink) 74%,var(--mut));
  font-family:var(--font-mono);font-size:clamp(.69rem,.72vw,.78rem);font-weight:650;
  letter-spacing:.075em;text-transform:uppercase;line-height:1.42;
}

/* --- Floating mono annotations over the lower art. --- */
.kzhs-notes{position:absolute;z-index:7;inset:0;pointer-events:none;opacity:clamp(0,calc((var(--progress) - .42)*3.2),.78)}
.kzhs-note{
  position:absolute;display:inline-flex;align-items:center;min-height:29px;padding:0 10px;
  border-left:1px solid var(--acc);color:var(--mut);
  background:linear-gradient(90deg,color-mix(in srgb,var(--bg2) 78%,transparent),transparent);
  font:500 9px var(--font-mono);letter-spacing:.04em;white-space:nowrap;
  backdrop-filter:blur(6px);
  animation:kzhsNote 4.8s ease-in-out infinite;
}
.kzhs-note-1{left:49%;bottom:26%}
.kzhs-note-2{left:67%;bottom:10%;animation-delay:-1.5s}
.kzhs-note-3{left:27%;bottom:16%;animation-delay:-2.9s}
@keyframes kzhsNote{0%,100%{transform:translateY(-3px)}50%{transform:translateY(5px)}}

/* --- Scroll meter. The fill scrubs via scaleX, never width. --- */
.kzhs-meter{
  position:absolute;z-index:12;left:var(--kzhs-inset);bottom:66px;
  display:grid;grid-template-columns:auto 110px auto;align-items:center;gap:11px;
  color:var(--dim);font:500 8px var(--font-mono);letter-spacing:.12em;
  opacity:clamp(.25,calc(1 - var(--progress)*.75),.76);
}
.kzhs-meter > i{position:relative;display:block;width:110px;height:1px;background:color-mix(in srgb,var(--line2) 55%,transparent)}
.kzhs-meter b{
  position:absolute;left:0;top:-1px;height:3px;width:100%;border-radius:2px;
  transform:scaleX(var(--progress));transform-origin:left;
  background:var(--acc3);box-shadow:0 0 10px var(--acc);
}
.kzhs-meter strong{color:var(--mut);font-weight:500}

/* --- Capability ribbon: duplicate-track infinite marquee. --- */
.kzhs-ribbon{
  position:absolute;z-index:15;left:0;right:0;bottom:0;overflow:hidden;height:39px;
  border-top:1px solid var(--line);
  background:color-mix(in srgb,var(--bg) 72%,transparent);backdrop-filter:blur(12px);
}
.kzhs-ribbon-track{display:flex;align-items:center;width:max-content;height:100%;animation:kzhsMarquee 36s linear infinite}
.kzhs-ribbon-track span{
  display:inline-flex;align-items:center;gap:10px;padding:0 28px;
  color:var(--mut);font:500 9px var(--font-mono);letter-spacing:.13em;
  text-transform:uppercase;white-space:nowrap;
}
.kzhs-ribbon-track i{width:4px;height:4px;transform:rotate(45deg);border:1px solid var(--acc3);box-shadow:0 0 12px 3px color-mix(in srgb,var(--acc3) 65%,transparent);animation:kzhsDiamond 4s linear infinite}
@keyframes kzhsDiamond{to{transform:rotate(405deg)}}
@keyframes kzhsMarquee{to{transform:translateX(-50%)}}
/* KzAmbient's data-kz-run gate, restated here because its sheet only ships
   when an ambient layer happens to render on the page and the ribbon must not
   depend on that. Without it the marquee and its 24 glowing diamonds ran for
   the life of the page — behind the fold and behind a hidden tab alike. */
.kzhs-ribbon[data-kz-run="0"] .kzhs-ribbon-track,
.kzhs-ribbon[data-kz-run="0"] .kzhs-ribbon-track i{animation-play-state:paused}
/* A rotating 4px glow dot is below the threshold of legibility on a touch
   screen, and there are 24 of them, each repainting its own box-shadow. */
@media (pointer:coarse){
  .kzhs-ribbon-track i{animation:none}
}

@media (max-width:920px){
  .kzhs-copy{width:min(710px,calc(100vw - 48px))}
  .kzhs-reveal{width:min(520px,calc(100vw - 48px))}
}

/* Reduced motion: the story flattens into ordinary flow. The art stays as a
   static backdrop, both stages render in sequence at full opacity, and every
   scrubbed or looping layer disappears rather than freezing mid-state. */
@media (prefers-reduced-motion: reduce){
  .kzhs-story{height:auto}
  .kzhs-sticky{position:relative;height:auto;min-height:0;padding:clamp(96px,14vh,160px) 0 96px}
  .kzhs-frame{transform:none;will-change:auto}
  .kzhs-grid,.kzhs-particles,.kzhs-marker,.kzhs-scan,.kzhs-notes,.kzhs-meter{display:none}
  .kzhs-copy,.kzhs-reveal{
    position:static;width:auto;max-width:var(--container-site);
    margin-inline:auto;padding-inline:clamp(18px,4.5vw,36px);box-sizing:border-box;
    opacity:1;transform:none;
  }
  .kzhs-intro{opacity:1;visibility:visible}
  .kzhs-reveal{margin-top:64px;pointer-events:auto}
  .kzhs-note,.kzhs-particles i{animation:none}
  .kzhs-ribbon{position:static;height:auto;min-height:39px;padding:8px 0}
  .kzhs-ribbon-track{width:100%;flex-wrap:wrap;justify-content:center;animation:none}
  .kzhs-ribbon-track span[aria-hidden]{display:none}
}

/* Phone-first hero: show the complete 16:9 artwork as its own opening panel,
   then put the heading and actions in ordinary document flow below it. This
   intentionally removes the desktop scroll-story on phones: no crop, no
   hidden half of the illustration, and no 210svh spacer to swipe through. */
@media ${KZ_PHONE_QUERY}{
  .kzhs-story{height:auto;--progress:0}
  .kzhs-sticky{
    position:relative;top:auto;height:auto;min-height:0;overflow:hidden;
    display:flex;flex-direction:column;padding:76px 0 0;
  }
  /* The blur-up is opacity-only here. The desktop treatment interpolates a
     blur() across an 800ms transition, which on a phone means a fresh Gaussian
     pass over a viewport-wide 16:9 image — around 1070x600 device pixels —
     every frame, and it starts precisely while React is hydrating. Resting at
     the loaded grade means no filter value ever interpolates. */
  .kzhs-frame{
    position:relative;z-index:0;inset:auto;order:0;width:100%;aspect-ratio:16/9;
    flex:none;opacity:0;transform:none;
    filter:saturate(.92) contrast(1.06) brightness(.92);
    transition:opacity .7s var(--kzhs-ease);
    will-change:auto;background:#02070c;
    -webkit-mask-image:linear-gradient(to bottom,#000 55%,transparent 100%);
    mask-image:linear-gradient(to bottom,#000 55%,transparent 100%);
  }
  /* Restates the filter because the unscoped .kzhs-frame.is-loaded above
     carries two classes to this rule's one and would otherwise win, settling
     the phone on the desktop grade — which is what filter is doing on the
     resting rule just above too. Both endpoints must name the SAME filter, or
     the transition has something to interpolate and the Gaussian is back. */
  .kzhs-frame.is-loaded{opacity:1;filter:saturate(.92) contrast(1.06) brightness(.92)}
  .kzhs-frame.is-loaded::after{display:none}
  .kzhs-frame img{object-fit:contain!important;object-position:center!important}
  [data-kz-theme="light"] .kzhs-frame{display:block}
  .kzhs-scene,.kzhs-grid,.kzhs-vignette,.kzhs-particles,
  .kzhs-marker,.kzhs-scan,.kzhs-notes,.kzhs-meter{display:none}
  /* No backdrop-filter here. A blurred backdrop whose contents never stop
     moving cannot be rasterised once and reused, so the marquee made the
     compositor re-resolve the blurred region every frame; the gradient below
     already carries the separation the blur was doing. */
  .kzhs-ribbon{
    position:relative;left:auto;right:auto;bottom:auto;order:1;height:36px;flex:none;
    margin-top:-22px;z-index:3;border-top:none;
    background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--bg) 58%,transparent) 30%,color-mix(in srgb,var(--bg) 82%,transparent));
    /* The whole point of the phone treatment: the base rule's blur has to be
       cancelled, not merely reduced. A backdrop-filter whose own contents move
       continuously — and this one carries a permanent marquee — makes the
       compositor re-resolve the blurred region every single frame, because the
       blur is not a raster it can reuse. */
    -webkit-backdrop-filter:none;
    backdrop-filter:none;
  }
  .kzhs-ribbon-track span{padding:0 19px;font-size:8px}
  .kzhs-ribbon-track{animation-duration:44s}
  .kzhs-copy{
    position:relative;z-index:2;left:auto;top:auto;order:2;
    width:auto;max-width:none;margin:0;padding:clamp(24px,7vw,38px) 20px 26px;
    opacity:1;visibility:visible;transform:none;
    background:var(--bg);
  }
  .kzhs-story[data-kzhs-past="true"] .kzhs-intro{visibility:visible}
  .kzhs-eyebrow{margin-bottom:16px;font-size:9px;letter-spacing:.1em;line-height:1.5}
  .kzhs-title{font-size:clamp(2.65rem,13.5vw,4.35rem);line-height:.91;letter-spacing:-.057em}
  .kzhs-lede{width:100%;max-width:44ch;margin-top:22px;font-size:16px;line-height:1.58}
  .kzhs-actions{flex-direction:column;width:100%;max-width:390px;margin-top:25px}
  .kzhs-actions .kzmag,.kzhs-actions .kzmag-in,.kzhs-actions .kz-btn{width:100%}
  .kzhs-actions .kz-btn{justify-content:center}
  .kzhs-reveal{
    position:relative;z-index:2;left:auto;right:auto;top:auto;order:3;
    width:auto;max-width:none;margin:0 20px 34px;padding:20px 18px;
    opacity:1;transform:none;pointer-events:auto;border-radius:16px;
  }
  .kzhs-stats{gap:14px 10px;margin-top:6px}
  /* align-content:start so a short cell does not inherit the slack of a taller
     one beside it — the 2x2 grid was giving every cell the height of its
     row's tallest, which showed as a void under the one-line labels. */
  .kzhs-stat{min-height:0;padding:4px 4px 4px 12px;align-content:start}
  /* 11vw put "99.98%" at ~154px inside a ~134px cell, so the percent sign
     orphaned onto a second line and took the whole row with it. Sized to fit
     the widest figure in kzStats, and nowrap so a longer one clips rather
     than silently re-breaking the grid. */
  .kzhs-stat-num{font-size:clamp(1.85rem,8.4vw,3rem);white-space:nowrap}
  .kzhs-stat-label{margin-top:8px;font-size:.66rem;line-height:1.38}
}
`;

export function KzHeroStory() {
  const storyRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const ribbonRef = useRef<HTMLDivElement | null>(null);
  const [artReady, setArtReady] = useState(false);

  /* onLoad can never fire for an image the browser finished before hydration,
     so the cached-visit case is settled by checking `complete` once. */
  useEffect(() => {
    const img = frameRef.current?.querySelector("img");
    if (img?.complete) setArtReady(true);
  }, []);

  /* Scroll → --progress. One passive listener, one rAF chain; frames coalesce
     because the rAF is only queued when none is pending. Reduced motion skips
     the lerp and writes the target directly (the CSS above has already
     flattened the layout, so the value only steers what little remains). */
  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;

    const phone = window.matchMedia(KZ_PHONE_QUERY);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let current = 0;
    let target = 0;
    let past = false;
    let onScreen = false;
    let bound = false;

    const measure = () => {
      const rect = story.getBoundingClientRect();
      const travel = Math.max(1, story.offsetHeight - window.innerHeight);
      target = Math.min(1, Math.max(0, -rect.top / travel));
    };

    const render = () => {
      /* Measuring here rather than in the listener is the point: the two reads
         above force layout, and from the listener they did so synchronously on
         every scroll event instead of once per painted frame. */
      measure();
      /* 0.13, raised with the shorter travel. The factor smooths in PROGRESS,
         not in pixels, so shrinking the story from 135svh of travel to 85svh
         makes the same wheel notch move the target ~1.6x further — and the old
         0.09 then left a visibly bigger gap behind the finger. Matching the two
         keeps the settle time where it was instead of making the art feel like
         it is being dragged along after the scroll. */
      current = reduced ? target : current + (target - current) * 0.13;
      story.style.setProperty("--progress", current.toFixed(4));
      const nextPast = current > 0.5;
      if (nextPast !== past) {
        past = nextPast;
        story.dataset.kzhsPast = String(nextPast);
      }
      /* Against a lerp factor of 0.09, the old 0.001 exit threshold kept the
         chain alive for some 70 frames after the finger left, resolving
         differences finer than a pixel can show; 0.004 settles in about 20. */
      if (Math.abs(target - current) > 0.004) frame = window.requestAnimationFrame(render);
      else frame = 0;
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const bind = () => {
      if (bound) return;
      bound = true;
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
      schedule();
    };

    const unbind = () => {
      if (!bound) return;
      bound = false;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };

    /* Two reasons the driver stands down. On phones the story is flattened and
       nothing consumes --progress, yet render() writes it as an inline style,
       which beats the stylesheet's `--progress:0` — so it really did animate
       there, invalidating style for the entire hero subtree every frame
       (custom properties inherit) to move zero pixels. And once the story has
       scrolled away it was still measuring the hero on every scroll event from
       the footer down; the observer ends that. The query is watched rather
       than read once so a window dragged across the breakpoint, or a rotation,
       hands the story back to the driver. */
    const sync = () => {
      const live = onScreen && !phone.matches;
      if (live) bind();
      else unbind();
      story.dataset.kzhsLive = String(live && !reduced);
    };

    /* A reload part-way down the story has to paint at the progress it is
       already at instead of lerping up from zero. */
    if (!phone.matches) {
      measure();
      current = target;
      story.style.setProperty("--progress", current.toFixed(4));
    }

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[entries.length - 1].isIntersecting;
        sync();
      },
      { rootMargin: "160px 0px" }
    );
    io.observe(story);
    phone.addEventListener("change", sync);

    return () => {
      io.disconnect();
      phone.removeEventListener("change", sync);
      unbind();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  /* Pointer parallax. Attached only on a hovering fine pointer with motion
     allowed; a touch device never gets the listener, and a stray touch-derived
     pointermove is skipped besides. Custom-property writes are cheap — the
     compositor consumes them through the transforms above. */
  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      story.style.setProperty("--pointer-x", ((event.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
      story.style.setProperty("--pointer-y", ((event.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  /* The ribbon is the one looping animation that survives into the phone
     layout, and it had nothing stopping it: the marquee kept running behind
     the fold and behind a hidden tab for as long as the page was open. This is
     KzAmbient's data-kz-run contract — the same attribute, the same two
     conditions — driven from here because that hook is private to it. */
  useEffect(() => {
    const ribbon = ribbonRef.current;
    if (!ribbon) return;

    let onScreen = false;
    const sync = () => {
      ribbon.setAttribute("data-kz-run", onScreen && !document.hidden ? "1" : "0");
    };

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[entries.length - 1].isIntersecting;
        sync();
      },
      { rootMargin: "160px 0px" }
    );
    io.observe(ribbon);
    document.addEventListener("visibilitychange", sync);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <section ref={storyRef} id="top" className="kzhs-story" aria-label="Kenzed Tech Lab">
      <style href="kz-hero-story" precedence="default" dangerouslySetInnerHTML={{ __html: KZ_HERO_STORY_CSS }} />
      <div className="kzhs-sticky">
        {/* The art is scenery — every fact it illustrates is in the copy. */}
        <div ref={frameRef} className={`kzhs-frame${artReady ? " is-loaded" : ""}`} aria-hidden="true">
          <Image
            src={asset("/kenzed-hidden-stack.webp")}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "50% 50%" }}
            onLoad={() => setArtReady(true)}
          />
        </div>
        <div className="kzhs-scene" aria-hidden="true" />
        <div className="kzhs-grid" aria-hidden="true" />
        <div className="kzhs-vignette" aria-hidden="true" />

        <div className="kzhs-particles" aria-hidden="true">
          {KZ_PARTICLES.map((p, index) => (
            <i key={index} style={{ left: p.left, top: p.top, animationDelay: p.delay }} />
          ))}
        </div>

        <div className="kzhs-marker" aria-hidden="true">
          <span>VISIBLE LAYER</span>
          <i />
          <span>FOUNDATION LAYER</span>
        </div>
        <div className="kzhs-scan" aria-hidden="true">
          <i />
        </div>

        {/* STAGE 1 — painted at final position server-side; no entrance. */}
        <div className="kzhs-copy kzhs-intro">
          {/* The site's own name and tagline, verbatim from content/site.ts. */}
          <p className="kzhs-eyebrow">
            <i /> {site.name} / {site.tagline}
          </p>
          <h1 className="kzhs-title">
            Engineering Intelligent Software for an{" "}
            <span className="kz-grad-text">Agentic World</span>
          </h1>
          <p className="kzhs-lede">
            Kenzed Tech Lab designs, builds, and deploys custom AI agents, machine-learning
            systems, voice AI, and enterprise software — production-grade, secure, and running on
            infrastructure we own and operate 24×7.
          </p>
          <div className="kzhs-actions">
            <KzMagnetic strength={0.28} max={12}>
              <KzButton href="/contact">Start Your AI Project →</KzButton>
            </KzMagnetic>
            <KzButton href="/services" variant="ghost">
              Explore Our Services
            </KzButton>
          </div>
        </div>

        {/* STAGE 2 — the foundation reveal: the site's four stats. */}
        <div className="kzhs-reveal">
          {/* The third stat's own label, verbatim — no invented copy. */}
          <p className="kzhs-eyebrow">
            <i /> Operations &amp; in-house AI compute
          </p>
          <div className="kzhs-stats">
            {kzStats.map((s) => (
              <div key={s.label} className="kzhs-stat">
                <div className="kzhs-stat-num">
                  <KzCountUp
                    to={s.target}
                    decimals={Number.isInteger(s.target) ? 0 : 2}
                    suffix={s.suffix}
                  />
                </div>
                <div className="kzhs-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* The old hero's floating chips, recast as the design's annotations. */}
        <div className="kzhs-notes" aria-hidden="true">
          <span className="kzhs-note kzhs-note-1">agent.plan() → tool_call → act()</span>
          <span className="kzhs-note kzhs-note-2">LoRA fine-tune · llama-3 · r=16</span>
          <span className="kzhs-note kzhs-note-3">inference 42 ms · on-prem GPU · 99.98% uptime</span>
        </div>

        <div className="kzhs-meter" aria-hidden="true">
          <span>SCROLL</span>
          <i>
            <b />
          </i>
          <strong>00 — 100</strong>
        </div>

        {/* Starts paused, as KzAmbient's layers do: the marquee then costs the
            compositor nothing during the hydration window, and the observer
            starts it on the first frame after. */}
        <div ref={ribbonRef} className="kzhs-ribbon" data-kz-run="0">
          <div className="kzhs-ribbon-track">
            {KZ_RIBBON_ITEMS.map((item) => (
              <span key={item}>
                <i aria-hidden="true" />
                {item}
              </span>
            ))}
            {/* Second copy exists only to make the -50% loop seamless. */}
            {KZ_RIBBON_ITEMS.map((item) => (
              <span key={`dup-${item}`} aria-hidden="true">
                <i />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
