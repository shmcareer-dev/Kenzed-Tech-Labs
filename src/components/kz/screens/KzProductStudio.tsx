"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { KzScrollSpy } from "@/components/kz/KzScrollSpy";
import { KzGridPattern } from "@/components/kz/motion/KzAmbient";
import { KzFadeUp } from "@/components/kz/motion/KzEntrance";
import {
  KzDecorPin,
  KzSpatialIcon3D,
  KzTechToken3D,
  kindForLabel,
  type KzSpatialKind,
} from "@/components/kz/KzSpatial3D";
import { KzPageHero, KzSectionTitle, KzEyebrow } from "@/components/kz/primitives";
import { KzProductLeadModal } from "@/components/kz/KzProductLeadModal";
import { products, type Product } from "@/content/products";
import { asset } from "@/content/site";

/**
 * The product shelf.
 *
 * This page used to be a filtered card grid where every product ended in three
 * priced tiers and a Buy now. None of these are bought that way — each one is
 * scoped per institution — so the tiers were fiction and the filter was sorting
 * six things into four buckets. It is now one chapter per product: the real
 * screenshot of the live site in a device frame, the claim, what backs it, and
 * a single Enquire now that opens the lead form.
 *
 * Mobile first, and that is not a slogan here: the layout is authored as a
 * single stacked column and only splits into two at 1000px. The device frame's
 * tilt, the parallax on the screenshot and the sheen are all desktop-only —
 * on a phone the screenshot is a plain, fast, full-width image, because the
 * screenshot IS the content and the chrome around it is not.
 */

