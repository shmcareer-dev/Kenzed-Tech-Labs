"use client";

import { useEffect, useState } from "react";

import { KzStackDial } from "@/components/kz/KzStackDial";
import { KzScrollSpy } from "@/components/kz/KzScrollSpy";
import { KzGridPattern } from "@/components/kz/motion/KzAmbient";
import { KzFadeUp, KzStagger } from "@/components/kz/motion/KzEntrance";
import {
  KzPageHero,
  KzCube,
  KzOrbitDots,
  KzEyebrow,
  KzSectionTitle,
} from "@/components/kz/primitives";
import { kzStack, kzArchFlow } from "@/content/kz";

export function KzTechnology() {
  const [desk, setDesk] = useState(false);

  useEffect(() => {
    const check = () => setDesk(window.innerWidth >= 940);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      <div id="top" style={{ position: "relative" }}>
        {desk && (
          <>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                right: "clamp(40px, 8vw, 120px)",
                top: "44%",
                zIndex: 1,
              }}
            >
              <KzCube size={64} opacity={0.8} />
            </div>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                right: "clamp(120px, 14vw, 220px)",
                top: "22%",
                zIndex: 1,
              }}
            >
              <KzOrbitDots count={6} radius={22} />
            </div>
          </>
        )}
        <KzPageHero
          eyebrow="05 / Technology"
          title="A modern stack behind every build"
          lead="A transparent view of the languages, frameworks, and platforms we use to build and run reliable production systems."
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

          <KzFadeUp style={{ marginTop: "clamp(46px, 7vw, 78px)" }}>
            <KzEyebrow>The stack, layer by layer</KzEyebrow>
            <KzSectionTitle style={{ maxWidth: "20ch", marginBottom: 16 }}>
              Eleven layers on one instrument
            </KzSectionTitle>
            <p className="kz-page-lead">
              Every layer of the stack sits on a single dial. Scroll and the ring turns under the
              fixed marker, stepping through all eleven while the panel reads out the tools in the
              layer it lands on — and the full written index follows below.
            </p>
          </KzFadeUp>

          {/* No entrance wrapper: an entry transform would shift the dial's
              measured position and jitter the rotation it derives from it, and a
              second scroll-linked system on top of the dial would fight it.
              aria-hidden because the index below is the same names as text —
              assistive tech should hear them once, not once here and again there. */}
          <div aria-hidden="true" style={{ marginTop: "clamp(26px, 4vw, 40px)" }}>
            <KzStackDial groups={kzStack} />
          </div>

          <KzFadeUp style={{ marginTop: "clamp(40px, 6vw, 64px)" }}>
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
              Full stack index
            </h3>
            <dl style={{ margin: 0, borderTop: "1px solid var(--line)" }}>
              {kzStack.map(([category, tags]) => (
                <div
                  key={category}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "baseline",
                    gap: "4px 22px",
                    padding: "14px 2px",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <dt
                    style={{
                      flex: "0 0 auto",
                      minWidth: 128,
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--acc)",
                      fontWeight: 600,
                    }}
                  >
                    {category}
                  </dt>
                  <dd
                    style={{
                      flex: "1 1 260px",
                      margin: 0,
                      fontSize: "0.9rem",
                      lineHeight: 1.65,
                      color: "var(--mut)",
                    }}
                  >
                    {tags.join(" · ")}
                  </dd>
                </div>
              ))}
            </dl>
          </KzFadeUp>
        </div>
      </section>
    </>
  );
}
