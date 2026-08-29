"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";

import { legalNav } from "@/content/legal";
import { phoneDigits, phoneDisplay, phoneHref, site } from "@/content/site";

import { KzLogo } from "./KzIcon";
import { KzReveal } from "./KzReveal";

/**
 * A scoped stylesheet instead of inline style objects: hover, focus-visible,
 * @supports and prefers-reduced-motion cannot be expressed as React style
 * props, and this keeps the footer's look inside the one file that owns it.
 * Unlayered, so these rules win over globals.css `@layer base/components`.
 */
const FOOTER_CSS = `
.kzf{position:relative;z-index:1;overflow:hidden;border-top:1px solid var(--line);background:var(--bg)}
/* padding-BLOCK, not the padding shorthand. This sheet is unlayered, and an
   unlayered declaration beats anything inside a cascade layer whatever its
   specificity — so the shorthand's 0 was overriding the padding-inline that
   .kz-wrap sets from @layer components, and the footer was rendering flush to
   both screen edges on every page while every other section kept its 18px
   gutter. It also widened .kzf-cols enough to fit a second column on a phone,
   which is where the ~220px hole in the bottom-right corner came from. */
.kzf-inner{position:relative;padding-block:clamp(46px,7vw,72px) 26px}

/* Decorative bloom. A radial gradient falls off on its own, so it needs no
   blur filter: it paints once and the float only recomposites its layer. */
.kzf-glow{position:absolute;inset-inline:0;bottom:-24%;height:62%;max-width:1000px;margin-inline:auto;pointer-events:none;background:radial-gradient(50% 50% at 50% 60%,var(--acc),transparent 72%);opacity:.11;will-change:transform}
.kzf-live .kzf-glow{animation:kzFloat 11s ease-in-out infinite alternate}
@media (max-width:639px){.kzf-glow{height:44%;opacity:.09}}

/* Light travelling the top hairline, clipped to a 1px strip. Transform only. */
.kzf-rule{position:absolute;top:0;left:0;right:0;height:1px;overflow:hidden;pointer-events:none}
.kzf-sweep{position:absolute;top:0;left:0;width:34%;height:1px;opacity:.8;background:linear-gradient(90deg,transparent,var(--acc),transparent);transform:translate3d(-110%,0,0)}
.kzf-live .kzf-sweep{animation:kzfSweep 7s linear infinite}
@keyframes kzfSweep{from{transform:translate3d(-110%,0,0)}to{transform:translate3d(400%,0,0)}}

.kzf-top{display:grid;gap:clamp(30px,5vw,40px);grid-template-columns:minmax(0,1fr)}
@media (min-width:1120px){.kzf-top{grid-template-columns:minmax(0,1fr) 330px;gap:48px}}
.kzf-cols{display:grid;gap:28px;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))}
/* Explicit rather than left to auto-fit arithmetic: a five-column footer that
   resolves to two ragged tracks on a phone is worse than one clean column. */
@media (max-width:560px){.kzf-cols{grid-template-columns:minmax(0,1fr);gap:22px}}
.kzf-group{display:flex;flex-direction:column;align-items:flex-start;min-width:0}
.kzf-head{margin:0 0 10px;font-family:var(--font-mono);font-size:.68rem;font-weight:500;letter-spacing:.16em;text-transform:uppercase;text-align:left;color:var(--acc)}

.kzf-link{position:relative;display:inline-block;max-width:100%;padding:12px 0;color:var(--mut);font-size:.9rem;line-height:1.4;text-align:left;transition:color .22s cubic-bezier(.2,.7,.2,1),transform .28s cubic-bezier(.2,.7,.2,1)}
.kzf-ul{position:absolute;left:0;right:0;bottom:8px;height:1px;opacity:.55;background:var(--acc);transform:scaleX(0);transform-origin:left center;transition:transform .34s cubic-bezier(.2,.7,.2,1)}
.kzf-link:focus-visible{color:var(--ink)}
.kzf-link:focus-visible .kzf-ul{transform:scaleX(1)}
@media (hover:hover){.kzf-link:hover{color:var(--ink);transform:translate3d(3px,0,0)}.kzf-link:hover .kzf-ul{transform:scaleX(1)}}
.kzf-note{display:block;padding:12px 0;font-size:.9rem;line-height:1.4;text-align:left;color:var(--dim)}

.kzf-lock{display:inline-flex;align-items:center;gap:11px;min-height:44px}
.kzf-name{display:flex;flex-direction:column;line-height:1.15;text-align:left}
/* The footer keeps its own copy of the KENZED/TECHLAB lockup (no gradient
   rule, unlike KzWordmark). Re-measured for Geist, which sets wider than the
   Space Grotesk it replaced: KENZED at 700/.92rem runs ≈(3.9 + 5x.02)em ≈
   3.68rem, so TECHLAB at .55rem Geist Mono (fixed .6em advance, 4.2em for 7
   glyphs) needs .41em of tracking to span it — (4.2 + 6x.41) x .55rem =
   3.66rem, which reads flush. .kzf-n2's negative margin cancels the trailing
   tracking gap so the lockup stays optically right-aligned. */
.kzf-n1{font-family:var(--font-display);font-weight:700;font-size:.92rem;letter-spacing:.02em;color:var(--ink)}
.kzf-n2{font-family:var(--font-mono);font-size:.55rem;letter-spacing:.41em;margin-right:-.41em;color:var(--mut)}
.kzf-blurb{margin:14px 0 0;max-width:34ch;font-size:.9rem;color:var(--mut)}
.kzf-tag{margin:12px 0 0;font-family:var(--font-mono);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;text-align:left;color:var(--dim)}

.kzf-news{max-width:460px;padding:clamp(18px,4vw,24px);border:1px solid var(--line);border-radius:16px;background:var(--card)}
.kzf-news-copy{margin:8px 0 16px;font-size:.86rem;color:var(--mut)}
.kzf-input{background:var(--bg2)}
.kzf-input[aria-invalid="true"]{border-color:var(--ink)}
.kzf-sub{width:100%;margin-top:12px}
.kzf-msg{margin:10px 0 0;font-size:.78rem;line-height:1.5;color:var(--ink)}
.kzf-msg-ok{color:var(--acc3)}

.kzf-markwrap{overflow:hidden;margin-top:clamp(34px,6vw,56px);container-type:inline-size}
/* 700, not 400: this is a stroked outline, and a lighter weight leaves too
   little counter for the stroke to describe a legible letterform at this
   size. Geist sets wider than the Space Grotesk it replaced, so the size
   ceiling comes down to 6rem and the tracking goes slightly negative — the
   old positive tracking would read as spaced capitals in the wider face. */
.kzf-mark{display:block;font-family:var(--font-display);font-weight:700;/* 7.4cqi, not 7.4vw: the wordmark is nowrap inside overflow:hidden, and
     sizing it off the viewport meant it was exactly viewport-wide — so the
     moment the gutter above was restored it would have clipped. Container
     units measure the box it actually sits in. */
  font-size:clamp(1.4rem,7.7cqi,6rem);line-height:1.06;letter-spacing:-.02em;text-align:left;white-space:nowrap;color:var(--line);will-change:transform,opacity}
/* Outline treatment. The colour above stays as the fill for engines without
   text-stroke, so the wordmark is never invisible. */
@supports (-webkit-text-stroke-width:1px){.kzf-mark{color:transparent;-webkit-text-stroke-width:clamp(1px,.16vw,2px);-webkit-text-stroke-color:var(--line2)}}

/* The last row of the last section on the page, which is exactly where the
   fixed chat launcher, the back-to-top control and the palette dock all live.
   Scrolled to the bottom they were sitting on top of the copyright line and
   the legal links. The reserve is horizontal on wide screens, where the row
   runs edge to edge, and vertical on a phone, where it stacks. */
.kzf-status{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 22px;margin-top:clamp(20px,3vw,30px);padding-top:16px;padding-bottom:calc(72px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line)}
@media (min-width:640px){
  .kzf-status{padding-bottom:8px}
  .kzf-ops{padding-inline-start:64px}
  .kzf-meta{padding-inline-end:104px}
}
.kzf-ops{display:inline-flex;align-items:center;gap:10px;min-height:44px;font-family:var(--font-mono);font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;text-align:left;color:var(--mut)}
.kzf-dotwrap{position:relative;display:grid;place-items:center;flex:none;width:10px;height:10px}
.kzf-dot{width:8px;height:8px;border-radius:999px;background:var(--acc3)}
.kzf-ping{position:absolute;inset:0;border-radius:999px;border:1px solid var(--acc3);opacity:0}
.kzf-live .kzf-dot{animation:kzPulse 2.6s ease-in-out infinite}
.kzf-live .kzf-ping{animation:kzfPing 2.6s ease-out infinite}
@keyframes kzfPing{0%{transform:scale(.7);opacity:.55}70%,100%{transform:scale(2.8);opacity:0}}
.kzf-meta{display:flex;flex-wrap:wrap;align-items:center;gap:2px 18px}
.kzf-copy{font-size:.78rem;color:var(--dim)}
.kzf-legal{padding:14px 0;font-size:.78rem}

@media (prefers-reduced-motion:reduce){
.kzf-live .kzf-dot,.kzf-live .kzf-ping,.kzf-live .kzf-glow,.kzf-live .kzf-sweep{animation:none}
.kzf-ping{display:none}
}
`;

