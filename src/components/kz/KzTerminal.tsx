"use client";

import { useEffect, useRef, useState } from "react";

/* Colours are token references rather than literals so the panel re-tints with
   the theme: the console sits on --card, which is a translucent blue over the
   near-black canvas in dark and a white card in light. */
const termLines: [string, string, string][] = [
  ["$", 'kenzed init --project "your-idea"', "var(--acc3)"],
  ["✓", "scope defined · architecture approved", "var(--ok)"],
  ["$", "kenzed build --agents --rag --guardrails", "var(--acc3)"],
  ["✓", "evals passed 98.6% · tracing enabled", "var(--ok)"],
  ["$", "kenzed deploy --target on-prem-gpu", "var(--acc3)"],
  ["●", "live in production — monitored 24×7", "var(--acc)"],
];

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/* Per-character cadence and the pauses that punctuate it. */
const CHAR_MIN = 16;
const CHAR_JITTER = 26;
const LINE_PAUSE = 460;
const REPLAY_PAUSE = 4600;

function renderLine(container: HTMLElement, index: number): HTMLSpanElement {
  const existing = container.children[index] as HTMLDivElement | undefined;
  if (existing) return existing.lastChild as HTMLSpanElement;

  const [glyph, , colour] = termLines[index];
  const line = document.createElement("div");
  const mark = document.createElement("span");
  mark.style.marginRight = "9px";
  mark.style.color = colour;
  mark.textContent = glyph;
  const text = document.createElement("span");
  line.append(mark, text);
  container.appendChild(line);
  return text;
}

export function KzTerminal() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  /* Reduced motion renders the finished transcript from markup instead, so the
     effect never mounts a timer and the panel still says what it is for. */
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION);
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || reduced) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let onscreen = false;
    let li = 0;
    let ci = 0;

    const wait = (fn: () => void, ms: number) => {
      timer = setTimeout(fn, ms);
    };

    const step = () => {
      // Offscreen the loop parks itself rather than typing into a panel nobody
      // can see; the observer restarts it on the way back in.
      if (!onscreen) {
        timer = null;
        return;
      }
      if (li >= termLines.length) {
        wait(() => {
          container.replaceChildren();
          li = 0;
          ci = 0;
          step();
        }, REPLAY_PAUSE);
        return;
      }

      const [, body] = termLines[li];
      const text = renderLine(container, li);
      ci++;
      text.textContent = body.slice(0, ci);

      if (ci >= body.length) {
        li++;
        ci = 0;
        wait(step, LINE_PAUSE);
      } else {
        wait(step, CHAR_MIN + Math.random() * CHAR_JITTER);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          onscreen = entry.isIntersecting;
          if (onscreen && timer === null) step();
        });
      },
      { threshold: 0.15 }
    );
    io.observe(container);

    return () => {
      io.disconnect();
      onscreen = false;
      if (timer !== null) clearTimeout(timer);
    };
  }, [reduced]);

  return (
    <div
      style={{
        marginTop: 28,
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "var(--shadow)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "12px 16px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        {/* Fixed window-chrome hues, not theme surfaces: the three dots are only
            legible as a title bar if they keep their familiar colours. */}
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} />
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.11em",
            color: "var(--dim)",
            textTransform: "uppercase",
          }}
        >
          kenzed@lab — production
        </span>
      </div>
      <div
        style={{
          padding: "16px 20px 18px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.76rem",
          lineHeight: 2,
          color: "var(--mut)",
          minHeight: 158,
        }}
      >
        {/* Two separate elements rather than one shared container: the typed
            panel is owned imperatively by the effect, so letting React render
            children into that same node would leave the two fighting over it
            if the motion preference flipped at runtime. */}
        {reduced ? (
          <div>
            {termLines.map(([glyph, body, colour]) => (
              <div key={body}>
                <span style={{ marginRight: 9, color: colour }}>{glyph}</span>
                <span>{body}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div ref={containerRef} />
            <span style={{ color: "var(--acc)", animation: "kzBlink 1.1s steps(1) infinite" }}>
              ▌
            </span>
          </>
        )}
      </div>
    </div>
  );
}
