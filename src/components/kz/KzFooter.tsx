"use client";

import Link from "next/link";

import { KzLogo } from "./KzIcon";

const footSvc = [
  { label: "AI Agents & Agentic AI", href: "/services" },
  { label: "Machine Learning", href: "/services" },
  { label: "LLM Fine-Tuning", href: "/services" },
  { label: "Voice AI", href: "/services" },
  { label: "Web & App Development", href: "/services" },
];

const footCo = [
  { label: "About", href: "/about" },
  { label: "Infrastructure", href: "/infrastructure" },
  { label: "Technology", href: "/technology" },
  { label: "Process", href: "/process" },
  { label: "Contact", href: "/contact" },
];

export function KzFooter() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        position: "relative",
        zIndex: 1,
        borderTop: "1px solid var(--line)",
        background: "var(--bg)",
      }}
    >
      <div className="kz-wrap" style={{ padding: "clamp(44px, 7vw, 64px) 0 30px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
            gap: 36,
            marginBottom: 44,
          }}
        >
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <KzLogo size={28} />
              <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.92rem",
                    letterSpacing: "0.03em",
                    color: "var(--ink)",
                  }}
                >
                  KENZED
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.5rem",
                    letterSpacing: "0.42em",
                    color: "var(--mut)",
                  }}
                >
                  TECH LABS
                </span>
              </span>
            </Link>
            <p
              style={{
                color: "var(--mut)",
                fontSize: "0.9rem",
                maxWidth: "32ch",
                margin: "16px 0 0",
              }}
            >
              Premium agentic AI, machine learning, and software development — engineered in
              Durgapur, delivered worldwide.
            </p>
          </div>

          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--dim)",
                marginBottom: 16,
              }}
            >
              Services
            </div>
            {footSvc.map((f) => (
              <Link
                key={f.label}
                href={f.href}
                style={{
                  display: "block",
                  color: "var(--mut)",
                  fontSize: "0.9rem",
                  marginBottom: 10,
                  transition: "color .2s",
                }}
              >
                {f.label}
              </Link>
            ))}
          </div>

          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--dim)",
                marginBottom: 16,
              }}
            >
              Company
            </div>
            {footCo.map((f) => (
              <Link
                key={f.label}
                href={f.href}
                style={{
                  display: "block",
                  color: "var(--mut)",
                  fontSize: "0.9rem",
                  marginBottom: 10,
                  transition: "color .2s",
                }}
              >
                {f.label}
              </Link>
            ))}
          </div>

          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--dim)",
                marginBottom: 16,
              }}
            >
              Get in touch
            </div>
            <a
              href="tel:+917699002237"
              style={{
                display: "block",
                color: "var(--mut)",
                fontSize: "0.9rem",
                marginBottom: 10,
                transition: "color .2s",
              }}
            >
              +91 76990 02237
            </a>
            <a
              href="mailto:kenzedtechlab@gmail.com"
              style={{
                display: "block",
                color: "var(--mut)",
                fontSize: "0.9rem",
                marginBottom: 10,
                transition: "color .2s",
              }}
            >
              kenzedtechlab@gmail.com
            </a>
            <a
              href="https://kenzed.in"
              target="_blank"
              rel="noopener"
              style={{
                display: "block",
                color: "var(--mut)",
                fontSize: "0.9rem",
                marginBottom: 10,
                transition: "color .2s",
              }}
            >
              kenzed.in
            </a>
            <span style={{ display: "block", color: "var(--mut)", fontSize: "0.9rem" }}>
              Durgapur · Kolkata
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            paddingTop: 24,
            borderTop: "1px solid var(--line)",
          }}
        >
          <span style={{ color: "var(--dim)", fontSize: "0.8rem" }}>
            © {year} Kenzed Tech Lab · Rajbandh, Durgapur – 713212, West Bengal
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.66rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--dim)",
            }}
          >
            Agentic AI · Machine Learning · Software
          </span>
        </div>
      </div>
    </footer>
  );
}
