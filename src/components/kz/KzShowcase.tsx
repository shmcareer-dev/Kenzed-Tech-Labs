"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { KzPill, KzSectionTitle } from "@/components/kz/primitives";
import { KzReveal } from "@/components/kz/KzReveal";

export interface KzStoryCard {
  client: string;
  quote: string;
  metric?: string;
  href?: string;
}

export interface KzStoryCarouselProps {
  stories: KzStoryCard[];
  title: ReactNode;
  action?: { label: string; href: string };
}

export interface KzGraphCardSpec {
  kind: "agents" | "pipeline" | "graph";
  name: string;
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
}

export interface KzGraphCardsProps {
  cards: KzGraphCardSpec[];
  title: ReactNode;
  lead?: string;
}

/* ==========================================================================
   Shared motion primitives
   ========================================================================== */

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

/* Fires once and then stops observing: the connector sweep is a one-shot
   entrance, never a loop that keeps paying for itself while parked on screen. */
function useKzEnterOnce<T extends Element>(threshold: number) {
  const ref = useRef<T | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          setEntered(true);
        });
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, entered };
}

/* ==========================================================================
   Styles — pseudo-elements, :hover guards and keyframes cannot be expressed
   as inline style objects, so this one sheet carries them. Every colour is a
   design token so the whole block follows a theme swap.
   ========================================================================== */

const KZ_SHOWCASE_CSS = `
.kz-sc-scroller{scrollbar-width:none;-ms-overflow-style:none}
.kz-sc-scroller::-webkit-scrollbar{display:none}
.kz-sc-card{transition:transform .32s cubic-bezier(.2,.7,.2,1),border-color .32s,box-shadow .32s}
.kz-sc-card:focus-within,.kz-gc-card:focus-within{
  transform:translateY(-4px);border-color:var(--acc);
  box-shadow:0 20px 46px -26px color-mix(in srgb,var(--acc) 70%,transparent)}
.kz-gc-card{transition:transform .32s cubic-bezier(.2,.7,.2,1),border-color .32s,box-shadow .32s}
.kz-sc-dot-mark{transition:transform .34s cubic-bezier(.2,.7,.2,1),background-color .34s}
.kz-sc-arrow{transition:transform .25s,border-color .25s,box-shadow .25s,opacity .25s}
.kz-sc-arrow:disabled{opacity:.34;cursor:default}
.kz-sc-link{transition:transform .25s,color .25s}
.kz-sc-link-arrow{display:inline-block;transition:transform .25s cubic-bezier(.2,.7,.2,1)}
@media (hover:hover){
  .kz-sc-card:hover,.kz-gc-card:hover{
    transform:translateY(-4px);border-color:var(--acc);
    box-shadow:0 20px 46px -26px color-mix(in srgb,var(--acc) 70%,transparent)}
  .kz-sc-arrow:not(:disabled):hover{
    transform:translateY(-2px);border-color:var(--acc);
    box-shadow:0 12px 26px -18px color-mix(in srgb,var(--acc) 80%,transparent)}
  .kz-sc-link:hover .kz-sc-link-arrow{transform:translateX(4px)}
}
.kz-gc-node{transform-box:fill-box;transform-origin:50% 50%}
.kz-gc-run .kz-gc-node{animation:kzGcNode .5s cubic-bezier(.2,.7,.2,1) both}
.kz-gc-run .kz-gc-flow{animation:kzGcTravel 1.05s linear both}
@keyframes kzGcNode{from{opacity:0;transform:translateY(6px) scale(.94)}to{opacity:1;transform:none}}
@keyframes kzGcTravel{
  0%{stroke-dashoffset:16;opacity:0}
  14%{opacity:1}
  86%{opacity:1}
  100%{stroke-dashoffset:-100;opacity:0}}
`;

function KzShowcaseStyles(): ReactElement {
  return <style>{KZ_SHOWCASE_CSS}</style>;
}

/* ==========================================================================
   Link helper — internal routes go through next/link, absolute URLs do not.
   ========================================================================== */

function KzShowcaseLink({
  href,
  label,
  style,
}: {
  href: string;
  label: string;
  style?: CSSProperties;
}): ReactElement {
  const linkStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    fontFamily: "var(--font-mono)",
    fontSize: "0.74rem",
    letterSpacing: "0.11em",
    textTransform: "uppercase",
    color: "var(--acc)",
    ...style,
  };
  const inner = (
    <>
      {label}
      <span className="kz-sc-link-arrow" aria-hidden="true">
        &rarr;
      </span>
    </>
  );
  const external = /^https?:/.test(href);

  if (external) {
    return (
      <a
        className="kz-sc-link"
        href={href}
        style={linkStyle}
        target="_blank"
        rel="noreferrer"
      >
        {inner}
      </a>
    );
  }
  return (
    <Link className="kz-sc-link" href={href} style={linkStyle}>
      {inner}
    </Link>
  );
}

