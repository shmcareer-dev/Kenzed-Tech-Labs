"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { KzWordmark } from "./KzWordmark";

import { useKzTheme } from "./KzThemeProvider";
import { KzLogo } from "./KzIcon";
import { KZ_EASE_CSS, KzHideOnScrollHeader } from "./motion/KzNav";

const nav = [
  { href: "/", label: "Home", num: "01" },
  { href: "/services", label: "Services", num: "02" },
  { href: "/product-studio", label: "Product Studio", num: "03" },
  { href: "/live-projects", label: "Live Projects", num: "04" },
  { href: "/technology", label: "Technology", num: "05" },
  { href: "/infrastructure", label: "Infrastructure", num: "06" },
  { href: "/process", label: "Process", num: "07" },
  { href: "/about", label: "About", num: "08" },
  { href: "/contact", label: "Contact", num: "09" },
];

/** Resting height of the bar, in px. */
const KZ_BAR_H = 72;
/** Fraction of that height the scrolled bar keeps. */
const KZ_BAR_SHRINK = 0.8;
/**
 * The shrink is a scaleY on the bar's own background layer, anchored to the top
 * edge, so the content only has to rise by half the lost height to stay
 * optically centred. Both halves are transforms: the header's layout box is
 * never resized, so no frame of the shrink costs a layout pass.
 */
const KZ_CONTENT_RISE = (KZ_BAR_H * (1 - KZ_BAR_SHRINK)) / 2;

export function KzHeader() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useKzTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  /** Nine nav items only clear the CTA above 1200px with the full CTA label. */
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 1000);
      setCompact(window.innerWidth < 1200);
    };
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

  /* Sliding indicator: one hairline measured against the active link and moved
     with translate + scaleX. Animating its left and width instead would relay
     out the whole nav row on every frame of the slide. */
  const navRef = useRef<HTMLElement | null>(null);
  const [marker, setMarker] = useState<{ x: number; w: number } | null>(null);

  const measureMarker = useCallback(() => {
    const list = navRef.current;
    if (!list) return;
    const link = list.querySelector<HTMLAnchorElement>(`[data-kznav="${active}"]`);
    if (!link) {
      setMarker(null);
      return;
    }
    setMarker({ x: link.offsetLeft, w: link.offsetWidth });
  }, [active]);

  useEffect(() => {
    const list = navRef.current;
    if (isMobile || !list) {
      setMarker(null);
      return;
    }

    measureMarker();

    let cancelled = false;
    if ("fonts" in document) {
      // The nav is set in a web font: every link changes width when it lands.
      void document.fonts.ready.then(() => {
        if (!cancelled) measureMarker();
      });
    }

    const observer = new ResizeObserver(() => measureMarker());
    observer.observe(list);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [isMobile, measureMarker]);

  return (
    <>
      <KzHideOnScrollHeader offset={KZ_BAR_H}>
        <header
          style={{
            position: "relative",
            height: KZ_BAR_H,
            display: "flex",
            alignItems: "center",
            /* Once scrolled, the visible bar is only 80% of this box, so the box
               itself must not swallow taps aimed at the page beneath it. */
            pointerEvents: "none",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "center top",
              transform: scrolled ? `scaleY(${KZ_BAR_SHRINK})` : "scaleY(1)",
              background: scrolled || menuOpen ? "var(--navbg)" : "transparent",
              backdropFilter: scrolled ? "blur(14px)" : "none",
              WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
              borderBottom: `1px solid ${scrolled ? "var(--line)" : "transparent"}`,
              transition: `transform .42s ${KZ_EASE_CSS}, background .3s, backdrop-filter .3s, border-color .3s`,
            }}
          />

          <div
            className="kz-wrap"
            style={{
              width: "100%",
              pointerEvents: "auto",
              transform: scrolled
                ? `translate3d(0, ${-KZ_CONTENT_RISE}px, 0)`
                : "translate3d(0, 0, 0)",
              transition: `transform .42s ${KZ_EASE_CSS}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <Link
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  flex: "0 0 auto",
                }}
              >
                <KzLogo size={28} />
                <KzWordmark />
              </Link>

              {!isMobile && (
                <nav
                  ref={navRef}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  {nav.map((item) => {
                    const isActive = active === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        data-kznav={item.href}
                        aria-current={isActive ? "page" : undefined}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "10px clamp(6px, 0.72vw, 11px) 12px",
                          fontFamily: "var(--font-mono)",
                          fontSize: "clamp(0.58rem, 0.3rem + 0.44vw, 0.66rem)",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                          color: isActive ? "var(--ink)" : "var(--mut)",
                          transition: "color .2s",
                        }}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: 0,
                      width: 1,
                      height: 2,
                      borderRadius: 2,
                      background: "var(--acc)",
                      transformOrigin: "left center",
                      transform: marker
                        ? `translate3d(${marker.x}px, 0, 0) scaleX(${marker.w})`
                        : "translate3d(0, 0, 0) scaleX(0)",
                      opacity: marker ? 1 : 0,
                      pointerEvents: "none",
                      transition: `transform .42s ${KZ_EASE_CSS}, opacity .3s ${KZ_EASE_CSS}`,
                    }}
                  />
                </nav>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
                <button
                  onClick={toggleTheme}
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
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
                    fontSize: "1rem",
                  }}
                >
                  {isDark ? "☀" : "☾"}
                </button>

                {isMobile ? (
                  <button
                    onClick={() => setMenuOpen(true)}
                    aria-label="Open menu"
                    aria-expanded={menuOpen}
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
                    style={{
                      padding: compact ? "13px 18px" : "13px 22px",
                      fontSize: "0.74rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {compact ? "Start →" : "Start a project →"}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>
      </KzHideOnScrollHeader>

      {menuOpen && (
        <div
          id="kz-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
            padding: "max(env(safe-area-inset-top, 0px), 0px) clamp(20px, 6vw, 48px) max(env(safe-area-inset-bottom, 0px), 24px)",
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div
            style={{
              height: KZ_BAR_H,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flex: "none",
            }}
          >
            <Link href="/" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <KzLogo size={28} />
              <KzWordmark />
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
                display: "grid",
                placeItems: "center",
              }}
            >
              ✕
            </button>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", marginTop: 18, marginBottom: 24 }}>
            {nav.map((item, i) => {
              const isActive = active === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 0",
                    minHeight: 52,
                    borderBottom: "1px solid var(--line)",
                    animation: `kzUp .55s ${KZ_EASE_CSS} both`,
                    animationDelay: `${0.04 + i * 0.04}s`,
                    touchAction: "manipulation",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.74rem",
                      color: isActive ? "var(--acc)" : "var(--dim)",
                    }}
                  >
                    {item.num}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "clamp(1.4rem, 6.2vw, 2rem)",
                      letterSpacing: "-0.004em",
                      textTransform: "uppercase",
                      lineHeight: 1.1,
                      color: isActive ? "var(--acc)" : "var(--ink)",
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
              padding: "24px 0 12px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px 18px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "var(--mut)",
                letterSpacing: "0.05em",
              }}
            >
              <a href="tel:+917699002237" style={{ color: "var(--ink)", padding: "4px 0" }}>
                +91 76990 02237
              </a>
              <span>·</span>
              <a href="mailto:kenzedtechlab@gmail.com" style={{ color: "var(--ink)", padding: "4px 0" }}>
                kenzedtechlab@gmail.com
              </a>
            </div>
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="kz-btn kz-btn-primary"
              style={{
                width: "100%",
                minHeight: 50,
                fontSize: "0.82rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 600,
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
