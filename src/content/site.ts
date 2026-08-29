/**
 * Company-wide facts, navigation, and contact details.
 * Edit here to update every page at once.
 */

export const site = {
  name: "Kenzed Tech Lab",
  tagline: "Agentic AI · ML · Software",
  legalName: "Kenzed Tech Lab",
  description:
    "Premium agentic AI, machine learning and software development company engineering production-grade intelligent systems.",
  /** Public origin. Override with NEXT_PUBLIC_SITE_URL in .env.local. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kenzed.in",
  email: "kenzedTechlab@gmail.com",
  phone: "+91-7699001138",
  foundedTeamSize: 25,
} as const;

/* Every rendering of the number derives from `site.phone` so the digits live in
   exactly one place. `tel:` and wa.me want bare digits, the UI wants the spaced
   Indian grouping, and nothing else should be re-deriving either by hand. */
export const phoneDigits = site.phone.replace(/\D/g, "");
export const phoneDisplay = `+${phoneDigits.slice(0, 2)} ${phoneDigits.slice(2, 7)} ${phoneDigits.slice(7)}`;
export const phoneHref = `tel:+${phoneDigits}`;
export const waHref = (text: string) => `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`;
export const emailHref = `mailto:${site.email}`;

/* Anything under public/ referenced by a root-absolute path has to carry the
   base path itself. Next prefixes what it owns — its own chunks, and the
   generated manifest route — but a literal "/icon.svg" in metadata, in the
   manifest body or in an <Image src> is passed straight through, so on the
   GitHub Pages deployment (base path /Kenzed-Tech-Labs) every one of them
   resolved to the domain root and 404'd. The root-domain build leaves the
   variable empty, so this is a no-op there. */
/**
 * Verified public profiles for this company, and nothing else.
 *
 * These become Schema.org `sameAs`, which is the strongest entity-grounding
 * signal a site has: it is how a search engine and an LLM confirm that the
 * "Kenzed Tech Lab" on this domain is the same entity as the one on LinkedIn,
 * on GitHub, in Crunchbase. Without it the company is a name on a page that a
 * consumer has to disambiguate on string match alone, which is how one company
 * ends up indexed as several.
 *
 * It is EMPTY on purpose. Adding a URL here asserts "this profile is us", and
 * a guessed handle asserts it falsely — pointing the graph at someone else's
 * account, or at a 404 that makes the whole claim look unreliable. Every entry
 * must be a profile someone has actually opened and confirmed.
 *
 * This is the single highest-value line in the SEO surface still unfilled.
 */
export const socialProfiles: string[] = [
  // "https://www.linkedin.com/company/...",
  // "https://github.com/...",
  // "https://x.com/...",
];

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (path: string) => `${basePath}${path}`;

export type Location = {
  kind: string;
  city: string;
  street: string;
  postalCode: string;
  region: string;
  country: string;
};

export const locations: Location[] = [
  {
    kind: "Engineering Centre",
    city: "Durgapur",
    street: "Rajbandh",
    postalCode: "713212",
    region: "West Bengal",
    country: "IN",
  },
  {
    kind: "Liaison Office",
    city: "Kolkata",
    street: "Action Area 1, Tower 10, Sankalpa Newton",
    postalCode: "700156",
    region: "West Bengal",
    country: "IN",
  },
];
