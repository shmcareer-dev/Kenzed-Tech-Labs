"use client";

import { KzIcon } from "@/components/kz/KzIcon";
import { KzGridPattern } from "@/components/kz/motion/KzAmbient";
import { KzFadeUp, KzStagger } from "@/components/kz/motion/KzEntrance";
import { KzHoverLift } from "@/components/kz/motion/KzPointer";
import { KzPageHero, KzCube, KzOrbitDots } from "@/components/kz/primitives";
import { KzContactForm } from "@/components/kz/KzContactForm";
import { useKzPage } from "@/components/kz/useKzPage";
import { kzLocations } from "@/content/kz";

const contactLinks: [string, string, string?][] = [
  ["+91 76990 02237", "tel:+917699002237"],
  ["kenzedtechlab@gmail.com", "mailto:kenzedtechlab@gmail.com"],
  ["kenzed.in", "https://kenzed.in", "_blank"],
];

export function KzContact() {
  useKzPage("contact");
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
        eyebrow="09 / Contact"
        title="Let's build something intelligent"
        lead="Tell us about your project and our team will reply within one business day — whether you need a custom AI agent, a fine-tuned model, or an enterprise platform."
      />

      <section
        style={{
          padding: "0 0 clamp(70px, 10vw, 120px)",
          background: "var(--bg)",
          position: "relative",
        }}
      >
        <KzGridPattern cell={64} opacity={0.4} fade="center" />
        <div
          className="kz-wrap"
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
            gap: "clamp(24px, 4vw, 48px)",
            alignItems: "start",
          }}
        >
          <KzFadeUp>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
              <span className="kz-pill">
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--ok)",
                    boxShadow: "0 0 8px var(--ok)",
                    animation: "kzPulse 2s infinite",
                    display: "inline-block",
                  }}
                />
                TEAM ONLINE — 24×7
              </span>
              <span className="kz-pill">RESPONSE &lt; 1 BUSINESS DAY</span>
            </div>

            <KzStagger step={90} style={{ display: "grid", gap: 14 }}>
              {kzLocations.map(([icon, title, desc]) => (
                <KzHoverLift key={title} lift={5}>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      padding: 22,
                      background: "var(--card)",
                      border: "1px solid var(--line)",
                      borderRadius: 16,
                    }}
                  >
                    <span className="kz-icon-tile">
                      <KzIcon name={icon} size={20} />
                    </span>
                    <div>
                      <h3
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          margin: "0 0 3px",
                          color: "var(--ink)",
                        }}
                      >
                        {title}
                      </h3>
                      <p style={{ fontSize: "0.88rem", color: "var(--mut)", margin: 0 }}>{desc}</p>
                    </div>
                  </div>
                </KzHoverLift>
              ))}
            </KzStagger>

            <KzStagger
              step={90}
              distance={14}
              childAs="span"
              style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}
            >
              {contactLinks.map(([label, href, target]) => (
                <a
                  key={href}
                  href={href}
                  target={target}
                  rel={target ? "noopener" : undefined}
                  className="kz-pill"
                  style={{
                    minHeight: 44,
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.76rem",
                  }}
                >
                  {label}
                </a>
              ))}
            </KzStagger>
          </KzFadeUp>

          <KzFadeUp delay={90}>
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
          </KzFadeUp>
        </div>
      </section>
    </div>
  );
}
