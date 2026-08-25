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
  email: "kenzedtechlab@gmail.com",
  phone: "+91-7699002237",
  foundedTeamSize: 25,
} as const;

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
