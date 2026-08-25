"use client";

import { useState } from "react";
import Link from "next/link";

import { KzWebFlow, type KzFlowNode } from "@/components/kz/KzDiagrams";
import { KzScrollSpy } from "@/components/kz/KzScrollSpy";
import { KzSpatialIcon3D, KzTechToken3D, kindForLabel } from "@/components/kz/KzSpatial3D";
import { KzGridPattern } from "@/components/kz/motion/KzAmbient";
import { KzFadeUp } from "@/components/kz/motion/KzEntrance";
import { KzSlidingTabs, type KzTabItem } from "@/components/kz/motion/KzNav";
import { KZ_HOVER_GROUP, KzArrowNudge, KzTilt3D, KzMagnetic } from "@/components/kz/motion/KzPointer";
import { KzButton, KzPageHero, KzSectionTitle, KzEyebrow } from "@/components/kz/primitives";
import { productCategories, products, type Product, type ProductTier } from "@/content/products";
import { KzProductLeadModal } from "@/components/kz/KzProductLeadModal";

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

export function KzProductStudio() {
  const [category, setCategory] = useState(ALL_PRODUCTS);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    productName: string;
    productSlug: string;
    tierName?: string;
  }>({
    isOpen: false,
    productName: "",
    productSlug: "",
  });

  const shown =
    category === ALL_PRODUCTS ? products : products.filter((p) => p.category === category);

  const openEnquiryModal = (product: Product, tier?: ProductTier) => {
    setModalState({
      isOpen: true,
      productName: product.name,
      productSlug: product.slug,
      tierName: tier?.name,
    });
  };

  const closeEnquiryModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div id="top" style={{ position: "relative" }}>
      <KzPageHero
        eyebrow="03 / Product studio"
        title="Production platforms built to scale"
        lead="Six flagship systems engineered, deployed, and proven in live production — from AI-driven learning management and speech-activated institutional portals to multi-campus ERPs, lightweight CRMs, and employment networks. Every product is customizable and ready for deployment."
        visual="chip"
      />

      <KzScrollSpy
        sections={[
          { id: "top", label: "Product studio" },
          { id: "products", label: "Products" },
          { id: "engagement", label: "How an engagement runs" },
          { id: "enquire", label: "Enquire now" },
        ]}
      />

      <section
        id="products"
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
                All platforms include custom domain setup, database migration, and ongoing SLA support.
              </span>
            </div>
          </KzFadeUp>

          <div
            id={PANEL_ID}
            role="tabpanel"
            aria-label={`${category} — product list`}
            style={{ display: "grid", gap: "clamp(24px, 4vw, 40px)" }}
          >
            {shown.map((product, i) => (
              <KzFadeUp key={product.slug} delay={(i % 2) * 80}>
                <ProductCard product={product} onEnquire={(tier) => openEnquiryModal(product, tier)} />
              </KzFadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="kz-wrap"><hr className="kz-section-glow" /></div>

      <section id="engagement" style={{ padding: "clamp(50px, 7vw, 80px) 0", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzFadeUp>
            <KzEyebrow index="02">Delivery Model</KzEyebrow>
            <KzSectionTitle style={{ marginBottom: 10 }}>How an engagement runs</KzSectionTitle>
            <p
              style={{
                color: "var(--mut)",
                maxWidth: "62ch",
                margin: "0 0 clamp(22px, 4vw, 32px)",
                fontSize: "1rem",
              }}
            >
              Nothing is bought blindly from a brochure. You share your institution or enterprise workload, we provide a scoped quote and architecture brief, and we launch a live pilot on your data so you can verify accuracy and performance before full rollout.
            </p>
          </KzFadeUp>
          <KzFadeUp delay={90}>
            <div className="kz-card" style={{ padding: "clamp(22px, 4vw, 34px)" }}>
              <KzWebFlow nodes={engagement} title="From first call to production" />
            </div>
          </KzFadeUp>
        </div>
      </section>

      <div className="kz-wrap"><hr className="kz-section-glow" /></div>

      <section id="enquire" style={{ padding: "clamp(60px, 9vw, 100px) 0", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzFadeUp>
            <div
              style={{
                border: "1px solid var(--line2)",
                borderRadius: 24,
                padding: "clamp(36px, 6vw, 68px) clamp(22px, 5vw, 56px)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(135deg, var(--card) 0%, var(--card2) 100%)",
                boxShadow: "0 28px 80px -40px var(--accglow)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  width: 420,
                  height: 420,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, color-mix(in srgb, var(--acc) 14%, transparent), transparent 65%)",
                  top: -190,
                  right: -110,
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "clamp(1.7rem, 4.4vw, 3rem)",
                    lineHeight: 1.04,
                    letterSpacing: "-0.045em",
                    margin: "0 auto 18px",
                    maxWidth: "22ch",
                    color: "var(--ink)",
                  }}
                >
                  Need a custom edition or bespoke platform?
                </h2>
                <p
                  style={{
                    color: "var(--mut)",
                    maxWidth: "56ch",
                    margin: "0 auto clamp(26px, 4vw, 32px)",
                    fontSize: "1.02rem",
                    lineHeight: 1.6,
                  }}
                >
                  If you need bespoke feature engineering, unique on-premise hardware deployments, or customized AI model integrations, our team can architect a tailored solution for your organization.
                </p>
                <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                  <KzButton
                    onClick={() =>
                      setModalState({
                        isOpen: true,
                        productName: "Bespoke Product Architecture",
                        productSlug: "bespoke",
                      })
                    }
                    className={KZ_HOVER_GROUP}
                  >
                    Enquire Now<KzArrowNudge>→</KzArrowNudge>
                  </KzButton>
                  <KzButton href="/contact" variant="ghost">
                    Speak with Technical Team
                  </KzButton>
                </div>
              </div>
            </div>
          </KzFadeUp>
        </div>
      </section>

      {/* Lead Enquiry Modal */}
      <KzProductLeadModal
        isOpen={modalState.isOpen}
        onClose={closeEnquiryModal}
        productName={modalState.productName}
        productSlug={modalState.productSlug}
        tierName={modalState.tierName}
      />
    </div>
  );
}

function ProductCard({
  product,
  onEnquire,
}: {
  product: Product;
  onEnquire: (tier?: ProductTier) => void;
}) {
  return (
    <article
      className="kz-card"
      style={{
        padding: "clamp(20px, 4vw, 36px)",
        display: "grid",
        gap: "clamp(22px, 3.5vw, 32px)",
        border: "1px solid var(--line)",
        borderRadius: 20,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top Identity Row */}
      <div style={{ display: "grid", gap: 14 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <KzSpatialIcon3D
              kind={kindForLabel(`${product.name} ${product.category}`)}
              size={56}
              float={false}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h2
                  style={{
                    fontSize: "clamp(1.35rem, 3.2vw, 1.85rem)",
                    fontWeight: 700,
                    margin: 0,
                    lineHeight: 1.15,
                    color: "var(--ink)",
                    fontFamily: "var(--font-display)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {product.name}
                </h2>
                <span className="kz-pill" style={{ background: "color-mix(in srgb, var(--acc) 12%, transparent)", borderColor: "var(--acc)", color: "var(--acc)" }}>
                  {product.category}
                </span>
                {product.badge && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: "var(--card2)",
                      border: "1px solid var(--line2)",
                      color: "var(--dim)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {product.badge}
                  </span>
                )}
              </div>
              <p
                style={{
                  margin: "6px 0 0",
                  color: "var(--acc)",
                  fontSize: "clamp(0.92rem, 2vw, 1.04rem)",
                  fontWeight: 500,
                }}
              >
                {product.tagline}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <KzButton onClick={() => onEnquire()} variant="primary" style={{ padding: "8px 18px", fontSize: "0.85rem" }}>
              Enquire Now →
            </KzButton>
          </div>
        </div>

        <p style={{ margin: 0, color: "var(--mut)", fontSize: "0.96rem", maxWidth: "80ch", lineHeight: 1.6 }}>
          {product.summary}
        </p>
      </div>

      {/* Browser Mockup / Live Preview Frame */}
      <div
        style={{
          border: "1px solid var(--line2)",
          borderRadius: 14,
          overflow: "hidden",
          background: "var(--bg)",
          boxShadow: "0 14px 40px -20px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Browser Chrome Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 14px",
            background: "var(--card2)",
            borderBottom: "1px solid var(--line)",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c93f", display: "inline-block" }} />
          </div>

          <div
            style={{
              flex: 1,
              maxWidth: 420,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "4px 12px",
              borderRadius: 6,
              background: "var(--bg)",
              border: "1px solid var(--line)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--ink)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: "#27c93f", fontSize: "0.6rem" }}>🔒</span>
            <span style={{ opacity: 0.7 }}>https://</span>
            <span style={{ fontWeight: 600 }}>{product.displayUrl}</span>
          </div>

          <a
            href={product.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: 6,
              background: "color-mix(in srgb, var(--acc) 14%, transparent)",
              color: "var(--acc)",
              border: "1px solid color-mix(in srgb, var(--acc) 30%, transparent)",
              textDecoration: "none",
              fontWeight: 600,
              transition: "background 0.2s, transform 0.2s",
            }}
          >
            <span>Visit Live</span>
            <span>↗</span>
          </a>
        </div>

        {/* Preview Content Canvas */}
        <div
          style={{
            position: "relative",
            padding: "clamp(20px, 3.5vw, 28px)",
            background: "linear-gradient(135deg, color-mix(in srgb, var(--bg2) 60%, var(--bg)), var(--bg))",
            minHeight: 140,
            display: "grid",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.12,
              backgroundImage:
                "linear-gradient(color-mix(in srgb, var(--acc) 25%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--acc) 25%, transparent) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#27c93f", boxShadow: "0 0 10px #27c93f" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--dim)" }}>
                  Verified Production Deployment
                </span>
              </div>
              <h3
                style={{
                  margin: "0 0 6px",
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)",
                  fontWeight: 600,
                  color: "var(--ink)",
                }}
              >
                {product.name} · {product.displayUrl}
              </h3>
              <p style={{ margin: 0, color: "var(--mut)", fontSize: "0.88rem" }}>
                Full-stack architecture engineered for speed, high concurrency, and data security.
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {product.highlights.map((h) => (
                <span
                  key={h}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.68rem",
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: "var(--card)",
                    border: "1px solid var(--line2)",
                    color: "var(--ink)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}
                >
                  <span style={{ color: "var(--acc)" }}>✓</span>
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities & Deliverables Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "clamp(18px, 3vw, 30px)",
        }}
      >
        <DetailList label="Core Capabilities" items={product.capabilities} />
        <DetailList label="What You Receive" items={product.deliverables} />
      </div>

      {/* Tech Stack Pills */}
      <div>
        <SectionLabel>Technology &amp; Architecture</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {product.stack.map((tech) => (
            <span key={tech} className="kz-pill kz-tag" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <KzTechToken3D name={tech} category={product.category} size={22} />
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Indicative Pricing Tiers */}
      <div>
        <SectionLabel>Indicative Pricing &amp; Editions</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
            gap: 14,
          }}
        >
          {product.tiers.map((tier) => (
            <KzTilt3D key={tier.name} max={5} style={{ display: "grid" }}>
              <TierCard tier={tier} onSelect={() => onEnquire(tier)} />
            </KzTilt3D>
          ))}
        </div>
      </div>

      {/* Bottom Full-Width Enquiry Strip */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          padding: "16px 20px",
          background: "var(--card2)",
          borderRadius: 14,
          border: "1px solid var(--line)",
        }}
      >
        <div>
          <strong style={{ color: "var(--ink)", fontSize: "0.95rem", display: "block" }}>
            Ready to deploy {product.name} for your organization?
          </strong>
          <span style={{ color: "var(--mut)", fontSize: "0.82rem" }}>
            Get a tailored implementation scope, live demo walkthrough, and pilot deployment quote.
          </span>
        </div>
        <KzButton onClick={() => onEnquire()} variant="primary" style={{ padding: "10px 22px" }}>
          Enquire Now for {product.name} →
        </KzButton>
      </div>
    </article>
  );
}

function TierCard({
  tier,
  onSelect,
}: {
  tier: ProductTier;
  onSelect: () => void;
}) {
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
        background: tier.highlight ? "color-mix(in srgb, var(--acc) 6%, var(--card))" : "var(--bg)",
        boxShadow: tier.highlight ? "0 10px 30px -15px var(--accglow)" : "none",
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
              letterSpacing: "-0.035em",
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
                padding: "4px 8px",
                borderRadius: 999,
                border: "1px solid var(--acc)",
                color: "var(--acc)",
                background: "color-mix(in srgb, var(--acc) 12%, transparent)",
                fontWeight: 600,
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
              fontWeight: 600,
              fontSize: "clamp(1.4rem, 3.6vw, 1.75rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
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
        <p style={{ margin: "10px 0 0", color: "var(--mut)", fontSize: "0.88rem", lineHeight: 1.5 }}>
          {tier.summary}
        </p>
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
            <span style={{ fontSize: "0.86rem", color: "var(--mut)", lineHeight: 1.45 }}>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSelect}
        className={`kz-btn ${tier.highlight ? "kz-btn-primary" : "kz-btn-ghost"}`}
        style={{ width: "100%", marginTop: "auto", minHeight: 42, justifyContent: "center", fontSize: "0.86rem" }}
      >
        Enquire for {tier.name} →
      </button>
    </div>
  );
}

function DetailList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
        {items.map((item) => (
          <li key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span
              style={{
                width: 12,
                height: 1,
                background: "var(--acc)",
                flex: "none",
                marginTop: 10,
                opacity: 0.85,
              }}
            />
            <span style={{ fontSize: "0.9rem", color: "var(--mut)", lineHeight: 1.5 }}>{item}</span>
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
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}
