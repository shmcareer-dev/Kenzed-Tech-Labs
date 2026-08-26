"use client";

import { useEffect, useState } from "react";

export interface KzScrollSpySection {
  id: string;
  label: string;
}

interface KzScrollSpyProps {
  sections: KzScrollSpySection[];
}

/**
 * A scoped stylesheet instead of inline style objects (same reasoning as
 * KzFooter): hover, aria-current attribute selectors, media queries and
 * prefers-reduced-motion cannot be expressed as React style props.
 * Unlayered, so these rules win over globals.css `@layer base/components`.
 *
 * All colour comes from tokens so the rail follows the light theme; the one
 * hardcoded value is the easing curve, which is the design language's single
 * motion constant (cubic-bezier(0.22,1,0.36,1)), not a theme value.
 */
const SPY_CSS = `
.kzss{position:fixed;z-index:30;left:16px;top:50%;display:grid;gap:3px;transform:translateY(-50%)}
.kzss a{display:grid;grid-template-columns:16px 18px auto;align-items:center;min-height:28px;color:var(--dim);font-family:var(--font-mono);font-size:7px;font-weight:500;letter-spacing:var(--tr-mono-sm);text-decoration:none}
.kzss a span{opacity:0;transition:opacity .25s cubic-bezier(0.22,1,0.36,1)}
.kzss a i{width:8px;height:1px;background:var(--dim);transition:width .3s cubic-bezier(0.22,1,0.36,1),background .3s cubic-bezier(0.22,1,0.36,1),box-shadow .3s cubic-bezier(0.22,1,0.36,1)}
/* Truncated rather than allowed to set its own width: the label is whatever
   the page passed as a section name, and a long one grew straight across the
   left edge of the content column. */
.kzss a b{opacity:0;transform:translateX(-5px);font-weight:500;max-width:11ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:opacity .25s cubic-bezier(0.22,1,0.36,1),transform .25s cubic-bezier(0.22,1,0.36,1)}
.kzss a:hover span,.kzss a:hover b,.kzss a[aria-current="location"] span,.kzss a[aria-current="location"] b{opacity:1;transform:none}
.kzss a[aria-current="location"]{color:var(--mut)}
.kzss a[aria-current="location"] i{width:17px;background:var(--acc3);box-shadow:0 0 9px var(--accglow)}
/* The rail competes with content for horizontal room, and .kz-wrap caps at
   1280px with a 36px gutter — so a rail parked at left:16px only clears the
   copy once the viewport is wide enough to leave a real margin outside that
   cap. Below 1400px the two were overlapping: at 1280px exactly, the section
   label sat directly on top of the first line of every page lead.
   display:none also removes it from the tab order. */
@media (max-width:1399px){.kzss{display:none}}
@media (prefers-reduced-motion:reduce){.kzss a span,.kzss a i,.kzss a b{transition:none}}
`;

/**
 * The design's fixed left-edge section rail: one row per section — a mono
 * index, a dash that grows cyan when current, a label revealed on
 * hover/current. Purely additive chrome: sections themselves are owned by the
 * pages, this only needs their ids to exist in the document.
 */
export function KzScrollSpy({ sections }: KzScrollSpyProps) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    // The -25%/-55% rootMargin narrows the viewport to a band just above its
    // middle, so "current" flips when a section's heading crosses the zone the
    // reader is actually looking at — not when its top edge grazes the fold.
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.2, 0.55] }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const el = document.getElementById(id);
    if (!el) return; // fall through to the default anchor jump
    event.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    // Keep the URL shareable without pushing a history entry per rail click.
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <nav className="kzss" aria-label="Page sections">
      <style dangerouslySetInnerHTML={{ __html: SPY_CSS }} />
      {sections.map((section, index) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-current={active === section.id ? "location" : undefined}
          onClick={(event) => handleClick(event, section.id)}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <i aria-hidden="true" />
          <b>{section.label}</b>
        </a>
      ))}
    </nav>
  );
}
