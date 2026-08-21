"use client";

const terms = [
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

export function KzMarquee() {
  return (
    <div
      style={{
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
        padding: "16px 0",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 0,
          width: "max-content",
          animation: "kzMarq 30s linear infinite",
        }}
      >
        {[0, 1].map((dup) => (
          <div key={dup} style={{ display: "flex", whiteSpace: "nowrap" }}>
            {terms.map((t) => (
              <span
                key={`${dup}-${t}`}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.76rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--mut)",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {t}
                <span style={{ color: "var(--acc)", margin: "0 26px" }}>◆</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
