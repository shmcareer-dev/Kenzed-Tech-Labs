"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useKzTheme } from "./KzThemeProvider";
import { KzLogo } from "./KzIcon";

const nav = [
  { href: "/", label: "Home", num: "01" },
  { href: "/services", label: "Services", num: "02" },
  { href: "/technology", label: "Technology", num: "03" },
  { href: "/infrastructure", label: "Infrastructure", num: "04" },
  { href: "/process", label: "Process", num: "05" },
  { href: "/about", label: "About", num: "06" },
  { href: "/contact", label: "Contact", num: "07" },
];

export function KzHeader() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useKzTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 940);
    check();
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("resize", check);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const active =
    nav.find((n) =>
      n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)
    )?.href || "/";

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: 72,
          display: "flex",
          alignItems: "center",
          background: scrolled || menuOpen ? "var(--navbg)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
          transition: "background .3s, backdrop-filter .3s, border-color .3s",
        }}
      >
        <div className="kz-wrap" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
              }}
            >
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

            {!isMobile && (
              <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {nav.map((item) => {
                  const isActive = active === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 14px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.7rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: isActive ? "var(--ink)" : "var(--mut)",
                        borderBottom: isActive
                          ? "2px solid var(--acc)"
                          : "2px solid transparent",
                        transition: "color .2s, border-color .2s",
                      }}
                    >
                      <span style={{ color: isActive ? "var(--acc)" : "var(--dim)" }}>
                        {item.num}
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  background: "var(--card)",
                  color: "var(--ink)",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "1rem",
                }}
              >
                {isDark ? "☀" : "☾"}
              </button>

              {isMobile ? (
                <button
                  onClick={() => setMenuOpen(true)}
                  aria-label="Open menu"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    border: "1px solid var(--line)",
                    background: "var(--card)",
                    color: "var(--ink)",
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: "1.15rem",
                  }}
                >
                  ☰
                </button>
              ) : (
                <Link
                  href="/contact"
                  className="kz-btn kz-btn-primary"
                  style={{ padding: "13px 22px", fontSize: "0.74rem" }}
                >
                  Start a project →
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {menuOpen && isMobile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
            padding: "0 clamp(20px, 6vw, 48px)",
            overflow: "auto",
          }}
        >
          <div
            style={{
              height: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flex: "none",
            }}
          >
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <KzLogo size={28} />
              <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.98rem",
                    letterSpacing: "0.03em",
                    color: "var(--ink)",
                  }}
                >
                  KENZED
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.52rem",
                    letterSpacing: "0.42em",
                    color: "var(--mut)",
                  }}
                >
                  TECH LABS
                </span>
              </span>
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "var(--card)",
                color: "var(--ink)",
                cursor: "pointer",
                fontSize: "1.15rem",
                fontFamily: "var(--font-mono)",
              }}
            >
              ✕
            </button>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", marginTop: 24 }}>
            {nav.map((item, i) => {
              const isActive = active === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 18,
                    padding: "17px 0",
                    borderBottom: "1px solid var(--line)",
                    animation: `kzUp .55s cubic-bezier(.2,.7,.2,1) both`,
                    animationDelay: `${0.04 + i * 0.05}s`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.72rem",
                      color: isActive ? "var(--acc)" : "var(--dim)",
                    }}
                  >
                    {item.num}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(1.7rem, 7.5vw, 2.5rem)",
                      textTransform: "uppercase",
                      lineHeight: 1.05,
                      color: isActive ? "var(--ink)" : "var(--mut)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div
            style={{
              marginTop: "auto",
              padding: "30px 0 26px",
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "var(--mut)",
                letterSpacing: "0.06em",
              }}
            >
              +91 76990 02237 · kenzedtechlab@gmail.com
            </div>
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "15px 24px",
                background: "var(--ink)",
                color: "var(--bg)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.74rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
                border: 0,
                borderRadius: 12,
              }}
            >
              Start a project →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
