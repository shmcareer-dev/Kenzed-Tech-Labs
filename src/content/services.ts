/**
 * The eight services. Each entry powers three things:
 *   - the homepage services grid
 *   - the /services index
 *   - its own /services/[slug] detail page (incl. metadata)
 * Add a service by appending an object here — no component changes needed.
 */

import type { KzIconKey } from "@/components/kz/KzIcon";

export type StackGroup = { label: string; items: string };

export type Service = {
  slug: string;
  /** Key into the ICONS map in components/kz/KzIcon.tsx */
  icon: KzIconKey;
  title: string;
  /** Card blurb on the homepage / services grid. */
  short: string;
  /** Opening paragraph on the detail page. */
  summary: string;
  deliverables: string[];
  stack: StackGroup[];
  seo: { title: string; description: string; keyword: string };
};

export const services: Service[] = [
  {
    slug: "ai-agent-development",
    icon: "agent",
    title: "Custom AI Agents & Agentic AI",
    short:
      "Autonomous, multi-agent systems that reason, plan, use tools, and complete real tasks — from education agents to workflow automation and customer experience.",
    summary:
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
      {
        label: "Frameworks",
        items: "LangChain, LangGraph, LlamaIndex, CrewAI, AutoGen, Model Context Protocol (MCP)",
      },
      {
        label: "Retrieval / memory",
        items: "Pinecone, Weaviate, Milvus, pgvector, FAISS; hybrid & semantic search",
      },
      {
        label: "Models",
        items: "OpenAI, Anthropic Claude, Google Gemini, Llama, Mistral, Qwen — plus private/self-hosted",
      },
      {
        label: "Reliability",
        items: "Guardrails, evaluation harnesses, tracing/observability, human-in-the-loop checkpoints",
      },
      {
        label: "Governance",
        items: "Bounded permissions, decision logging, sandboxing, compliance-first architecture",
      },
    ],
    seo: {
      title: "AI Agent Development Services | Kenzed Tech Lab",
      description:
        "Custom AI agents and multi-agent systems with RAG, MCP tool use, memory and guardrails — built for production by Kenzed Tech Lab.",
      keyword: "AI agent development services",
    },
  },
  {
    slug: "machine-learning-development",
    icon: "ml",
    title: "Machine Learning & Data Science",
    short:
      "ML-implemented software that turns data into predictions, classifications, and recommendations — deployed and monitored as a dependable production service.",
    summary:
      "We build ML-implemented software that turns raw data into predictions, classifications, and recommendations — then deploy and monitor it as a dependable production service. From computer vision to forecasting, our models are engineered for accuracy, explainability, and scale.",
    deliverables: [
      "Predictive analytics, recommendation systems, and time-series forecasting",
      "Computer vision — detection, segmentation, OCR, and quality inspection",
      "Natural language processing — classification, extraction, summarization, search",
      "Anomaly & fraud detection and demand/risk modeling",
      "End-to-end MLOps: training pipelines, deployment, monitoring, and drift detection",
    ],
    stack: [
      {
        label: "Core",
        items: "Python, PyTorch, TensorFlow, scikit-learn, XGBoost, Hugging Face, OpenCV",
      },
      {
        label: "MLOps",
        items: "MLflow, Kubeflow, Docker, Kubernetes, CI/CD, model registry & monitoring",
      },
      {
        label: "Data",
        items: "Pandas, Spark, Airflow, feature stores, data validation & versioning",
      },
      {
        label: "Serving",
        items: "REST/gRPC APIs, batch & real-time inference, GPU-accelerated deployment",
      },
    ],
    seo: {
      title: "Machine Learning Development Services | Kenzed Tech Lab",
      description:
        "Production machine learning — predictive analytics, computer vision, NLP and full MLOps pipelines engineered for accuracy and scale.",
      keyword: "machine learning development services",
    },
  },
  {
    slug: "llm-fine-tuning",
    icon: "llm",
    title: "LLM Fine-Tuning & LLMOps",
    short:
      "Private, domain-specialized language models that are faster, cheaper, and more accurate for your use case — including efficient small models for the edge.",
    summary:
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
      {
        label: "Tuning",
        items: "LoRA, QLoRA, PEFT, full fine-tuning, RLHF, DPO, instruction tuning",
      },
      {
        label: "Optimization",
        items: "Quantization (GGUF, GPTQ, AWQ), distillation, pruning",
      },
      {
        label: "Serving",
        items: "vLLM, TGI, Ollama, TensorRT-LLM — on-prem or private cloud",
      },
      {
        label: "Base models",
        items: "Llama, Mistral, Qwen, Gemma, Phi and other open-weight families",
      },
    ],
    seo: {
      title: "LLM Fine-Tuning & LLMOps Services | Kenzed Tech Lab",
      description:
        "Private, domain-specialized language models — LoRA/QLoRA fine-tuning, SLMs, quantization and on-premise deployment with continuous LLMOps.",
      keyword: "LLM fine-tuning company",
    },
  },
  {
    slug: "voice-ai-development",
    icon: "voice",
    title: "Voice AI & Conversational Assistants",
    short:
      "Real-time voice assistants that understand, respond, and act — in English and Indian languages — for support, education, IVR, and hands-free operations.",
    summary:
      "We build real-time voice assistants and conversational AI that understand, respond, and act — in English and Indian languages — for support, education, IVR, and hands-free operations. Low latency and natural speech make them feel human.",
    deliverables: [
      "Voice agents and smart assistants with real-time, low-latency pipelines",
      "Speech-to-text (ASR) and natural text-to-speech (TTS) voice synthesis",
      "Multilingual & multi-accent support, including major Indian languages",
      "Telephony / IVR integration, wake-word detection, and speaker diarization",
      "Sentiment and intent detection for smarter routing and escalation",
    ],
    stack: [
      {
        label: "Speech",
        items: "Whisper & streaming ASR, neural TTS, VAD, diarization",
      },
      {
        label: "Realtime",
        items: "Low-latency streaming, barge-in, WebRTC, telephony (Twilio & SIP)",
      },
      {
        label: "Intelligence",
        items: "LLM-driven dialog, RAG grounding, intent & sentiment analysis",
      },
    ],
    seo: {
      title: "Voice AI Development Services | Kenzed Tech Lab",
      description:
        "Real-time multilingual voice agents — streaming ASR, neural TTS, telephony/IVR integration and LLM-driven dialog for Indian languages and English.",
      keyword: "voice AI development services",
    },
  },
  {
    slug: "web-app-development",
    icon: "web",
    title: "Web & Application Development",
    short:
      "High-performance websites, web apps, and mobile apps — including immersive 3D / WebGL experiences — engineered for Core Web Vitals and conversion.",
    summary:
      "We craft high-performance websites, web apps, and mobile apps — including immersive 3D experiences powered by WebGL and Three.js — that are fast, responsive, and search-engine ready. Every build is engineered for Core Web Vitals and conversion.",
    deliverables: [
      "Corporate websites, web platforms, dashboards, and progressive web apps (PWAs)",
      "Immersive 3D / WebGL experiences and interactive product visualizations",
      "Cross-platform mobile apps (React Native / Flutter)",
      "E-commerce, headless CMS, and API-driven architectures",
      "SEO-ready builds with optimized Core Web Vitals and accessibility",
    ],
    stack: [
      {
        label: "Frontend",
        items: "React, Next.js, TypeScript, Three.js, React Three Fiber, WebGL, GSAP",
      },
      {
        label: "Backend",
        items: "Node.js, NestJS, Python (FastAPI/Django), REST & GraphQL APIs",
      },
      { label: "Mobile", items: "React Native, Flutter, PWA" },
      {
        label: "Quality",
        items: "Core Web Vitals, WCAG accessibility, automated testing, CI/CD",
      },
    ],
    seo: {
      title: "Web & 3D Application Development | Kenzed Tech Lab",
      description:
        "High-performance web and mobile applications, including immersive WebGL/Three.js experiences — engineered for Core Web Vitals, SEO and conversion.",
      keyword: "3D website development company",
    },
  },
  {
    slug: "adaptive-ui-ux-design",
    icon: "ux",
    title: "Adaptive UI/UX Design",
    short:
      "Context-aware, personalized interfaces that respond to each user — combining human-centered research with AI-driven personalization.",
    summary:
      "We design adaptive, context-aware interfaces that respond to each user — combining human-centered research with AI-driven personalization to make software intuitive, accessible, and delightful.",
    deliverables: [
      "User research, information architecture, wireframing, and prototyping",
      "Adaptive, context-aware UI that personalizes to user behavior",
      "Design systems, component libraries, and brand-consistent visual language",
      "Micro-interactions, motion design, and 3D interface elements",
      "Accessibility (WCAG) and usability testing baked into every screen",
    ],
    stack: [
      {
        label: "Design",
        items: "Figma, design systems, prototyping, motion & 3D UI",
      },
      {
        label: "Research",
        items: "User interviews, usability testing, journey mapping, A/B testing",
      },
      {
        label: "Personalization",
        items: "AI-driven recommendations, adaptive layouts, behavioral triggers",
      },
    ],
    seo: {
      title: "Adaptive UI/UX Design Services | Kenzed Tech Lab",
      description:
        "Adaptive, context-aware interface design — user research, design systems, motion and AI-driven personalization with WCAG accessibility built in.",
      keyword: "adaptive UI UX design company",
    },
  },
  {
    slug: "enterprise-software-development",
    icon: "ent",
    title: "Enterprise-Grade Software",
    short:
      "Secure, scalable, cloud-native systems architected for high availability, compliance, and long-term maintainability — cleanly integrated with your stack.",
    summary:
      "We build secure, scalable, cloud-native software for business-critical operations — architected for high availability, compliance, and long-term maintainability, and integrated cleanly with your existing systems.",
    deliverables: [
      "Custom enterprise platforms, ERP/CRM extensions, and internal systems",
      "Cloud-native, microservices, and API-first architectures",
      "Security engineering — encryption, RBAC, OWASP hardening, audit trails",
      "System integration, data migration, and legacy modernization",
      "High availability, observability, and disaster recovery",
    ],
    stack: [
      {
        label: "Cloud",
        items: "AWS, Microsoft Azure, Google Cloud — plus private/on-prem",
      },
      {
        label: "Architecture",
        items: "Microservices, event-driven, serverless, containerized (Docker/Kubernetes)",
      },
      {
        label: "Security",
        items: "Encryption at rest/in transit, RBAC, SSO/OAuth, OWASP, audit logging",
      },
      {
        label: "Reliability",
        items: "CI/CD, IaC (Terraform), monitoring, autoscaling, HA & DR",
      },
    ],
    seo: {
      title: "Enterprise Software Development | Kenzed Tech Lab",
      description:
        "Secure, cloud-native enterprise platforms — microservices, RBAC, OWASP hardening, high availability and disaster recovery, integrated with your stack.",
      keyword: "enterprise software development company",
    },
  },
  {
    slug: "utility-software-automation",
    icon: "util",
    title: "Utility Software & Automation",
    short:
      "Practical tools that remove repetitive work — cross-platform utilities, RPA, data pipelines, and internal apps that quietly save hours every day.",
    summary:
      "We build the practical tools that remove repetitive work — cross-platform desktop utilities, automation scripts, data pipelines, and internal apps that quietly save hours every day.",
    deliverables: [
      "Cross-platform desktop and productivity utilities",
      "Workflow automation, RPA, and scheduled data pipelines",
      "Internal tools, admin panels, and integrations between systems",
      "Custom scripts and add-ons tailored to your operations",
    ],
    stack: [
      {
        label: "Automation",
        items: "RPA, workflow engines, scheduled jobs, event triggers",
      },
      {
        label: "Data",
        items: "ETL/ELT pipelines, Airflow, validation & reconciliation",
      },
      {
        label: "Apps",
        items: "Cross-platform desktop, internal admin panels, system integrations",
      },
    ],
    seo: {
      title: "Utility Software & Automation | Kenzed Tech Lab",
      description:
        "Cross-platform utilities, RPA, data pipelines and internal tools that remove repetitive work and save your team hours every day.",
      keyword: "workflow automation software company",
    },
  },
];

/** Options for the contact form's "service of interest" dropdown. */
export const serviceOptions = services.map((s) => s.title);

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
