/**
 * Content shaped for the Kenzed Tech Lab.dc.html redesign.
 * Kept separate from the legacy content files so the new components have a
 * single, predictable data contract.
 */

import type { KzIconKey } from "@/components/kz/KzIcon";
import type { KzLifecycleStageDetail } from "@/components/kz/KzLifecycleRing";
import type { KzGraphCardSpec, KzStoryCard } from "@/components/kz/KzShowcase";

export type KzService = {
  icon: KzIconKey;
  title: string;
  short: string;
  intro: string;
  deliverables: string[];
  stack: [string, string][];
  cmd: string;
};

export const kzServices: KzService[] = [
  {
    icon: "agent",
    title: "Custom AI Agents & Agentic AI",
    short:
      "Autonomous, multi-agent systems that reason, plan, use tools, and complete real tasks — from education agents to workflow automation and customer experience.",
    intro:
      "We design and deploy autonomous AI agents that reason, plan, use tools, and complete real tasks — moving your organization from chatbots that answer to agents that act. From single-purpose assistants to coordinated multi-agent systems, we build agentic software with the guardrails, memory, and observability that production demands.",
    deliverables: [
      "Custom AI agents for education, workflow automation, research, and customer experience",
      "Multi-agent orchestration with task decomposition and specialized sub-agents",
      "Retrieval-augmented generation (RAG) grounded in your private knowledge base",
      "Tool use / function calling and Model Context Protocol (MCP) integrations to your systems",
      "Long-term memory, human-in-the-loop approval, and safety guardrails",
      "Evaluation, tracing, and observability for reliable, auditable behavior",
    ],
    stack: [
      ["Frameworks", "LangChain, LangGraph, LlamaIndex, CrewAI, AutoGen, Model Context Protocol (MCP)"],
      ["Retrieval / memory", "Vector databases — Pinecone, Weaviate, Milvus, pgvector, FAISS; hybrid & semantic search"],
      ["Models", "OpenAI, Anthropic Claude, Google Gemini, Llama, Mistral, Qwen — plus private/self-hosted"],
      ["Reliability", "Guardrails, evaluation harnesses, tracing/observability, human-in-the-loop checkpoints"],
      ["Governance", "Bounded permissions, decision logging, sandboxing, compliance-first architecture"],
    ],
    cmd: "deploy --service ai-agents --guardrails on",
  },
  {
    icon: "ml",
    title: "Machine Learning & Data Science",
    short:
      "ML-implemented software that turns data into predictions, classifications, and recommendations — deployed and monitored as a dependable production service.",
    intro:
      "We build ML-implemented software that turns raw data into predictions, classifications, and recommendations — then deploy and monitor it as a dependable production service. From computer vision to forecasting, our models are engineered for accuracy, explainability, and scale.",
    deliverables: [
      "Predictive analytics, recommendation systems, and time-series forecasting",
      "Computer vision — detection, segmentation, OCR, and quality inspection",
      "Natural language processing — classification, extraction, summarization, search",
      "Anomaly & fraud detection and demand/risk modeling",
      "End-to-end MLOps: training pipelines, deployment, monitoring, and drift detection",
    ],
    stack: [
      ["Core", "Python, PyTorch, TensorFlow, scikit-learn, XGBoost, Hugging Face, OpenCV"],
      ["MLOps", "MLflow, Kubeflow, Docker, Kubernetes, CI/CD, model registry & monitoring"],
      ["Data", "Pandas, Spark, Airflow, feature stores, data validation & versioning"],
      ["Serving", "REST/gRPC APIs, batch & real-time inference, GPU-accelerated deployment"],
    ],
    cmd: "train --pipeline mlops --monitor drift",
  },
  {
    icon: "llm",
    title: "LLM Fine-Tuning & LLMOps",
    short:
      "Private, domain-specialized language models that are faster, cheaper, and more accurate for your use case — including efficient small models for the edge.",
    intro:
      "We adapt large and small language models to your domain, data, and voice — delivering private models that are faster, cheaper, and more accurate for your use case than general-purpose APIs. 2026 is the year of fine-tuned small models, and we help you own that advantage.",
    deliverables: [
      "Domain adaptation and instruction tuning on your proprietary data",
      "Parameter-efficient fine-tuning — LoRA, QLoRA, PEFT — and preference tuning (RLHF/DPO)",
      "Small Language Models (SLMs) for edge and on-device, low-cost inference",
      "Quantization, distillation, and optimization for latency and cost",
      "Private, on-premise, and sovereign AI deployments for data residency & compliance",
      "Prompt & context engineering, evaluation, and continuous LLMOps monitoring",
    ],
    stack: [
      ["Tuning", "LoRA, QLoRA, PEFT, full fine-tuning, RLHF, DPO, instruction tuning"],
      ["Optimization", "Quantization (GGUF, GPTQ, AWQ), distillation, pruning"],
      ["Serving", "vLLM, TGI, Ollama, TensorRT-LLM — on-prem or private cloud"],
      ["Base models", "Llama, Mistral, Qwen, Gemma, Phi and other open-weight families"],
    ],
    cmd: "finetune --lora r=16 --quantize awq",
  },
  {
    icon: "voice",
    title: "Voice AI & Conversational Assistants",
    short:
      "Real-time voice assistants that understand, respond, and act — in English and Indian languages — for support, education, IVR, and hands-free operations.",
    intro:
      "We build real-time voice assistants and conversational AI that understand, respond, and act — in English and Indian languages — for support, education, IVR, and hands-free operations. Low latency and natural speech make them feel human.",
    deliverables: [
      "Voice agents and smart assistants with real-time, low-latency pipelines",
      "Speech-to-text (ASR) and natural text-to-speech (TTS) voice synthesis",
      "Multilingual & multi-accent support, including major Indian languages",
      "Telephony / IVR integration, wake-word detection, and speaker diarization",
      "Sentiment and intent detection for smarter routing and escalation",
    ],
    stack: [
      ["Speech", "Whisper & streaming ASR, neural TTS, VAD, diarization"],
      ["Realtime", "Low-latency streaming, barge-in, WebRTC, telephony (Twilio & SIP)"],
      ["Intelligence", "LLM-driven dialog, RAG grounding, intent & sentiment analysis"],
    ],
    cmd: "serve --voice --streaming --low-latency",
  },
  {
    icon: "web",
    title: "Web & Application Development",
    short:
      "High-performance websites, web apps, and mobile apps — including immersive 3D / WebGL experiences — engineered for Core Web Vitals and conversion.",
    intro:
      "We craft high-performance websites, web apps, and mobile apps — including immersive 3D experiences powered by WebGL and Three.js — that are fast, responsive, and search-engine ready. Every build is engineered for Core Web Vitals and conversion.",
    deliverables: [
      "Corporate websites, web platforms, dashboards, and progressive web apps (PWAs)",
      "Immersive 3D / WebGL experiences and interactive product visualizations",
      "Cross-platform mobile apps (React Native / Flutter)",
      "E-commerce, headless CMS, and API-driven architectures",
      "SEO-ready builds with optimized Core Web Vitals and accessibility",
    ],
    stack: [
      ["Frontend", "React, Next.js, TypeScript, Three.js, React Three Fiber, WebGL, GSAP"],
      ["Backend", "Node.js, NestJS, Python (FastAPI/Django), REST & GraphQL APIs"],
      ["Mobile", "React Native, Flutter, PWA"],
      ["Quality", "Core Web Vitals, WCAG accessibility, automated testing, CI/CD"],
    ],
    cmd: "build --web --webgl --cwv green",
  },
  {
    icon: "ux",
    title: "Adaptive UI/UX Design",
    short:
      "Context-aware, personalized interfaces that respond to each user — combining human-centered research with AI-driven personalization.",
    intro:
      "We design adaptive, context-aware interfaces that respond to each user — combining human-centered research with AI-driven personalization to make software intuitive, accessible, and delightful.",
    deliverables: [
      "User research, information architecture, wireframing, and prototyping",
      "Adaptive, context-aware UI that personalizes to user behavior",
      "Design systems, component libraries, and brand-consistent visual language",
      "Micro-interactions, motion design, and 3D interface elements",
      "Accessibility (WCAG) and usability testing baked into every screen",
    ],
    stack: [
      ["Design", "Figma, design systems, prototyping, motion & 3D UI"],
      ["Research", "User interviews, usability testing, journey mapping, A/B testing"],
      ["Personalization", "AI-driven recommendations, adaptive layouts, behavioral triggers"],
    ],
    cmd: "design --adaptive --wcag aa",
  },
  {
    icon: "ent",
    title: "Enterprise-Grade Software Engineering",
    short:
      "Secure, scalable, cloud-native systems architected for high availability, compliance, and long-term maintainability — cleanly integrated with your stack.",
    intro:
      "We build secure, scalable, cloud-native software for business-critical operations — architected for high availability, compliance, and long-term maintainability, and integrated cleanly with your existing systems.",
    deliverables: [
      "Custom enterprise platforms, ERP/CRM extensions, and internal systems",
      "Cloud-native, microservices, and API-first architectures",
      "Security engineering — encryption, RBAC, OWASP hardening, audit trails",
      "System integration, data migration, and legacy modernization",
      "High availability, observability, and disaster recovery",
    ],
    stack: [
      ["Cloud", "AWS, Microsoft Azure, Google Cloud — plus private/on-prem"],
      ["Architecture", "Microservices, event-driven, serverless, containerized (Docker/Kubernetes)"],
      ["Security", "Encryption at rest/in transit, RBAC, SSO/OAuth, OWASP, audit logging"],
      ["Reliability", "CI/CD, IaC (Terraform), monitoring, autoscaling, HA & DR"],
    ],
    cmd: "ship --cloud-native --ha --dr",
  },
  {
    icon: "util",
    title: "Utility Software & Automation",
    short:
      "Practical tools that remove repetitive work — cross-platform utilities, RPA, data pipelines, and internal apps that quietly save hours every day.",
    intro:
      "We build the practical tools that remove repetitive work — cross-platform desktop utilities, automation scripts, data pipelines, and internal apps that quietly save hours every day.",
    deliverables: [
      "Cross-platform desktop and productivity utilities",
      "Workflow automation, RPA, and scheduled data pipelines",
      "Internal tools, admin panels, and integrations between systems",
      "Custom scripts and add-ons tailored to your operations",
    ],
    stack: [["Focus", "Automation, RPA, scheduled data pipelines, internal tools & system integrations"]],
    cmd: "automate --rpa --pipelines cron",
  },
];

