"use client";

import Link from "next/link";

import { KzGridPattern } from "@/components/kz/motion/KzAmbient";
import { KzFadeUp } from "@/components/kz/motion/KzEntrance";
import { KzSpatialIcon3D, type KzSpatialKind } from "@/components/kz/KzSpatial3D";
import { KzPageHero } from "@/components/kz/primitives";
import { LEGAL_EFFECTIVE, legalDocs, type LegalDoc } from "@/content/legal";
import { site } from "@/content/site";

/**
 * One renderer for the whole legal shelf.
 *
 * These pages are read differently from the rest of the site: someone arrives
 * looking for a single clause, not for a story. So the layout gives them a
 * standing table of contents on the left from 1080px up, numbered sections with
 * their own anchors, and a plain measure capped at 68 characters. Nothing here
 * animates on scroll beyond the entrance fade — a document that reflows while
 * you are trying to read clause 6 is a worse document.
 *
 * Deliberately no KzScrollSpy. Every other page uses the fixed left rail
 * because it has no other section index; these pages have a real one, and two
 * tables of contents on the same screen is one too many — the rail's expanded
 * labels are full clause headings, which ran straight over the sidebar.
 */

const KZL_CSS = `
.kzl{
  display:grid;
  gap:clamp(26px,4vw,44px);
  grid-template-columns:minmax(0,1fr);
  align-items:start;
}
@media (min-width:1080px){
  .kzl{grid-template-columns:236px minmax(0,1fr);gap:clamp(38px,5vw,72px)}
  .kzl-toc{position:sticky;top:104px}
}

.kzl-toc{min-width:0}
.kzl-toc-head{
  margin:0 0 12px;
  font-family:var(--font-mono);
  font-size:.6rem;
  font-weight:500;
  letter-spacing:.2em;
  text-transform:uppercase;
  color:var(--dim);
}
.kzl-toc ol{list-style:none;margin:0;padding:0;display:grid;gap:1px}
.kzl-toc a{
  display:block;
  padding:8px 10px;
  border-left:2px solid var(--line);
  border-radius:0 8px 8px 0;
  font-size:.82rem;
  line-height:1.35;
  color:var(--mut);
  transition:color .22s var(--ease),border-color .22s var(--ease),background .22s var(--ease);
}
@media (hover:hover){
  .kzl-toc a:hover{color:var(--ink);border-left-color:var(--acc);background:var(--card)}
}
.kzl-toc a:focus-visible{color:var(--ink);border-left-color:var(--acc)}

/* The other documents on the shelf, so a reader who wanted the privacy policy
   and landed on the terms is one tap away rather than back at the footer. */
.kzl-shelf{margin-top:26px;padding-top:18px;border-top:1px solid var(--line);display:grid;gap:2px}
.kzl-shelf a{
  display:flex;
  align-items:center;
  gap:8px;
  min-height:40px;
  padding:6px 0;
  font-family:var(--font-mono);
  font-size:.64rem;
  letter-spacing:.13em;
  text-transform:uppercase;
  color:var(--dim);
  transition:color .22s var(--ease),transform .26s var(--ease);
}
.kzl-shelf a[aria-current="page"]{color:var(--acc)}
@media (hover:hover){.kzl-shelf a:hover{color:var(--ink);transform:translate3d(3px,0,0)}}

/* Below the sidebar breakpoint the same two lists become swipeable chip rails.
   Stacked, a twelve-clause contents list plus the shelf pushed the first line
   of the actual document about 1200px down a phone — a table of contents that
   costs more scrolling than it saves is not a table of contents. Two rails
   cost roughly 120px and still jump you to a clause. */
@media (max-width:1079px){
  .kzl-toc{
    position:relative;
    /* Bleed to the viewport edge so a rail reads as scrollable rather than as
       a row that happens to be cut off. */
    margin-inline:calc(clamp(18px,4.5vw,36px) * -1);
    padding-inline:clamp(18px,4.5vw,36px);
  }
  .kzl-toc-head{margin-bottom:9px}
  .kzl-toc ol,.kzl-shelf{
    display:flex;
    gap:8px;
    overflow-x:auto;
    overscroll-behavior-x:contain;
    scroll-snap-type:x proximity;
    -ms-overflow-style:none;
    scrollbar-width:none;
    /* Room for the chip focus ring, and the same bleed on the far edge. */
    padding:3px clamp(18px,4.5vw,36px) 10px 0;
  }
  .kzl-toc ol::-webkit-scrollbar,.kzl-shelf::-webkit-scrollbar{display:none}
  .kzl-toc a,.kzl-shelf a{
    flex:0 0 auto;
    scroll-snap-align:start;
    display:inline-flex;
    align-items:center;
    gap:7px;
    min-height:38px;
    padding:8px 14px;
    border:1px solid var(--line);
    border-left:1px solid var(--line);
    border-radius:999px;
    background:var(--card);
    white-space:nowrap;
    font-size:.76rem;
  }
  .kzl-shelf{
    margin-top:10px;
    padding-top:10px;
  }
  .kzl-shelf a{
    font-size:.6rem;
    padding:7px 13px 7px 8px;
  }
  .kzl-shelf a[aria-current="page"]{border-color:var(--acc);background:var(--card2)}
  @media (hover:hover){
    .kzl-toc a:hover,.kzl-shelf a:hover{border-color:var(--line2);transform:none}
  }
}

.kzl-doc{min-width:0}

.kzl-summary{
  position:relative;
  overflow:hidden;
  margin-bottom:clamp(30px,5vw,48px);
  padding:clamp(18px,3.4vw,26px);
  border:1px solid var(--line);
  border-radius:18px;
  background:linear-gradient(145deg,color-mix(in srgb,var(--card2) 88%,transparent),var(--card));
  box-shadow:0 18px 60px -48px var(--accglow);
}
.kzl-summary-head{
  display:flex;
  align-items:center;
  gap:12px;
  margin:0 0 14px;
}
.kzl-summary-head span{
  font-family:var(--font-mono);
  font-size:.6rem;
  font-weight:500;
  letter-spacing:.2em;
  text-transform:uppercase;
  color:var(--acc);
}
.kzl-summary ul{list-style:none;margin:0;padding:0;display:grid;gap:9px}
.kzl-summary li{
  position:relative;
  padding-left:20px;
  font-size:clamp(.88rem,2.5vw,.96rem);
  line-height:1.55;
  color:var(--ink);
}
.kzl-summary li::before{
  content:"";
  position:absolute;
  left:2px;
  top:.62em;
  width:7px;
  height:7px;
  border-radius:50%;
  background:var(--acc3);
  box-shadow:0 0 10px var(--accglow);
}
.kzl-summary-note{
  margin:16px 0 0;
  font-size:.78rem;
  line-height:1.55;
  color:var(--dim);
}

.kzl-sec{
  padding-top:clamp(24px,4vw,36px);
  margin-top:clamp(24px,4vw,36px);
  border-top:1px solid var(--line);
  scroll-margin-top:100px;
}
.kzl-sec:first-of-type{border-top:0;margin-top:0;padding-top:0}
.kzl-sec h2{
  margin:0 0 14px;
  font-family:var(--font-display);
  font-weight:580;
  font-size:clamp(1.06rem,3vw,1.42rem);
  line-height:1.14;
  letter-spacing:-.032em;
  color:var(--ink);
}
.kzl-sec p{
  max-width:68ch;
  margin:0 0 14px;
  font-size:clamp(.9rem,2.5vw,1rem);
  line-height:1.72;
  color:var(--mut);
}
.kzl-sec p:last-child{margin-bottom:0}
.kzl-sec ul{
  max-width:68ch;
  list-style:none;
  margin:0 0 14px;
  padding:0;
  display:grid;
  gap:10px;
}
.kzl-sec li{
  position:relative;
  padding-left:22px;
  font-size:clamp(.88rem,2.5vw,.97rem);
  line-height:1.66;
  color:var(--mut);
}
.kzl-sec li::before{
  content:"";
  position:absolute;
  left:3px;
  top:.72em;
  width:9px;
  height:1px;
  background:var(--acc);
  opacity:.8;
}

/* Tables carry the retention and lawful-basis grids. Below 720px each row
   becomes a stacked block: a two-column table at 360px would set four
   characters to a line. */
.kzl-table{
  max-width:68ch;
  margin:0 0 14px;
  border:1px solid var(--line);
  border-radius:14px;
  overflow:hidden;
}
.kzl-table dl{margin:0}
.kzl-tr{
  display:grid;
  gap:4px 20px;
  padding:13px clamp(13px,2.4vw,17px);
  border-top:1px solid var(--line);
}
.kzl-tr:first-child{border-top:0}
.kzl-th{
  background:color-mix(in srgb,var(--card2) 70%,transparent);
}
.kzl-th dt,.kzl-th dd{
  font-family:var(--font-mono);
  font-size:.6rem;
  font-weight:500;
  letter-spacing:.16em;
  text-transform:uppercase;
  color:var(--dim);
}
.kzl-tr dt{
  margin:0;
  font-weight:560;
  font-size:.88rem;
  line-height:1.45;
  color:var(--ink);
}
.kzl-tr dd{
  margin:0;
  font-size:.86rem;
  line-height:1.6;
  color:var(--mut);
}
@media (min-width:720px){
  .kzl-tr{grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr);align-items:baseline}
}

.kzl-foot{
  margin-top:clamp(30px,5vw,48px);
  padding-top:20px;
  border-top:1px solid var(--line);
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:10px 22px;
}
.kzl-foot span{
  font-family:var(--font-mono);
  font-size:.64rem;
  letter-spacing:.13em;
  text-transform:uppercase;
  color:var(--dim);
}
.kzl-foot a{color:var(--acc3)}
@media (hover:hover){.kzl-foot a:hover{color:var(--ink)}}
`;