const KZPS_CSS = `
.kzps-chapter{
  position:relative;
  display:grid;
  gap:clamp(22px,4vw,34px);
  grid-template-columns:minmax(0,1fr);
  align-items:center;
  padding:clamp(38px,7vw,86px) 0;
  border-top:1px solid var(--line);
}
.kzps-chapter:first-of-type{border-top:0}

@media (min-width:1000px){
  .kzps-chapter{
    grid-template-columns:minmax(0,1.02fr) minmax(0,1fr);
    gap:clamp(38px,5vw,72px);
    align-items:start;
  }
  /* The device frame is ~400px against 740-890px of copy. Centred, that left
     a ~400px hole in every chapter. Sticky instead: the screenshot holds at
     eye level while its own copy scrolls past it, which spends the height
     rather than padding it. top clears the fixed header pill. */
  .kzps-art{
    position:sticky;
    top:clamp(96px,12vh,132px);
    align-self:start;
  }
  /* Alternating sides. nth-of-TYPE, not nth-child: the chapters are articles
     sharing a parent with the intro div, so nth-child counts that div too and
     the alternation started on the wrong foot. Source order never changes —
     a screen reader and a phone both read name-then-evidence every time. */
  .kzps-chapter:nth-of-type(even) .kzps-copy{grid-column:2;grid-row:1}
  .kzps-chapter:nth-of-type(even) .kzps-art{grid-column:1;grid-row:1}
  .kzps-chapter:nth-of-type(even) .kzps-device{--kzps-ry:5deg}
}

.kzps-copy{min-width:0}
.kzps-art{min-width:0;position:relative}

.kzps-kicker{
  display:flex;
  align-items:center;
  gap:10px;
  margin-bottom:14px;
}
.kzps-kind{
  font-family:var(--font-mono);
  font-size:.58rem;
  font-weight:500;
  letter-spacing:.2em;
  text-transform:uppercase;
  color:var(--acc);
}
.kzps-index{
  margin-left:auto;
  font-family:var(--font-mono);
  font-size:.58rem;
  letter-spacing:.2em;
  color:var(--dim);
}

.kzps-name{
  margin:0 0 8px;
  font-family:var(--font-display);
  font-weight:580;
  font-size:clamp(1.5rem,5.2vw,2.5rem);
  line-height:1.02;
  letter-spacing:-.045em;
  color:var(--ink);
}
.kzps-tagline{
  margin:0 0 14px;
  font-size:clamp(1rem,3vw,1.16rem);
  line-height:1.4;
  letter-spacing:-.011em;
  color:var(--acc3);
}
.kzps-summary{
  margin:0 0 20px;
  max-width:60ch;
  font-size:clamp(.92rem,2.6vw,1rem);
  line-height:1.72;
  color:var(--mut);
}

.kzps-chips{
  display:flex;
  flex-wrap:wrap;
  gap:7px;
  margin-bottom:20px;
  padding:0;
  list-style:none;
}
.kzps-chips li{
  display:inline-flex;
  align-items:center;
  gap:7px;
  padding:7px 12px;
  border:1px solid var(--line);
  border-radius:999px;
  background:var(--card);
  font-family:var(--font-mono);
  font-size:.58rem;
  letter-spacing:.11em;
  text-transform:uppercase;
  color:var(--mut);
}
.kzps-chips li::before{
  content:"";
  width:5px;height:5px;border-radius:50%;
  background:var(--acc3);
  box-shadow:0 0 0 1px color-mix(in srgb,var(--acc3) 50%,transparent),0 0 6px var(--acc3);
}

/* The voice products get a marker of their own — it is the single most
   unusual thing either site does and it disappears in a chip row. */
.kzps-voice{
  display:flex;
  align-items:center;
  gap:12px;
  margin-bottom:20px;
  padding:12px 14px;
  border:1px solid color-mix(in srgb,var(--acc) 34%,var(--line));
  border-radius:14px;
  background:linear-gradient(120deg,color-mix(in srgb,var(--acc) 12%,transparent),transparent 70%);
}
.kzps-voice p{
  margin:0;
  font-size:.86rem;
  line-height:1.5;
  color:var(--ink);
}
.kzps-voice-wave{
  display:flex;
  align-items:flex-end;
  gap:2.5px;
  flex:0 0 auto;
  height:20px;
}
.kzps-voice-wave i{
  width:2.5px;
  border-radius:2px;
  background:var(--acc3);
  animation:kzpsWave 1.25s ease-in-out infinite;
}
@keyframes kzpsWave{0%,100%{height:5px;opacity:.55}50%{height:18px;opacity:1}}

.kzps-proof{
  display:grid;
  gap:1px;
  margin:0 0 22px;
  padding:0;
  list-style:none;
  border:1px solid var(--line);
  border-radius:14px;
  overflow:hidden;
  background:var(--line);
}
@media (min-width:560px){.kzps-proof{grid-template-columns:repeat(2,minmax(0,1fr))}}
.kzps-proof li{
  min-width:0;
  padding:13px 15px;
  background:var(--bg);
}
.kzps-proof b{
  display:block;
  margin-bottom:3px;
  font-family:var(--font-mono);
  font-size:.56rem;
  font-weight:500;
  letter-spacing:.16em;
  text-transform:uppercase;
  color:var(--acc);
}
.kzps-proof span{
  font-size:.84rem;
  line-height:1.55;
  color:var(--mut);
}

.kzps-stack{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:8px;
  margin-bottom:22px;
}
.kzps-stack-label{
  font-family:var(--font-mono);
  font-size:.56rem;
  letter-spacing:.18em;
  text-transform:uppercase;
  color:var(--dim);
}
.kzps-stack-item{
  display:inline-flex;
  align-items:center;
  gap:6px;
  font-size:.76rem;
  color:var(--mut);
}

/* Stacked and equal-width on a phone. Side by side they came out 162px and
   182px — two buttons of different lengths reading as a mistake rather than a
   hierarchy. Above 480px they sit inline and size to their own text. */
.kzps-actions{display:grid;gap:10px}
@media (min-width:480px){
  .kzps-actions{display:flex;flex-wrap:wrap;align-items:center}
}
.kzps-enquire{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  min-height:48px;
  padding:0 22px;
  border:0;
  border-radius:12px;
  background:var(--btn-bg);
  color:var(--btn-ink);
  cursor:pointer;
  font-family:var(--font-mono);
  font-size:.7rem;
  font-weight:600;
  letter-spacing:.14em;
  text-transform:uppercase;
  box-shadow:var(--btn-glow);
  transition:background .22s var(--ease),transform .26s var(--ease);
}
.kzps-enquire span{transition:transform .3s var(--ease)}
@media (hover:hover){
  .kzps-enquire:hover{background:var(--btn-bg-hover);transform:translateY(-2px)}
  .kzps-enquire:hover span{transform:translateX(4px)}
}
.kzps-visit{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:9px;
  min-height:48px;
  padding:0 18px;
  border:1px solid var(--line);
  border-radius:12px;
  background:var(--btn-ghost-bg);
  color:var(--mut);
  font-family:var(--font-mono);
  font-size:.66rem;
  letter-spacing:.12em;
  text-transform:uppercase;
  transition:color .22s var(--ease),border-color .22s var(--ease),transform .26s var(--ease);
}
@media (hover:hover){
  .kzps-visit:hover{color:var(--ink);border-color:var(--acc3);transform:translateY(-2px)}
}

/* ── The device frame ────────────────────────────────────────────────────
   A browser chrome drawn in CSS around a real screenshot. The frame carries
   the perspective, NOT the image: tilting the image itself would resample the
   screenshot and undo the resolution it was captured at. */
.kzps-device{
  position:relative;
  border:1px solid var(--line2);
  border-radius:14px;
  overflow:hidden;
  background:var(--bg2);
  box-shadow:
    0 2px 4px -1px rgba(0,0,0,.6),
    0 34px 70px -40px rgba(0,0,0,.9),
    0 0 0 1px color-mix(in srgb,var(--acc) 14%,transparent);
}
.kzps-bar{
  display:flex;
  align-items:center;
  gap:9px;
  padding:9px 12px;
  border-bottom:1px solid var(--line);
  background:color-mix(in srgb,var(--bg2) 82%,var(--bg));
}
.kzps-dots{display:flex;gap:5px;flex:0 0 auto}
.kzps-dots i{width:8px;height:8px;border-radius:50%;background:var(--line2);opacity:.7}
.kzps-dots i:first-child{background:#ff5f57;opacity:.85}
.kzps-dots i:nth-child(2){background:#febc2e;opacity:.85}
.kzps-dots i:nth-child(3){background:#28c840;opacity:.85}
.kzps-url{
  flex:1 1 auto;
  min-width:0;
  padding:4px 11px;
  border:1px solid var(--line);
  border-radius:999px;
  background:var(--bg);
  font-family:var(--font-mono);
  font-size:.58rem;
  letter-spacing:.06em;
  color:var(--dim);
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.kzps-badge{
  flex:0 0 auto;
  display:inline-flex;
  align-items:center;
  gap:6px;
  font-family:var(--font-mono);
  font-size:.5rem;
  letter-spacing:.13em;
  text-transform:uppercase;
  color:var(--acc3);
}
.kzps-badge::before{
  content:"";
  width:5px;height:5px;border-radius:50%;
  background:var(--acc3);
  box-shadow:0 0 6px var(--acc3);
}
@media (max-width:520px){.kzps-badge{display:none}}

.kzps-screen{
  position:relative;
  display:block;
  width:100%;
  aspect-ratio:1280/800;
  overflow:hidden;
  background:var(--bg);
}
.kzps-screen img{
  display:block;
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:50% 0;
}

/* The phone, laid over the corner of the desktop frame — only where there is
   room for it to sit beside the frame rather than on the content. */
.kzps-phone{display:none}
@media (min-width:1000px){
  .kzps-phone{
    position:absolute;
    display:block;
    right:-14px;
    bottom:-26px;
    z-index:2;
    width:23%;
    min-width:112px;
    border:1px solid var(--line2);
    border-radius:16px;
    overflow:hidden;
    background:var(--bg2);
    box-shadow:0 3px 6px -1px rgba(0,0,0,.7),0 26px 46px -26px rgba(0,0,0,.95);
  }
  .kzps-phone img{display:block;width:100%;height:auto}
  .kzps-phone::before{
    content:"";
    position:absolute;
    top:6px;left:50%;
    width:26%;height:3px;
    border-radius:999px;
    background:var(--line2);
    transform:translateX(-50%);
    z-index:1;
  }
}

.kzps-artpin{
  position:absolute;
  left:-10px;
  top:-22px;
  z-index:3;
}
/* Two class selectors, because .kz3-pin sets display:inline-flex from the
   KzSpatial3D sheet and that one is registered at a later precedence, so it
   wins any tie on document order. */
@media (max-width:1000px){.kzps-art .kzps-artpin{display:none}}

/* Desktop only. The tilt is a compositor transform on the frame, and the
   parallax nudges the screenshot inside its own overflow box, so neither one
   costs a layout. Both are off under reduced motion and on touch. */
@media (min-width:1000px) and (hover:hover){
  .kzps-device{
    transform:perspective(1600px) rotateY(var(--kzps-ry,-5deg)) rotateX(2deg);
    transition:transform .7s var(--ease),box-shadow .7s var(--ease);
  }
  .kzps-art:hover .kzps-device{transform:perspective(1600px) rotateY(0deg) rotateX(0deg)}
  .kzps-screen img{
    transform:translate3d(0,calc(var(--kzps-p,0) * -3%),0) scale(1.03);
    transition:transform .1s linear;
  }
}

@media (prefers-reduced-motion:reduce){
  .kzps-device{transform:none!important;transition:none}
  .kzps-screen img{transform:none!important}
  .kzps-voice-wave i{animation:none;height:11px}
  .kzps-enquire,.kzps-visit{transition:none}
}
`;

