"use client";

import { KzReveal } from "@/components/kz/KzReveal";
import { KzScrollSpy } from "@/components/kz/KzScrollSpy";
import { KzSpatialIcon3D, kindForLabel } from "@/components/kz/KzSpatial3D";
import { KzPageHero } from "@/components/kz/primitives";
import { kzProcess } from "@/content/kz";

export function KzProcess() {
  return (
    <div id="top" style={{ position: "relative" }}>
      <KzPageHero
        eyebrow="07 / How we work"
        title="A transparent, production-first process"
        lead="Agile delivery that de-risks your project and keeps you in control at every step."
        visual="pipeline"
      />

      <KzScrollSpy
        sections={[
          { id: "top", label: "How we work" },
          { id: "process", label: "Our process" },
        ]}
      />

      <section id="process" style={{ padding: "0 0 clamp(70px, 10vw, 120px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          {/* The rail is a clipping window; the ramp inside it is twice as wide
              and carries the gradient twice, so sliding it half its width loops
              seamlessly while only ever moving a composited layer. */}
          <div
            aria-hidden="true"
            style={{
              height: 3,
              borderRadius: 2,
              margin: "0 12px 10px",
              overflow: "hidden",
              opacity: 0.5,
            }}
          >
            <div
              style={{
                width: "200%",
                height: "100%",
                background:
                  "repeating-linear-gradient(90deg, var(--acc), var(--acc2), var(--acc3), var(--acc) 200px)",
                animation: "kzFlow 5s linear infinite",
                willChange: "transform",
              }}
            />
          </div>

          {kzProcess.map(([t, d], i) => (
            <KzReveal key={t} delay={i % 3}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(86px, 130px) 1fr",
                  gap: "clamp(14px, 3vw, 40px)",
                  padding: "clamp(24px, 4vw, 38px) 12px",
                  borderTop: "1px solid var(--line)",
                  transition: "background .3s",
                }}
                className="kz-hover-row"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <KzSpatialIcon3D
                    kind={kindForLabel(t)}
                    size={44}
                    float={false}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "clamp(1.45rem, 3.5vw, 2.4rem)",
                      lineHeight: 1.02,
                      letterSpacing: "-0.035em",
                      color: "var(--dim)",
                      transition: "color .3s",
                    }}
                    className="process-num"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                    gap: "6px 28px",
                    alignItems: "baseline",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "clamp(1.15rem, 2.4vw, 1.6rem)",
                      letterSpacing: "-0.035em",
                      margin: 0,
                      lineHeight: 1.22,
                      color: "var(--ink)",
                    }}
                  >
                    {t}
                  </h2>
                  <p style={{ margin: 0, color: "var(--mut)", fontSize: "0.96rem" }}>{d}</p>
                </div>
              </div>
            </KzReveal>
          ))}
          <div style={{ borderTop: "1px solid var(--line)" }} />
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.11em",
              textTransform: "uppercase",
              color: "var(--dim)",
              margin: "26px 12px 0",
            }}
          >
            Agile sprints · working demos every cycle · you stay in control
          </p>
        </div>
      </section>
    </div>
  );
}
