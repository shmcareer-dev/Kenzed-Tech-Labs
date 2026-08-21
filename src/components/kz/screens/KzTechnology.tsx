"use client";

import { useEffect, useState } from "react";

import { KzReveal } from "@/components/kz/KzReveal";
import { KzPageHero, KzCube, KzOrbitDots } from "@/components/kz/primitives";
import { useKzPage } from "@/components/kz/useKzPage";
import { kzStack, kzArchFlow } from "@/content/kz";

export function KzTechnology() {
  useKzPage("technology");
  const [desk, setDesk] = useState(false);

  useEffect(() => {
    const check = () => setDesk(window.innerWidth >= 940);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="kz-page-enter">
      <div style={{ position: "relative" }}>
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
          eyebrow="03 / Technology"
          title="A modern stack behind every build"
          lead="A transparent view of the languages, frameworks, and platforms we use to build and run reliable production systems."
        />
      </div>

      <section style={{ padding: "0 0 clamp(70px, 10vw, 120px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzReveal delay={0}>
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
            </div>
          </KzReveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: 16,
            }}
          >
            {kzStack.map(([category, tags], i) => (
              <KzReveal key={category} delay={i % 3}>
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
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 16,
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.74rem",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "var(--acc)",
                        margin: 0,
                        fontWeight: 600,
                      }}
                    >
                      {category}
                    </h3>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.66rem",
                        color: "var(--dim)",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: "0.82rem",
                          padding: "7px 13px",
                          borderRadius: 9,
                          background: "var(--card2)",
                          border: "1px solid var(--line)",
                          color: "var(--mut)",
                          transition: "color .2s, border-color .2s",
                        }}
                        className="kz-tag"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </KzReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
