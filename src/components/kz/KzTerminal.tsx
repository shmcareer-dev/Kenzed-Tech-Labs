"use client";

import { useEffect, useRef } from "react";

const termLines: [string, string, string][] = [
  ["$", 'kenzed init --project "your-idea"', "#6ff0e2"],
  ["✓", "scope defined · architecture approved", "#34c759"],
  ["$", "kenzed build --agents --rag --guardrails", "#6ff0e2"],
  ["✓", "evals passed 98.6% · tracing enabled", "#34c759"],
  ["$", "kenzed deploy --target on-prem-gpu", "#6ff0e2"],
  ["●", "live in production — monitored 24×7", "#4da3ff"],
];

export function KzTerminal() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let li = 0;
    let ci = 0;

    const step = () => {
      if (!containerRef.current) {
        timeoutRef.current = setTimeout(step, 700);
        return;
      }
      if (li >= termLines.length) {
        timeoutRef.current = setTimeout(() => {
          if (containerRef.current) containerRef.current.innerHTML = "";
          li = 0;
          ci = 0;
          step();
        }, 4600);
        return;
      }
      const L = termLines[li];
      let line = container.children[li] as HTMLDivElement | undefined;
      if (!line) {
        line = document.createElement("div");
        line.innerHTML = `<span style="margin-right:9px;color:${L[2]}">${L[0]}</span><span></span>`;
        container.appendChild(line);
      }
      ci++;
      const textSpan = line.lastChild as HTMLSpanElement;
      textSpan.textContent = L[1].slice(0, ci);
      if (ci >= L[1].length) {
        li++;
        ci = 0;
        timeoutRef.current = setTimeout(step, 460);
      } else {
        timeoutRef.current = setTimeout(step, 16 + Math.random() * 26);
      }
    };

    step();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      style={{
        marginTop: 28,
        background: "#0a0f1a",
        border: "1px solid rgba(255,255,255,.14)",
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
          borderBottom: "1px solid rgba(255,255,255,.09)",
        }}
      >
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} />
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.14em",
            color: "#5d6a83",
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
          color: "#9fb4d8",
          minHeight: 158,
        }}
      >
        <div ref={containerRef} />
        <span style={{ color: "#4da3ff", animation: "kzBlink 1.1s steps(1) infinite" }}>▌</span>
      </div>
    </div>
  );
}