export const kzStack: [string, string[]][] = [
  ["Languages", ["Python", "TypeScript", "JavaScript", "Go", "Java", "C++", "SQL", "Rust"]],
  ["AI / ML", ["PyTorch", "TensorFlow", "scikit-learn", "Hugging Face", "XGBoost", "OpenCV", "ONNX"]],
  ["LLM & Agents", ["LangChain", "LangGraph", "LlamaIndex", "CrewAI", "AutoGen", "MCP", "vLLM", "Ollama"]],
  ["Vector & Data", ["Pinecone", "Weaviate", "Milvus", "pgvector", "FAISS", "Spark", "Airflow"]],
  ["Frontend & 3D", ["React", "Next.js", "Three.js", "React Three Fiber", "WebGL", "GSAP", "Tailwind"]],
  ["Backend", ["Node.js", "NestJS", "FastAPI", "Django", "GraphQL", "gRPC"]],
  ["Mobile", ["React Native", "Flutter", "Progressive Web Apps"]],
  ["Databases", ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch"]],
  ["Cloud & DevOps", ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "CI/CD"]],
  ["MLOps", ["MLflow", "Kubeflow", "Model registry", "Monitoring", "Drift detection"]],
  ["Security", ["OAuth / SSO", "RBAC", "Encryption", "OWASP practices", "Secrets management"]],
];

