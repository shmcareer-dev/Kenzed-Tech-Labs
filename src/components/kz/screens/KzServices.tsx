"use client";

import { useState } from "react";

import { KzIcon } from "@/components/kz/KzIcon";
import { KzGridPattern } from "@/components/kz/motion/KzAmbient";
import { KZ_EASE, KzFadeUp } from "@/components/kz/motion/KzEntrance";
import { KzTilt3D } from "@/components/kz/motion/KzPointer";
import { KzPageHero, KzTorus, KzSphere } from "@/components/kz/primitives";
import { useKzPage } from "@/components/kz/useKzPage";
import { kzServices } from "@/content/kz";

/* The house curve, spelled for a CSS transition. Derived from the kit constant
   rather than retyped, so there is still exactly one easing language. */
const KZ_EASE_CSS = `cubic-bezier(${KZ_EASE.join(", ")})`;

export function KzServices() {
  useKzPage("services");
  const [expanded, setExpanded] = useState<number | null>(null);

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
        <KzTorus size={64} opacity={0.35} />
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "min(4%, 50px)",
          top: "clamp(200px, 32vh, 320px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <KzSphere size={48} opacity={0.3} />
      </div>

      <KzPageHero
        eyebrow="02 / Services"
        title="From autonomous agents to enterprise platforms"
        lead="Every service ships with the technical depth, security, and observability real systems demand. Tap a service to see exactly what we deliver — and the stack behind it."
      />

      <section
        style={{
          padding: "0 0 clamp(70px, 10vw, 120px)",
          background: "var(--bg)",
          position: "relative",
        }}
      >
        <KzGridPattern cell={64} opacity={0.4} fade="center" />
        <div className="kz-wrap" style={{ position: "relative" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: 16,
            }}
          >
            {kzServices.map((s, i) => {
              const open = expanded === i;
              return (
                <KzFadeUp
                  key={s.title}
                  delay={(i % 4) * 90}
                  style={{ gridColumn: open ? "1 / -1" : "auto" }}
                >
                  {/* Tilt is switched off while the card is expanded: a full-width
                      panel leaning under the pointer reads as a wobble, not depth. */}
                  <KzTilt3D max={open ? 0 : 5}>
                    <div
                      onClick={() => setExpanded(open ? null : i)}
                      style={{
                        cursor: "pointer",
                        background: "var(--card)",
                        border: `1px solid ${open ? "var(--acc)" : "var(--line)"}`,
                        borderRadius: 18,
                        padding: "clamp(22px, 3vw, 30px)",
                      }}
                      className="kz-card"
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 16,
                        }}
                      >
                        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                          <span className="kz-icon-tile">
                            <KzIcon name={s.icon} size={22} />
                          </span>
                          <div>
                            <div
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.66rem",
                                color: "var(--dim)",
                                marginBottom: 4,
                              }}
                            >
                              {String(i + 1).padStart(2, "0")}
                            </div>
                            <h2
                              style={{
                                fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)",
                                fontWeight: 700,
                                margin: 0,
                                lineHeight: 1.25,
                                color: "var(--ink)",
                              }}
                            >
                              {s.title}
                            </h2>
                          </div>
                        </div>
                        <span
                          style={{
                            width: 34,
                            height: 34,
                            flex: "none",
                            borderRadius: "50%",
                            border: "1px solid var(--line2)",
                            display: "grid",
                            placeItems: "center",
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.95rem",
                            color: open ? "var(--acc)" : "var(--mut)",
                            transform: `rotate(${open ? "45deg" : "0deg"})`,
                            transition: `transform .35s ${KZ_EASE_CSS}, color .35s ${KZ_EASE_CSS}`,
                          }}
                        >
                          +
                        </span>
                      </div>

                      <p style={{ fontSize: "0.92rem", color: "var(--mut)", margin: "14px 0 0" }}>
                        {s.short}
                      </p>

                      {open && (
                        <KzFadeUp distance={12} duration={460} amount={0}>
                          <div
                            style={{
                              marginTop: 22,
                              borderTop: "1px solid var(--line)",
                              paddingTop: 22,
                              cursor: "default",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <p
                              style={{
                                fontSize: "0.96rem",
                                color: "var(--mut)",
                                margin: "0 0 24px",
                                maxWidth: "78ch",
                              }}
                            >
                              {s.intro}
                            </p>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(min(100%, 290px), 1fr))",
                                gap: 26,
                              }}
                            >
                              <div>
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
                                  What we deliver
                                </div>
                                {s.deliverables.map((d) => (
                                  <div
                                    key={d}
                                    style={{
                                      display: "flex",
                                      gap: 12,
                                      padding: "8px 0",
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: 14,
                                        height: 1,
                                        background: "var(--acc)",
                                        flex: "none",
                                        marginTop: 11,
                                        opacity: 0.8,
                                      }}
                                    />
                                    <span
                                      style={{
                                        fontSize: "0.9rem",
                                        color: "var(--ink)",
                                        opacity: 0.88,
                                      }}
                                    >
                                      {d}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div>
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
                                  Technical stack
                                </div>
                                {s.stack.map(([k, v]) => (
                                  <div
                                    key={k}
                                    style={{ padding: "10px 0", borderTop: "1px solid var(--line)" }}
                                  >
                                    <div
                                      style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: "0.66rem",
                                        letterSpacing: "0.12em",
                                        textTransform: "uppercase",
                                        color: "var(--acc3)",
                                        marginBottom: 3,
                                      }}
                                    >
                                      {k}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "0.86rem",
                                        color: "var(--mut)",
                                        lineHeight: 1.55,
                                      }}
                                    >
                                      {v}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div
                              style={{
                                marginTop: 22,
                                borderTop: "1px solid var(--line)",
                                paddingTop: 14,
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.72rem",
                                color: "var(--dim)",
                                display: "flex",
                                alignItems: "center",
                                gap: 9,
                                flexWrap: "wrap",
                              }}
                            >
                              <span style={{ color: "var(--acc3)" }}>$</span>
                              <span>kenzed {s.cmd}</span>
                              <span style={{ color: "var(--ok)" }}>✓</span>
                            </div>
                          </div>
                        </KzFadeUp>
                      )}
                    </div>
                  </KzTilt3D>
                </KzFadeUp>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
