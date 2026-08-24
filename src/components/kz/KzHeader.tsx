"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { KzWordmark } from "./KzWordmark";
import { useKzTheme } from "./KzThemeProvider";
import { KZ_EASE_CSS, KzCommandPalette } from "./motion/KzNav";

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

/**
 * The pill cannot fit nine links, so the three offer pages fold into a
 * "Services" mega menu and the rest stay top-level. Every page remains
 * reachable: Home via the brand, Contact via the CTA, and all nine via the
 * mobile menu and the command palette. The `note` lines are each page's own
 * metadata title with the "| Kenzed Tech Lab" suffix dropped — existing
 * strings, not invented copy.
 */
const MEGA = [
  { href: "/services", label: "Services", num: "02", note: "AI, ML & Software Development Services" },
  { href: "/product-studio", label: "Product Studio", num: "03", note: "AI Products & Pricing" },
  { href: "/live-projects", label: "Live Projects", num: "04", note: "Live Projects & AI Training in Durgapur" },
];
const TOP = ["/technology", "/infrastructure", "/process", "/about"];

/** Scroll depth after which the pill compacts (design: 90px). */
const KZ_COMPACT_AT = 90;
/** Scroll depth after which scrolling down may hide the pill (design: 480px). */
const KZ_HIDE_AT = 480;
/** Scroll delta that counts as a direction change; filters trackpad jitter. */
const KZ_JITTER = 6;
/** Hover intent for the mega menu, both directions (design: ~170ms). */
const KZ_MEGA_INTENT_MS = 170;