export const kzInfrastructure: [KzIconKey, string, string][] = [
  ["bed", "Staff Accommodation", "On-site residential accommodation supporting 24×7 shifts and visiting teams."],
  ["food", "In-House Canteen", "A canteen and cafeteria serving the team through every shift."],
  ["power", "24×7 Power Supply", "Uninterrupted power — dual-source grid, diesel generator backup & UPS/battery, N+1 redundancy."],
  ["gpu", "In-House AI Compute", "On-premise GPU workstations & servers (NVIDIA RTX / data-center GPUs) for training & private inference."],
  ["hw", "Full Hardware Stack", "High-core CPU workstations, a dedicated testing/QA lab, networking, and NAS/SAN storage."],
  ["sw", "Full Software Stack", "Licensed IDEs, design suites, cloud subscriptions, CI/CD, and security tooling."],
  ["net", "Redundant Connectivity", "High-speed internet with leased-line and automatic failover for always-on delivery."],
  ["studio", "Media & Voice Studio", "A dedicated studio for media, PR, and voice/audio recording."],
  ["sec", "24×7 Security", "Physical security, CCTV surveillance, and biometric access control."],
  ["cont", "Business Continuity", "Backup power, data backups, and disaster-recovery readiness for uninterrupted delivery."],
];

export const kzInfraWhy: [string, string][] = [
  ["Private & sovereign AI", "Run sensitive models and data on hardware we control, within your compliance boundary."],
  ["Always-on delivery", "24×7 power, connectivity, and on-site teams keep projects moving across time zones."],
  ["Real compute", "In-house GPUs mean faster training, fine-tuning, and inference without cloud lock-in."],
  ["Reliability", "Redundancy across power, network, and storage protects your timelines and data."],
];

