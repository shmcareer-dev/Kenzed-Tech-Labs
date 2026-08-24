"use client";

import Link from "next/link";

import { KzReveal } from "@/components/kz/KzReveal";
import { KzIcon } from "@/components/kz/KzIcon";
import { KzSectionTitle, KzButton } from "@/components/kz/primitives";
import { useKzPage } from "@/components/kz/useKzPage";
import type { Service } from "@/content/services";

interface KzServiceDetailProps {
  service: Service;
  related: Service[];
}

export function KzServiceDetail({ service, related }: KzServiceDetailProps) {
  useKzPage("services");

  return (
    <>
      <section style={{ padding: "clamp(130px, 18vh, 180px) 0 clamp(40px, 6vw, 70px)" }}>
        <div className="kz-wrap">
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--acc)",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <span style={{ width: 26, height: 1, background: "var(--acc)", opacity: 0.7 }} />
            02 / Services
          </div>
          <h1
            className="kz-page-title"
            style={{ maxWidth: "22ch", fontSize: "clamp(1.9rem, 5vw, 3.2rem)" }}
          >
            {service.title}
          </h1>
          <p className="kz-page-lead" style={{ maxWidth: "70ch" }}>
            {service.summary}
          </p>
        </div>
      </section>

      <section style={{ padding: "0 0 clamp(70px, 10vw, 120px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <div
            style={{
              display: "grid",
              gap: "clamp(28px, 5vw, 64px)",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            }}
          >
            <div>
              <KzReveal delay={0}>
                <KzSectionTitle style={{ marginBottom: 24, fontSize: "clamp(1.3rem, 3vw, 1.8rem)" }}>
                  What we deliver
                </KzSectionTitle>
              </KzReveal>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {service.deliverables.map((item, i) => (
                  <KzReveal key={item} delay={(i % 4) + 1}>
                    <li
                      style={{
                        display: "flex",
                        gap: 14,
                        padding: "10px 0",
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
                      <span style={{ fontSize: "0.95rem", color: "var(--mut)" }}>{item}</span>
                    </li>
                  </KzReveal>
                ))}
              </ul>
            </div>

            <div>
              <KzReveal delay={0}>
                <KzSectionTitle style={{ marginBottom: 24, fontSize: "clamp(1.3rem, 3vw, 1.8rem)" }}>
                  Technical stack
                </KzSectionTitle>
              </KzReveal>
              <dl style={{ margin: 0 }}>
                {service.stack.map((group, i) => (
                  <KzReveal key={group.label} delay={(i % 4) + 1}>
                    <div
                      style={{
                        padding: "14px 0",
                        borderTop: "1px solid var(--line)",
                      }}
                    >
                      <dt
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.66rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "var(--acc3)",
                          marginBottom: 4,
                        }}
                      >
                        {group.label}
                      </dt>
                      <dd
                        style={{
                          fontSize: "0.9rem",
                          color: "var(--mut)",
                          lineHeight: 1.55,
                          margin: 0,
                        }}
                      >
                        {group.items}
                      </dd>
                    </div>
                  </KzReveal>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "0 0 clamp(50px, 7vw, 80px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzReveal delay={0}>
            <KzSectionTitle style={{ marginBottom: 26 }}>Related services</KzSectionTitle>
          </KzReveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: 16,
              marginBottom: 48,
            }}
          >
            {related.map((item, i) => (
              <KzReveal key={item.slug} delay={(i % 2) + 1}>
                <Link
                  href={`/services/${item.slug}`}
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
                  <span className="kz-icon-tile">
                    <KzIcon name={item.icon} size={22} />
                  </span>
                  <h3
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      margin: 0,
                      color: "var(--ink)",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "0.88rem", color: "var(--mut)", margin: 0, flex: 1 }}>
                    {item.short}
                  </p>
                </Link>
              </KzReveal>
            ))}
          </div>

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
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "clamp(1.5rem, 3.8vw, 2.2rem)",
                  lineHeight: 1.06,
                  letterSpacing: "-0.004em",
                  margin: "0 auto 18px",
                  maxWidth: "24ch",
                }}
              >
                Ready to start your {service.title.toLowerCase()} project?
              </h2>
              <p
                style={{
                  color: "var(--mut)",
                  maxWidth: "52ch",
                  margin: "0 auto 30px",
                  fontSize: "1.04rem",
                }}
              >
                Tell us what you&apos;re trying to build and we&apos;ll come back with a clear scope,
                timeline, and estimate — no obligation.
              </p>
              <KzButton href="/contact">Book a free consultation →</KzButton>
            </div>
          </KzReveal>

          <KzReveal delay={1}>
            <p style={{ marginTop: 32, fontSize: "0.95rem", color: "var(--mut)" }}>
              <Link href="/services" style={{ color: "var(--acc)" }}>
                ← Back to all services
              </Link>
            </p>
          </KzReveal>
        </div>
      </section>
    </>
  );
}
