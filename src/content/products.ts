/**
 * Product catalogue for /product-studio.
 *
 * Real products developed by Kenzed Tech Labs with live URLs, capabilities,
 * deliverables, technology stack, and indicative pricing tiers.
 */

import type { KzIconKey } from "@/components/kz/KzIcon";

export type ProductTier = {
  name: string;
  price: string;
  period: string;
  summary: string;
  features: string[];
  /** Exactly one tier per product carries the recommended flag. */
  highlight?: boolean;
};

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  liveUrl: string;
  displayUrl: string;
  icon: KzIconKey;
  category: string;
  badge?: string;
  highlights: string[];
  capabilities: string[];
  deliverables: string[];
  stack: string[];
  tiers: ProductTier[];
};

export const products: Product[] = [
  {
    slug: "kenzed-lms",
    name: "Kenzed LMS",
    tagline: "Intelligent Learning Management & Assessment Platform for Higher Education.",
    summary:
      "A complete next-generation LMS engineered for colleges, universities, and training institutes. Features automated grading, AI assignment analysis, interactive course delivery, student performance analytics, digital attendance tracking, and multi-department course administration.",
    liveUrl: "https://www.lms.shmedu.in",
    displayUrl: "www.lms.shmedu.in",
    icon: "ent",
    category: "EdTech & AI",
    badge: "AI-Powered LMS",
    highlights: ["AI Automated Grading", "Live WebRTC Classrooms", "Predictive Student Analytics", "Role-Based Portals"],
    capabilities: [
      "AI-assisted assessment and automated assignment evaluation with feedback",
      "Rich course delivery supporting video, documents, interactive code, and quizzes",
      "Student progress tracking and early-warning predictive academic analytics",
      "Live lecture scheduling with integrated WebRTC virtual classrooms",
      "Automated digital certificate generation and secure examination portal",
      "Dedicated role-based portals for faculty, students, parents, and HODs",
    ],
    deliverables: [
      "White-label multi-tenant LMS deployment on your cloud or on-premise infrastructure",
      "Custom domain setup (lms.yourinstitution.edu) with SSL, SSO, and OAuth2",
      "Student and faculty batch migration pipeline with SIS database integration",
      "Admin training, faculty onboarding workshops, and ongoing 24×7 technical SLA",
    ],
    stack: [
      "Next.js",
      "Python / FastAPI",
      "PostgreSQL",
      "Redis",
      "WebRTC",
      "Docker",
      "Tailwind CSS",
      "pgvector",
    ],
    tiers: [
      {
        name: "Department",
        price: "₹45,000",
        period: "per month",
        summary: "Single department or institute up to 1,000 active students.",
        features: [
          "Up to 1,000 active students and 50 faculty members",
          "Core LMS modules, video hosting, and quiz engine",
          "Automated grading and digital attendance",
          "Standard email and business-hours support",
        ],
      },
      {
        name: "Campus",
        price: "₹95,000",
        period: "per month",
        summary: "Full college campus with AI analytics and live classrooms.",
        features: [
          "Up to 5,000 students and unlimited faculty members",
          "AI-assisted grading, plagiarism check, and performance alerts",
          "WebRTC live classrooms with cloud recording",
          "Custom domain, SSO integration, and branded mobile app",
          "Dedicated account manager with 4-hour SLA",
        ],
        highlight: true,
      },
      {
        name: "University",
        price: "₹1,95,000",
        period: "per month",
        summary: "Multi-campus university system with sovereign data residency.",
        features: [
          "Unlimited students, faculty, and affiliated colleges",
          "On-premise deployment with sovereign database privacy",
          "Custom SIS/ERP connectors and multi-entity hierarchy",
          "24×7 dedicated engineer support with guaranteed 1-hour SLA",
        ],
      },
    ],
  },
  {
    slug: "shm-college-portal",
    name: "SHM College Portal & Voice AI",
    tagline: "Flagship Institutional Portal with Speech-Activated Interactive Voice Assistant.",
    summary:
      "Ultra-modern institutional web portal built for Subhas Bose Institute of Hotel Management. Powered by an intelligent, speech-activated voice AI assistant that converses naturally with prospective students, guides visitors through hospitality programs, answers fee queries, and captures qualified admissions leads in real time.",
    liveUrl: "https://www.shmedu.in",
    displayUrl: "www.shmedu.in",
    icon: "voice",
    category: "Voice AI & Web",
    badge: "Voice-Guided Portal",
    highlights: ["Speech-Activated Voice Guide", "Interactive Campus Tours", "Automated Lead Capture", "Sub-second LCP"],
    capabilities: [
      "Real-time speech-activated voice assistant that listens, talks, and guides visitors",
      "Interactive admissions navigator, fee calculator, and course eligibility checker",
      "Virtual campus tour and department showcase with 3D interactive visuals",
      "Automated prospect lead qualification with instant WhatsApp admissions handoff",
      "Real-time syllabus download, placement records, and recruiter directory",
      "Ultra-responsive mobile-first architecture engineered for high SEO rankings",
    ],
    deliverables: [
      "Fully customized, high-converting institutional web platform with responsive UI",
      "Embedded speech AI model tuned with the institution's complete knowledge base",
      "Admin lead console with call transcripts, visitor intent analytics, and CRM push",
      "Comprehensive SEO optimization, schema markup, and speed audits",
    ],
    stack: [
      "Next.js",
      "Whisper ASR",
      "Neural TTS",
      "Web Speech API",
      "Three.js",
      "FastAPI",
      "Tailwind CSS",
      "PostgreSQL",
    ],
    tiers: [
      {
        name: "Institutional Web",
        price: "₹1,20,000",
        period: "one-time",
        summary: "Modern institutional portal with premium responsive design.",
        features: [
          "Complete responsive website with up to 25 bespoke pages",
          "Dynamic department, faculty, and placement showcases",
          "Mobile-first touch UX and sub-second page speed",
          "Basic lead capture forms and WhatsApp integration",
        ],
      },
      {
        name: "Voice AI Edition",
        price: "₹2,40,000",
        period: "one-time",
        summary: "Full portal with embedded speech-activated conversational voice AI.",
        features: [
          "Everything in Institutional Web plus custom-trained Voice Assistant",
          "Natural speech recognition and audio synthesis in English and Hindi",
          "Conversational course navigator and automated lead qualification",
          "Transcripts dashboard and instant counselor WhatsApp alerts",
          "12 months of voice AI prompt tuning and maintenance",
        ],
        highlight: true,
      },
      {
        name: "Campus Network",
        price: "₹4,80,000",
        period: "one-time",
        summary: "Multi-branch institutional portal with omni-channel AI agents.",
        features: [
          "Multi-campus portal network with centralized content management",
          "Voice AI deployed on web, WhatsApp bot, and inbound telephony line",
          "Integrated application form with online payment gateway",
          "Dedicated support engineer with on-site rollout training",
        ],
      },
    ],
  },
  {
    slug: "kenzed-erp",
    name: "Kenzed ERP",
    tagline: "Multi-College Cloud ERP with Adaptive UI/UX & Embedded AI Intelligence.",
    summary:
      "Robust, multi-tenant SaaS Enterprise Resource Planning platform for educational trusts and multi-campus institutions. Unifies student admissions, automated fee management, HR & payroll, inventory, hostel, library, and examination systems under one frictionless, adaptive interface with predictive intelligence.",
    liveUrl: "https://www.erp.kenzed.in",
    displayUrl: "www.erp.kenzed.in",
    icon: "ent",
    category: "Enterprise SaaS",
    badge: "Multi-Campus Cloud ERP",
    highlights: ["Multi-Entity Management", "Automated Fee Invoicing", "Biometric / RFID Attendance", "Adaptive UI/UX"],
    capabilities: [
      "Multi-campus and multi-entity centralized trust administration",
      "Automated fee collection, instalment plans, invoicing, and payment gateway sync",
      "Biometric and RFID attendance integration with automated parent SMS/WhatsApp alerts",
      "AI-driven fee default prediction, cash-flow forecasting, and budget analytics",
      "Faculty workload allocation, biometric payroll, and performance appraisal",
      "Adaptive, clutter-free user experience with customizable department workflows",
    ],
    deliverables: [
      "Multi-tenant cloud ERP instance configured for your trust's campus structure",
      "Full historical data migration from legacy spreadsheets, databases, or older ERPs",
      "Role-based access controls for Trustees, Principals, Accountants, and Staff",
      "Daily automated offsite encrypted backups and 99.98% uptime SLA guarantee",
    ],
    stack: [
      "Next.js",
      "NestJS",
      "PostgreSQL",
      "Redis",
      "GraphQL",
      "Docker",
      "Kubernetes",
      "Tailwind CSS",
    ],
    tiers: [
      {
        name: "Single Campus",
        price: "₹65,000",
        period: "per month",
        summary: "Complete ERP modules for a standalone college up to 2,000 students.",
        features: [
          "Admissions, Fee Accounting, Attendance, and Examination modules",
          "Up to 2,000 students and 150 staff members",
          "Payment gateway integration and SMS/WhatsApp notifications",
          "Standard data backups and business-hours support",
        ],
      },
      {
        name: "Trust / Multi-Campus",
        price: "₹1,45,000",
        period: "per month",
        summary: "Centralized multi-college ERP for educational trusts up to 10 campuses.",
        features: [
          "Centralized dashboard across all colleges and institutions",
          "Consolidated financial reporting, audit logs, and tax invoicing",
          "HR & biometric payroll, inventory management, and transport routing",
          "AI predictive fee collection and revenue analytics",
          "Dedicated implementation manager and 2-hour SLA",
        ],
        highlight: true,
      },
      {
        name: "Sovereign Cloud",
        price: "₹2,85,000",
        period: "per month",
        summary: "Dedicated private instance on private GPU/VPC infrastructure.",
        features: [
          "Unlimited campuses, students, and administrative staff",
          "Deployed inside your private cloud or dedicated on-premise hardware",
          "Custom bespoke module engineering and ERP customizations",
          "24×7 high-priority support with on-site quarterly reviews",
        ],
      },
    ],
  },
  {
    slug: "ani-dgp-nursing",
    name: "ANI DGP Nursing College & Voice AI",
    tagline: "Premier Healthcare Education Portal with Conversational Voice Guidance.",
    summary:
      "A cutting-edge digital presence engineered for ANI College of Nursing (Durgapur). Features fluid micro-animations, high-end healthcare aesthetics, mobile-first touch ergonomics, and an interactive voice assistant that speaks with prospective students about nursing curricula, clinical rotations, and admissions requirements.",
    liveUrl: "https://www.anidgp.in",
    displayUrl: "www.anidgp.in",
    icon: "voice",
    category: "Voice AI & Web",
    badge: "Healthcare & Voice AI",
    highlights: ["Interactive Voice Guidance", "Clinical Rotations Viewer", "Mobile-First Touch Ergonomics", "Online Application"],
    capabilities: [
      "Speech-activated voice assistant for nursing program guidance and admissions info",
      "Interactive clinical training and affiliated hospital directory with map guides",
      "Online application submission, document upload, and eligibility verification portal",
      "Fluid 60fps micro-animations with lightweight 3D healthcare spatial graphics",
      "Sub-second page load times optimized for 4G/5G mobile touch users",
      "Direct WhatsApp admissions helpline integration with automated greeting",
    ],
    deliverables: [
      "Complete bespoke web portal with healthcare-grade aesthetic and mobile UX",
      "Custom-trained conversational voice AI tuned for nursing admissions",
      "Admissions management console with instant prospect notification alerts",
      "Full SEO optimization, schema markup, and speed audits",
    ],
    stack: [
      "Next.js",
      "Three.js",
      "Web Audio API",
      "Neural TTS",
      "FastAPI",
      "Tailwind CSS",
      "Framer Motion",
      "PostgreSQL",
    ],
    tiers: [
      {
        name: "Standard Portal",
        price: "₹95,000",
        period: "one-time",
        summary: "Bespoke nursing college website with mobile-first UI.",
        features: [
          "Mobile-first responsive portal with course and hospital showcases",
          "Online application form with document upload",
          "WhatsApp helpline and Google Maps integration",
          "Complete SEO setup and lightning-fast loading",
        ],
      },
      {
        name: "Voice AI Edition",
        price: "₹1,85,000",
        period: "one-time",
        summary: "Full portal with embedded speech-activated voice admissions counselor.",
        features: [
          "Everything in Standard Portal plus speech-activated Voice AI Counselor",
          "Trained on nursing syllabus, INC guidelines, and clinical training schedules",
          "Automated lead capture with instant counselor mobile push",
          "12 months of voice model maintenance and knowledge base updates",
        ],
        highlight: true,
      },
      {
        name: "Healthcare Network",
        price: "₹3,50,000",
        period: "one-time",
        summary: "Multi-institution healthcare trust portal with hospital integrations.",
        features: [
          "Integrated portal for nursing college, pharmacy institute, and hospital",
          "Omni-channel voice and chat AI assistants across web and telephony",
          "Online entrance exam and interview scheduling module",
          "Dedicated technical support with guaranteed uptime SLA",
        ],
      },
    ],
  },
  {
    slug: "kenzed-crm",
    name: "Kenzed CRM",
    tagline: "Clean, Clutter-Free & Fun-to-Use CRM for High-Velocity Sales & Admissions.",
    summary:
      "A delightfully simple yet deeply capable CRM designed to eliminate spreadsheet chaos. Built for both corporate sales teams and college admissions offices, Kenzed CRM automates lead capture, visualizes deal pipelines, routes WhatsApp & call enquiries, and tracks team productivity without complex onboarding.",
    liveUrl: "https://crm.kenzed.in",
    displayUrl: "crm.kenzed.in",
    icon: "util",
    category: "Enterprise SaaS",
    badge: "Zero-Clutter CRM",
    highlights: ["Visual Kanban Pipelines", "Omni-Channel Lead Capture", "One-Click WhatsApp Messaging", "No-Bloat UI"],
    capabilities: [
      "Visual drag-and-drop Kanban pipelines for sales deals and admissions stages",
      "Multi-channel lead ingestion (Website forms, WhatsApp, Meta Ads, Google Ads, Phone)",
      "Automated follow-up reminders, task assignments, and one-click WhatsApp messaging",
      "Team performance metrics, conversion rates, response times, and lead aging analytics",
      "Custom form builder with embeddable lead capture widgets for any website",
      "Zero-clutter, lightning-fast user interface designed to be intuitive on day one",
    ],
    deliverables: [
      "Dedicated CRM instance customized to your sales or admissions pipeline stages",
      "Webhook and API integrations for Meta Ads, Google Ads, and external web forms",
      "Team onboarding training session and role-based permissions configuration",
      "Cloud hosting with automated daily backups, SSL, and data privacy security",
    ],
    stack: [
      "Next.js",
      "FastAPI",
      "PostgreSQL",
      "Redis",
      "WhatsApp Cloud API",
      "Tailwind CSS",
      "Docker",
    ],
    tiers: [
      {
        name: "Starter Team",
        price: "₹25,000",
        period: "per month",
        summary: "For small teams up to 5 users managing active leads.",
        features: [
          "Up to 5 team users and 5,000 active leads",
          "Visual Kanban pipeline and contact management",
          "Website form webhook and email notifications",
          "Standard analytics and CSV export",
        ],
      },
      {
        name: "Growth",
        price: "₹55,000",
        period: "per month",
        summary: "For growing sales teams and college admissions offices up to 20 users.",
        features: [
          "Up to 20 team users and 25,000 active leads",
          "WhatsApp Cloud API integration with one-click direct messaging",
          "Meta Ads and Google Ads automatic lead sync",
          "Automated follow-up reminders and lead distribution rules",
          "Comprehensive conversion reporting and manager dashboards",
        ],
        highlight: true,
      },
      {
        name: "Enterprise",
        price: "₹1,15,000",
        period: "per month",
        summary: "Unlimited users, multiple branch pipelines, and custom API integrations.",
        features: [
          "Unlimited team users and unlimited lead storage",
          "Multi-branch and multi-department isolated pipelines",
          "Custom telephony and IVR integration with call recording links",
          "Dedicated account engineer with 1-hour response SLA",
        ],
      },
    ],
  },
  {
    slug: "careerking",
    name: "CareerKing.in",
    tagline: "Dedicated Employment & Higher Education Discovery Network.",
    summary:
      "A high-traffic job and higher-education discovery marketplace connecting ambitious students and job seekers with top colleges and hiring employers. Features AI resume parsing, candidate skill-matching algorithms, college comparison tools, and an intuitive employer hiring dashboard.",
    liveUrl: "https://careerking.in",
    displayUrl: "careerking.in",
    icon: "ml",
    category: "Portals & Platforms",
    badge: "Jobs & Education Portal",
    highlights: ["AI Resume Matching", "College & Course Directory", "Recruiter Dashboard", "100k+ Concurrency"],
    capabilities: [
      "AI-powered resume matching and personalized job recommendation engine",
      "Comprehensive college and course discovery directory with ranking comparisons",
      "Employer recruiter dashboard with applicant screening and status tracking",
      "Direct application tracking, exam notification alerts, and interview scheduling",
      "Verified institutional placement records and industry salary benchmarks",
      "High-concurrency infrastructure engineered to handle 100,000+ monthly active visitors",
    ],
    deliverables: [
      "Multi-sided marketplace portal with candidate, recruiter, and college dashboards",
      "High-speed Elasticsearch-powered search and filtering engine",
      "Integrated payment gateway for featured job postings and premium listings",
      "Automated WhatsApp job alerts and candidate notification newsletters",
    ],
    stack: [
      "Next.js",
      "Python",
      "Elasticsearch",
      "PostgreSQL",
      "Redis",
      "AWS",
      "Docker",
      "Tailwind CSS",
    ],
    tiers: [
      {
        name: "Portal Solution",
        price: "₹1,80,000",
        period: "one-time",
        summary: "Complete job or education directory portal with search and listings.",
        features: [
          "Full marketplace platform with candidate and employer accounts",
          "Elasticsearch search engine with location and category filters",
          "Payment gateway for paid listings and banner promotions",
          "Mobile-responsive UI with sub-second page speed",
        ],
      },
      {
        name: "AI Matching Edition",
        price: "₹3,40,000",
        period: "one-time",
        summary: "Marketplace platform with embedded AI resume parser and skill matcher.",
        features: [
          "Everything in Portal Solution plus AI resume parsing engine",
          "Automated candidate skill matching and job recommendations",
          "WhatsApp notification engine for instant candidate alerts",
          "Recruiter candidate screening and interview scheduling tools",
          "12 months of tuning, hosting architecture, and support",
        ],
        highlight: true,
      },
      {
        name: "Enterprise Network",
        price: "₹6,80,000",
        period: "one-time",
        summary: "State or national-scale employment and education network.",
        features: [
          "High-availability autoscaling cluster architecture on AWS/GCP",
          "Multi-state regional portal subdomains with localized content",
          "Government / university verification API integrations",
          "24×7 server monitoring with guaranteed 99.99% uptime SLA",
        ],
      },
    ],
  },
];

/** Filter chips for the catalogue, in first-appearance order. */
export const productCategories: string[] = Array.from(new Set(products.map((p) => p.category)));
