/**
 * The site's section map, in one place.
 *
 * Four things used to describe this site's structure and they were all
 * maintained separately: the header's link list, the sitemap's route array,
 * the footer columns, and nothing at all for machines. They drifted — the
 * sitemap still listed routes with a URL shape the pages themselves had
 * stopped claiming as canonical.
 *
 * Everything structural now reads from here: sitemap.xml, the
 * SiteNavigationElement graph that feeds Google's sitelinks, the FAQ hub, and
 * llms.txt. `description` is not decoration — it is the line an answer engine
 * quotes when it has to say what a page is for, and the one-liner Google may
 * use under a sitelink.
 */

export type NavEntry = {
  name: string;
  /** Canonical path, no trailing slash. canonicalUrl() adds it. */
  path: string;
  /** One sentence. What a person would find here, in plain terms. */
  description: string;
  priority: number;
  changeFrequency: "weekly" | "monthly";
};

/** The sections a visitor is meant to find. Order is deliberate: it is the
    order of importance, and sitelink candidates are read from the top. */
export const primaryNav: NavEntry[] = [
  {
    name: "Home",
    path: "/",
    description:
      "Agentic AI, machine learning and custom software engineered in Durgapur and delivered worldwide.",
    priority: 1,
    changeFrequency: "weekly",
  },
  {
    name: "Services",
    path: "/services",
    description:
      "Eight services: AI agents, machine learning, LLM fine-tuning, voice AI, web and app development, adaptive UI/UX, enterprise software, and automation.",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    name: "Product Studio",
    path: "/product-studio",
    description:
      "Six systems Kenzed built and runs in production, including Kenzed LMS, Kenzed ERP, Kenzed CRM and CareerKing.",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    name: "Live Projects",
    path: "/live-projects",
    description:
      "The training programme that places people inside real delivery work rather than practice projects.",
    priority: 0.8,
    changeFrequency: "weekly",
  },
  {
    name: "About",
    path: "/about",
    description:
      "Why a 25-person AI engineering company is built in Durgapur, and what it is trying to prove.",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    name: "Contact",
    path: "/contact",
    description:
      "Reach the team by email, phone or WhatsApp. Replies within one business day.",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    name: "Technology",
    path: "/technology",
    description:
      "The full stack, eleven layers deep — languages, AI/ML, agent frameworks, vector stores, cloud, MLOps and security.",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    name: "Infrastructure",
    path: "/infrastructure",
    description:
      "In-house AI compute, 24x7 operations and a 99.98% uptime target on the systems Kenzed runs.",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    name: "Industries",
    path: "/industries",
    description:
      "The sectors these systems already run in, education and healthcare training deepest among them.",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    name: "Process",
    path: "/process",
    description:
      "How an idea becomes a system in production: scope, architect, build, evaluate.",
    priority: 0.6,
    changeFrequency: "monthly",
  },
  {
    name: "Team",
    path: "/team",
    description: "The 25 engineers, designers, testers and creators who do the work.",
    priority: 0.6,
    changeFrequency: "monthly",
  },
  {
    name: "FAQ",
    path: "/faq",
    description:
      "Direct answers about services, pricing, process, infrastructure, products and how to start.",
    priority: 0.7,
    changeFrequency: "monthly",
  },
];

/** Indexed on purpose. A legal shelf search engines cannot see is a trust
    signal nobody receives. */
/* NOT `legalNav` — content/legal.ts already exports a list under that name
   for the footer, and two same-named exports in different modules is exactly
   the import anyone gets wrong once. */
export const legalPages: NavEntry[] = [
  {
    name: "Terms & Conditions",
    path: "/terms",
    description: "The terms under which Kenzed Tech Lab supplies services.",
    priority: 0.3,
    changeFrequency: "monthly",
  },
  {
    name: "Privacy Policy",
    path: "/privacy",
    description: "What data kenzed.in collects, why, and how to have it removed.",
    priority: 0.3,
    changeFrequency: "monthly",
  },
  {
    name: "Cookie Policy",
    path: "/cookies",
    description: "What kenzed.in stores in a browser, and why.",
    priority: 0.2,
    changeFrequency: "monthly",
  },
  {
    name: "Refund Policy",
    path: "/refund",
    description: "Cancellation and refund terms for Kenzed Tech Lab engagements.",
    priority: 0.3,
    changeFrequency: "monthly",
  },
];

export const allNav: NavEntry[] = [...primaryNav, ...legalPages];
