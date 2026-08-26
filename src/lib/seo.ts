import type { Metadata } from "next";

import { LEGAL_ISO } from "@/content/legal";
import { locations, site } from "@/content/site";

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
  const url = new URL(path, site.url).toString();

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
    url: new URL(path, site.url).toString(),
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
    url: new URL(`/${doc.slug}`, site.url).toString(),
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
      item: new URL(crumb.path, site.url).toString(),
    })),
  };
}
