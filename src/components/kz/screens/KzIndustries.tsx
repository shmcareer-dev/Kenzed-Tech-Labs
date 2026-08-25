"use client";

import { KzReveal } from "@/components/kz/KzReveal";
import { KzScrollSpy } from "@/components/kz/KzScrollSpy";
import { KzSpatialIcon3D, kindForLabel } from "@/components/kz/KzSpatial3D";
import { KzPageHero, KzSectionTitle } from "@/components/kz/primitives";
import { kzIndustries } from "@/content/kz";

export function KzIndustries() {
  return (
    <>
      <div id="top">
        <KzPageHero
          eyebrow="Industries we serve"
          title="Solutions that adapt to your sector"
          lead="Our work adapts to the realities of each sector. These are the industries where our AI and software solutions create the most impact."
        />

        <KzScrollSpy
          sections={[
            { id: "top", label: "Industries" },
            { id: "industries", label: "Industries we serve" },
          ]}
        />
      </div>

      <section id="industries" style={{ padding: "0 0 clamp(70px, 10vw, 120px)", background: "var(--bg)" }}>
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
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <KzSpatialIcon3D kind={kindForLabel(t)} size={52} float={false} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--acc)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
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
    </>
  );
}
