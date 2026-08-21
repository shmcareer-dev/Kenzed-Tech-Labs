"use client";

import { KzReveal } from "@/components/kz/KzReveal";
import { KzPageHero, KzTorus, KzOrbitDots } from "@/components/kz/primitives";
import { useKzPage } from "@/components/kz/useKzPage";
import { kzProcess } from "@/content/kz";

export function KzProcess() {
  useKzPage("process");
  return (
    <div className="kz-page-enter" style={{ position: "relative" }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "min(6%, 90px)",
          top: "clamp(140px, 20vh, 200px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <KzTorus size={58} opacity={0.32} />
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "min(4%, 50px)",
          top: "clamp(220px, 34vh, 340px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <KzOrbitDots count={6} radius={20} />
      </div>

      <KzPageHero
        eyebrow="05 / How we work"
        title="A transparent, production-first process"
        lead="Agile delivery that de-risks your project and keeps you in control at every step."
      />

      <section style={{ padding: "0 0 clamp(70px, 10vw, 120px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <div
            aria-hidden="true"
            style={{
              height: 3,
              borderRadius: 2,
              margin: "0 12px 10px",
              background:
                "linear-gradient(90deg, var(--acc), var(--acc2), var(--acc3), var(--acc))",
              backgroundSize: "200px 100%",
              backgroundRepeat: "repeat-x",
              animation: "kzFlow 5s linear infinite",
              opacity: 0.5,
            }}
          />

          {kzProcess.map(([t, d], i) => (
            <KzReveal key={t} delay={i % 3}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(64px, 110px) 1fr",
                  gap: "clamp(14px, 3vw, 40px)",
                  padding: "clamp(24px, 4vw, 38px) 12px",
                  borderTop: "1px solid var(--line)",
                  transition: "background .3s",
                }}
                className="kz-hover-row"
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.8rem, 4.5vw, 3rem)",
                    lineHeight: 1,
                    color: "var(--dim)",
                    transition: "color .3s",
                  }}
                  className="process-num"
                >
                  {String(i + 1).padStart(2, "0")}
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
                      fontWeight: 400,
                      fontSize: "clamp(1.15rem, 2.4vw, 1.6rem)",
                      textTransform: "uppercase",
                      margin: 0,
                      lineHeight: 1.15,
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
              letterSpacing: "0.14em",
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
