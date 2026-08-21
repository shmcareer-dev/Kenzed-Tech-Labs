/** Team disciplines — shown on / and /team. */

export type Discipline = { title: string; description: string };

export const disciplines: Discipline[] = [
  {
    title: "AI / ML Engineering",
    description: "Agent design, model development, fine-tuning, and MLOps.",
  },
  {
    title: "UI / UX Design",
    description: "Research, adaptive interface design, and design systems.",
  },
  {
    title: "Software Testing & QA",
    description: "Automated and manual testing for reliability and performance.",
  },
  {
    title: "PR & Communications",
    description: "Brand, content, and client communication.",
  },
  {
    title: "Studio Management",
    description: "Creative production, media, and voice/audio work.",
  },
  {
    title: "Hardware Maintenance",
    description: "In-house upkeep of compute, networking, and infrastructure.",
  },
];
