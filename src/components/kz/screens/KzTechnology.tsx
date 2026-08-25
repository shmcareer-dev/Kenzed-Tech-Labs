"use client";

import { KzStackDial } from "@/components/kz/KzStackDial";
import { KzScrollSpy } from "@/components/kz/KzScrollSpy";
import { KzGridPattern } from "@/components/kz/motion/KzAmbient";
import { KzFadeUp, KzStagger } from "@/components/kz/motion/KzEntrance";
import {
  KzDecorPin,
  KzSpatialIcon3D,
  KzTechAtlas3D,
  kindForLabel,
} from "@/components/kz/KzSpatial3D";
import {
  KzPageHero,
  KzEyebrow,
  KzSectionTitle,
} from "@/components/kz/primitives";
import { kzStack, kzArchFlow } from "@/content/kz";

export function KzTechnology() {
  return (
    <>
      <div id="top" style={{ position: "relative" }}>
        <KzPageHero
          eyebrow="05 / Technology"
          title="A modern stack behind every build"
          lead="A transparent view of the languages, frameworks, and platforms we use to build and run reliable production systems."
          visual="code"
        />
      </div>

      <KzScrollSpy
        sections={[
          { id: "top", label: "Technology" },
          { id: "stack", label: "Technology stack" },
        ]}
      />

      <section
        id="stack"
        style={{
          padding: "0 0 clamp(70px, 10vw, 120px)",
          background: "var(--bg)",
          position: "relative",
        }}
      >
        <KzGridPattern cell={64} opacity={0.4} fade="center" />
        <div className="kz-wrap" style={{ position: "relative" }}>
          <KzFadeUp>
            <div
              style={{
                marginBottom: 26,
                border: "1px solid var(--line)",
                borderRadius: 16,
                padding: "18px clamp(16px, 3vw, 26px)",
                background: "var(--card)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.64rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--dim)",
                  marginRight: 6,
                }}
              >
                Production topology
              </span>
              <KzStagger
                as="span"
                childAs="span"
                step={90}
                distance={14}
                style={{ display: "inline-flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
              >
                {kzArchFlow.map((t, i) => (
                  <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.7rem",
                        letterSpacing: "0.08em",
                        padding: "8px 13px",
                        border: "1px solid var(--line)",
                        borderRadius: 9,
                        background: "var(--card2)",
                        color: "var(--ink)",
                      }}
                    >
                      <KzSpatialIcon3D
                        kind={kindForLabel(t)}
                        size={28}
                        float={false}
                      />
                      {t}
                    </span>
                    {i < kzArchFlow.length - 1 && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--acc)",
                          fontSize: "0.8rem",
                        }}
                      >
                        →
                      </span>
                    )}
                  </span>
                ))}
              </KzStagger>
            </div>
          </KzFadeUp>

          <div style={{ position: "relative" }}>
            <KzDecorPin
              kind="database"
              label="Vector + data layer"
              size={54}
              tone="violet"
              className="kz-tech-pin"
            />
            <KzFadeUp style={{ marginTop: "clamp(46px, 7vw, 78px)" }}>
              <KzEyebrow>The stack, layer by layer</KzEyebrow>
              <KzSectionTitle style={{ maxWidth: "20ch", marginBottom: 16 }}>
                Eleven layers, one spatial system
              </KzSectionTitle>
              <p className="kz-page-lead">
                Scroll and the instrument turns through all eleven layers. The active panel reads
                out the tools in that layer; below it, every named technology gets a textured 3D
                marker in the complete visual index.
              </p>
            </KzFadeUp>
          </div>

          {/* No entrance wrapper: an entry transform would shift the dial's
              measured position and jitter the rotation it derives from it, and a
              second scroll-linked system on top of the dial would fight it.
              aria-hidden because the index below is the same names as text —
              assistive tech should hear them once, not once here and again there. */}
          <div aria-hidden="true" style={{ marginTop: "clamp(26px, 4vw, 40px)" }}>
            <KzStackDial groups={kzStack} />
          </div>

          <KzFadeUp style={{ marginTop: "clamp(46px, 7vw, 72px)" }}>
            <h3
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.64rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--dim)",
                margin: "0 0 14px",
                fontWeight: 500,
              }}
            >
              Full 3D technology index
            </h3>
            <KzTechAtlas3D groups={kzStack} />
          </KzFadeUp>
        </div>
      </section>
    </>
  );
}
