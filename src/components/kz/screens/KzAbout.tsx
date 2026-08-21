"use client";

import { KzReveal } from "@/components/kz/KzReveal";
import { KzSectionTitle, KzSphere, KzCube } from "@/components/kz/primitives";
import { useKzPage } from "@/components/kz/useKzPage";
import { kzValues, kzTeam, kzIndustries } from "@/content/kz";
import { longStory, mission, vision } from "@/content/company";

export function KzAbout() {
  useKzPage("about");
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
        <KzSphere size={54} opacity={0.3} />
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
        <KzCube size={40} opacity={0.26} />
      </div>

      <section style={{ padding: "clamp(130px, 18vh, 180px) 0 clamp(40px, 6vw, 70px)" }}>
        <div className="kz-wrap">
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "var(--acc)",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <span style={{ width: 26, height: 1, background: "var(--acc)", opacity: 0.7 }} />
            06 / About us
          </div>
          <h1 className="kz-page-title" style={{ maxWidth: "18ch" }}>
            Built in the steel city. Engineered for the world.
          </h1>
        </div>
      </section>

      <section style={{ padding: "0 0 clamp(50px, 7vw, 80px)", background: "var(--bg)" }}>
        <div
          className="kz-wrap"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
            gap: "clamp(28px, 5vw, 64px)",
          }}
        >
          <KzReveal delay={0}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: 14,
              }}
            >
              Our story
            </div>
            <p style={{ fontSize: "1.06rem", color: "var(--mut)", margin: "0 0 16px" }}>
              {longStory}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 }}>
              {[
                "23.52°N 87.31°E — DURGAPUR HQ",
                "22.58°N 88.46°E — KOLKATA",
                "UTC+5:30 · DELIVERING WORLDWIDE",
              ].map((t) => (
                <span
                  key={t}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.66rem",
                    letterSpacing: "0.08em",
                    padding: "9px 14px",
                    border: "1px solid var(--line2)",
                    borderRadius: 999,
                    color: "var(--mut)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </KzReveal>

          <div style={{ display: "grid", gap: 16 }}>
            <KzReveal delay={1}>
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  padding: 26,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.66rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--acc)",
                    marginBottom: 10,
                  }}
                >
                  Mission
                </div>
                <p style={{ margin: 0, color: "var(--mut)", fontSize: "0.96rem" }}>{mission}</p>
              </div>
            </KzReveal>
            <KzReveal delay={2}>
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  padding: 26,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.66rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--acc)",
                    marginBottom: 10,
                  }}
                >
                  Vision
                </div>
                <p style={{ margin: 0, color: "var(--mut)", fontSize: "0.96rem" }}>{vision}</p>
              </div>
            </KzReveal>
          </div>
        </div>
      </section>

      <section style={{ padding: "0 0 clamp(50px, 7vw, 80px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzReveal delay={0}>
            <KzSectionTitle style={{ marginBottom: 26 }}>Our values</KzSectionTitle>
          </KzReveal>
          <div>
            {kzValues.map(([t, d], i) => (
              <KzReveal key={t} delay={i}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                    gap: "8px 28px",
                    padding: "22px 12px",
                    borderTop: "1px solid var(--line)",
                    alignItems: "baseline",
                    transition: "background .3s",
                  }}
                  className="kz-hover-row"
                >
                  <div style={{ display: "flex", gap: 20, alignItems: "baseline" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.78rem",
                        color: "var(--acc)",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 400,
                        fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
                        textTransform: "uppercase",
                        margin: 0,
                        lineHeight: 1.2,
                        color: "var(--ink)",
                      }}
                    >
                      {t}
                    </h3>
                  </div>
                  <p style={{ margin: 0, color: "var(--mut)", fontSize: "0.94rem" }}>{d}</p>
                </div>
              </KzReveal>
            ))}
            <div style={{ borderTop: "1px solid var(--line)" }} />
          </div>
        </div>
      </section>

      <section style={{ padding: "0 0 clamp(50px, 7vw, 80px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzReveal delay={0}>
            <KzSectionTitle style={{ marginBottom: 10 }}>
              Every discipline under one roof
            </KzSectionTitle>
            <p
              style={{
                color: "var(--mut)",
                maxWidth: "62ch",
                margin: "0 0 26px",
                fontSize: "1rem",
              }}
            >
              A multidisciplinary team of 25 professionals taking products from concept to delivery,
              maintenance, and beyond — with no handoffs to third parties.
            </p>
          </KzReveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 265px), 1fr))",
              gap: 16,
            }}
          >
            {kzTeam.map(([t, d], i) => (
              <KzReveal key={t} delay={i % 4}>
                <div
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--line)",
                    borderRadius: 16,
                    padding: 24,
                    transition: "transform .3s, border-color .3s, box-shadow .3s",
                  }}
                  className="kz-card"
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.66rem",
                      color: "var(--dim)",
                      marginBottom: 10,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      margin: "0 0 8px",
                      color: "var(--ink)",
                    }}
                  >
                    {t}
                  </h3>
                  <p style={{ fontSize: "0.88rem", color: "var(--mut)", margin: 0 }}>{d}</p>
                </div>
              </KzReveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "0 0 clamp(70px, 10vw, 120px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzReveal delay={0}>
            <KzSectionTitle style={{ marginBottom: 10 }}>Industries we serve</KzSectionTitle>
            <p
              style={{
                color: "var(--mut)",
                maxWidth: "62ch",
                margin: "0 0 26px",
                fontSize: "1rem",
              }}
            >
              Our work adapts to the realities of each sector.
            </p>
          </KzReveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 245px), 1fr))",
              gap: 16,
            }}
          >
            {kzIndustries.map(([t, d], i) => (
              <KzReveal key={t} delay={i % 4}>
                <div
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--line)",
                    borderRadius: 16,
                    padding: 22,
                    transition: "transform .3s, border-color .3s, box-shadow .3s",
                  }}
                  className="kz-card"
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.66rem",
                      color: "var(--acc)",
                      marginBottom: 10,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      margin: "0 0 6px",
                      color: "var(--ink)",
                    }}
                  >
                    {t}
                  </h3>
                  <p style={{ fontSize: "0.86rem", color: "var(--mut)", margin: 0 }}>{d}</p>
                </div>
              </KzReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
