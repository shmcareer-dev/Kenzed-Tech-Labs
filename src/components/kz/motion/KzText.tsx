"use client";

/**
 * KzText — the text motion kit.
 *
 * Nine reusable primitives. A page picks two or three of them; the catalogue's
 * "eight effects executed well beat eighty" applies to the page, not to the kit.
 *
 * The rules every component in this file obeys:
 *
 * 1. ACCESSIBLE TEXT SURVIVES THE SPLIT. Nothing here ever hands a screen
 *    reader a pile of letters. While a component is animating, the wrapper
 *    carries `aria-label` with the original sentence, the visual spans are
 *    `aria-hidden`, and a visually-hidden copy of the real sentence rides
 *    alongside them (a bare <span aria-label> is not exposed by every screen
 *    reader, so the hidden copy is the belt to aria-label's braces). Crawlers
 *    read the real sentence either way — the split spans still contain the
 *    real characters, and the server-rendered markup is plain text.
 *
 * 2. NOTHING ANIMATES ABOVE THE FOLD ON FIRST PAINT. Every entrance component
 *    measures itself in a layout effect on mount: if it is already on screen
 *    when the page paints, it renders the finished text and never animates.
 *    That keeps the LCP element painted at first paint. `playOnMount` is the
 *    deliberate opt-out and must only be used on elements that are not the
 *    LCP candidate.
 *
 * 3. SERVER MARKUP IS PLAIN TEXT. Splitting happens after mount, so hydration
 *    can never mismatch and no-JS output is the sentence itself.
 *
 * 4. TRANSFORM AND OPACITY ONLY. The two exceptions are deliberate and
 *    documented where they occur (KzBlurTextReveal's filter, which is
 *    GPU-composited, and KzAnimatedGradientText's background-position, which
 *    repaints a headline-sized box and never touches layout).
 *
 * 5. NO REFLOW WHILE ANIMATING. Components whose live text changes size
 *    (typewriter, scramble, rotating word, outline-to-fill) size their box
 *    from an in-flow hidden copy of the longest string and paint the live
 *    text in an absolutely positioned layer above it, so the box is measured
 *    once and never moves. Zero CLS.
 *
 * 6. ONE EASING LANGUAGE: cubic-bezier(0.22, 1, 0.36, 1), 200-800ms.
 *
 * 7. prefers-reduced-motion renders the finished, plain text immediately, and
 *    is re-evaluated live if the user flips the OS setting mid-session.
 *
 * 8. Every timer, rAF, IntersectionObserver and ResizeObserver is torn down on
 *    unmount; the looping components also pause themselves when scrolled out
 *    of view.
 */

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";

/* ==========================================================================
   Shared constants
   ========================================================================== */

/** The site's single entrance easing. */
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** A staggered sequence never runs longer than this, however many pieces. */
const MAX_SEQUENCE = 700;

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const COMPACT_QUERY = "(max-width: 640px)";

/**
 * Net-zero padding: it grows the clip box of a masked line so descenders are
 * not sheared off, while the matching negative margin keeps the line's
 * contribution to layout identical.
 */
const MASK_PAD = "0.18em";

const DEFAULT_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\[]{}#%&$*";

/* ==========================================================================
   Shared styles
   ========================================================================== */

const SR_ONLY: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  border: 0,
};

/**
 * The measure-once stack. In-flow children (the hidden sizers) fix the box;
 * the live layer is absolute, so whatever it does — typing, scrambling,
 * swapping words — cannot resize anything.
 */
const STACK: CSSProperties = {
  position: "relative",
  display: "inline-grid",
  maxWidth: "100%",
};

const STACK_SIZER: CSSProperties = {
  gridArea: "1 / 1",
  visibility: "hidden",
  pointerEvents: "none",
  WebkitUserSelect: "none",
  userSelect: "none",
};

const STACK_LIVE: CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  whiteSpace: "pre-wrap",
};