export const kzWhy: [string, string][] = [
  ["Full-stack under one roof", "Research, engineering, design, QA, and hardware in one team — no handoffs to third parties."],
  ["We own our infrastructure", "On-premise GPU compute, 24×7 power, and secure facilities for private and sovereign AI."],
  ["Production-first", "We don’t stop at prototypes; we ship, monitor, and optimize live systems."],
  ["Transparent partnership", "Clear scopes, agile delivery, and dedicated teams that feel like your own."],
];

export const kzValues: [string, string][] = [
  ["Engineering rigor", "We treat AI as software: tested, observable, and built to last."],
  ["Innovation with purpose", "We adopt the newest techniques only where they create real value."],
  ["Transparency", "Clear communication, honest timelines, and no black boxes."],
  ["Partnership", "Your goals define success; we operate as an extension of your team."],
  ["Responsibility", "Privacy, security, and responsible AI are built in, not bolted on."],
];

export const kzTeam: [string, string][] = [
  ["AI / ML Engineering", "Agent design, model development, fine-tuning, and MLOps."],
  ["UI / UX Design", "Research, adaptive interface design, and design systems."],
  ["Software Testing & QA", "Automated and manual testing for reliability and performance."],
  ["PR & Communications", "Brand, content, and client communication."],
  ["Studio Management", "Creative production, media, and voice/audio work."],
  ["Hardware Maintenance", "In-house upkeep of compute, networking, and infrastructure."],
];

export const kzIndustries: [string, string][] = [
  ["Education & EdTech", "AI tutors, adaptive learning, and education agents."],
  ["Enterprise", "Workflow automation, internal copilots, and modernization."],
  ["Startups", "Rapid MVPs and scalable AI products built to raise and grow."],
  ["Healthcare", "Clinical documentation, imaging, and decision support."],
  ["Retail & E-commerce", "Recommendations, search, and conversational commerce."],
  ["Finance & Fintech", "Fraud detection, risk modeling, and document intelligence."],
  ["Manufacturing", "Computer-vision inspection and predictive maintenance."],
  ["Public Sector", "Citizen services, multilingual voice, and sovereign AI."],
];

