/** Industries served — shown on / and /industries. */

export type Industry = {
  /** Key into the ICONS map in components/ui/icons.tsx */
  icon: string;
  title: string;
  description: string;
};

export const industries: Industry[] = [
  {
    icon: "education",
    title: "Education & EdTech",
    description: "AI tutors, adaptive learning, and education agents.",
  },
  {
    icon: "enterprise",
    title: "Enterprise",
    description: "Workflow automation, internal copilots, and modernization.",
  },
  {
    icon: "startup",
    title: "Startups",
    description: "Rapid MVPs and scalable AI products built to raise and grow.",
  },
  {
    icon: "health",
    title: "Healthcare",
    description: "Clinical documentation, imaging, and decision support.",
  },
  {
    icon: "retail",
    title: "Retail & E-commerce",
    description: "Recommendations, search, and conversational commerce.",
  },
  {
    icon: "finance",
    title: "Finance & Fintech",
    description: "Fraud detection, risk modeling, and document intelligence.",
  },
  {
    icon: "manufacturing",
    title: "Manufacturing",
    description: "Computer-vision inspection and predictive maintenance.",
  },
  {
    icon: "public",
    title: "Public Sector",
    description: "Citizen services, multilingual voice, and sovereign AI.",
  },
];