/**
 * Hyphenation is switched off inside split text: globals.css turns `hyphens:
 * auto` on for prose, and a word broken across two lines would be measured
 * into one line group and re-rendered into the other.
 */
const SPLIT_HOST: CSSProperties = {
  WebkitHyphens: "manual",
  hyphens: "manual",
};

/* ==========================================================================
   Kit stylesheet — the two effects that genuinely need @keyframes.
   React 19 hoists this into <head> and de-duplicates it by `href`, so however
   many typewriters or gradients a page mounts, one copy ships.
   ========================================================================== */

const KIT_CSS = `
@keyframes kzTextCaret { 0%, 46% { opacity: 1; } 47%, 100% { opacity: 0; } }
@keyframes kzTextRamp { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }
.kz-text-caret { animation: kzTextCaret 1.06s steps(1, end) infinite; }
.kz-text-ramp {
  background-image: linear-gradient(100deg, var(--acc) 0%, var(--acc2) 25%, var(--acc3) 50%, var(--acc2) 75%, var(--acc) 100%);
  background-size: 200% 100%;
  animation: kzTextRamp var(--kz-ramp-dur, 6000ms) linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .kz-text-caret, .kz-text-ramp { animation-name: none !important; }
}
`;

function KzTextStyles() {
  return (
    <style href="kz-text-kit" precedence="medium">
      {KIT_CSS}
    </style>
  );
}

/* ==========================================================================
   Types
   ========================================================================== */

export type KzTextTag =
  | "span"
  | "div"
  | "p"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "strong"
  | "em"
  | "li"
  | "figcaption"
  | "blockquote";

export interface KzTextBaseProps {
  /** Element to render. Defaults to `span` so the caller owns the heading level. */
  as?: KzTextTag;
  className?: string;
  style?: CSSProperties;
}

type SpanRef = RefObject<HTMLSpanElement | null>;

type KzStage = "plain" | "armed" | "play";

/* ==========================================================================
   Helpers
   ========================================================================== */

/** Layout effects must not run on the prerender pass of a static export. */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function toWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/** Shrinks the per-item stagger so a long sentence never outstays its welcome. */
function pace(step: number, count: number): number {
  if (count <= 1) return step;
  return Math.min(step, MAX_SEQUENCE / (count - 1));
}

function KzSrText({ text }: { text: string }) {
  return <span style={SR_ONLY}>{text}</span>;
}

/** The flat pass that line grouping measures. */
function measureMarkup(words: string[]): ReactNode {
  return words.map((word, i) => (
    <Fragment key={i}>
      {i > 0 ? " " : null}
      <span data-kz-word="true">{word}</span>
    </Fragment>
  ));
}

/* ==========================================================================
   Hooks
   ========================================================================== */

/** True below 640px. Used to drop effect fidelity rather than ship jank. */
function useCompact(): boolean {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY);
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return compact;
}

/**
 * Drives an entrance: `plain` (finished text — reduced motion, above the fold
 * at first paint, or not yet mounted), `armed` (split, at the from-state) and
 * `play` (split, at the to-state). `inView` keeps reporting afterwards so the
 * looping components can pause themselves offscreen.
 */
function useKzEntrance(ref: SpanRef, playOnMount: boolean) {
  const [stage, setStage] = useState<KzStage>("plain");
  const [inView, setInView] = useState(false);
  const [motionEpoch, setMotionEpoch] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia(REDUCE_QUERY);
    const bump = () => setMotionEpoch((n) => n + 1);
    mq.addEventListener("change", bump);
    return () => mq.removeEventListener("change", bump);
  }, []);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia(REDUCE_QUERY).matches) {
      setStage("plain");
      setInView(true);
      return;
    }

    const box = el.getBoundingClientRect();
    const onScreenAtFirstPaint = box.top < window.innerHeight && box.bottom > 0;
    if (onScreenAtFirstPaint && !playOnMount) {
      setStage("plain");
      setInView(true);
      return;
    }

    setStage("armed");

    let frameA = 0;
    let frameB = 0;
    // Two frames: the armed state has to be painted before the transition to
    // the play state can interpolate from it.
    const play = () => {
      frameA = requestAnimationFrame(() => {
        frameB = requestAnimationFrame(() => setStage("play"));
      });
    };

    if (playOnMount) {
      setInView(true);
      play();
      return () => {
        cancelAnimationFrame(frameA);
        cancelAnimationFrame(frameB);
      };
    }

    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setInView(entry.isIntersecting);
        if (!entry.isIntersecting || started) return;
        started = true;
        play();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frameA);
      cancelAnimationFrame(frameB);
    };
  }, [ref, playOnMount, motionEpoch]);

  return { stage, inView };
}

