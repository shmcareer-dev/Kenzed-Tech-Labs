"use client";

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

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const MAX_SEQUENCE = 700;
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const MASK_PAD = "0.18em";

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

const SPLIT_HOST: CSSProperties = {
  WebkitHyphens: "manual",
  hyphens: "manual",
};

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
  as?: KzTextTag;
  className?: string;
  style?: CSSProperties;
}

type SpanRef = RefObject<HTMLSpanElement | null>;
type KzStage = "plain" | "armed" | "play";

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function toWords(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

function pace(step: number, count: number) {
  if (count <= 1) return step;
  return Math.min(step, MAX_SEQUENCE / (count - 1));
}

function KzSrText({ text }: { text: string }) {
  return <span style={SR_ONLY}>{text}</span>;
}

function measureMarkup(words: string[]): ReactNode {
  return words.map((word, index) => (
    <Fragment key={index}>
      {index > 0 ? " " : null}
      <span data-kz-word="true">{word}</span>
    </Fragment>
  ));
}

function useKzEntrance(ref: SpanRef, playOnMount: boolean) {
  const [stage, setStage] = useState<KzStage>("plain");
  const [motionEpoch, setMotionEpoch] = useState(0);

  useEffect(() => {
    const media = window.matchMedia(REDUCE_QUERY);
    const refresh = () => setMotionEpoch((value) => value + 1);
    media.addEventListener("change", refresh);
    return () => media.removeEventListener("change", refresh);
  }, []);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia(REDUCE_QUERY).matches) {
      setStage("plain");
      return;
    }

    const box = el.getBoundingClientRect();
    const visibleAtFirstPaint =
      box.top < window.innerHeight && box.bottom > 0;
    if (visibleAtFirstPaint && !playOnMount) {
      setStage("plain");
      return;
    }

    setStage("armed");
    let frameA = 0;
    let frameB = 0;
    const play = () => {
      frameA = requestAnimationFrame(() => {
        frameB = requestAnimationFrame(() => setStage("play"));
      });
    };

    if (playOnMount) {
      play();
      return () => {
        cancelAnimationFrame(frameA);
        cancelAnimationFrame(frameB);
      };
    }

    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || started) return;
        started = true;
        play();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameA);
      cancelAnimationFrame(frameB);
    };
  }, [motionEpoch, playOnMount, ref]);

  return stage;
}

function useKzLineGroups(
  ref: SpanRef,
  words: string[],
  enabled: boolean
): string[][] | null {
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

    const resizeObserver = new ResizeObserver(() => {
      const host = ref.current;
      if (!host) return;
      const width = host.getBoundingClientRect().width;
      if (Math.abs(width - widthRef.current) < 1) return;
      widthRef.current = width;
      setGroups(null);
    });
    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, [enabled, groups, ref, words]);

  return groups;
}

export interface KzMaskedLinesProps extends KzTextBaseProps {
  text: string;
  stagger?: number;
  duration?: number;
  delay?: number;
  playOnMount?: boolean;
}

/** Reveals the browser's measured lines without duplicating accessible text. */
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
  const stage = useKzEntrance(ref, playOnMount);
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
          : lines.map((line, index) => (
              <span
                key={index}
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
                    transform: playing
                      ? "translate3d(0, 0, 0)"
                      : "translate3d(0, 110%, 0)",
                    transition:
                      `transform ${duration}ms ${EASE} ${delay + index * step}ms`,
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