const footSvc = [
  { label: "AI Agents & Agentic AI", href: "/services" },
  { label: "Machine Learning", href: "/services" },
  { label: "LLM Fine-Tuning", href: "/services" },
  { label: "Voice AI", href: "/services" },
  { label: "Web & App Development", href: "/services" },
];

const footCo = [
  { label: "About", href: "/about" },
  { label: "Team", href: "/team" },
  { label: "Product Studio", href: "/product-studio" },
  { label: "Live Projects", href: "/live-projects" },
  { label: "Industries", href: "/industries" },
  { label: "Infrastructure", href: "/infrastructure" },
  { label: "Technology", href: "/technology" },
  { label: "Process", href: "/process" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

/* site.ts owns the number AND its two renderings. The footer used to strip the
   storage hyphen itself, which produced an ungrouped ten-digit block sitting
   next to the header's grouped form on the same page. Nowhere but site.ts may
   re-derive either — a grep for the digits should find exactly one file. */
const siteLabel = site.url.replace(/^https?:\/\//, "");
const legalHref = `mailto:${site.email}?subject=${encodeURIComponent(
  `Legal & privacy enquiry — ${site.name}`
)}`;

type SubState = "idle" | "invalid" | "sent" | "error";

const SUB_MESSAGE: Record<Exclude<SubState, "idle">, string> = {
  invalid: "Enter a valid email address to subscribe.",
  sent: "Thanks — confirm the prefilled WhatsApp message and you are on the list.",
  error: "Could not open WhatsApp. Email us instead and we will add you.",
};

export function KzFooter() {
  const year = new Date().getFullYear();
  const footerRef = useRef<HTMLElement | null>(null);
  const markRef = useRef<HTMLSpanElement | null>(null);
  const [email, setEmail] = useState("");
  const [sub, setSub] = useState<SubState>("idle");

  useEffect(() => {
    const footer = footerRef.current;
    const mark = markRef.current;
    if (!footer || !mark) return;
    /* Reduced motion keeps the markup's static end state and costs no
       listeners at all. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const paint = () => {
      frame = 0;
      const vh = window.innerHeight || 1;
      const top = footer.getBoundingClientRect().top;
      /* 0 as the footer's top edge touches the fold, 1 once it has risen by
         55% of a viewport height. */
      const p = Math.min(1, Math.max(0, (vh - top) / (vh * 0.55)));
      mark.style.transform = `translate3d(0, ${((1 - p) * 60).toFixed(2)}%, 0)`;
      mark.style.opacity = (0.15 + p * 0.85).toFixed(3);
    };

    // Coalesced: a burst of scroll events still queues at most one frame.
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(paint);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        footer.classList.toggle("kzf-live", entry.isIntersecting);
        if (entry.isIntersecting) {
          window.addEventListener("scroll", schedule, { passive: true });
          window.addEventListener("resize", schedule, { passive: true });
          schedule();
        } else {
          window.removeEventListener("scroll", schedule);
          window.removeEventListener("resize", schedule);
        }
      },
      { rootMargin: "160px 0px" }
    );
    io.observe(footer);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setSub("invalid");
      return;
    }

    const text = encodeURIComponent(
      [
        `*Newsletter signup — ${site.name}*`,
        ``,
        `*Email:* ${value}`,
        ``,
        `Please add me to the engineering briefing list.`,
      ].join("\n")
    );

    /* A blocked pop-up returns null rather than throwing, so the catch alone
       would report "sent" for a message that was never handed over. */
    let handle: Window | null = null;
    try {
      handle = window.open(`https://wa.me/${phoneDigits}?text=${text}`, "_blank", "noopener,noreferrer");
    } catch {
      handle = null;
    }

    if (!handle) {
      setSub("error");
      return;
    }

    setSub("sent");
    setEmail("");
  }

  return (
    <footer ref={footerRef} className="kzf">
      <style dangerouslySetInnerHTML={{ __html: FOOTER_CSS }} />
      <span className="kzf-glow" aria-hidden="true" />
      <span className="kzf-rule" aria-hidden="true">
        <span className="kzf-sweep" />
      </span>

      <div className="kz-wrap kzf-inner">
        <div className="kzf-top">
          <div className="kzf-cols">
            <KzReveal>
              <div className="kzf-group">
                <Link href="/" className="kzf-lock">
                  <KzLogo size={28} />
                  <span className="kzf-name">
                    <span className="kzf-n1">KENZED</span>
                    <span className="kzf-n2">TECHLAB</span>
                  </span>
                </Link>
                <p className="kzf-blurb">
                  Premium agentic AI, machine learning, and software development — engineered in
                  Durgapur, delivered worldwide.
                </p>
                <p className="kzf-tag">{site.tagline}</p>
              </div>
            </KzReveal>

            <KzReveal delay={1}>
              <div className="kzf-group">
                <h2 className="kzf-head">Services</h2>
                {footSvc.map((f) => (
                  <Link key={f.label} href={f.href} className="kzf-link">
                    {f.label}
                    <span className="kzf-ul" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </KzReveal>

            <KzReveal delay={2}>
              <div className="kzf-group">
                <h2 className="kzf-head">Company</h2>
                {footCo.map((f) => (
                  <Link key={f.label} href={f.href} className="kzf-link">
                    {f.label}
                    <span className="kzf-ul" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </KzReveal>

            <KzReveal delay={3}>
              <div className="kzf-group">
                <h2 className="kzf-head">Legal</h2>
                {legalNav.map((entry) => (
                  <Link key={entry.href} href={entry.href} className="kzf-link">
                    {entry.label}
                    <span className="kzf-ul" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </KzReveal>

            <KzReveal delay={4}>
              <div className="kzf-group">
                <h2 className="kzf-head">Get in touch</h2>
                <a href={phoneHref} className="kzf-link">
                  {phoneDisplay}
                  <span className="kzf-ul" aria-hidden="true" />
                </a>
                <a href={`mailto:${site.email}`} className="kzf-link">
                  {site.email}
                  <span className="kzf-ul" aria-hidden="true" />
                </a>
                <a href={site.url} target="_blank" rel="noopener noreferrer" className="kzf-link">
                  {siteLabel}
                  <span className="kzf-ul" aria-hidden="true" />
                </a>
                <span className="kzf-note">Durgapur · Kolkata</span>
              </div>
            </KzReveal>
          </div>

          <KzReveal delay={5}>
            <div className="kzf-news">
              <h2 className="kzf-head">Newsletter</h2>
              <p className="kzf-news-copy">
                One short brief a month on agentic AI in production — no pitches, no noise.
              </p>
              <form onSubmit={handleSubscribe} noValidate>
                <label className="kz-label" htmlFor="kzf-news-email">
                  Work email
                </label>
                <input
                  id="kzf-news-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="kz-field kzf-input"
                  aria-invalid={sub === "invalid"}
                  aria-describedby={sub === "idle" ? undefined : "kzf-news-msg"}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSub("idle");
                  }}
                />
                <button type="submit" className="kz-btn kz-btn-primary kzf-sub">
                  Subscribe →
                </button>
              </form>
              {sub !== "idle" && (
                <p
                  id="kzf-news-msg"
                  role={sub === "sent" ? "status" : "alert"}
                  className={sub === "sent" ? "kzf-msg kzf-msg-ok" : "kzf-msg"}
                >
                  {SUB_MESSAGE[sub]}
                </p>
              )}
            </div>
          </KzReveal>
        </div>

        <div className="kzf-markwrap" aria-hidden="true">
          <span ref={markRef} className="kzf-mark">
            KENZED TECHLAB
          </span>
        </div>

        <div className="kzf-status">
          <span className="kzf-ops">
            <span className="kzf-dotwrap" aria-hidden="true">
              <span className="kzf-ping" />
              <span className="kzf-dot" />
            </span>
            All systems operational
          </span>
          <span className="kzf-meta">
            <span className="kzf-copy">
              © {year} {site.legalName} · Rajbandh, Durgapur – 713212, West Bengal
            </span>
            {/* Was a single mailto reading "Legal & privacy". A visitor
                looking for the privacy policy at the foot of the page expects
                the policy, not a compose window. */}
            <Link href="/privacy" className="kzf-link kzf-legal">
              Privacy
              <span className="kzf-ul" aria-hidden="true" />
            </Link>
            <Link href="/terms" className="kzf-link kzf-legal">
              Terms
              <span className="kzf-ul" aria-hidden="true" />
            </Link>
            <a href={legalHref} className="kzf-link kzf-legal">
              Legal enquiries
              <span className="kzf-ul" aria-hidden="true" />
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