export const kzProcess: [string, string][] = [
  ["Discovery & Strategy", "We define goals, success metrics, feasibility, and scope."],
  ["Design & Architecture", "UX, data, and system architecture — with security by design."],
  ["Development", "Agile sprints with regular, working demos."],
  ["Testing & QA", "Automated and manual testing, evaluation, and hardening."],
  ["Deployment", "Secure release to cloud or on-premise with CI/CD."],
  ["Support & Optimization", "Monitoring, iteration, and continuous improvement."],
];

export const kzLocations: [KzIconKey, string, string][] = [
  [
    "pin",
    "Engineering Centre — Durgapur",
    "Rajbandh, Durgapur – 713212, West Bengal",
  ],
  [
    "bld",
    "Liaison Office — Kolkata",
    "Action Area 1, Tower 10, Sankalpa Newton, Kolkata – 700156, West Bengal",
  ],
  [
    "phone",
    "Talk to us",
    "+91 76990 02237 · kenzedtechlab@gmail.com · kenzed.in",
  ],
];

export const kzStatusRows: [string, string, string][] = [
  ["GPU cluster", "ONLINE", "var(--ok)"],
  ["Power", "N+1 REDUNDANT", "var(--ok)"],
  ["Network", "FAILOVER ARMED", "var(--acc)"],
  ["Security", "BIOMETRIC · CCTV", "var(--acc)"],
  ["Backups", "DAILY · OFFSITE", "var(--ok)"],
  ["Uptime target", "99.98%", "var(--ok)"],
];

export const kzArchFlow = [
  "CLIENT",
  "API GATEWAY",
  "AGENT ORCHESTRATOR",
  "RAG · VECTOR DB",
  "LLM / SLM",
  "ON-PREM GPU",
];

export const kzStats: { target: number; val: string; suffix: string; label: string }[] = [
  { target: 99.98, val: "99.98", suffix: "%", label: "Uptime target on production systems" },
  { target: 8, val: "8", suffix: "+", label: "Industries served end to end" },
  { target: 24, val: "24", suffix: "×7", label: "Operations & in-house AI compute" },
  { target: 2, val: "2", suffix: "", label: "Locations — Durgapur & Kolkata" },
];

/* ==========================================================================
   Home page — the dark, LangChain-style recomposition.
   The prop types are imported from the components that consume this data, so
   a component-side change surfaces here as a type error instead of as a
   silent mismatch at runtime.
   ========================================================================== */

