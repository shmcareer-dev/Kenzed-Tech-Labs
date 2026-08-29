import type { Metadata } from "next";

import { LEGAL_ISO } from "@/content/legal";
import { allNav } from "@/content/nav";
import { locations, site, socialProfiles } from "@/content/site";

/**
 * The canonical absolute URL for a route.
 *
 * `trailingSlash` is on in next.config.ts, so Next writes every internal href,
 * canonical tag and og:url with a trailing slash of its own accord. Anything
 * that assembles a URL by hand — the sitemap, the breadcrumb and document
 * JSON-LD — has to agree with it. When it did not, the sitemap advertised
 * `/technology` while the page itself claimed `/technology/` as canonical: two
 * spellings of one page for a crawler to reconcile, and a redirect on the way
 * in to every URL the sitemap lists.
 */
export function canonicalUrl(path: string): string {
  const url = new URL(path, site.url);
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url.toString();
}

/**
 * Per-page metadata helper.
 *
 * Every page calls this so canonical URLs, Open Graph and Twitter cards stay
 * consistent — pass only what differs.
 */
export function pageMetadata({
  title,
  description,
  path,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const url = canonicalUrl(path);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      type: "website",
      locale: "en_IN",
      images: [OG_IMAGE],
    },
    twitter: {
      /* summary_large_image was already declared, but with no image behind it
         — so every share of this site rendered as a bare grey card. */
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

/** The share card, rendered to public/og.png from the brand lockup. */
export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.tagline}`,
};

/**
 * Stable @ids for the two entities every other node points at.
 *
 * Without these, each page emits an Organization that a consumer has to guess
 * is the same Organization as the one on the last page — matched on a name
 * string, which is exactly how "Kenzed Tech Lab" ends up as several different
 * companies in an index. With them the whole site is one connected graph:
 * every WebPage declares isPartOf the WebSite and about the Organization, and
 * every Service and Product declares the same provider node.
 *
 * The fragment form (#organization) is the convention, and it matters that
 * these never change — an @id is an identifier, so editing one severs every
 * reference to it.
 */
export const ORG_ID = `${site.url}/#organization`;
export const SITE_ID = `${site.url}/#website`;

/** A reference to the org node rather than a second copy of it. */
export const orgRef = { "@id": ORG_ID };

/** Organization + LocalBusiness graph, emitted once in the root layout. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    alternateName: "Kenzed",
    slogan: site.tagline,
    /* logo and image are distinct in Schema.org and consumers use them
       differently: logo is the mark shown beside a knowledge-panel result,
       image is the picture used when one is needed. Google requires logo to
       be reachable and non-SVG-only, so the raster share card is given as the
       image and the SVG mark as the logo. */
    logo: {
      "@type": "ImageObject",
      url: new URL("/icon.svg", site.url).toString(),
      contentUrl: new URL("/icon.svg", site.url).toString(),
    },
    image: new URL(OG_IMAGE.url, site.url).toString(),
    description: site.description,
    url: site.url,
    email: site.email,
    telephone: site.phone,
    areaServed: "Worldwide",
    numberOfEmployees: String(site.foundedTeamSize),
    address: postalAddress(0),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: site.phone,
      email: site.email,
      contactType: "sales",
      areaServed: "IN",
    },
    location: locations.map((location, index) => ({
      "@type": "Place",
      name: location.kind,
      address: postalAddress(index),
    })),
    /* knowsAbout is how an answer engine decides whether this company is
       relevant to a question at all, so it names the actual competences
       rather than three buzzwords. Every entry corresponds to something the
       site has a page or a service about — a claim of expertise with nothing
       behind it is the kind of thing that gets a site demoted, not surfaced. */
    knowsAbout: [
      "Agentic AI",
      "AI agent development",
      "Multi-agent systems",
      "Retrieval-augmented generation",
      "Model Context Protocol",
      "Machine learning engineering",
      "LLM fine-tuning",
      "LLMOps",
      "Voice AI",
      "Conversational assistants",
      "Web application development",
      "Adaptive UI/UX design",
      "Enterprise software engineering",
      "Software automation",
      "College ERP software",
      "Learning management systems",
    ],
    /* sameAs is the strongest entity-grounding signal there is: it is how a
       search engine or an LLM confirms that this Kenzed Tech Lab is the same
       one it has seen elsewhere. It is EMPTY because this codebase contains no
       verified profile URL for the company, and inventing one would assert an
       identity we cannot prove. Populate it from site.ts the moment real
       LinkedIn / X / GitHub / Crunchbase URLs exist — it is the single highest
       -value line in this file. */
    ...(socialProfiles.length ? { sameAs: socialProfiles } : {}),
  };
}