/* ==========================================================================
   KzStoryCarousel
   ========================================================================== */

function KzChevron({ dir }: { dir: -1 | 1 }): ReactElement {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={dir === -1 ? "M15 5 L8 12 L15 19" : "M9 5 L16 12 L9 19"} />
    </svg>
  );
}

const KZ_ARROW_STYLE: CSSProperties = {
  width: 44,
  height: 44,
  display: "grid",
  placeItems: "center",
  borderRadius: 12,
  background: "var(--card)",
  border: "1px solid var(--line2)",
  color: "var(--ink)",
  cursor: "pointer",
  flex: "none",
};

export function KzStoryCarousel({
  stories,
  title,
  action,
}: KzStoryCarouselProps): ReactElement {
  const rootRef = useRef<HTMLElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const reduced = useKzReducedMotion();
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /* What the scroll handler last published. A flick crosses a card boundary
     every few frames, and the bail-out React does when a value is unchanged
     still costs a render pass, so the comparison happens out here instead. */
  const activeRef = useRef(0);
  const atStartRef = useRef(true);
  const atEndRef = useRef(false);
  /* Card positions and the scrollable distance are layout, so they are read once
     per resize rather than once per frame: sync() used to call
     getBoundingClientRect() on the scroller and on every card, then read
     scrollWidth, which forces a layout of the whole strip mid-drag. */
  const offsetsRef = useRef<number[]>([]);
  const maxScrollRef = useRef(0);

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-kz-story]"));
    /* Relative to the first card, which is where a scrollLeft of 0 leaves it, so
       an offset can be compared against scrollLeft directly. offsetLeft ignores
       ancestor scrolling, so these stay valid while the strip moves. */
    const base = items[0]?.offsetLeft ?? 0;
    offsetsRef.current = items.map((item) => item.offsetLeft - base);
    maxScrollRef.current = el.scrollWidth - el.clientWidth;
  }, []);

  const sync = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    /* scrollLeft is a scalar read that costs no layout, which is the whole point
       of measuring the cards up front. */
    const left = el.scrollLeft;
    const offsets = offsetsRef.current;
    let best = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < offsets.length; i += 1) {
      const distance = Math.abs(offsets[i] - left);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    }
    if (best !== activeRef.current) {
      activeRef.current = best;
      setActive(best);
    }
    const startNow = left <= 1;
    if (startNow !== atStartRef.current) {
      atStartRef.current = startNow;
      setAtStart(startNow);
    }
    const endNow = left >= maxScrollRef.current - 1;
    if (endNow !== atEndRef.current) {
      atEndRef.current = endNow;
      setAtEnd(endNow);
    }
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setVisible(entries[0].isIntersecting),
      { rootMargin: "140px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !visible) return;
    measure();
    sync();
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    };
    /* This stands in for the old window resize listener too: a card is either a
       fixed 340px or a share of the viewport, and at the widths where the share
       wins the scroller is the full width of the screen, so nothing can move the
       cards without resizing the scroller as well. */
    const ro = new ResizeObserver(() => {
      measure();
      sync();
    });
    ro.observe(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [measure, sync, visible]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>("[data-kz-story]"));
      const target = items[Math.max(0, Math.min(index, items.length - 1))];
      if (!target) return;
      const delta =
        target.getBoundingClientRect().left - el.getBoundingClientRect().left;
      el.scrollTo({
        left: el.scrollLeft + delta,
        behavior: reduced ? "auto" : "smooth",
      });
    },
    [reduced]
  );

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    scrollToIndex(active + (event.key === "ArrowRight" ? 1 : -1));
  };

  return (
    <section ref={rootRef}>
      <KzShowcaseStyles />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "clamp(20px, 4vw, 30px)",
        }}
      >
        <KzSectionTitle style={{ maxWidth: "20ch" }}>{title}</KzSectionTitle>
        {action && <KzShowcaseLink href={action.href} label={action.label} />}
      </div>

      <div
        ref={scrollerRef}
        className="kz-sc-scroller"
        role="group"
        aria-roledescription="carousel"
        aria-label="Client stories"
        tabIndex={0}
        onKeyDown={onKeyDown}
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: "clamp(14px, 3vw, 20px)",
          overflowX: "auto",
          overscrollBehaviorX: "contain",
          scrollSnapType: "x mandatory",
          padding: "6px 0 22px",
          scrollPaddingInlineStart: 20,
        }}
      >
        {stories.map((story, i) => (
          <article
            key={`${story.client}-${i}`}
            data-kz-story=""
            className="kz-sc-card"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${stories.length}`}
            style={{
              flex: "0 0 min(88vw, 340px)",
              minWidth: 0,
              scrollSnapAlign: "start",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: "clamp(20px, 5vw, 26px)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "1.05rem",
                letterSpacing: "-0.035em",
                lineHeight: 1.15,
                color: "var(--ink)",
              }}
            >
              {story.client}
            </span>
            <blockquote style={{ margin: 0 }}>
              <p style={{ margin: 0, color: "var(--mut)", fontSize: "0.95rem" }}>
                {story.quote}
              </p>
            </blockquote>
            {story.metric && (
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                  color: "var(--acc3)",
                }}
              >
                {story.metric}
              </div>
            )}
            {story.href && (
              <div style={{ marginTop: "auto" }}>
                <KzShowcaseLink
                  href={story.href}
                  label="Read case"
                  style={{ marginBottom: -10 }}
                />
              </div>
            )}
          </article>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 10,
          marginTop: 4,
        }}
      >
        <div style={{ display: "flex", flex: "1 1 auto", flexWrap: "wrap" }}>
          {stories.map((story, i) => (
            <button
              key={`dot-${story.client}-${i}`}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Show story ${i + 1}: ${story.client}`}
              aria-current={i === active ? "true" : undefined}
              style={{
                width: 44,
                height: 44,
                display: "grid",
                placeItems: "center",
                background: "none",
                border: 0,
                padding: 0,
                cursor: "pointer",
              }}
            >
              <span
                className="kz-sc-dot-mark"
                style={{
                  display: "block",
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: i === active ? "var(--acc)" : "var(--line2)",
                  transform: i === active ? "scaleX(2.6)" : "none",
                }}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="kz-sc-arrow"
          onClick={() => scrollToIndex(active - 1)}
          disabled={atStart}
          aria-label="Previous story"
          style={KZ_ARROW_STYLE}
        >
          <KzChevron dir={-1} />
        </button>
        <button
          type="button"
          className="kz-sc-arrow"
          onClick={() => scrollToIndex(active + 1)}
          disabled={atEnd}
          aria-label="Next story"
          style={KZ_ARROW_STYLE}
        >
          <KzChevron dir={1} />
        </button>
      </div>
    </section>
  );
}

