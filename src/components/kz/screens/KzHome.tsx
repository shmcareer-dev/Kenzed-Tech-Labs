"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { KzTerminal } from "@/components/kz/KzTerminal";
import { KzMarquee } from "@/components/kz/KzMarquee";
import { KzIcon } from "@/components/kz/KzIcon";
import { KzLifecycleRing } from "@/components/kz/KzLifecycleRing";
import { KzParticleField } from "@/components/kz/KzParticleField";
import { KzGraphCards, KzStoryCarousel } from "@/components/kz/KzShowcase";
import { KzEyebrow, KzSectionTitle, KzButton, KzSphere, KzTorus } from "@/components/kz/primitives";
import { KzFadeUp, KzStagger } from "@/components/kz/motion/KzEntrance";
import { KzMaskedLines } from "@/components/kz/motion/KzText";
import { KzParallax, KzScrollFillText, KzStickyStack } from "@/components/kz/motion/KzScrollFx";
import { KzAurora, KzSpotlight } from "@/components/kz/motion/KzAmbient";
import { KzArrowNudge, KzMagnetic } from "@/components/kz/motion/KzPointer";
import { KzCountUp } from "@/components/kz/motion/KzFeedback";
import { useKzPage } from "@/components/kz/useKzPage";
import {
  kzBuildSection,
  kzHomeCta,
  kzLifecycleSection,
  kzOutcomesSection,
  kzServices,
  kzStats,
  kzWhy,
} from "@/content/kz";

/* Every section below the hero shares one vertical rhythm so the page reads as
   a sequence of rooms rather than a scroll of stacked widgets. */
const KZ_SECTION_PAD = "clamp(56px, 8vw, 128px) 0";

/* The one statement on the page that lights up word by word as it is read. It
   is pulled out of the intro column so the effect owns an element of its own
   rather than being layered on top of an entrance. */
const KZ_STATEMENT =
  "Whether you are an enterprise modernizing operations, an institution reimagining education, or a startup racing to launch — we are the technical partner that takes you from idea to production, and keeps you there.";

