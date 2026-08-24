"use client";

import { useState } from "react";

import { KzWebFlow, type KzFlowNode } from "@/components/kz/KzDiagrams";
import { KzIcon } from "@/components/kz/KzIcon";
import { KzGridPattern } from "@/components/kz/motion/KzAmbient";
import { KzFadeUp } from "@/components/kz/motion/KzEntrance";
import { KzSlidingTabs, type KzTabItem } from "@/components/kz/motion/KzNav";
import { KZ_HOVER_GROUP, KzArrowNudge, KzTilt3D } from "@/components/kz/motion/KzPointer";
import { KzButton, KzPageHero, KzSectionTitle, KzSphere, KzTorus } from "@/components/kz/primitives";
import { useKzPage } from "@/components/kz/useKzPage";
import { productCategories, products, type Product, type ProductTier } from "@/content/products";

const ALL_PRODUCTS = "All products";

const PANEL_ID = "kz-product-list";

const filterTabs: KzTabItem[] = [ALL_PRODUCTS, ...productCategories].map((name) => ({
  id: name,
  label: name,
  controls: PANEL_ID,
}));

const engagement: KzFlowNode[] = [
  { label: "Requirement call", kind: "input" },
  { label: "Scoped quote", kind: "process" },
  { label: "Pilot on your data", kind: "process" },
  { label: "Production rollout", kind: "output" },
];

/** Carries the product and tier into the contact flow — pricing is quoted, never charged. */
function knowPriceHref(slug: string, tier: string) {
  return `/contact?${new URLSearchParams({ product: slug, tier }).toString()}`;
}

export function KzProductStudio() {
  /* The Kz3D page union has no product-studio scene, so this borrows the services one. */
  useKzPage("services");
  const [category, setCategory] = useState(ALL_PRODUCTS);

  const shown =
    category === ALL_PRODUCTS ? products : products.filter((p) => p.category === category);

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
        <KzTorus size={62} opacity={0.34} />
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "min(4%, 50px)",
          top: "clamp(210px, 33vh, 330px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <KzSphere size={48} opacity={0.28} />
      </div>

      <KzPageHero
        eyebrow="03 / Product studio"
        title="Products we already know how to ship"
        lead="Six systems we build again and again — agent platforms, retrieval, voice, vision, automation, and private models. Each one arrives configured to your data and your workflows, not as a demo. Open a product to see what it does, what you receive, and what it costs to run."
      />

      <section
        style={{
          padding: "0 0 clamp(50px, 7vw, 80px)",
          background: "var(--bg)",
          position: "relative",
        }}
      >
        <KzGridPattern cell={64} opacity={0.4} fade="center" />
        <div className="kz-wrap" style={{ position: "relative" }}>
          <KzFadeUp>
            <KzSlidingTabs
              tabs={filterTabs}
              value={category}
              onValueChange={setCategory}
              ariaLabel="Filter products by category"
            />

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "baseline",
                gap: "6px 14px",
                margin: "22px 0 clamp(24px, 4vw, 34px)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textAlign: "left",
                color: "var(--dim)",
              }}
            >
              <span style={{ color: "var(--acc)" }}>
                {String(shown.length).padStart(2, "0")} / {String(products.length).padStart(2, "0")}{" "}
                products
              </span>
              <span>
                Figures are indicative — final scope is quoted per project after a requirement call.
              </span>
            </div>
          </KzFadeUp>

          <div
            id={PANEL_ID}
            role="tabpanel"
            aria-label={`${category} — product list`}
            style={{ display: "grid", gap: "clamp(18px, 3vw, 26px)" }}
          >
            {shown.map((product, i) => (
              <KzFadeUp key={product.slug} delay={(i % 3) * 90}>
                <ProductCard product={product} />
              </KzFadeUp>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "0 0 clamp(50px, 7vw, 80px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzFadeUp>
            <KzSectionTitle style={{ marginBottom: 10 }}>How an engagement runs</KzSectionTitle>
            <p
              style={{
                color: "var(--mut)",
                maxWidth: "62ch",
                margin: "0 0 clamp(22px, 4vw, 32px)",
                fontSize: "1rem",
              }}
            >
              Nothing is bought from a page. You tell us the workload, we come back with a scoped
              quote, and the first thing we build is a pilot on your own data — so the production
              rollout is a decision made on evidence rather than on a brochure.
            </p>
          </KzFadeUp>
          <KzFadeUp delay={90}>
            <div className="kz-card" style={{ padding: "clamp(22px, 4vw, 34px)" }}>
              <KzWebFlow nodes={engagement} title="From first call to production" />
            </div>
          </KzFadeUp>
        </div>
      </section>

      <section style={{ padding: "0 0 clamp(70px, 10vw, 120px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzFadeUp>
            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: 24,
                padding: "clamp(36px, 6vw, 68px) clamp(22px, 5vw, 56px)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(135deg, var(--card) 0%, var(--card2) 100%)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  width: 420,
                  height: 420,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(28,80,224,.14), transparent 65%)",
                  top: -190,
                  right: -110,
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontSize: "clamp(1.7rem, 4.4vw, 3rem)",
                    lineHeight: 1.04,
                    letterSpacing: "-0.008em",
                    margin: "0 auto 18px",
                    maxWidth: "20ch",
                  }}
                >
                  Enquire now for your requirement
                </h2>
                <p
                  style={{
                    color: "var(--mut)",
                    maxWidth: "54ch",
                    margin: "0 auto clamp(26px, 4vw, 32px)",
                    fontSize: "1.02rem",
                  }}
                >
                  If none of the six fit, describe the problem instead of the product. Bespoke agent
                  platforms, models, and internal systems are scoped the same way — a requirement
                  call, a written scope, then a pilot you can judge before committing.
                </p>
                <KzButton href="/contact?intent=custom" className={KZ_HOVER_GROUP}>
                  Enquire now<KzArrowNudge>→</KzArrowNudge>
                </KzButton>
              </div>
            </div>
          </KzFadeUp>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article
      className="kz-card"
      style={{ padding: "clamp(22px, 4vw, 36px)", display: "grid", gap: "clamp(20px, 3vw, 28px)" }}
    >
      <div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <span className="kz-icon-tile">
            <KzIcon name={product.icon} size={22} />
          </span>
          <h2
            style={{
              fontSize: "clamp(1.25rem, 3vw, 1.6rem)",
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.2,
              color: "var(--ink)",
            }}
          >
            {product.name}
          </h2>
          <span className="kz-pill">{product.category}</span>
        </div>
        <p
          style={{
            margin: "0 0 12px",
            color: "var(--acc)",
            fontSize: "clamp(0.98rem, 2.2vw, 1.08rem)",
          }}
        >
          {product.tagline}
        </p>
        <p style={{ margin: 0, color: "var(--mut)", fontSize: "0.96rem", maxWidth: "72ch" }}>
          {product.summary}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "clamp(18px, 3vw, 30px)",
        }}
      >
        <DetailList label="Capabilities" items={product.capabilities} />
        <DetailList label="What you receive" items={product.deliverables} />
      </div>

      <div>
        <SectionLabel>Built with</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {product.stack.map((tech) => (
            <span key={tech} className="kz-pill kz-tag">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Indicative pricing</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
            gap: 14,
          }}
        >
          {product.tiers.map((tier) => (
            <KzTilt3D key={tier.name} max={5} style={{ display: "grid" }}>
              <TierCard slug={product.slug} tier={tier} />
            </KzTilt3D>
          ))}
        </div>
      </div>
    </article>
  );
}