/* ==========================================================================
   KzGraphCards — three mini system diagrams drawn on one 300x132 canvas so
   the three cards line up whatever their copy length.
   ========================================================================== */

interface KzDiagramNode {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  lead?: boolean;
}

interface KzDiagramSpec {
  nodes: KzDiagramNode[];
  edges: string[];
  alt: string;
}

const KZ_DIAGRAMS: Record<KzGraphCardSpec["kind"], KzDiagramSpec> = {
  agents: {
    nodes: [
      { x: 96, y: 6, w: 108, h: 26, label: "Orchestrator", lead: true },
      { x: 4, y: 60, w: 80, h: 26, label: "Retrieve" },
      { x: 110, y: 60, w: 80, h: 26, label: "Reason" },
      { x: 216, y: 60, w: 80, h: 26, label: "Act" },
      { x: 66, y: 104, w: 168, h: 24, label: "Shared memory" },
    ],
    edges: [
      "M150 32 V46 H44 V60",
      "M150 32 V60",
      "M150 32 V46 H256 V60",
      "M44 86 V95 H96 V104",
      "M150 86 V104",
      "M256 86 V95 H204 V104",
    ],
    alt: "An orchestrator delegating to retrieve, reason and act agents, all writing back to one shared memory.",
  },
  pipeline: {
    nodes: [
      { x: 3, y: 26, w: 60, h: 28, label: "Ingest", lead: true },
      { x: 81, y: 26, w: 60, h: 28, label: "Enrich" },
      { x: 159, y: 26, w: 60, h: 28, label: "Infer" },
      { x: 237, y: 26, w: 60, h: 28, label: "Serve" },
      { x: 76, y: 92, w: 112, h: 26, label: "Feature store" },
    ],
    edges: [
      "M63 40 H81",
      "M141 40 H159",
      "M219 40 H237",
      "M111 54 V92",
      "M188 105 H267 V54",
    ],
    alt: "A four stage pipeline from ingest to serve, with enrich writing into a feature store that feeds the serving stage.",
  },
  graph: {
    nodes: [
      { x: 2, y: 53, w: 56, h: 26, label: "Query", lead: true },
      { x: 78, y: 6, w: 62, h: 24, label: "Router" },
      { x: 78, y: 102, w: 62, h: 24, label: "Vectors" },
      { x: 160, y: 53, w: 64, h: 26, label: "Graph DB" },
      { x: 242, y: 53, w: 56, h: 26, label: "Answer" },
    ],
    edges: [
      "M58 66 H68 V18 H78",
      "M58 66 H68 V114 H78",
      "M109 30 V102",
      "M140 18 H192 V53",
      "M140 114 H192 V79",
      "M224 66 H242",
    ],
    alt: "A query fanning out to a router and a vector index, both resolving through a graph database into a single answer.",
  },
};

