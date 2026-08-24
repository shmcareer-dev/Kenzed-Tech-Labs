"use client";

import { KzReveal } from "@/components/kz/KzReveal";
import { KzScrollSpy } from "@/components/kz/KzScrollSpy";
import { KzPageHero, KzSectionTitle } from "@/components/kz/primitives";
import { kzTeam } from "@/content/kz";

export function KzTeam() {
  return (
    <>
      <div id="top">
        <KzPageHero
          eyebrow="Our team"
          title="Every discipline your project needs — under one roof"
          lead="We are a multidisciplinary team of 25 professionals structured to take a product from concept to delivery, maintenance, and beyond — without handoffs to third parties."
        />

        <KzScrollSpy
          sections={[
            { id: "top", label: "Team" },
            { id: "disciplines", label: "Every discipline" },
          ]}
        />
      </div>

      <section id="disciplines" style={{ padding: "0 0 clamp(70px, 10vw, 120px)", background: "var(--bg)" }}>
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
    </>
  );
}
