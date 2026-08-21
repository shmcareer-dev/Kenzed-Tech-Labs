import type { Metadata } from "next";

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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

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

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