function TierCard({ slug, tier }: { slug: string; tier: ProductTier }) {
  return (
    <div
      className={KZ_HOVER_GROUP}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        height: "100%",
        padding: "clamp(18px, 3vw, 24px)",
        borderRadius: 16,
        border: `1px solid ${tier.highlight ? "var(--acc)" : "var(--line)"}`,
        background: tier.highlight ? "var(--card2)" : "var(--bg)",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "8px 12px",
            marginBottom: 12,
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "clamp(1rem, 2.2vw, 1.15rem)",
              letterSpacing: "0.01em",
              textTransform: "uppercase",
              margin: 0,
              lineHeight: 1.25,
              color: "var(--ink)",
            }}
          >
            {tier.name}
          </h3>
          {tier.highlight && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.13em",
                textTransform: "uppercase",
                padding: "5px 10px",
                borderRadius: 999,
                border: "1px solid var(--acc)",
                color: "var(--acc)",
              }}
            >
              Recommended
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(1.4rem, 3.6vw, 1.75rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
              color: "var(--ink)",
            }}
          >
            {tier.price}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.64rem",
              letterSpacing: "0.11em",
              textTransform: "uppercase",
              color: "var(--dim)",
            }}
          >
            {tier.period}
          </span>
        </div>
        <p style={{ margin: "10px 0 0", color: "var(--mut)", fontSize: "0.9rem" }}>{tier.summary}</p>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 9 }}>
        {tier.features.map((feature) => (
          <li key={feature} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
            <span
              style={{
                width: 10,
                height: 1,
                background: "var(--acc)",
                flex: "none",
                marginTop: 10,
                opacity: 0.8,
              }}
            />
            <span style={{ fontSize: "0.88rem", color: "var(--mut)" }}>{feature}</span>
          </li>
        ))}
      </ul>

      <KzButton
        href={knowPriceHref(slug, tier.name)}
        variant={tier.highlight ? "primary" : "ghost"}
        style={{ width: "100%", marginTop: "auto" }}
      >
        Know price<KzArrowNudge>→</KzArrowNudge>
      </KzButton>
    </div>
  );
}

function DetailList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
        {items.map((item) => (
          <li key={item} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
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
            <span style={{ fontSize: "0.92rem", color: "var(--mut)" }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.66rem",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        textAlign: "left",
        color: "var(--acc)",
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}
