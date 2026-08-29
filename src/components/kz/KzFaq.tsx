/**
 * The FAQ block, and the FAQPage schema that goes with it.
 *
 * Built on native <details>/<summary> rather than a JS accordion, for three
 * reasons that all point the same way:
 *
 *  - The answers are in the DOM whether or not the panel is open and whether
 *    or not JS ran. A crawler, a reader-mode extension and an answer engine
 *    all see the full text. A div that mounts its answer on click shows an
 *    empty page to every one of them.
 *  - <summary> is a button, a heading target and a disclosure control for
 *    free, with keyboard and screen-reader behaviour that no hand-rolled
 *    version gets right without effort.
 *  - It costs no JavaScript at all.
 *
 * Rendered from page.tsx rather than from inside a screen. Every screen on
 * this site is a client component, so importing this into one would drag it —
 * and the whole FAQ text — into the client bundle for no reason. Rendered from
 * the page it stays a server component and ships zero JavaScript, which is
 * also why it can use <details> and stop there.
 */

import { JsonLd } from "@/components/ui/JsonLd";
import { KzEyebrow, KzSectionTitle } from "@/components/kz/primitives";
import { faqFor, type FaqItem } from "@/content/faq";
import { faqSchema } from "@/lib/seo";

const KZ_FAQ_CSS = `
.kzfaq{
  position:relative;
  /* The header is fixed, so a deep link to #faq lands with the heading tucked
     underneath it. This is the offset that stops that — it has to clear the
     header's own height plus its top inset. */
  scroll-margin-top:96px;
}
.kzfaq-item{scroll-margin-top:96px}
.kzfaq-list{display:grid;gap:10px;margin:0;padding:0;list-style:none}

.kzfaq-item{
  border:1px solid var(--line);
  border-radius:14px;
  background:linear-gradient(155deg,color-mix(in srgb,var(--card2) 82%,transparent),var(--card));
  overflow:hidden;
  transition:border-color 240ms var(--ease);
}
.kzfaq-item[open]{border-color:color-mix(in srgb,var(--acc) 34%,var(--line))}
.kzfaq-item:hover{border-color:var(--line2)}

.kzfaq-q{
  display:flex;align-items:flex-start;gap:14px;
  padding:clamp(15px,3vw,19px) clamp(16px,3.4vw,22px);
  cursor:pointer;list-style:none;
  font-family:var(--font-display);
  font-size:clamp(.99rem,2.5vw,1.06rem);
  line-height:1.42;letter-spacing:-.017em;font-weight:520;
  color:var(--ink);
  /* A question is a heading, not prose: never justified, never hyphenated. */
  text-align:left;
  -webkit-hyphens:manual;hyphens:manual;
}
/* Safari paints its own triangle unless BOTH of these are declared. */
.kzfaq-q::-webkit-details-marker{display:none}
.kzfaq-q::marker{content:""}

/* The sign is drawn from two rules rather than a glyph so it can cross-fade
   into a minus without a font dependency or a layout change. */
.kzfaq-sign{
  position:relative;flex:0 0 auto;width:17px;height:17px;margin-top:.16em;
  border-radius:4px;
}
.kzfaq-sign::before,.kzfaq-sign::after{
  content:"";position:absolute;left:50%;top:50%;
  background:var(--acc);border-radius:2px;
  transition:transform 260ms var(--ease),opacity 200ms var(--ease);
}
.kzfaq-sign::before{width:13px;height:1.5px;transform:translate(-50%,-50%)}
.kzfaq-sign::after{width:1.5px;height:13px;transform:translate(-50%,-50%)}
.kzfaq-item[open] .kzfaq-sign::after{transform:translate(-50%,-50%) rotate(90deg);opacity:0}

.kzfaq-a{
  padding:0 clamp(16px,3.4vw,22px) clamp(16px,3.2vw,20px);
  margin:0;
  /* Aligns the answer with the question text rather than the sign. */
  padding-left:calc(clamp(16px,3.4vw,22px) + 17px + 14px);
  color:var(--mut);
  font-size:.94rem;line-height:1.62;
}
@media (max-width:520px){
  /* Below this the indent costs more than the alignment is worth. */
  .kzfaq-a{padding-left:clamp(16px,3.4vw,22px)}
}

/* The disclosure animation is opacity and transform only — animating height
   on a <details> forces layout on every frame, and this list sits above the
   footer on pages that are already long. */
@media (prefers-reduced-motion: no-preference){
  .kzfaq-item[open] .kzfaq-a{animation:kzfaqIn 300ms var(--ease) both}
}
@keyframes kzfaqIn{from{opacity:0;transform:translate3d(0,-5px,0)}to{opacity:1;transform:none}}

.kzfaq-more{
  display:inline-flex;align-items:center;gap:9px;margin-top:22px;
  font-family:var(--font-mono);font-size:.68rem;letter-spacing:.14em;
  text-transform:uppercase;color:var(--acc);text-decoration:none;
}
.kzfaq-more:hover{text-decoration:underline;text-underline-offset:4px}
`;

export type KzFaqProps = {
  items: FaqItem[];
  /** Heading above the list. */
  title?: string;
  eyebrow?: string;
  index?: string;
  /**
   * Emit FAQPage JSON-LD. Exactly ONE block per page may claim to be the
   * page's FAQ, so a page rendering two lists must silence the second.
   */
  schema?: boolean;
  /** Link through to the hub. Off on the hub itself. */
  hubLink?: boolean;
  id?: string;
};

export function KzFaq({
  items,
  title = "Questions, answered",
  eyebrow = "FAQ",
  index,
  schema = true,
  hubLink = true,
  id = "faq",
}: KzFaqProps) {
  if (!items.length) return null;

  return (
    <div className="kzfaq" id={id}>
      <style
        href="kz-faq"
        precedence="default"
        dangerouslySetInnerHTML={{ __html: KZ_FAQ_CSS }}
      />
      {schema && <JsonLd data={faqSchema(items)} />}

      {eyebrow && <KzEyebrow index={index}>{eyebrow}</KzEyebrow>}
      <KzSectionTitle style={{ maxWidth: "18ch", marginBottom: 22 }}>{title}</KzSectionTitle>

      <ul className="kzfaq-list">
        {items.map((item) => (
          <li key={item.q}>
            {/* `name` is deliberately absent: grouping them would make the list
                exclusive, and a reader comparing two answers has to be able to
                hold both open. */}
            <details className="kzfaq-item">
              <summary className="kzfaq-q">
                <span className="kzfaq-sign" aria-hidden="true" />
                <span>{item.q}</span>
              </summary>
              <p className="kzfaq-a">{item.a}</p>
            </details>
          </li>
        ))}
      </ul>

      {hubLink && (
        <a className="kzfaq-more" href="/faq/">
          All questions <span aria-hidden="true">→</span>
        </a>
      )}
    </div>
  );
}

/**
 * The FAQ as a full page section, looked up by route.
 *
 * This is what pages render. It owns the section shell — the wrap, the
 * vertical rhythm, the divider — so eleven pages do not each restate it and
 * then drift.
 */
export function KzFaqSection({
  path,
  title,
  index,
  schema = true,
}: {
  path: string;
  title?: string;
  index?: string;
  schema?: boolean;
}) {
  const items = faqFor(path);
  if (!items.length) return null;

  return (
    <section
      aria-labelledby="faq"
      style={{
        padding: "clamp(56px, 8vw, 96px) 0 clamp(64px, 9vw, 104px)",
        background: "var(--bg)",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div className="kz-wrap">
        <KzFaq items={items} title={title} index={index} schema={schema} />
      </div>
    </section>
  );
}