const KZ_HDR_CSS = `
.kzhdr{
  position:fixed;z-index:50;top:18px;left:50%;
  width:min(1180px,calc(100% - 32px));height:64px;padding:0 12px 0 17px;
  display:grid;grid-template-columns:1fr auto 1fr;align-items:center;
  border:1px solid var(--line);border-radius:13px;
  background:var(--navbg);
  box-shadow:0 22px 70px rgba(0,0,0,.34);
  backdrop-filter:blur(20px) saturate(130%);
  -webkit-backdrop-filter:blur(20px) saturate(130%);
  transform:translate3d(-50%,0,0);
  transition:height .35s ${KZ_EASE_CSS},top .35s ${KZ_EASE_CSS},
    transform .38s ${KZ_EASE_CSS},background .3s ${KZ_EASE_CSS};
}
/* color-mix keeps the "more opaque when compact" step reading from --bg, so
   the light theme gets a paler pill instead of a hardcoded dark one. */
.kzhdr[data-compact="true"]{top:10px;height:54px;background:color-mix(in srgb,var(--bg) 91%,transparent)}
.kzhdr[data-hidden="true"]{transform:translate3d(-50%,-130%,0)}
[data-kz-theme="light"] .kzhdr{box-shadow:0 22px 70px rgba(12,20,36,.14)}

.kzhdr-brand{display:inline-flex;align-items:center;width:max-content}

.kzhdr-links{display:flex;align-items:center;gap:33px}
.kzhdr-link{
  font-family:var(--font-mono);font-size:11px;font-weight:500;
  letter-spacing:.03em;white-space:nowrap;
  color:var(--mut);transition:color .25s ${KZ_EASE_CSS};
}
.kzhdr-link:hover{color:var(--acc3)}
.kzhdr-link[aria-current="page"],.kzhdr-mega>.kzhdr-link[data-active="true"]{color:var(--ink)}

.kzhdr-mega{position:relative}
.kzhdr-mega>button{
  display:flex;align-items:center;gap:6px;
  border:0;padding:0;background:transparent;cursor:pointer;
}
.kzhdr-caret{font-size:10px;transition:transform .25s ${KZ_EASE_CSS}}
.kzhdr-mega[data-open="true"] .kzhdr-caret{transform:rotate(180deg)}
.kzhdr-megamenu{
  position:absolute;top:calc(100% + 22px);left:-24px;width:420px;padding:8px;
  border:1px solid var(--line);border-radius:13px;
  background:color-mix(in srgb,var(--bg) 96%,transparent);
  box-shadow:0 26px 80px rgba(0,0,0,.48);
  backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);
  opacity:0;visibility:hidden;transform:translateY(-9px) scale(.97);
  transform-origin:top left;
  transition:opacity .25s ${KZ_EASE_CSS},visibility .25s,transform .25s ${KZ_EASE_CSS};
}
.kzhdr-mega[data-open="true"] .kzhdr-megamenu{opacity:1;visibility:visible;transform:none}
[data-kz-theme="light"] .kzhdr-megamenu{box-shadow:0 26px 80px rgba(12,20,36,.2)}
.kzhdr-megamenu a{
  display:grid;grid-template-columns:30px 1fr auto;align-items:center;gap:12px;
  min-height:64px;padding:10px 12px;border-radius:9px;
  transition:background .24s ${KZ_EASE_CSS};
}
.kzhdr-megamenu a:hover{background:var(--card2)}
.kzhdr-megamenu a b{color:var(--acc3);font:500 8px var(--font-mono);letter-spacing:.08em}
.kzhdr-megamenu a>span{display:grid;gap:3px;color:var(--ink);font-size:13px}
.kzhdr-megamenu a small{color:var(--mut);font-size:10px}
.kzhdr-megamenu a i{
  font-style:normal;color:var(--mut);
  transition:transform .24s ${KZ_EASE_CSS};
}
.kzhdr-megamenu a:hover i{transform:translate(3px,-3px)}

/* Compact the palette's built-in trigger to nav-furniture size inside the
   pill; the palette itself (and its Cmd/Ctrl+K wiring) is untouched. */
.kzhdr .kzcp-trigger{
  min-height:24px;padding:0 8px;gap:6px;border-radius:6px;
  background:transparent;font-size:9px;letter-spacing:.08em;
}
.kzhdr .kzcp-trigger .kzcp-kbd{padding:1px 5px;font-size:.55rem}

.kzhdr-end{display:flex;align-items:center;justify-content:flex-end;gap:8px}
.kzhdr-theme{
  width:40px;height:40px;flex:0 0 auto;display:grid;place-items:center;
  border:1px solid var(--line);border-radius:9px;background:transparent;
  color:var(--ink);cursor:pointer;font-size:.92rem;
  transition:border-color .25s ${KZ_EASE_CSS},color .25s ${KZ_EASE_CSS};
}
.kzhdr-theme:hover{border-color:var(--line2)}
.kzhdr-cta{
  display:inline-flex;align-items:center;gap:17px;min-height:42px;padding:0 14px;
  border:1px solid color-mix(in srgb,var(--acc) 38%,transparent);border-radius:8px;
  background:color-mix(in srgb,var(--acc) 8%,transparent);
  font-family:var(--font-mono);font-size:11px;font-weight:500;
  letter-spacing:.03em;white-space:nowrap;color:var(--ink);
  transition:color .25s ${KZ_EASE_CSS},border-color .25s ${KZ_EASE_CSS},background .25s ${KZ_EASE_CSS};
}
.kzhdr-cta:hover{
  border-color:color-mix(in srgb,var(--acc3) 76%,transparent);
  background:color-mix(in srgb,var(--acc) 15%,transparent);
}
.kzhdr-menubtn{
  display:none;width:40px;height:40px;flex:0 0 auto;padding:0;
  border:1px solid var(--line);border-radius:9px;
  background:color-mix(in srgb,var(--acc) 7%,transparent);
  color:var(--ink);cursor:pointer;
}
.kzhdr-menubtn i{display:block;width:16px;height:1px;margin:5px auto;background:currentColor}

@media (max-width:920px){
  .kzhdr{grid-template-columns:1fr auto}
  .kzhdr-links{display:none}
  .kzhdr-cta{display:none}
  .kzhdr-menubtn{display:block}
}
@media (max-width:640px){
  .kzhdr{top:10px;width:calc(100% - 20px);height:58px;padding-left:12px;border-radius:11px}
  .kzhdr[data-compact="true"]{top:7px;height:52px}
  .kzhdr-brand .kzwm-name b{display:none}
  .kzhdr-menubtn{width:38px;height:38px}
}
@media (prefers-reduced-motion:reduce){
  .kzhdr{transition:none}
  .kzhdr[data-hidden="true"]{transform:translate3d(-50%,0,0)}
}
`;

