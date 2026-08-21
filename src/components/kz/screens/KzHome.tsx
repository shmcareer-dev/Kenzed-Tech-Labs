"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { KzReveal } from "@/components/kz/KzReveal";
import { KzCount } from "@/components/kz/KzCount";
import { KzTerminal } from "@/components/kz/KzTerminal";
import { KzMarquee } from "@/components/kz/KzMarquee";
import { KzIcon } from "@/components/kz/KzIcon";
import { KzEyebrow, KzSectionTitle, KzButton, KzMascot, KzCube, KzSphere, KzTorus, KzOrbitDots } from "@/components/kz/primitives";
import { useKzPage } from "@/components/kz/useKzPage";
import { kzServices, kzWhy, kzStats } from "@/content/kz";

export function KzHome() {
  useKzPage("home");
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const check = () => setWide(window.innerWidth >= 1200);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="kz-page-enter">
      <section
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "110px 0 40px",
          position: "relative",
        }}
      >
        <div className="kz-wrap" style={{ width: "100%", boxSizing: "border-box" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "clamp(2.45rem, 7.4vw, 5.4rem)",
              lineHeight: 0.99,
              letterSpacing: "-0.015em",
              textTransform: "uppercase",
              margin: "0 0 26px",
              maxWidth: "17ch",
              position: "relative",
            }}
          >
            <KzMascot />
            Engineering intelligent software for an{" "}
            <span className="kz-grad-text">agentic world</span>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                right: "min(8%, 120px)",
                top: "20%",
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              <KzTorus size={72} opacity={0.45} />
            </span>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "min(4%, 60px)",
                bottom: "18%",
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              <KzSphere size={56} opacity={0.4} />
            </span>
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 1.6vw, 1.22rem)",
              color: "var(--mut)",
              maxWidth: "56ch",
              margin: "0 0 36px",
            }}
          >
            Kenzed Tech Lab designs, builds, and deploys custom AI agents, machine-learning
            systems, voice AI, and enterprise software — production-grade, secure, and running on
            infrastructure we own and operate 24×7.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: "clamp(44px, 6vh, 64px)" }}>
            <KzButton href="/contact">Start your AI project →</KzButton>
            <KzButton href="/services" variant="ghost">
              Explore our services
            </KzButton>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(20px, 4vw, 44px)" }}>
            {kzStats.map((s) => (
              <div key={s.label} style={{ borderLeft: "2px solid var(--line)", paddingLeft: 18 }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.55rem, 3vw, 2.25rem)",
                    lineHeight: 1.1,
                    color: "var(--ink)",
                  }}
                >
                  <KzCount target={s.target} suffix={s.suffix} />
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.64rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--mut)",
                    maxWidth: "17ch",
                    marginTop: 4,
                    lineHeight: 1.5,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {wide && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
            <FloatingChip right="5%" top="24%" delay="0s" color="var(--acc3)" symbol="»">
              agent.plan() → tool_call → act()
            </FloatingChip>
            <FloatingChip right="23%" top="50%" delay="0.8s" color="var(--acc)" symbol="◇">
              LoRA fine-tune · llama-3 · r=16
            </FloatingChip>
            <FloatingChip right="4%" top="66%" delay="1.6s" color="var(--acc2)" symbol="●">
              inference 42 ms · on-prem GPU · 99.98% uptime
            </FloatingChip>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: 22,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.3em",
              color: "var(--dim)",
            }}
          >
            SCROLL
          </span>
          <span
            style={{ width: 1, height: 34, background: "linear-gradient(var(--acc), transparent)" }}
          />
        </div>
      </section>

      <KzMarquee />

      <section style={{ padding: "clamp(70px, 10vw, 120px) 0", background: "var(--bg)" }}>
        <div
          className="kz-wrap"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
            gap: "clamp(28px, 5vw, 64px)",
            alignItems: "start",
          }}
        >
          <KzReveal delay={0}>
            <KzEyebrow index="01">The agentic era</KzEyebrow>
            <KzSectionTitle style={{ fontSize: "clamp(1.7rem, 3.8vw, 2.7rem)" }}>
              Software that doesn&apos;t just respond — it reasons, plans, and acts
            </KzSectionTitle>
          </KzReveal>

          <KzReveal delay={1}>
            <p style={{ fontSize: "1.08rem", color: "var(--mut)", margin: "0 0 18px" }}>
              Software is entering its agentic era. Kenzed Tech Lab helps organizations make that
              leap. We combine deep AI research capability with disciplined software engineering to
              deliver intelligent products that create measurable value: autonomous agents that
              handle real workflows, machine-learning models that turn data into decisions, and
              beautifully engineered applications that people love to use.
            </p>
            <p style={{ fontSize: "1.08rem", color: "var(--mut)", margin: 0 }}>
              Whether you are an enterprise modernizing operations, an institution reimagining
              education, or a startup racing to launch — we are the technical partner that takes you
              from idea to production, and keeps you there.
            </p>
            <KzReveal delay={2}>
              <KzTerminal />
            </KzReveal>
          </KzReveal>
        </div>
      </section>

      <section style={{ padding: "0 0 clamp(70px, 10vw, 120px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzReveal delay={0}>
            <KzEyebrow index="02">What we build</KzEyebrow>
            <KzSectionTitle style={{ maxWidth: "22ch", marginBottom: 44 }}>
              Services engineered for production, not prototypes
            </KzSectionTitle>
          </KzReveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 265px), 1fr))",
              gap: 16,
            }}
          >
            {kzServices.map((s, i) => (
              <KzReveal key={s.title} delay={(i % 4) + 1}>
                <Link
                  href="/services"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    padding: 24,
                    background: "var(--card)",
                    border: "1px solid var(--line)",
                    borderRadius: 16,
                    transition: "transform .3s, border-color .3s, box-shadow .3s",
                  }}
                  className="kz-card"
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="kz-icon-tile">
                      <KzIcon name={s.icon} size={22} />
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.72rem",
                        color: "var(--dim)",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: "1.04rem",
                      fontWeight: 700,
                      margin: 0,
                      lineHeight: 1.3,
                      color: "var(--ink)",
                    }}
                  >
                    {s.title.replace(" & Agentic AI", "").replace(" Engineering", "")}
                  </h3>
                  <p style={{ fontSize: "0.88rem", color: "var(--mut)", margin: 0, flex: 1 }}>
                    {s.short.split(" — ")[0].split(". ")[0]}
                  </p>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.66rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--acc)",
                    }}
                  >
                    Explore →
                  </span>
                </Link>
              </KzReveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "0 0 clamp(70px, 10vw, 120px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzReveal delay={0}>
            <KzEyebrow index="03">Why Kenzed</KzEyebrow>
            <KzSectionTitle style={{ marginBottom: 34 }}>
              Four reasons teams choose us
            </KzSectionTitle>
          </KzReveal>

          <div>
            {kzWhy.map(([t, d], i) => (
              <KzReveal key={t} delay={i}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                    gap: "8px 28px",
                    padding: "26px 12px",
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
                        fontWeight: 400,
                        fontSize: "clamp(1.05rem, 2vw, 1.35rem)",
                        textTransform: "uppercase",
                        margin: 0,
                        lineHeight: 1.2,
                        color: "var(--ink)",
                      }}
                    >
                      {t}
                    </h3>
                  </div>
                  <p style={{ margin: 0, color: "var(--mut)", fontSize: "0.96rem" }}>{d}</p>
                </div>
              </KzReveal>
            ))}
            <div style={{ borderTop: "1px solid var(--line)" }} />
          </div>
        </div>
      </section>

      <section style={{ padding: "0 0 clamp(70px, 10vw, 120px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzReveal delay={0}>
            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: 24,
                padding: "clamp(44px, 7vw, 72px) clamp(24px, 5vw, 56px)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(135deg, var(--card) 0%, var(--card2) 100%)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 420,
                  height: 420,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(28,80,224,.14), transparent 65%)",
                  top: -180,
                  right: -100,
                  pointerEvents: "none",
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "6%",
                  top: "24%",
                  pointerEvents: "none",
                }}
              >
                <KzCube size={54} opacity={0.7} />
              </div>
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  right: "8%",
                  bottom: "16%",
                  pointerEvents: "none",
                }}
              >
                <KzOrbitDots count={8} radius={28} />
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  textTransform: "uppercase",
                  fontSize: "clamp(1.8rem, 4.4vw, 3rem)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.01em",
                  margin: "0 auto 18px",
                  maxWidth: "20ch",
                }}
              >
                Ready to build something intelligent?
              </h2>
              <p
                style={{
                  color: "var(--mut)",
                  maxWidth: "52ch",
                  margin: "0 auto 30px",
                  fontSize: "1.04rem",
                }}
              >
                Let&apos;s turn your idea into a production-grade AI product — engineered, secured,
                and supported by a team that owns its craft end to end.
              </p>
              <KzButton href="/contact">Book a free consultation →</KzButton>
            </div>
          </KzReveal>
        </div>
      </section>
    </div>
  );
}

function FloatingChip({
  right,
  top,
  delay,
  color,
  symbol,
  children,
}: {
  right: string;
  top: string;
  delay: string;
  color: string;
  symbol: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        right,
        top,
        animation: `kzFloat 6s ease-in-out ${delay} infinite alternate`,
        fontFamily: "var(--font-mono)",
        fontSize: "0.68rem",
        letterSpacing: "0.04em",
        color: "var(--mut)",
        padding: "10px 14px",
        border: "1px solid var(--line2)",
        borderRadius: 10,
        background: "color-mix(in srgb, var(--bg) 74%, transparent)",
        backdropFilter: "blur(8px)",
      }}
    >
      <span style={{ color }}>{symbol}</span> {children}
    </div>
  );
}