const WAVE_BARS = [0, 0.18, 0.36, 0.12, 0.28];

function ProductChapter({
  product,
  index,
  onEnquire,
}: {
  product: Product;
  index: number;
  onEnquire: () => void;
}) {
  const artRef = useRef<HTMLDivElement | null>(null);

  /* Parallax on the screenshot inside its frame. Desktop and fine-pointer
     only — the query is checked in JS as well as in CSS so a phone never even
     registers the listener, and the write is a single custom property that CSS
     turns into a transform. */
  useEffect(() => {
    const el = artRef.current;
    if (!el) return;
    const allowed = window.matchMedia("(min-width: 1000px) and (hover: hover)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!allowed.matches || still.matches) return;

    let frame = 0;
    let visible = false;

    const paint = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const travel = vh + rect.height;
      const raw = travel > 0 ? (vh - rect.top) / travel : 0.5;
      el.style.setProperty("--kzps-p", (Math.min(1, Math.max(0, raw)) * 2 - 1).toFixed(3));
    };
    const schedule = () => {
      if (frame || !visible) return;
      frame = requestAnimationFrame(paint);
    };

    const io = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      schedule();
    });
    io.observe(el);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const kind: KzSpatialKind = kindForLabel(`${product.name} ${product.tagline}`);

  return (
    <article className="kzps-chapter" id={product.slug}>
      <div className="kzps-copy">
        <KzFadeUp>
          <div className="kzps-kicker">
            <KzSpatialIcon3D kind={kind} size={44} float={false} tone={index % 2 ? "violet" : "cyan"} />
            <span className="kzps-kind">{product.kind}</span>
            <span className="kzps-index">{String(index + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}</span>
          </div>

          <h3 className="kzps-name">{product.name}</h3>
          <p className="kzps-tagline">{product.tagline}</p>
          <p className="kzps-summary kz-prose">{product.summary}</p>

          {product.voice && (
            <div className="kzps-voice">
              <span className="kzps-voice-wave" aria-hidden="true">
                {WAVE_BARS.map((delay, i) => (
                  <i key={i} style={{ animationDelay: `${delay}s` }} />
                ))}
              </span>
              <p>{product.voice}</p>
            </div>
          )}

          <ul className="kzps-chips">
            {product.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>

          <ul className="kzps-proof">
            {product.proof.map((entry) => (
              <li key={entry.label}>
                <b>{entry.label}</b>
                <span>{entry.detail}</span>
              </li>
            ))}
          </ul>

          <div className="kzps-stack">
            <span className="kzps-stack-label">Built with</span>
            {product.stack.map((tool) => (
              <span className="kzps-stack-item" key={tool}>
                <KzTechToken3D name={tool} category={product.name} size={26} />
                {tool}
              </span>
            ))}
          </div>

          <div className="kzps-actions">
            <button type="button" className="kzps-enquire" onClick={onEnquire}>
              Enquire now
              <span aria-hidden="true">→</span>
            </button>
            <a
              className="kzps-visit"
              href={product.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit {product.displayUrl}
            </a>
          </div>
        </KzFadeUp>
      </div>

      <div className="kzps-art" ref={artRef}>
        <KzDecorPin
          kind={kind}
          label={product.kind}
          size={52}
          tone={index % 2 ? "cyan" : "violet"}
          className="kzps-artpin"
        />
        <KzFadeUp delay={90}>
          <div className="kzps-device">
            <div className="kzps-bar">
              <span className="kzps-dots" aria-hidden="true">
                <i /><i /><i />
              </span>
              <span className="kzps-url">{product.displayUrl}</span>
              {product.badge && <span className="kzps-badge">{product.badge}</span>}
            </div>
            <div className="kzps-screen">
              {/* A real capture of the live site. Not priority: these sit far
                  below the fold, and six above-the-fold images would be the
                  slowest thing on the page. */}
              <Image
                src={asset(product.shot)}
                alt={`${product.name} — the live site at ${product.displayUrl}`}
                width={1280}
                height={800}
                sizes="(min-width: 1000px) 48vw, 100vw"
                loading="lazy"
              />
            </div>
          </div>

          {product.phoneShot && (
            <div className="kzps-phone" aria-hidden="true">
              <Image
                src={asset(product.phoneShot)}
                alt=""
                width={390}
                height={844}
                sizes="180px"
                loading="lazy"
              />
            </div>
          )}
        </KzFadeUp>
      </div>
    </article>
  );
}

export function KzProductStudio() {
  const [enquiry, setEnquiry] = useState<{ open: boolean; name?: string; slug?: string }>({
    open: false,
  });

  return (
    <div id="top" style={{ position: "relative" }}>
      <style href="kz-product-studio" precedence="default" dangerouslySetInnerHTML={{ __html: KZPS_CSS }} />

      <KzPageHero
        eyebrow="03 / Product Studio"
        title="Six systems, all of them live"
        lead="Not a catalogue of concepts. Every product below is in production today, and every screenshot on this page is the real site — captured, not mocked up."
        visual="rocket"
      />

      <KzScrollSpy
        sections={[
          { id: "top", label: "Product Studio" },
          ...products.map((product) => ({ id: product.slug, label: product.name })),
        ]}
      />

      <section
        id="shelf"
        style={{
          position: "relative",
          padding: "clamp(26px, 4vw, 44px) 0 clamp(70px, 10vw, 120px)",
          background: "var(--bg)",
        }}
      >
        <KzGridPattern cell={64} opacity={0.28} fade="center" />

        <div className="kz-wrap" style={{ position: "relative" }}>
          <KzFadeUp>
            <KzEyebrow>What we run</KzEyebrow>
            <KzSectionTitle style={{ maxWidth: "22ch", marginBottom: 12 }}>
              Built, shipped, and still ours to maintain
            </KzSectionTitle>
            <p className="kz-page-lead kz-prose" style={{ marginBottom: 0, maxWidth: "68ch" }}>
              Two of these are platforms we license to institutions; the rest are live builds we
              designed, shipped and still operate. Pricing is scoped per institution — seats,
              campuses, integrations and hosting all move the number — so there are no printed
              tiers here. Tell us the shape of your problem and we will quote against it.
            </p>
          </KzFadeUp>

          {/* Rendered as direct siblings, NOT through KzStagger. That wraps
              every child in its own element, which would make each chapter the
              only child of its wrapper — and the nth-child(even) rule that
              alternates the artwork side would then never match. Each chapter
              carries its own KzFadeUp, so the stagger was redundant anyway. */}
          {products.map((product, index) => (
            <ProductChapter
              key={product.slug}
              product={product}
              index={index}
              onEnquire={() =>
                setEnquiry({ open: true, name: product.name, slug: product.slug })
              }
            />
          ))}
        </div>
      </section>

      <KzProductLeadModal
        isOpen={enquiry.open}
        onClose={() => setEnquiry((prev) => ({ ...prev, open: false }))}
        productName={enquiry.name}
        productSlug={enquiry.slug}
      />
    </div>
  );
}
