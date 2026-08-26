"use client";

import Link from "next/link";

import { KzTerminal } from "@/components/kz/KzTerminal";
import { KzHeroStory } from "@/components/kz/KzHeroStory";
import { KzScrollSpy } from "@/components/kz/KzScrollSpy";
import { KzLifecycleRing } from "@/components/kz/KzLifecycleRing";
import { KzParticleField } from "@/components/kz/KzParticleField";
import { KzGraphCards, KzStoryCarousel } from "@/components/kz/KzShowcase";
import {
  KzDecorPin,
  KzSpatialIcon3D,
  kindForLabel,
} from "@/components/kz/KzSpatial3D";
import { KzEyebrow, KzSectionTitle, KzButton } from "@/components/kz/primitives";
import { KzFadeUp, KzStagger } from "@/components/kz/motion/KzEntrance";
import { KzMaskedLines } from "@/components/kz/motion/KzText";
import { KzParallax, KzScrollFillText, KzStickyStack } from "@/components/kz/motion/KzScrollFx";
import { KzSpotlight } from "@/components/kz/motion/KzAmbient";
import { KzArrowNudge, KzMagnetic } from "@/components/kz/motion/KzPointer";
import {
  kzBuildSection,
  kzHomeCta,
  kzLifecycleSection,
  kzOutcomesSection,
  kzServices,
  kzWhy,
} from "@/content/kz";

/* Every section below the hero shares one vertical rhythm so the page reads as
   a sequence of rooms rather than a scroll of stacked widgets. */
const KZ_SECTION_PAD = "clamp(44px, 6vw, 88px) 0";
const KZ_SECTION_END = "0 0 clamp(48px, 6vw, 88px)";

/* The one statement on the page that lights up word by word as it is read. It
   is pulled out of the intro column so the effect owns an element of its own
   rather than being layered on top of an entrance. */
const KZ_STATEMENT =
  "Whether you are an enterprise modernizing operations, an institution reimagining education, or a startup racing to launch — we are the technical partner that takes you from idea to production, and keeps you there.";

/** The closing CTA labels ship with their own arrow; the nudge needs it split off. */
const KZ_TRAILING_ARROW = /\s*→\s*$/;

export function KzHome() {

  return (
    <>
      {/* HERO — the scroll-story stage. The hero copy, stats, floating chips
          (now the annotations) and the capability ribbon (formerly the
          standalone marquee below) all live inside KzHeroStory. The h1 still
          paints at its final position and opacity on first paint. */}
      <KzHeroStory />

      {/* The design's left-edge rail. Labels are the sections' own eyebrows,
          so the rail never introduces copy of its own. Desktop-only chrome —
          the component hides itself below 920px. */}
      <KzScrollSpy
        sections={[
          { id: "top", label: "Home" },
          { id: "agentic", label: "The agentic era" },
          { id: "lifecycle", label: kzLifecycleSection.eyebrow },
          { id: "build", label: kzBuildSection.eyebrow },
          { id: "services", label: "What we build" },
          { id: "why", label: "Why Kenzed" },
          { id: "outcomes", label: kzOutcomesSection.eyebrow },
          { id: "cta", label: kzHomeCta.eyebrow },
        ]}
      />

      <section
        id="agentic"
        style={{ padding: KZ_SECTION_PAD, background: "var(--bg)", position: "relative" }}
      >
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

          <div style={{ position: "relative" }}>
            <p className="kz-page-lead" style={{ marginBottom: 22 }}>
              Software is entering its agentic era. Kenzed Tech Lab helps organizations make that
              leap. We combine deep AI research capability with disciplined software engineering to
              deliver intelligent products that create measurable value: autonomous agents that
              handle real workflows, machine-learning models that turn data into decisions, and
              beautifully engineered applications that people love to use.
            </p>
            <KzDecorPin
              kind="code"
              label="Code layer / live"
              size={52}
              className="kz-home-terminal-pin"
              tone="blue"
            />
            <KzTerminal />
          </div>
        </KzStagger>

        <div className="kz-wrap" style={{ marginTop: "clamp(28px, 4vw, 44px)" }}>
          <KzScrollFillText className="kz-page-lead" dim={0.46}>
            {KZ_STATEMENT}
          </KzScrollFillText>
        </div>
      </section>

      <div className="kz-wrap"><hr className="kz-section-glow" /></div>

      <section id="lifecycle" style={{ background: "var(--bg)" }}>
        <KzLifecycleRing
          eyebrow={kzLifecycleSection.eyebrow}
          title={kzLifecycleSection.title}
          stages={kzLifecycleSection.stages}
        />
      </section>

      <section id="build" style={{ padding: KZ_SECTION_PAD, background: "var(--bg)" }}>
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

      <section id="services" style={{ padding: KZ_SECTION_END, background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzFadeUp>
            <KzEyebrow index="04">What we build</KzEyebrow>
            <KzSectionTitle style={{ maxWidth: "22ch", marginBottom: 32 }}>
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
                  <KzSpatialIcon3D
                    kind={kindForLabel(s.title)}
                    size={54}
                    float={false}
                  />
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

      <div className="kz-wrap"><hr className="kz-section-glow" /></div>

      <section id="why" style={{ padding: KZ_SECTION_END, background: "var(--bg)" }}>
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
                      letterSpacing: "-0.035em",
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

      <div className="kz-wrap"><hr className="kz-section-glow" /></div>

      <section id="outcomes" style={{ padding: KZ_SECTION_END, background: "var(--bg)" }}>
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
              }}
            >
              {kzOutcomesSection.note}
            </p>
          </KzFadeUp>
        </div>
      </section>

      <section
        id="cta"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "var(--bg)",
          borderTop: "1px solid var(--line)",
          padding: "clamp(56px, 8vw, 96px) 0 clamp(112px, 18vw, 210px)",
        }}
      >
        <KzDecorPin
          kind="robot"
          label="Agent channel / ready"
          size={58}
          className="kz-home-cta-pin"
          tone="violet"
        />
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
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 35%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, #000 35%)",
          }}
        >
          <KzParallax depth={0.3}>
            <KzParticleField height={420} density={1.1} />
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
              fontSize: "clamp(2.1rem, 6.4vw, 4.1rem)",
              lineHeight: 1.03,
              letterSpacing: "-0.05em",
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