export const kzLifecycleSection: {
  eyebrow: string;
  title: string;
  stages: KzLifecycleStageDetail[];
} = {
  eyebrow: "02 / The delivery lifecycle",
  title: "How an idea becomes a system you can depend on",
  stages: [
    {
      key: "scope",
      label: "Scope",
      icon: "studio",
      title: "Frame the problem before the first line of code",
      lead: "A short, paid discovery that turns an ambition into a scoped system with a measurable definition of done.",
      points: [
        {
          lead: "Workflow mapping.",
          rest: "We follow the real process end to end and mark where judgement actually happens, separating what a model should decide from what a rule already handles perfectly well.",
        },
        {
          lead: "Feasibility spike.",
          rest: "A throwaway prototype on your own data answers the question that decides the budget — is the accuracy you need reachable at all?",
        },
        {
          lead: "Success metric.",
          rest: "One number your business already trusts, baselined before we build, so every later trade-off has something concrete to argue against.",
        },
      ],
      links: [
        { label: "Our process", href: "/process" },
        { label: "Talk to us", href: "/contact" },
      ],
    },
    {
      key: "architect",
      label: "Architect",
      icon: "sw",
      title: "Design the system and decide where it runs",
      lead: "Architecture, data flow and hosting are settled together, because running on our own GPUs changes the design and not just the invoice.",
      points: [
        {
          lead: "Data contracts.",
          rest: "Sources, retention windows, personal-data boundaries and the retrieval strategy are fixed before a single pipeline is written.",
        },
        {
          lead: "Model strategy.",
          rest: "A hosted frontier model, an open-weight model on our own hardware, or both behind one gateway — chosen against latency, cost and data residency rather than fashion.",
        },
        {
          lead: "Guardrails by design.",
          rest: "Permissions, approval checkpoints and failure behaviour are part of the architecture, never a patch bolted on after the first security review.",
        },
      ],
      links: [
        { label: "Technology", href: "/technology" },
        { label: "Infrastructure", href: "/infrastructure" },
      ],
    },
    {
      key: "build",
      label: "Build",
      icon: "agent",
      title: "Ship working software every single sprint",
      lead: "Agents, models and interfaces are built in parallel by one team and demonstrated on real data at the end of every sprint.",
      points: [
        {
          lead: "Agents and tools.",
          rest: "Orchestration, memory and tool calls are wired into the systems you already run, so what you see in the demo is what goes to production.",
        },
        {
          lead: "Interfaces people keep.",
          rest: "The UI is engineered alongside the model, so confidence, sources and an undo path are visible exactly where the decision is being made.",
        },
        {
          lead: "One team, one standup.",
          rest: "Data, ML, backend and design work in the same cadence, which makes integration continuous instead of a phase everyone dreads.",
        },
      ],
      links: [
        { label: "What we build", href: "/services" },
        { label: "Product studio", href: "/product-studio" },
      ],
    },
    {
      key: "evaluate",
      label: "Evaluate",
      icon: "ml",
      title: "Prove it before anyone depends on it",
      lead: "An evaluation harness is a deliverable in its own right — a regression should fail a build, not a customer.",
      points: [
        {
          lead: "Golden sets.",
          rest: "Your domain experts label the cases that matter, deliberately including the ones the system is expected to refuse or escalate.",
        },
        {
          lead: "Automated scoring.",
          rest: "Accuracy, grounding, latency and cost per task run on every change and gate the release, so quality is a number rather than an impression.",
        },
        {
          lead: "Red teaming.",
          rest: "Prompt injection, data leakage and permission escape are tested on purpose, and every finding is written up with the fix that closed it.",
        },
      ],
      links: [{ label: "How we work", href: "/process" }],
    },
    {
      key: "deploy",
      label: "Deploy",
      icon: "cont",
      title: "Release to your cloud or to hardware we own",
      lead: "The same containerised build runs in your cloud account or on our Durgapur GPU cluster, with a rollback measured in seconds.",
      points: [
        {
          lead: "Staged rollout.",
          rest: "Shadow mode first, then a limited cohort, then full traffic — each step carrying an explicit criterion for going forward or backing out.",
        },
        {
          lead: "Infrastructure we operate.",
          rest: "Where residency or cost rules out public cloud, workloads run on redundant power and network in our own facility, staffed and monitored around the clock.",
        },
        {
          lead: "Handover that holds.",
          rest: "Runbooks, dashboards and an on-call path your own team can use confidently from the first day they own it.",
        },
      ],
      links: [
        { label: "Infrastructure", href: "/infrastructure" },
        { label: "Live projects", href: "/live-projects" },
      ],
    },
    {
      key: "improve",
      label: "Improve",
      icon: "net",
      title: "Watch it in production, then make it better",
      lead: "Traces, drift alerts and a standing backlog keep the system earning its place long after the launch announcement.",
      points: [
        {
          lead: "Full tracing.",
          rest: "Every agent decision is logged with its inputs, its tool calls and its cost, so a bad answer can be explained instead of guessed at.",
        },
        {
          lead: "Drift and quality.",
          rest: "Input distribution, refusal rate and evaluation scores are monitored continuously, and a regression opens a ticket before a user has to report it.",
        },
        {
          lead: "A compounding roadmap.",
          rest: "Quarterly reviews turn production evidence into the next increment, which is how a system improves rather than accumulating a rewrite.",
        },
      ],
      links: [
        { label: "Industries we serve", href: "/industries" },
        { label: "Start a project", href: "/contact" },
      ],
    },
  ],
};