/**
 * A page, as a node in the site graph.
 *
 * Every page gets one. It is what ties a URL to the site and to the company:
 * without it each page is an orphan document that happens to share a domain,
 * and a consumer has no structural reason to attribute its content to Kenzed
 * Tech Lab at all.
 */
export function webPageSchema({
  title,
  description,
  path,
  breadcrumb,
  dateModified,
}: {
  title: string;
  description: string;
  path: string;
  breadcrumb?: boolean;
  dateModified?: string;
}) {
  const url = canonicalUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: "en-IN",
    isPartOf: { "@id": SITE_ID },
    about: orgRef,
    publisher: orgRef,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: new URL(OG_IMAGE.url, site.url).toString(),
    },
    ...(breadcrumb ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
    ...(dateModified ? { dateModified } : {}),
  };
}

/** The eight services as one list, so the set is legible as a set. */
export function serviceListSchema(
  items: { slug: string; title: string; short: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${site.name} services`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: item.title,
        description: item.short,
        url: canonicalUrl(`/services/${item.slug}`),
        provider: orgRef,
        areaServed: ["India", "Worldwide"],
      },
    })),
  };
}

function postalAddress(index: number) {
  const location = locations[index];

  return {
    "@type": "PostalAddress",
    streetAddress: location.street,
    addressLocality: location.city,
    postalCode: location.postalCode,
    addressRegion: location.region,
    addressCountry: location.country,
  };
}

/** Service schema for each /services/[slug] page. */
export function serviceSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: { "@type": "Organization", name: site.name, url: site.url },
    areaServed: ["India", "Worldwide"],
    url: canonicalUrl(path),
  };
}

/** A legal document. `dateModified` is what search engines surface next to a
    policy result, and it is the one fact a reader checks first. */
export function legalPageSchema(doc: {
  slug: string;
  title: string;
  metaDescription: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: doc.title,
    description: doc.metaDescription,
    url: canonicalUrl(`/${doc.slug}`),
    inLanguage: "en",
    dateModified: LEGAL_ISO,
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
    publisher: { "@type": "Organization", name: site.legalName, url: site.url },
  };
}

/** The product shelf as an ItemList of real, reachable applications. */
export function productCatalogSchema(
  items: { slug: string; name: string; tagline: string; summary: string; liveUrl: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${site.name} products`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareApplication",
        name: item.name,
        description: item.summary,
        url: item.liveUrl,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        author: { "@type": "Organization", name: site.legalName, url: site.url },
      },
    })),
  };
}

/** Breadcrumbs strengthen site-structure signals on inner pages. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: canonicalUrl(crumb.path),
    })),
  };
}

/**
 * FAQPage. This is the one piece of structured data on the site that a search
 * engine will render verbatim, and every LLM that cites a source reads it, so
 * the text has to be the SAME text the page shows. Emitting an answer here
 * that a visitor cannot find on the page is cloaking, and Google treats it as
 * such.
 *
 * One FAQPage per page. Two blocks both claiming to be the page's FAQ is
 * invalid and the usual outcome is that neither is used.
 */
export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/**
 * The site as an entity, emitted once in the root layout.
 *
 * No `potentialAction` SearchAction here on purpose: Google retired the
 * sitelinks search box in 2024 and the markup now does nothing but add weight.
 * Sitelinks are earned from structure — a clean sitemap, stable internal
 * anchor text, and the navigation graph below — not from a declaration.
 */
export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    alternateName: "Kenzed",
    url: site.url,
    description: site.description,
    inLanguage: "en",
    publisher: { "@type": "Organization", name: site.legalName, url: site.url },
  };
}

/**
 * The primary navigation, as a graph rather than as a list of links buried in
 * a header that only exists after hydration. This is the input Google uses
 * when deciding which pages deserve to appear as sitelinks under the main
 * result, and it is the cheapest signal on this page to get right.
 */
export function siteNavigationSchema(
  links: { name: string; path: string; description?: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${site.name} — site navigation`,
    itemListElement: links.map((link, index) => ({
      "@type": "SiteNavigationElement",
      position: index + 1,
      name: link.name,
      description: link.description,
      url: canonicalUrl(link.path),
    })),
  };
}

/**
 * The WebPage node for one of the site's own sections, looked up by path.
 *
 * Pages call this rather than restating their own title and description a
 * second time: those already live in content/nav.ts, which is the same list
 * the sitemap and the navigation graph read. Restating them per page is how
 * the sitemap ended up advertising a URL shape the pages had stopped claiming.
 */
export function webPageSchemaFor(path: string) {
  const entry = allNav.find((nav) => nav.path === path);
  if (!entry) return null;
  return webPageSchema({
    title: entry.name === "Home" ? site.name : `${entry.name} — ${site.name}`,
    description: entry.description,
    path: entry.path,
    breadcrumb: entry.path !== "/",
  });
}