function KzGraphDiagram({ kind }: { kind: KzGraphCardSpec["kind"] }): ReactElement {
  const spec = KZ_DIAGRAMS[kind];
  const uid = useId().replace(/:/g, "");
  const reduced = useKzReducedMotion();
  const { ref, entered } = useKzEnterOnce<SVGSVGElement>(0.35);
  const run = entered && !reduced;

  return (
    <svg
      ref={ref}
      viewBox="0 0 300 132"
      role="img"
      aria-label={spec.alt}
      className={run ? "kz-gc-run" : undefined}
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <defs>
        <marker
          id={`${uid}-head`}
          markerWidth="6"
          markerHeight="6"
          refX="5.2"
          refY="3"
          orient="auto"
        >
          <path d="M0 0.7 L5 3 L0 5.3 Z" fill="var(--line2)" />
        </marker>
      </defs>
      {spec.edges.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="var(--line2)"
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
          markerEnd={`url(#${uid}-head)`}
        />
      ))}
      {/* The travelling pulse only exists once motion is wanted, so a reduced
          motion reader gets the plain connectors and no extra paint. */}
      {run &&
        spec.edges.map((d, i) => (
          <path
            key={`flow-${d}`}
            className="kz-gc-flow"
            d={d}
            pathLength={100}
            fill="none"
            stroke="var(--acc)"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeDasharray="16 400"
            style={{ animationDelay: `${i * 90}ms` }}
          />
        ))}
      {spec.nodes.map((node, i) => (
        <g
          key={node.label}
          className="kz-gc-node"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <rect
            x={node.x}
            y={node.y}
            width={node.w}
            height={node.h}
            rx={7}
            fill="var(--card2)"
            stroke={node.lead ? "var(--acc)" : "var(--line2)"}
            strokeWidth={1}
          />
          <text
            x={node.x + node.w / 2}
            y={node.y + node.h / 2}
            dy=".33em"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={9.5}
            letterSpacing="0.04em"
            fill={node.lead ? "var(--acc)" : "var(--mut)"}
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function KzGraphCards({ cards, title, lead }: KzGraphCardsProps): ReactElement {
  return (
    <section>
      <KzShowcaseStyles />
      <KzSectionTitle style={{ maxWidth: "20ch" }}>{title}</KzSectionTitle>
      {lead && (
        <p className="kz-page-lead" style={{ marginTop: 16 }}>
          {lead}
        </p>
      )}
      <div
        style={{
          display: "grid",
          gap: "clamp(16px, 3vw, 24px)",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 258px), 1fr))",
          marginTop: "clamp(24px, 4vw, 36px)",
        }}
      >
        {cards.map((card, i) => (
          <KzReveal key={`${card.name}-${i}`} delay={i} style={{ height: "100%" }}>
            <article
              className="kz-gc-card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                height: "100%",
                minWidth: 0,
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: 16,
                padding: "clamp(18px, 4.5vw, 24px)",
              }}
            >
              <div
                style={{
                  background: "var(--bg2)",
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  padding: "14px 12px",
                }}
              >
                <KzGraphDiagram kind={card.kind} />
              </div>
              <div style={{ display: "flex" }}>
                <KzPill>{card.name}</KzPill>
              </div>
              <h3
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "clamp(1rem, 2.4vw, 1.15rem)",
                  lineHeight: 1.25,
                  letterSpacing: "-0.035em",
                  color: "var(--ink)",
                }}
              >
                {card.title}
              </h3>
              <p style={{ margin: 0, color: "var(--mut)", fontSize: "0.94rem" }}>
                {card.body}
              </p>
              {card.href && (
                <div style={{ marginTop: "auto" }}>
                  <KzShowcaseLink
                    href={card.href}
                    label={card.linkLabel ?? "Learn more"}
                    style={{ marginBottom: -10 }}
                  />
                </div>
              )}
            </article>
          </KzReveal>
        ))}
      </div>
    </section>
  );
}