export const kzBuildSection: {
  eyebrow: string;
  title: string;
  lead: string;
  cards: KzGraphCardSpec[];
} = {
  eyebrow: "03 / How we build",
  title: "Three system shapes behind most of our work",
  lead: "Almost every engagement resolves into one of three architectures, or a composition of them. Knowing which one you are in from the very start is what keeps a build predictable: it decides the data contracts, the evaluation strategy and the hardware long before it decides the code.",
  cards: [
    {
      kind: "agents",
      name: "Agent systems",
      title: "Agents that act inside your stack",
      body: "An orchestrator decomposes the task and delegates to specialised agents that retrieve, reason and act through your real APIs — with shared memory, bounded permissions and human approval on anything consequential.",
      href: "/services/ai-agent-development",
      linkLabel: "Agent development",
    },
    {
      kind: "pipeline",
      name: "Data & RAG",
      title: "Pipelines that keep answers grounded",
      body: "Ingestion, enrichment, inference and serving as one versioned pipeline, with a feature and vector store every model reads from. Retraining is scheduled, and drift is a monitored signal rather than a surprise.",
      href: "/services/machine-learning-development",
      linkLabel: "ML engineering",
    },
    {
      kind: "graph",
      name: "Orchestration",
      title: "Graphs that route work to the right model",
      body: "A router sends each query down the cheapest path that can answer it — vector search, a knowledge graph, or a frontier model — and one graph definition holds the fallbacks, retries and cost ceilings.",
      href: "/technology",
      linkLabel: "Our stack",
    },
  ],
};

/* Kenzed has no named public references cleared for the site, so these cards
   describe the shape of the work by sector and stay deliberately
   unattributed: no invented brand names and no invented numbers. */
export const kzOutcomesSection: {
  eyebrow: string;
  title: string;
  note: string;
  action: { label: string; href: string };
  stories: KzStoryCard[];
} = {
  eyebrow: "06 / Where the work lands",
  title: "The shape of a Kenzed engagement",
  note: "Engagement patterns described by sector rather than by name. We publish client specifics only where we have written permission to do so.",
  action: { label: "See live projects", href: "/live-projects" },
  stories: [
    {
      client: "A regional hospital network",
      quote:
        "Clinical documentation agents draft notes from dictation and route every draft to a clinician for approval before anything reaches the patient record.",
      metric: "Healthcare · on-premise deployment",
    },
    {
      client: "A state university group",
      quote:
        "Course-aware tutoring agents grounded in the institution's own material, with a teaching dashboard that shows which sources each answer was built from.",
      metric: "Education · retrieval-augmented",
    },
    {
      client: "A multi-city logistics operator",
      quote:
        "Demand and routing forecasts served behind an internal API, retrained on a schedule and monitored for the drift that quietly degrades a model.",
      metric: "Logistics · ML in production",
    },
    {
      client: "A banking operations team",
      quote:
        "Document intelligence extracts and cross-checks fields from scanned forms, escalating anything under a confidence threshold to a human reviewer.",
      metric: "Finance · human in the loop",
    },
    {
      client: "A manufacturing plant",
      quote:
        "Computer-vision inspection running at the line on hardware we specified, flagging defects without a single frame leaving the site.",
      metric: "Manufacturing · edge inference",
    },
  ],
};

export const kzHomeCta: {
  eyebrow: string;
  title: string;
  lead: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
} = {
  eyebrow: "07 / Start here",
  title: "Ready to build something that reasons?",
  lead: "Bring us the workflow that is costing you the most, and we will tell you honestly whether an agent, a model, or plain well-built software is the right answer. Either way you leave the first conversation with a scope, a metric and a number.",
  primary: { label: "Start your AI project →", href: "/contact" },
  secondary: { label: "Explore our services", href: "/services" },
};