const HERO_KIND: Record<string, KzSpatialKind> = {
  terms: "layers",
  privacy: "lock",
  cookies: "database",
  refund: "chart",
};

export function KzLegal({ doc }: { doc: LegalDoc }) {
  const kind = HERO_KIND[doc.slug] ?? "shield";

  return (
    <div id="top" style={{ position: "relative" }}>
      <style href="kz-legal" precedence="default" dangerouslySetInnerHTML={{ __html: KZL_CSS }} />

      <KzPageHero eyebrow={doc.eyebrow} title={doc.title} lead={doc.lead} visual={kind} />

      <section
        style={{
          position: "relative",
          padding: "clamp(30px, 5vw, 52px) 0 clamp(70px, 10vw, 120px)",
          background: "var(--bg)",
        }}
      >
        <KzGridPattern cell={64} opacity={0.3} fade="center" />

        <div className="kz-wrap" style={{ position: "relative" }}>
          <div className="kzl">
            <nav className="kzl-toc" aria-label="On this page">
              <p className="kzl-toc-head">On this page</p>
              <ol>
                {doc.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.heading}</a>
                  </li>
                ))}
              </ol>

              <div className="kzl-shelf">
                {legalDocs.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/${entry.slug}`}
                    aria-current={entry.slug === doc.slug ? "page" : undefined}
                  >
                    <KzSpatialIcon3D
                      kind={HERO_KIND[entry.slug] ?? "shield"}
                      size={22}
                      float={false}
                      tone={entry.slug === doc.slug ? "cyan" : "blue"}
                    />
                    {entry.title}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="kzl-doc">
              <KzFadeUp>
                <div className="kzl-summary">
                  <div className="kzl-summary-head">
                    <KzSpatialIcon3D kind={kind} size={44} float={false} tone="violet" />
                    <span>In short</span>
                  </div>
                  <ul>
                    {doc.summary.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <p className="kzl-summary-note">
                    This summary is written for speed of reading and is not itself the agreement.
                    Where it and the numbered sections below differ, the sections govern.
                  </p>
                </div>
              </KzFadeUp>

              {doc.sections.map((section) => (
                <section key={section.id} id={section.id} className="kzl-sec">
                  <h2>{section.heading}</h2>
                  {section.blocks.map((block, index) => {
                    if (block.kind === "p") return <p key={index}>{block.text}</p>;
                    if (block.kind === "list") {
                      return (
                        <ul key={index}>
                          {block.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <div key={index} className="kzl-table">
                        <dl>
                          <div className="kzl-tr kzl-th">
                            <dt>{block.head[0]}</dt>
                            <dd>{block.head[1]}</dd>
                          </div>
                          {block.rows.map(([term, detail]) => (
                            <div key={term} className="kzl-tr">
                              <dt>{term}</dt>
                              <dd>{detail}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    );
                  })}
                </section>
              ))}

              <div className="kzl-foot">
                <span>Effective {LEGAL_EFFECTIVE}</span>
                <span>
                  {site.legalName} · Durgapur, West Bengal
                </span>
                <a href={`mailto:${site.email}?subject=${encodeURIComponent(doc.title)}`}>
                  {site.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