/** The closing CTA labels ship with their own arrow; the nudge needs it split off. */
const KZ_TRAILING_ARROW = /\s*→\s*$/;

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
    <>
      {/* HERO — nothing here animates on first paint. The h1 is the LCP element
          and it is painted at its final position, at full opacity, with no
          observer attached to it. The only motion in this viewport is the
          aurora, which starts paused and is composited behind the copy. */}
      <section
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          /* The bottom padding is the scroll cue's clearance, not decoration.
             The cue is absolutely positioned 22px off the section's bottom edge
             and stands 58px tall; on compact mobile viewports clamp keeps it clear. */
          padding: "clamp(88px, 12vh, 120px) 0 clamp(44px, 6vh, 80px)",
          position: "relative",
        }}
      >
        <KzAurora count={2} blur={90} opacity={0.26} speed={34} size="68%" style={{ zIndex: 0 }} />

        <div
          className="kz-wrap"
          style={{ width: "100%", boxSizing: "border-box", position: "relative", zIndex: 2 }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              /* 700, not 400. Archivo Black shipped one cut so the weight here
                 was inert; Space Grotesk would resolve 400 to its 500 and the
                 hero would read as body copy set large. */
              fontWeight: 700,
              fontSize: "clamp(2.1rem, 7.2vw, 5.4rem)",
              lineHeight: 1.02,
              /* Uppercase. -0.015em was fitted to Archivo Black, which is 26%
                 wider per cap; the same value on Space Grotesk closes the
                 counters and the LED bloom then fills them in. */
              letterSpacing: "-0.012em",
              textTransform: "uppercase",
              margin: "0 0 24px",
              maxWidth: "17ch",
              position: "relative",
              wordBreak: "break-word",
            }}
          >
            Engineering intelligent software for an{" "}
            <span className="kz-grad-text">agentic world</span>
            {wide && (
              <>
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
              </>
            )}
          </h1>

          <p
            style={{
              fontSize: "clamp(0.96rem, 1.5vw, 1.22rem)",
              color: "var(--mut)",
              maxWidth: "56ch",
              margin: "0 0 32px",
              lineHeight: 1.6,
            }}
          >
            Kenzed Tech Lab designs, builds, and deploys custom AI agents, machine-learning
            systems, voice AI, and enterprise software — production-grade, secure, and running on
            infrastructure we own and operate 24×7.
          </p>

          <div className="kz-hero-actions">
            <KzButton href="/contact">Start your AI project →</KzButton>
            <KzButton href="/services" variant="ghost">
              Explore our services
            </KzButton>
          </div>

          {/* The counters render their finished value in the server HTML and
              only run if the visitor has to scroll to reach them, so a stat
              that is already on screen costs nothing at first paint. */}
          <div className="kz-hero-stats">
            {kzStats.map((s) => (
              <div key={s.label} style={{ borderLeft: "2px solid var(--line)", paddingLeft: 16 }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "clamp(1.45rem, 3vw, 2.25rem)",
                    lineHeight: 1.06,
                    letterSpacing: "-0.015em",
                    color: "var(--ink)",
                  }}
                >
                  <KzCountUp
                    to={s.target}
                    decimals={Number.isInteger(s.target) ? 0 : 2}
                    suffix={s.suffix}
                  />
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.64rem",
                    fontWeight: 500,
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                    color: "var(--mut)",
                    maxWidth: "17ch",
                    marginTop: 4,
                    lineHeight: 1.45,
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
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.24em",
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

      <section style={{ padding: KZ_SECTION_PAD, background: "var(--bg)" }}>
        {/* Two columns, staggered: the heading lands, then the argument. */}
        <KzStagger
          className="kz-wrap"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
            gap: "clamp(28px, 5vw, 64px)",
            alignItems: "start",
          }}
        >
          <div>
            <KzEyebrow index="01">The agentic era</KzEyebrow>
            <KzSectionTitle style={{ fontSize: "clamp(1.7rem, 3.8vw, 2.7rem)" }}>
              Software that doesn&apos;t just respond — it reasons, plans, and acts
            </KzSectionTitle>
          </div>

          <div>
            <p className="kz-page-lead" style={{ marginBottom: 22 }}>
              Software is entering its agentic era. Kenzed Tech Lab helps organizations make that
              leap. We combine deep AI research capability with disciplined software engineering to
              deliver intelligent products that create measurable value: autonomous agents that
              handle real workflows, machine-learning models that turn data into decisions, and
              beautifully engineered applications that people love to use.
            </p>
            <KzTerminal />
          </div>
        </KzStagger>

        <div className="kz-wrap" style={{ marginTop: "clamp(34px, 6vw, 60px)" }}>
          <KzScrollFillText className="kz-page-lead">{KZ_STATEMENT}</KzScrollFillText>
        </div>
      </section>

      <KzLifecycleRing
        eyebrow={kzLifecycleSection.eyebrow}
        title={kzLifecycleSection.title}
        stages={kzLifecycleSection.stages}
      />

      <section style={{ padding: KZ_SECTION_PAD, background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzFadeUp>
            <KzEyebrow>{kzBuildSection.eyebrow}</KzEyebrow>
          </KzFadeUp>
          {/* The light tracks the pointer across the whole diagram grid. It is
              decoration, never information: the layer is not rendered at all on
              a coarse pointer or under reduced motion. */}
          <KzSpotlight size={340}>
            <KzGraphCards
              title={kzBuildSection.title}
              lead={kzBuildSection.lead}
              cards={kzBuildSection.cards}
            />
          </KzSpotlight>
        </div>
      </section>

      <section style={{ padding: "0 0 clamp(72px, 10vw, 128px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzFadeUp>
            <KzEyebrow index="04">What we build</KzEyebrow>
            <KzSectionTitle style={{ maxWidth: "22ch", marginBottom: 44 }}>
              Services engineered for production, not prototypes
            </KzSectionTitle>
          </KzFadeUp>

          <KzStagger
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 265px), 1fr))",
              gap: 16,
            }}
          >
            {kzServices.map((s, i) => (
              <Link
                key={s.title}
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
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                    color: "var(--acc)",
                  }}
                >
                  Explore →
                </span>
              </Link>
            ))}
          </KzStagger>
        </div>
      </section>

      <section style={{ padding: "0 0 clamp(72px, 10vw, 128px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzFadeUp>
            <KzEyebrow index="05">Why Kenzed</KzEyebrow>
            <KzSectionTitle style={{ marginBottom: 34 }}>
              Four reasons teams choose us
            </KzSectionTitle>
          </KzFadeUp>

          {/* The page's one pinned-feeling section, and it is the vertical kind:
              the cards pile up under the header and the reader keeps scrolling
              at native speed the whole way through. Nothing is scroll-jacked, so
              a phone is never trapped here. The cards carry an opaque ground
              because a translucent one would show the buried card through it. */}
          <KzStickyStack top={96} offset={16} gap={18}>
            {kzWhy.map(([t, d], i) => (
              <div
                key={t}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                  gap: "8px 28px",
                  padding: "clamp(20px, 4vw, 28px)",
                  background: "var(--bg2)",
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  alignItems: "baseline",
                }}
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
                      fontSize: "clamp(1.05rem, 2vw, 1.35rem)",
                      letterSpacing: "0.01em",
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
            ))}
          </KzStickyStack>
        </div>
      </section>

      <section style={{ padding: "0 0 clamp(72px, 10vw, 128px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzFadeUp>
            <KzEyebrow>{kzOutcomesSection.eyebrow}</KzEyebrow>
          </KzFadeUp>
          <KzStoryCarousel
            title={kzOutcomesSection.title}
            action={kzOutcomesSection.action}
            stories={kzOutcomesSection.stories}
          />
          <KzFadeUp>
            <p
              style={{
                margin: "18px 0 0",
                maxWidth: "62ch",
                color: "var(--dim)",
                fontSize: "0.84rem",
                lineHeight: 1.7,
                textAlign: "justify",
              }}
            >
              {kzOutcomesSection.note}
            </p>
          </KzFadeUp>
        </div>
      </section>

      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "var(--bg)",
          borderTop: "1px solid var(--line)",
          padding: "clamp(76px, 11vw, 130px) 0 clamp(170px, 28vw, 300px)",
        }}
      >
        {/* The field is a backdrop, so it is masked into the page rather than
            given its own edge: the copy stays fully legible above the fade. It
            is also the page's one parallax layer — decorative, clipped by the
            section, and halved on narrow viewports by the primitive itself. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            opacity: 0.85,
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 42%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, #000 42%)",
          }}
        >
          <KzParallax depth={0.3}>
            <KzParticleField height={520} density={0.9} />
          </KzParallax>
        </div>

        <div className="kz-wrap" style={{ position: "relative", zIndex: 1 }}>
          <KzFadeUp>
            <KzEyebrow>{kzHomeCta.eyebrow}</KzEyebrow>
          </KzFadeUp>

          {/* The page's single masked-line reveal, saved for the closing line. */}
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: "clamp(2.1rem, 6.4vw, 4.1rem)",
              lineHeight: 1.03,
              letterSpacing: "-0.012em",
              margin: "0 0 22px",
              maxWidth: "16ch",
              color: "var(--ink)",
            }}
          >
            <KzMaskedLines as="span" text={kzHomeCta.title} />
          </h2>

          <KzFadeUp delay={90}>
            <p className="kz-page-lead" style={{ marginBottom: 34 }}>
              {kzHomeCta.lead}
            </p>
            <div className="kz-hero-actions">
              <KzMagnetic strength={0.28} max={12}>
                <KzButton href={kzHomeCta.primary.href}>
                  {kzHomeCta.primary.label.replace(KZ_TRAILING_ARROW, "")}{" "}
                  <KzArrowNudge>→</KzArrowNudge>
                </KzButton>
              </KzMagnetic>
              <KzButton href={kzHomeCta.secondary.href} variant="ghost">
                {kzHomeCta.secondary.label}
              </KzButton>
            </div>
          </KzFadeUp>
        </div>
      </section>
    </>
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
