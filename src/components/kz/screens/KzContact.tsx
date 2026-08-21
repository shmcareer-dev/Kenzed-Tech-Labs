"use client";

import { KzReveal } from "@/components/kz/KzReveal";
import { KzIcon } from "@/components/kz/KzIcon";
import { KzPageHero, KzCube, KzOrbitDots } from "@/components/kz/primitives";
import { KzContactForm } from "@/components/kz/KzContactForm";
import { useKzPage } from "@/components/kz/useKzPage";
import { kzLocations } from "@/content/kz";

export function KzContact() {
  useKzPage("contact");
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
        <KzCube size={52} opacity={0.32} />
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
        <KzOrbitDots count={7} radius={24} />
      </div>

      <KzPageHero
        eyebrow="07 / Contact"
        title="Let's build something intelligent"
        lead="Tell us about your project and our team will reply within one business day — whether you need a custom AI agent, a fine-tuned model, or an enterprise platform."
      />

      <section style={{ padding: "0 0 clamp(70px, 10vw, 120px)", background: "var(--bg)" }}>
        <div
          className="kz-wrap"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
            gap: "clamp(24px, 4vw, 48px)",
            alignItems: "start",
          }}
        >
          <KzReveal delay={0}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
              <span className="kz-pill">
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#34c759",
                    boxShadow: "0 0 8px #34c759",
                    animation: "kzPulse 2s infinite",
                    display: "inline-block",
                  }}
                />
                TEAM ONLINE — 24×7
              </span>
              <span className="kz-pill">RESPONSE &lt; 1 BUSINESS DAY</span>
            </div>

            {kzLocations.map(([icon, title, desc]) => (
              <div
                key={title}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: 22,
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  marginBottom: 14,
                }}
              >
                <span className="kz-icon-tile">
                  <KzIcon name={icon} size={20} />
                </span>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 3px", color: "var(--ink)" }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: "0.88rem", color: "var(--mut)", margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
              <a
                href="tel:+917699002237"
                className="kz-pill"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.76rem" }}
              >
                +91 76990 02237
              </a>
              <a
                href="mailto:kenzedtechlab@gmail.com"
                className="kz-pill"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.76rem" }}
              >
                kenzedtechlab@gmail.com
              </a>
              <a
                href="https://kenzed.in"
                target="_blank"
                rel="noopener"
                className="kz-pill"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.76rem" }}
              >
                kenzed.in
              </a>
            </div>
          </KzReveal>

          <KzReveal delay={1}>
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: 20,
                padding: "clamp(22px, 3.5vw, 32px)",
              }}
            >
              <KzContactForm />
            </div>
          </KzReveal>
        </div>
      </section>
    </div>
  );
}
