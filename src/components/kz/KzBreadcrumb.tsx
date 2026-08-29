/**
 * The breadcrumb trail, visible and in the graph.
 *
 * Twenty-four pages already emitted BreadcrumbList JSON-LD with nothing on the
 * page to back it. That is the weaker half of the pair: Google's own guidance
 * is that the markup should describe a trail the reader can see, and a trail
 * that exists only in a script tag is markup describing something that is not
 * there. It is also a wasted internal link — a crawler following breadcrumbs
 * up from a service page is how the /services hub accumulates the authority
 * that makes it a sitelink candidate.
 *
 * Server component, no JavaScript. It renders above the page hero and is
 * deliberately quiet: this is wayfinding and a crawl path, not a feature.
 */

import Link from "next/link";

import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema, canonicalUrl } from "@/lib/seo";

const KZ_CRUMB_CSS = `
.kzcrumb{
  padding-top:clamp(84px,11vh,116px);
  padding-bottom:0;
  background:var(--bg);
}
.kzcrumb-list{
  display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;
  margin:0;padding:0;list-style:none;
  font-family:var(--font-mono);
  font-size:.66rem;letter-spacing:.13em;text-transform:uppercase;
  color:var(--dim);
}
.kzcrumb-list li{display:inline-flex;align-items:center;gap:8px}
.kzcrumb-list a{color:var(--dim);text-decoration:none;transition:color 200ms var(--ease)}
.kzcrumb-list a:hover{color:var(--acc)}
.kzcrumb-sep{opacity:.45}
/* The last crumb is the current page: not a link, and not competing with the
   h1 below it for attention. */
.kzcrumb-here{color:var(--mut)}

@media (max-width:520px){
  .kzcrumb{padding-top:clamp(72px,10vh,96px)}
  .kzcrumb-list{font-size:.61rem;letter-spacing:.1em}
}
`;

export type Crumb = { name: string; path: string };

export function KzBreadcrumb({ trail }: { trail: Crumb[] }) {
  if (trail.length < 2) return null;
  const here = trail[trail.length - 1];

  return (
    <nav className="kzcrumb" aria-label="Breadcrumb">
      <style
        href="kz-breadcrumb"
        precedence="default"
        dangerouslySetInnerHTML={{ __html: KZ_CRUMB_CSS }}
      />
      {/* The @id lets the page's WebPage node point AT this trail rather than
          restating it, which is what makes the two one graph instead of two
          unrelated blocks that happen to describe the same page. */}
      <JsonLd
        data={{
          ...breadcrumbSchema(trail),
          "@id": `${canonicalUrl(here.path)}#breadcrumb`,
        }}
      />
      <div className="kz-wrap">
        <ol className="kzcrumb-list">
          {trail.map((crumb, index) => {
            const last = index === trail.length - 1;
            return (
              <li key={crumb.path}>
                {last ? (
                  <span className="kzcrumb-here" aria-current="page">
                    {crumb.name}
                  </span>
                ) : (
                  <>
                    <Link href={crumb.path === "/" ? "/" : `${crumb.path}/`}>{crumb.name}</Link>
                    <span className="kzcrumb-sep" aria-hidden="true">
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
