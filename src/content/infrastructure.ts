/** Facility and infrastructure content for / and /infrastructure. */

export type InfraItem = { icon: string; title: string; description: string };

/** Rendered as a wide gradient tile at the top of the infrastructure grid. */
export const facilityHighlight = {
  value: "15,000",
  caption:
    "sq ft dedicated development & studio facility, purpose-built for round-the-clock engineering.",
};

export const infraItems: InfraItem[] = [
  {
    icon: "bed",
    title: "Staff Accommodation",
    description: "On-site residential accommodation supporting 24×7 shifts and visiting teams.",
  },
  {
    icon: "food",
    title: "In-House Canteen",
    description: "A canteen and cafeteria serving the team through every shift.",
  },
  {
    icon: "power",
    title: "24×7 Power Supply",
    description:
      "Uninterrupted power — dual-source grid, diesel generator backup & UPS/battery, N+1 redundancy.",
  },
  {
    icon: "gpu",
    title: "In-House AI Compute",
    description:
      "On-premise GPU workstations & servers (NVIDIA RTX / data-center GPUs) for training & private inference.",
  },
  {
    icon: "hw",
    title: "Full Hardware Stack",
    description:
      "High-core CPU workstations, a dedicated testing/QA lab, networking, and NAS/SAN storage.",
  },
  {
    icon: "sw",
    title: "Full Software Stack",
    description: "Licensed IDEs, design suites, cloud subscriptions, CI/CD, and security tooling.",
  },
  {
    icon: "net",
    title: "Redundant Connectivity",
    description:
      "High-speed internet with leased-line and automatic failover for always-on delivery.",
  },
  {
    icon: "studio",
    title: "Media & Voice Studio",
    description: "A dedicated studio for media, PR, and voice/audio recording.",
  },
  {
    icon: "sec",
    title: "24×7 Security",
    description: "Physical security, CCTV surveillance, and biometric access control.",
  },
  {
    icon: "cont",
    title: "Business Continuity",
    description: "Backup power, data backups, and disaster-recovery readiness for uninterrupted delivery.",
  },
];

/** Client-facing benefits, listed on /infrastructure. */
export const infraBenefits = [
  {
    title: "Private & sovereign AI",
    description:
      "Run sensitive models and data on hardware we control, within your compliance boundary.",
  },
  {
    title: "Always-on delivery",
    description:
      "24×7 power, connectivity, and on-site teams keep projects moving across time zones.",
  },
  {
    title: "Real compute",
    description:
      "In-house GPUs mean faster training, fine-tuning, and inference without cloud lock-in.",
  },
  {
    title: "Reliability",
    description: "Redundancy across power, network, and storage protects your timelines and data.",
  },
];
