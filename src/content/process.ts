/** Delivery process timeline for / and /process. */

export type ProcessStep = {
  number: string;
  title: string;
  /** Short line for the homepage timeline. */
  description: string;
  /** Fuller explanation for the /process page. */
  detail: string;
};

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Discovery & Strategy",
    description: "Goals, success metrics, feasibility, and scope.",
    detail:
      "We define what success looks like before writing code — business goals, measurable outcomes, technical feasibility, data readiness, and a scope both sides agree on.",
  },
  {
    number: "02",
    title: "Design & Architecture",
    description: "UX, data, and system architecture — secure by design.",
    detail:
      "User experience, data models, and system architecture are designed together, with security, privacy, and observability considered from the first diagram rather than retrofitted.",
  },
  {
    number: "03",
    title: "Development",
    description: "Agile sprints with regular working demos.",
    detail:
      "We build in short sprints and demo working software throughout, so you see real progress and can steer direction long before launch.",
  },
  {
    number: "04",
    title: "Testing & QA",
    description: "Automated & manual testing, evaluation, hardening.",
    detail:
      "Automated test suites, manual QA, model evaluation harnesses, and security hardening run continuously — not as a phase bolted on at the end.",
  },
  {
    number: "05",
    title: "Deployment",
    description: "Secure release to cloud or on-premise via CI/CD.",
    detail:
      "Release to your cloud or to our on-premise infrastructure through CI/CD pipelines, with infrastructure as code, staged rollouts, and rollback paths.",
  },
  {
    number: "06",
    title: "Support & Optimize",
    description: "Monitoring, iteration, continuous improvement.",
    detail:
      "Live systems are monitored for performance, cost, and model drift — and improved on an agreed cadence so the product keeps getting better after launch.",
  },
];