/**
 * For the ambient components, whose first paint is already the finished text:
 * they only need to be off under reduced motion and paused offscreen. `delay`
 * holds the effect back past first paint.
 */
function useKzAmbient(ref: SpanRef, delay = 0): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia(REDUCE_QUERY);
    let timer: ReturnType<typeof setTimeout> | null = null;
    let visible = false;

    const apply = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      if (mq.matches || !visible) {
        setActive(false);
        return;
      }
      if (delay <= 0) {
        setActive(true);
        return;
      }
      timer = setTimeout(() => setActive(true), delay);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        visible = entry.isIntersecting;
        apply();
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0 }
    );
    io.observe(el);
    mq.addEventListener("change", apply);

    return () => {
      io.disconnect();
      mq.removeEventListener("change", apply);
      if (timer !== null) clearTimeout(timer);
    };
  }, [ref, delay]);

  return active;
}

/**
 * Groups words into the lines the browser actually laid out, by reading their
 * box tops. Returns null until it has measured, which is the caller's cue to
 * render the flat pass. The measurement runs in a layout effect, so the flat
 * pass never reaches the screen.
 */
function useKzLineGroups(ref: SpanRef, words: string[], enabled: boolean): string[][] | null {
  const [groups, setGroups] = useState<string[][] | null>(null);
  const widthRef = useRef(-1);

  useIsoLayoutEffect(() => {
    if (!enabled) {
      widthRef.current = -1;
      setGroups(null);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const host = ref.current;
      if (!host) return;
      const nodes = host.querySelectorAll<HTMLElement>("[data-kz-word]");
      // Already grouped: nothing to measure until a resize resets us.
      if (nodes.length === 0) return;
      const next: string[][] = [];
      let top = Number.NaN;
      nodes.forEach((node) => {
        const nodeTop = node.getBoundingClientRect().top;
        if (Number.isNaN(top) || Math.abs(nodeTop - top) > 2) {
          next.push([]);
          top = nodeTop;
        }
        next[next.length - 1].push(node.textContent ?? "");
      });
      widthRef.current = host.getBoundingClientRect().width;
      setGroups(next);
    };

    measure();

    // A rotation or a resized window re-wraps the text, so the grouping has to
    // be rebuilt. Guarding on width keeps the observer from feeding itself.
    const ro = new ResizeObserver(() => {
      const host = ref.current;
      if (!host) return;
      const width = host.getBoundingClientRect().width;
      if (Math.abs(width - widthRef.current) < 1) return;
      widthRef.current = width;
      setGroups(null);
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [ref, enabled, words, groups]);

  return groups;
}

/* ==========================================================================
   1. KzSplitText — characters, words or measured lines rise and fade in.
   ========================================================================== */

export interface KzSplitTextProps extends KzTextBaseProps {
  text: string;
  /** char splits into letters, word into words, line into laid-out lines. */
  mode?: "char" | "word" | "line";
  /** Milliseconds between pieces. Auto-compressed so the run stays under ~700ms. */
  stagger?: number;
  duration?: number;
  delay?: number;
  /** Travel distance in px. Transform only — never top/margin. */
  y?: number;
  /** Opt out of the above-the-fold guard. Never use on the LCP element. */
  playOnMount?: boolean;
}

export function KzSplitText({
  text,
  mode = "word",
  stagger,
  duration = 600,
  delay = 0,
  y = 20,
  playOnMount = false,
  as = "span",
  className = "",
  style,
}: KzSplitTextProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const compact = useCompact();
  const { stage } = useKzEntrance(ref, playOnMount);
  const words = useMemo(() => toWords(text), [text]);

  // Per-character work on a phone is the first thing to go: same choreography,
  // a tenth of the nodes.
  const resolved = compact && mode === "char" ? "word" : mode;
  const animating = stage !== "plain";
  const playing = stage === "play";
  const lines = useKzLineGroups(ref, words, animating && resolved === "line");

  const Tag = as as "span";

  if (!animating) {
    return (
      <Tag ref={ref} className={className} style={style}>
        {text}
      </Tag>
    );
  }

  const hidden = `translate3d(0, ${y}px, 0)`;
  const move = (index: number, step: number): CSSProperties => ({
    opacity: playing ? 1 : 0,
    transform: playing ? "none" : hidden,
    transition:
      `opacity ${duration}ms ${EASE} ${delay + index * step}ms, ` +
      `transform ${duration}ms ${EASE} ${delay + index * step}ms`,
  });

  let content: ReactNode;

  if (resolved === "line") {
    if (lines === null) {
      content = measureMarkup(words);
    } else {
      const step = pace(stagger ?? 90, lines.length);
      content = lines.map((line, i) => (
        <span key={i} style={{ display: "block", ...move(i, step) }}>
          {line.join(" ")}
        </span>
      ));
    }
  } else if (resolved === "char") {
    const total = words.reduce((sum, word) => sum + Array.from(word).length, 0);
    const step = pace(stagger ?? 22, total);
    let index = 0;
    content = words.map((word, w) => (
      <Fragment key={w}>
        {w > 0 ? " " : null}
        {/* The word box keeps the letters together, so line breaking still
            happens at spaces exactly as it does in the plain sentence. */}
        <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
          {Array.from(word).map((ch, c) => {
            const i = index;
            index += 1;
            return (
              <span key={c} style={{ display: "inline-block", ...move(i, step) }}>
                {ch}
              </span>
            );
          })}
        </span>
      </Fragment>
    ));
  } else {
    const step = pace(stagger ?? 55, words.length);
    content = words.map((word, i) => (
      <Fragment key={i}>
        {i > 0 ? " " : null}
        <span style={{ display: "inline-block", ...move(i, step) }}>{word}</span>
      </Fragment>
    ));
  }

  return (
    <Tag ref={ref} className={className} style={style} aria-label={text}>
      <KzSrText text={text} />
      <span
        aria-hidden="true"
        style={{ ...SPLIT_HOST, display: resolved === "line" ? "block" : "inline" }}
      >
        {content}
      </span>
    </Tag>
  );
}

/* ==========================================================================
   2. KzMaskedLines — each laid-out line rises out of an overflow:hidden slot.
   ========================================================================== */

export interface KzMaskedLinesProps extends KzTextBaseProps {
  text: string;
  stagger?: number;
  duration?: number;
  delay?: number;
  playOnMount?: boolean;
}

export function KzMaskedLines({
  text,
  stagger = 90,
  duration = 700,
  delay = 0,
  playOnMount = false,
  as = "span",
  className = "",
  style,
}: KzMaskedLinesProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const { stage } = useKzEntrance(ref, playOnMount);
  const words = useMemo(() => toWords(text), [text]);
  const animating = stage !== "plain";
  const playing = stage === "play";
  const lines = useKzLineGroups(ref, words, animating);

  const Tag = as as "span";

  if (!animating) {
    return (
      <Tag ref={ref} className={className} style={style}>
        {text}
      </Tag>
    );
  }

  const step = pace(stagger, lines?.length ?? 1);

  return (
    <Tag ref={ref} className={className} style={style} aria-label={text}>
      <KzSrText text={text} />
      <span aria-hidden="true" style={{ ...SPLIT_HOST, display: "block" }}>
        {lines === null
          ? measureMarkup(words)
          : lines.map((line, i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  overflow: "hidden",
                  paddingBottom: MASK_PAD,
                  marginBottom: `-${MASK_PAD}`,
                }}
              >
                <span
                  style={{
                    display: "block",
                    paddingBottom: MASK_PAD,
                    marginBottom: `-${MASK_PAD}`,
                    transform: playing ? "translate3d(0, 0, 0)" : "translate3d(0, 110%, 0)",
                    transition: `transform ${duration}ms ${EASE} ${delay + i * step}ms`,
                  }}
                >
                  {line.join(" ")}
                </span>
              </span>
            ))}
      </span>
    </Tag>
  );
}

/* ==========================================================================
   3. KzTypewriter — types, holds, erases, moves on. Blinking caret.
   ========================================================================== */

export interface KzTypewriterProps extends KzTextBaseProps {
  /** One string, or several to cycle through. */
  text: string | string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  /** Pause on a completed string before erasing it. */
  holdTime?: number;
  /** Retype a single string forever. Ignored when several are supplied. */
  loop?: boolean;
  caret?: boolean;
  startDelay?: number;
  playOnMount?: boolean;
}

export function KzTypewriter({
  text,
  typeSpeed = 55,
  deleteSpeed = 28,
  holdTime = 1500,
  loop = false,
  caret = true,
  startDelay = 260,
  playOnMount = false,
  as = "span",
  className = "",
  style,
}: KzTypewriterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const items = useMemo(() => {
    const list = (Array.isArray(text) ? text : [text]).filter(Boolean);
    return list.length > 0 ? list : [""];
  }, [text]);
  const { stage, inView } = useKzEntrance(ref, playOnMount);
  const [typed, setTyped] = useState("");
  const progress = useRef({ item: 0, count: 0, erasing: false, started: false });

  const running = stage === "play" && inView;

  useEffect(() => {
    if (!running) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      const p = progress.current;
      const target = items[p.item % items.length] ?? "";

      if (!p.erasing) {
        p.count = Math.min(p.count + 1, target.length);
        setTyped(target.slice(0, p.count));
        if (p.count >= target.length) {
          if (items.length === 1 && !loop) return;
          p.erasing = true;
          timer = setTimeout(tick, holdTime);
          return;
        }
        timer = setTimeout(tick, typeSpeed);
        return;
      }

      p.count = Math.max(p.count - 1, 0);
      setTyped(target.slice(0, p.count));
      if (p.count === 0) {
        p.erasing = false;
        p.item = (p.item + 1) % items.length;
        timer = setTimeout(tick, 320);
        return;
      }
      timer = setTimeout(tick, deleteSpeed);
    };

    // Resuming after a scroll-away picks up mid-word rather than restarting.
    const first = progress.current.started ? 0 : Math.max(startDelay, 0);
    progress.current.started = true;
    timer = setTimeout(tick, first);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [running, items, typeSpeed, deleteSpeed, holdTime, loop, startDelay]);

  const Tag = as as "span";
  const label = items.join(", ");

  if (stage === "plain") {
    return (
      <Tag ref={ref} className={className} style={style}>
        {items[0]}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} className={className} style={style} aria-label={label}>
      <KzSrText text={label} />
      <span aria-hidden="true" style={STACK}>
        {/* In-flow copies of every string: the box is the widest of them and
            is measured once, so typing can never reflow the headline. */}
        {items.map((item, i) => (
          <span key={i} style={STACK_SIZER}>
            {item}
          </span>
        ))}
        <span style={STACK_LIVE}>
          {typed}
          {caret ? (
            <i
              className="kz-text-caret"
              style={{
                display: "inline-block",
                width: "0.075em",
                minWidth: 1,
                height: "1em",
                marginLeft: "0.12em",
                verticalAlign: "-0.12em",
                borderRadius: 1,
                background: "var(--acc)",
              }}
            />
          ) : null}
        </span>
      </span>
      <KzTextStyles />
    </Tag>
  );
}

/* ==========================================================================
   4. KzScramble — random glyphs resolve into the word, left to right.
   ========================================================================== */

export interface KzScrambleProps extends KzTextBaseProps {
  text: string;
  /** Total resolve time. Kept inside the 200-800ms band by default. */
  duration?: number;
  /** Frame interval. 45ms is ~22fps of glyph churn, which reads as noise. */
  tick?: number;
  glyphs?: string;
  playOnMount?: boolean;
}

export function KzScramble({
  text,
  duration = 800,
  tick = 45,
  glyphs = DEFAULT_GLYPHS,
  playOnMount = false,
  as = "span",
  className = "",
  style,
}: KzScrambleProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const { stage, inView } = useKzEntrance(ref, playOnMount);
  const chars = useMemo(() => Array.from(text), [text]);
  const [frame, setFrame] = useState<string | null>(null);
  // State, not a ref: `running` is read during render, and a ref read there is
  // both a lint error and a correctness trap (the render that should stop the
  // effect would not see the mutation).
  const [done, setDone] = useState(false);

  const running = stage === "play" && inView && !done;

  // A layout effect, so the first scrambled frame is what paints — the clean
  // text never flashes before the noise.
  useIsoLayoutEffect(() => {
    if (!running) return;

    const revealAt = chars.map((ch, i) =>
      /\s/.test(ch)
        ? 0
        : (i / Math.max(chars.length, 1)) * duration * 0.6 + Math.random() * duration * 0.4
    );

    const paint = (elapsed: number) => {
      setFrame(
        chars
          .map((ch, i) =>
            elapsed >= revealAt[i] ? ch : glyphs.charAt(Math.floor(Math.random() * glyphs.length))
          )
          .join("")
      );
    };

    const startedAt = performance.now();
    paint(0);

    const id = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      if (elapsed >= duration) {
        window.clearInterval(id);
        setDone(true);
        setFrame(null);
        return;
      }
      paint(elapsed);
    }, tick);

    return () => window.clearInterval(id);
  }, [running, chars, duration, tick, glyphs]);

  const Tag = as as "span";

  if (stage === "plain" || frame === null) {
    return (
      <Tag ref={ref} className={className} style={style}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} className={className} style={style} aria-label={text}>
      <KzSrText text={text} />
      <span aria-hidden="true" style={STACK}>
        {/* Random glyphs are not the width of real ones, so the real text sizes
            the box and the noise is painted over it. */}
        <span style={STACK_SIZER}>{text}</span>
        <span style={STACK_LIVE}>{frame}</span>
      </span>
    </Tag>
  );
}

