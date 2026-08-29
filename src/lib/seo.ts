import type { Metadata } from "next";

import { LEGAL_ISO } from "@/content/legal";
import { locations, site } from "@/content/site";

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

/** Organization + LocalBusiness graph, emitted once in the root layout. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
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
    knowsAbout: [
      "Agentic AI",
      "Machine Learning",
      "LLM Fine-Tuning",
      "Voice AI",
      "Software Development",
    ],
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
