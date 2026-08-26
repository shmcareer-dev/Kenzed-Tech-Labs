"use client";

import { KzReveal } from "@/components/kz/KzReveal";
import { KzScrollSpy } from "@/components/kz/KzScrollSpy";
import { KzDecorPin, KzSpatialIcon3D, kindForLabel } from "@/components/kz/KzSpatial3D";
import { KzPageHero, KzSectionTitle } from "@/components/kz/primitives";
import { kzInfrastructure, kzInfraWhy, kzStatusRows } from "@/content/kz";

export function KzInfrastructure() {
  return (
    <div id="top" style={{ position: "relative" }}>
      <KzPageHero
        eyebrow="06 / Infrastructure"
        title="Great software needs a great foundation"
        lead="We invested early in our own facility, compute, and utilities — so our teams build without interruption, and clients who need private, on-premise, or sovereign AI can trust exactly where their workloads run."
        visual="cloud"
      />

      <KzScrollSpy
        sections={[
          { id: "top", label: "Infrastructure" },
          { id: "facility", label: "Infrastructure we own" },
          { id: "why", label: "Why this matters" },
        ]}
      />

      <section id="facility" style={{ padding: "0 0 clamp(50px, 7vw, 80px)", background: "var(--bg)" }}>
        <div className="kz-wrap" style={{ position: "relative" }}>
          <KzDecorPin
            kind="server"
            label="On-prem compute"
            size={58}
            className="kz-section-pin"
          />
          <KzReveal delay={0}>
            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: 22,
                padding: "clamp(28px, 5vw, 48px)",
                background: "linear-gradient(135deg, var(--card), var(--card2))",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                gap: 20,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--mut)",
                    marginBottom: 10,
                  }}
                >
                  Durgapur · Engineering centre
                </div>
                {/* Emphasis via the shared class so the central cyan
                    restyle (and the light theme) both apply. */}
                <div
                  className="kz-grad-text"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "clamp(1.7rem, 4.5vw, 2.9rem)",
                    lineHeight: 1.04,
                    letterSpacing: "-0.045em",
                  }}
                >
                  Infrastructure we own, not rent
                </div>
              </div>
              <p style={{ margin: 0, color: "var(--mut)", fontSize: "1.02rem" }}>
                A dedicated, purpose-built development &amp; studio facility in Durgapur for focused
                engineering, collaboration, and round-the-clock delivery — with a corporate presence
                in Kolkata for client engagement.
              </p>
            </div>
          </KzReveal>

          <KzReveal delay={1}>
            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: 16,
                background: "var(--card)",
                padding: "4px clamp(16px, 3vw, 26px)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 225px), 1fr))",
                gap: "0 30px",
                marginBottom: 16,
              }}
            >
              {kzStatusRows.map(([k, v, c], i) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "14px 0",
                    /* A divider ABOVE each row but the first, rather than below
                       each row: below, the last row's line landed a hairline
                       inside the card's own border and read as a double edge —
                       and in the single-column phone layout that is every
                       column's last row. `:last-child` cannot be expressed as
                       an inline style, so the index carries it. */
                    borderTop: i === 0 ? undefined : "1px solid var(--line)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.64rem",
                      letterSpacing: "0.13em",
                      textTransform: "uppercase",
                      color: "var(--dim)",
                    }}
                  >
                    {k}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: c,
                        boxShadow: `0 0 8px ${c}`,
                        animation: "kzPulse 2.2s infinite",
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.66rem",
                        letterSpacing: "0.06em",
                        color: "var(--ink)",
                      }}
                    >
                      {v}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </KzReveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 245px), 1fr))",
              gap: 16,
            }}
          >
            {kzInfrastructure.map(([icon, t, d], i) => (
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
                  <KzSpatialIcon3D
                    kind={kindForLabel(`${icon} ${t}`)}
                    size={58}
                    float={false}
                    style={{ marginBottom: 10 }}
                  />
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

      <section id="why" style={{ padding: "0 0 clamp(70px, 10vw, 120px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzReveal delay={0}>
            <KzSectionTitle style={{ marginBottom: 30 }}>
              Why this matters to clients
            </KzSectionTitle>
          </KzReveal>

          <div>
            {kzInfraWhy.map(([t, d], i) => (
              <KzReveal key={t} delay={i}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                    gap: "8px 28px",
                    padding: "24px 12px",
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
                        fontWeight: 600,
                        fontSize: "clamp(1rem, 1.8vw, 1.25rem)",
                        letterSpacing: "-0.035em",
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
    </div>
  );
}