/* ==========================================================================
   5. KzGradientText — a static token ramp clipped to the glyphs.
   ========================================================================== */

export interface KzGradientTextProps extends KzTextBaseProps {
  children: ReactNode;
  /** Any CSS gradient. Pass a token: var(--gr) or var(--tile). */
  gradient?: string;
}

export function KzGradientText({
  children,
  gradient = "var(--grt)",
  as = "span",
  className = "",
  style,
}: KzGradientTextProps) {
  const Tag = as as "span";
  return (
    <Tag
      className={className}
      style={{
        backgroundImage: gradient,
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        // Without this a wrapped inline gets one slice of the ramp per line.
        WebkitBoxDecorationBreak: "clone",
        boxDecorationBreak: "clone",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

/* ==========================================================================
   6. KzAnimatedGradientText — the ramp travels through the glyphs.
   ========================================================================== */

export interface KzAnimatedGradientTextProps extends KzTextBaseProps {
  children: ReactNode;
  /** One full pass of the ramp. Ambient, so it sits outside the 200-800ms band. */
  duration?: number;
  /** Held back past first paint so the ramp never competes with LCP. */
  startDelay?: number;
}

export function KzAnimatedGradientText({
  children,
  duration = 6000,
  startDelay = 400,
  as = "span",
  className = "",
  style,
}: KzAnimatedGradientTextProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const active = useKzAmbient(ref, startDelay);
  const Tag = as as "span";

  // The one place in this file that animates a paint property. A travelling
  // background-clip ramp cannot be expressed as a transform in any
  // cross-browser way; the cost is a repaint of a headline-sized box, it never
  // touches layout, it is paused whenever the text is off screen, and reduced
  // motion stops it dead (see KIT_CSS).
  const rampVars = { "--kz-ramp-dur": `${duration}ms` } as CSSProperties;

  return (
    <Tag
      ref={ref}
      className={`kz-text-ramp ${className}`}
      style={{
        ...rampVars,
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        WebkitBoxDecorationBreak: "clone",
        boxDecorationBreak: "clone",
        animationPlayState: active ? "running" : "paused",
        willChange: active ? "background-position" : "auto",
        ...style,
      }}
    >
      {children}
      <KzTextStyles />
    </Tag>
  );
}

/* ==========================================================================
   7. KzOutlineToFill — hollow letters fill in.
   ========================================================================== */

export interface KzOutlineToFillProps extends KzTextBaseProps {
  text: string;
  /** wipe reveals the fill left to right; fade cross-dissolves it. */
  mode?: "wipe" | "fade";
  /** -webkit-text-stroke width in px. */
  stroke?: number;
  /** Colour of the filled state. currentColor, or a token such as var(--acc). */
  fill?: string;
  duration?: number;
  delay?: number;
  playOnMount?: boolean;
}

export function KzOutlineToFill({
  text,
  mode = "wipe",
  stroke = 1,
  fill = "currentColor",
  duration = 700,
  delay = 0,
  playOnMount = false,
  as = "span",
  className = "",
  style,
}: KzOutlineToFillProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const { stage } = useKzEntrance(ref, playOnMount);
  const playing = stage === "play";
  const Tag = as as "span";

  if (stage === "plain") {
    return (
      <Tag ref={ref} className={className} style={style}>
        {text}
      </Tag>
    );
  }

  const reveal: CSSProperties =
    mode === "wipe"
      ? {
          clipPath: playing ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
          transition: `clip-path ${duration}ms ${EASE} ${delay}ms`,
        }
      : {
          opacity: playing ? 1 : 0,
          transition: `opacity ${duration}ms ${EASE} ${delay}ms`,
        };

  return (
    <Tag ref={ref} className={className} style={style} aria-label={text}>
      <KzSrText text={text} />
      <span aria-hidden="true" style={STACK}>
        {/* The outline copy is in flow and owns the box; the filled copy is
            painted over it, so the reveal cannot move a pixel of layout. */}
        <span
          style={{
            gridArea: "1 / 1",
            WebkitTextFillColor: "transparent",
            WebkitTextStrokeWidth: `${stroke}px`,
            WebkitTextStrokeColor: "currentColor",
          }}
        >
          {text}
        </span>
        <span
          style={{
            ...STACK_LIVE,
            color: fill,
            WebkitTextFillColor: fill,
            ...reveal,
          }}
        >
          {text}
        </span>
      </span>
    </Tag>
  );
}

/* ==========================================================================
   8. KzBlurTextReveal — words sharpen in sequence.
   ========================================================================== */

export interface KzBlurTextRevealProps extends KzTextBaseProps {
  text: string;
  stagger?: number;
  duration?: number;
  delay?: number;
  /** Starting blur radius in px. Capped on small screens. */
  blur?: number;
  playOnMount?: boolean;
}

export function KzBlurTextReveal({
  text,
  stagger = 70,
  duration = 650,
  delay = 0,
  blur = 8,
  playOnMount = false,
  as = "span",
  className = "",
  style,
}: KzBlurTextRevealProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const compact = useCompact();
  const { stage } = useKzEntrance(ref, playOnMount);
  const words = useMemo(() => toWords(text), [text]);
  const playing = stage === "play";
  const Tag = as as "span";

  if (stage === "plain") {
    return (
      <Tag ref={ref} className={className} style={style}>
        {text}
      </Tag>
    );
  }

  // Blur is the one filter worth animating — it is GPU-composited and, unlike a
  // width or a margin, it expands only the paint box. Mobile GPUs still hate a
  // wide radius, so it is capped there.
  const radius = compact ? Math.min(blur, 5) : blur;
  const step = pace(stagger, words.length);

  return (
    <Tag ref={ref} className={className} style={style} aria-label={text}>
      <KzSrText text={text} />
      <span aria-hidden="true" style={SPLIT_HOST}>
        {words.map((word, i) => (
          <Fragment key={i}>
            {i > 0 ? " " : null}
            <span
              style={{
                display: "inline-block",
                opacity: playing ? 1 : 0,
                filter: playing ? "blur(0px)" : `blur(${radius}px)`,
                transition:
                  `opacity ${duration}ms ${EASE} ${delay + i * step}ms, ` +
                  `filter ${duration}ms ${EASE} ${delay + i * step}ms`,
              }}
            >
              {word}
            </span>
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

/* ==========================================================================
   9. KzRotatingWord — one word of a headline cycles.
   ========================================================================== */

export interface KzRotatingWordProps extends KzTextBaseProps {
  words: string[];
  /** Time each word is held. Floored at duration + 400ms. */
  interval?: number;
  duration?: number;
}

export function KzRotatingWord({
  words,
  interval = 2400,
  duration = 520,
  as = "span",
  className = "",
  style,
}: KzRotatingWordProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const list = useMemo(() => {
    const clean = words.filter(Boolean);
    return clean.length > 0 ? clean : [""];
  }, [words]);
  const active = useKzAmbient(ref);
  const [cursor, setCursor] = useState({ current: 0, previous: -1 });

  useEffect(() => {
    if (!active || list.length < 2) return;
    const every = Math.max(interval, duration + 400);
    const id = window.setInterval(() => {
      setCursor((c) => ({ current: (c.current + 1) % list.length, previous: c.current }));
    }, every);
    return () => window.clearInterval(id);
  }, [active, list.length, interval, duration]);

  const Tag = as as "span";
  const current = list[cursor.current] ?? "";

  // Every word is a grid item in the same cell, so the cell is exactly as wide
  // as the longest word from first paint onwards and the headline never jumps.
  // The markup is identical on the server and under reduced motion — only the
  // cursor stops moving — so there is no hydration swap and no layout shift.
  return (
    <Tag ref={ref} className={className} style={{ ...STACK, ...style }} aria-label={current}>
      <KzSrText text={current} />
      <span aria-hidden="true" style={{ display: "contents" }}>
        {list.map((word, i) => {
          const isCurrent = i === cursor.current;
          const isLeaving = i === cursor.previous && !isCurrent;
          const waiting = !isCurrent && !isLeaving;
          return (
            <span
              key={i}
              style={{
                gridArea: "1 / 1",
                whiteSpace: "nowrap",
                opacity: isCurrent ? 1 : 0,
                transform: isCurrent
                  ? "translate3d(0, 0, 0)"
                  : isLeaving
                    ? "translate3d(0, -0.5em, 0)"
                    : "translate3d(0, 0.5em, 0)",
                // Words waiting their turn snap back to the start position
                // instead of animating through the headline.
                transition: waiting
                  ? "none"
                  : `opacity ${duration}ms ${EASE}, transform ${duration}ms ${EASE}`,
              }}
            >
              {word}
            </span>
          );
        })}
      </span>
    </Tag>
  );
}