export function KzHeader() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useKzTheme();
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaBtnRef = useRef<HTMLButtonElement | null>(null);

  /* One passive scroll listener, one rAF: compact past 90px, retract past
     480px on the way down, return on the way up. Reduced motion never hides
     the bar — losing the nav to a transform you cannot see arrive is worse
     than a permanently visible pill. */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let lastY = window.scrollY;
    const apply = () => {
      raf = 0;
      const y = window.scrollY;
      setCompact(y > KZ_COMPACT_AT);
      if (reduced.matches) {
        setHidden(false);
        lastY = y;
        return;
      }
      const delta = y - lastY;
      if (Math.abs(delta) < KZ_JITTER) return;
      lastY = y;
      setHidden(delta > 0 && y > KZ_HIDE_AT);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    // Scroll restoration can land mid-page; paint the matching state now.
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Route changes close both overlays; a nav that follows you is a bug.
  // Adjusted during render (not in an effect) so the stale open state never
  // paints on the new page — the pattern react.dev prescribes for this.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMenuOpen(false);
    setMegaOpen(false);
  }

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

  useEffect(() => {
    if (!menuOpen && !megaOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (megaOpen) {
        setMegaOpen(false);
        // Escape hands focus back to the control that opened the panel.
        megaBtnRef.current?.focus();
      }
      if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, megaOpen]);

  // Clear a pending hover-intent timer if the header unmounts mid-flight.
  useEffect(() => {
    return () => {
      if (megaTimerRef.current) clearTimeout(megaTimerRef.current);
    };
  }, []);

  const setMegaIntent = (open: boolean) => {
    if (megaTimerRef.current) clearTimeout(megaTimerRef.current);
    megaTimerRef.current = setTimeout(() => setMegaOpen(open), KZ_MEGA_INTENT_MS);
  };

  const active =
    nav.find((n) => (n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)))?.href || "/";
  const megaActive = MEGA.some((item) => pathname.startsWith(item.href));

  return (
    <>
      <style href="kz-header" precedence="default" dangerouslySetInnerHTML={{ __html: KZ_HDR_CSS }} />

      <header className="kzhdr" data-compact={compact} data-hidden={hidden}>
        <Link href="/" className="kzhdr-brand" aria-label="KENZED TECHLAB home">
          <KzWordmark />
        </Link>

        <nav className="kzhdr-links" aria-label="Primary">
          <div
            className="kzhdr-mega"
            data-open={megaOpen}
            onPointerEnter={() => setMegaIntent(true)}
            onPointerLeave={() => setMegaIntent(false)}
            onBlur={(event) => {
              // Tabbing out of the whole cluster closes the panel; moving
              // focus between trigger and entries keeps it open.
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setMegaOpen(false);
              }
            }}
          >
            <button
              ref={megaBtnRef}
              type="button"
              className="kzhdr-link"
              data-active={megaActive}
              aria-expanded={megaOpen}
              aria-haspopup="true"
              aria-controls="kzhdr-megamenu"
              onClick={() => setMegaOpen((open) => !open)}
            >
              Services{" "}
              <span className="kzhdr-caret" aria-hidden="true">
                ⌄
              </span>
            </button>
            <div className="kzhdr-megamenu" id="kzhdr-megamenu">
              {MEGA.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active === item.href ? "page" : undefined}
                  tabIndex={megaOpen ? undefined : -1}
                  onClick={() => setMegaOpen(false)}
                >
                  <b>{item.num}</b>
                  <span>
                    {item.label}
                    <small>{item.note}</small>
                  </span>
                  <i aria-hidden="true">↗</i>
                </Link>
              ))}
            </div>
          </div>

          {nav
            .filter((item) => TOP.includes(item.href))
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="kzhdr-link"
                aria-current={active === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}

          {/* Second palette instance for the pill; the layout's instance owns
              the Cmd/Ctrl+K hotkey, so this one must not also bind it. */}
          <KzCommandPalette hotkey={false} triggerLabel="Search" />
        </nav>

        <div className="kzhdr-end">
          <button
            type="button"
            className="kzhdr-theme"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? "☀" : "☾"}
          </button>

          <Link href="/contact" className="kzhdr-cta">
            Start a project <span aria-hidden="true">→</span>
          </Link>

          <button
            type="button"
            className="kzhdr-menubtn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <i />
            <i />
          </button>
        </div>
      </header>

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
            padding:
              "max(env(safe-area-inset-top, 0px), 0px) clamp(20px, 6vw, 48px) max(env(safe-area-inset-bottom, 0px), 24px)",
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
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
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              aria-label="KENZED TECHLAB home"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <KzWordmark />
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              style={{
                width: 44,
                height: 44,
                borderRadius: 9,
                border: "1px solid var(--line)",
                background: "transparent",
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
                      color: isActive ? "var(--acc3)" : "var(--dim)",
                    }}
                  >
                    {item.num}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      /* Sentence case display type per the design: weight and
                         negative tracking carry the hierarchy that the old
                         uppercase transform used to. */
                      fontWeight: 560,
                      fontSize: "clamp(1.4rem, 6.2vw, 2rem)",
                      letterSpacing: "-0.035em",
                      lineHeight: 1.05,
                      color: isActive ? "var(--acc3)" : "var(--ink)",
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
