"use client";

import { type CSSProperties } from "react";

import { KzGridPattern } from "@/components/kz/motion/KzAmbient";
import { KzFadeUp, KzStagger } from "@/components/kz/motion/KzEntrance";
import { KzHoverLift } from "@/components/kz/motion/KzPointer";
import { KzSectionTitle, KzSphere, KzCube } from "@/components/kz/primitives";
import { useKzPage } from "@/components/kz/useKzPage";
import { kzValues, kzTeam, kzIndustries } from "@/content/kz";
import { longStory, mission, vision } from "@/content/company";

const cardGrid = (min: number): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`,
  gap: 16,
});

export function KzAbout() {
  useKzPage("about");
  return (
    <div style={{ position: "relative" }}>
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

      {/* Above the fold: painted straight, never animated in. */}
      <section style={{ padding: "clamp(130px, 18vh, 180px) 0 clamp(40px, 6vw, 70px)" }}>
        <div className="kz-wrap">
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
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
            08 / About us
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
          <KzFadeUp>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                letterSpacing: "0.16em",
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
            <KzStagger
              step={90}
              distance={14}
              childAs="span"
              style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 }}
            >
              {[
                "23.52°N 87.31°E — DURGAPUR HQ",
                "22.58°N 88.46°E — KOLKATA",
                "UTC+5:30 · DELIVERING WORLDWIDE",
              ].map((t) => (
                <span
                  key={t}
                  style={{
                    display: "inline-block",
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
            </KzStagger>
          </KzFadeUp>

          <KzStagger step={100} style={{ display: "grid", gap: 16 }}>
            {[
              ["Mission", mission],
              ["Vision", vision],
            ].map(([label, body]) => (
              <KzHoverLift key={label} lift={5}>
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
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--acc)",
                      marginBottom: 10,
                    }}
                  >
                    {label}
                  </div>
                  <p style={{ margin: 0, color: "var(--mut)", fontSize: "0.96rem" }}>{body}</p>
                </div>
              </KzHoverLift>
            ))}
          </KzStagger>
        </div>
      </section>

      <section
        style={{
          padding: "0 0 clamp(50px, 7vw, 80px)",
          background: "var(--bg)",
          position: "relative",
        }}
      >
        <KzGridPattern cell={64} opacity={0.4} fade="center" />
        <div className="kz-wrap" style={{ position: "relative" }}>
          <KzFadeUp>
            <KzSectionTitle style={{ marginBottom: 26 }}>Our values</KzSectionTitle>
          </KzFadeUp>
          <div>
            <KzStagger step={90}>
              {kzValues.map(([t, d], i) => (
                <div
                  key={t}
                  className="kz-hover-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                    gap: "8px 28px",
                    padding: "22px 12px",
                    borderTop: "1px solid var(--line)",
                    alignItems: "baseline",
                  }}
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
                        fontWeight: 600,
                        fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
                        letterSpacing: "0.01em",
                        textTransform: "uppercase",
                        margin: 0,
                        lineHeight: 1.25,
                        color: "var(--ink)",
                      }}
                    >
                      {t}
                    </h3>
                  </div>
                  <p style={{ margin: 0, color: "var(--mut)", fontSize: "0.94rem" }}>{d}</p>
                </div>
              ))}
            </KzStagger>
            <div style={{ borderTop: "1px solid var(--line)" }} />
          </div>
        </div>
      </section>

      <section style={{ padding: "0 0 clamp(50px, 7vw, 80px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzFadeUp>
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
              Our team of twenty-five works from a dedicated 15,000 sq ft facility in Durgapur,
              taking products from concept to delivery, maintenance, and beyond — with no handoffs
              to third parties.
            </p>
          </KzFadeUp>
          <KzStagger step={90} style={cardGrid(265)}>
            {kzTeam.map(([t, d], i) => (
              <div
                key={t}
                className="kz-card"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  padding: 24,
                }}
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
            ))}
          </KzStagger>
        </div>
      </section>

      <section style={{ padding: "0 0 clamp(70px, 10vw, 120px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzFadeUp>
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
          </KzFadeUp>
          <KzStagger step={90} style={cardGrid(245)}>
            {kzIndustries.map(([t, d], i) => (
              <div
                key={t}
                className="kz-card"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  padding: 22,
                }}
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
            ))}
          </KzStagger>
        </div>
      </section>
    </div>
  );
}
