/**
 * Content shaped for the Kenzed Tech Lab.dc.html redesign.
 * Kept separate from the legacy content files so the new components have a
 * single, predictable data contract.
 */

import type { KzIconKey } from "@/components/kz/KzIcon";

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
    "Rajbandh, Durgapur – 713212, West Bengal · 15,000 sq ft facility",
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
  ["GPU cluster", "ONLINE", "#34c759"],
  ["Power", "N+1 REDUNDANT", "#34c759"],
  ["Network", "FAILOVER ARMED", "#4da3ff"],
  ["Security", "BIOMETRIC · CCTV", "#4da3ff"],
  ["Backups", "DAILY · OFFSITE", "#34c759"],
  ["Uptime target", "99.98%", "#34c759"],
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
  { target: 25, val: "25", suffix: "+", label: "AI, software & design specialists" },
  { target: 15000, val: "15,000", suffix: " sq ft", label: "Dedicated development facility" },
  { target: 24, val: "24", suffix: "×7", label: "Operations & in-house AI compute" },
  { target: 2, val: "2", suffix: "", label: "Locations — Durgapur & Kolkata" },
];

export const kzMarquee = [
  "Agentic AI",
  "RAG Pipelines",
  "LLM Fine-Tuning",
  "Voice AI",
  "MCP Integrations",
  "Computer Vision",
  "3D Web / WebGL",
  "On-Prem GPU Compute",
  "Enterprise Software",
  "Adaptive UI/UX",
  "MLOps · CI/CD",
  "Multi-Agent Systems",
];
