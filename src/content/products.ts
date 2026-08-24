/**
 * Product catalogue for /product-studio.
 *
 * PRICING IS INDICATIVE PLACEHOLDER DATA — replace every `price` with real figures
 * before relying on this commercially. The UI never takes payment: every CTA routes
 * to "Know price", which opens the contact/WhatsApp flow.
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
  icon: KzIconKey;
  category: string;
  capabilities: string[];
  deliverables: string[];
  stack: string[];
  tiers: ProductTier[];
};

export const products: Product[] = [
  {
    slug: "agentgrid",
    name: "AgentGrid",
    tagline: "A control plane for multi-agent workflows that run in production.",
    summary:
      "AgentGrid turns one-off agent scripts into a governed platform — orchestration, tool permissions, memory, and traces in a single runtime. Teams compose specialized agents, hand them your systems through MCP, and keep a human in the loop wherever the stakes demand it. Every decision is logged, replayable, and measurable against an evaluation suite.",
    icon: "agent",
    category: "Agentic AI",
    capabilities: [
      "Workflow builder for task decomposition across specialized sub-agents",
      "MCP and function-calling connectors to your ERP, CRM, ticketing, and databases",
      "Bounded tool permissions with approval gates and per-action audit trails",
      "Short- and long-term memory with tenant-level isolation",
      "Evaluation harness, regression suites, and side-by-side prompt experiments",
      "Live tracing, cost and latency dashboards, and failure replay",
    ],
    deliverables: [
      "Deployed runtime on your cloud or our on-premise GPU infrastructure",
      "Two production workflows built and tuned alongside your team",
      "Connector pack for the systems in scope, with credential handling",
      "Evaluation baseline plus a runbook for adding new agents safely",
    ],
    stack: [
      "LangGraph",
      "Model Context Protocol",
      "Python",
      "FastAPI",
      "PostgreSQL",
      "pgvector",
      "Redis",
      "Docker",
    ],
    tiers: [
      {
        name: "Starter",
        price: "₹85,000",
        period: "per month",
        summary: "One team, one workflow, and the guardrails to trust it.",
        features: [
          "Up to 3 agents and 2 connectors",
          "5,000 governed actions per month",
          "Tracing and audit retention for 30 days",
          "Business-hours support",
        ],
      },
      {
        name: "Growth",
        price: "₹1,85,000",
        period: "per month",
        summary: "Several departments, shared memory, and evaluation in CI.",
        features: [
          "Up to 15 agents and 10 connectors",
          "50,000 governed actions per month",
          "Evaluation suites wired into your CI pipeline",
          "SSO, role-based access, and 12-month audit retention",
          "Named delivery engineer",
        ],
        highlight: true,
      },
      {
        name: "Enterprise",
        price: "₹4,20,000",
        period: "per month",
        summary: "Private deployment inside your own compliance boundary.",
        features: [
          "Unlimited agents and connectors",
          "On-premise or VPC deployment on dedicated GPUs",
          "Custom guardrails, data residency, and retention policy",
          "24×7 support with an agreed response SLA",
        ],
      },
    ],
  },
  {
    slug: "knowledgecore",
    name: "KnowledgeCore",
    tagline: "Answers drawn from your own documents, with the source attached.",
    summary:
      "KnowledgeCore reads your contracts, manuals, circulars, and tickets, then answers questions with citations pointing back to the exact page. Hybrid search and re-ranking keep answers grounded, while permissions follow the document — nobody retrieves what they could not already open. It ships as an internal copilot, a support console, or an API behind your own product.",
    icon: "ent",
    category: "Agentic AI",
    capabilities: [
      "Ingestion for PDF, Office, HTML, scanned documents, and ticket exports",
      "OCR and layout-aware chunking that preserves tables and clause structure",
      "Hybrid semantic and keyword retrieval with cross-encoder re-ranking",
      "Answers with inline citations and page-level source preview",
      "Document-level access control inherited from your identity provider",
      "Freshness pipeline that re-indexes on change and flags stale answers",
    ],
    deliverables: [
      "Indexed corpus with a documented ingestion and refresh pipeline",
      "Branded search and chat console, plus a REST API for embedding",
      "Retrieval accuracy report against a question set your team defines",
      "Admin tooling for permissions, redaction, and content takedown",
    ],
    stack: ["LlamaIndex", "Qdrant", "pgvector", "Elasticsearch", "PyTorch", "FastAPI", "Next.js"],
    tiers: [
      {
        name: "Pilot",
        price: "₹3,20,000",
        period: "one-time",
        summary: "One corpus, one team, proven on your real questions.",
        features: [
          "Up to 25,000 pages indexed",
          "Single knowledge base with the web console",
          "Accuracy report on a 100-question benchmark",
          "60 days of post-launch tuning",
        ],
      },
      {
        name: "Department",
        price: "₹6,80,000",
        period: "one-time",
        summary: "Several corpora, real permissions, and an API for your apps.",
        features: [
          "Up to 250,000 pages across multiple knowledge bases",
          "SSO with document-level access control",
          "Embeddable API and widget for your existing products",
          "Scheduled re-indexing with change detection",
          "Quarterly retrieval tuning",
        ],
        highlight: true,
      },
      {
        name: "Enterprise",
        price: "₹14,50,000",
        period: "one-time",
        summary: "Organisation-wide retrieval, deployed privately.",
        features: [
          "Unlimited corpora with tenant isolation",
          "On-premise deployment with sovereign data residency",
          "Custom extractors for your document formats",
          "Dedicated support with an agreed response SLA",
        ],
      },
    ],
  },
  {
    slug: "voxdesk",
    name: "VoxDesk",
    tagline: "A voice agent that answers the phone and finishes the job.",
    summary:
      "VoxDesk handles inbound and outbound calls in English, Hindi, and Bengali with turn-taking fast enough to survive Indian telephony. It listens, retrieves the right record, completes the transaction, and escalates to a human the moment confidence drops. Every call lands in your CRM as a transcript, a summary, and a structured outcome.",
    icon: "voice",
    category: "Voice AI",
    capabilities: [
      "Streaming ASR and neural TTS tuned for Indian accents and code-mixing",
      "Barge-in, noise suppression, and low-latency turn-taking on poor lines",
      "SIP and cloud telephony integration with recording and consent capture",
      "Task completion against your systems — bookings, status checks, collections",
      "Confidence-based escalation with a warm handoff to a human agent",
      "Transcripts, summaries, sentiment, and outcome codes pushed to your CRM",
    ],
    deliverables: [
      "Configured voice agent with your scripts, voice, and escalation rules",
      "Telephony provisioning and CRM integration in your environment",
      "Call quality report covering latency, containment, and drop reasons",
      "Supervisor console for live monitoring and transcript review",
    ],
    stack: ["Whisper", "Neural TTS", "WebRTC", "Twilio", "SIP", "LangGraph", "Python", "Redis"],
    tiers: [
      {
        name: "Desk",
        price: "₹65,000",
        period: "per month",
        summary: "One line, one language, live within weeks.",
        features: [
          "1 concurrent line, 1,500 minutes per month",
          "Single language with one custom voice",
          "Transcripts, summaries, and CSV export",
          "Business-hours support",
        ],
      },
      {
        name: "Team",
        price: "₹1,40,000",
        period: "per month",
        summary: "Multilingual coverage with write-back into your CRM.",
        features: [
          "10 concurrent lines, 15,000 minutes per month",
          "English, Hindi, and Bengali with mid-call switching",
          "CRM integration and structured outcome codes",
          "Supervisor console with live monitoring",
          "Monthly script and prompt tuning",
        ],
        highlight: true,
      },
      {
        name: "Contact Centre",
        price: "₹3,60,000",
        period: "per month",
        summary: "Campaign-scale calling with private speech models.",
        features: [
          "100+ concurrent lines with autoscaling",
          "Outbound campaigns with retry and compliance windows",
          "On-premise speech models for data residency",
          "24×7 support with an agreed response SLA",
        ],
      },
    ],
  },
  {
    slug: "visionqa",
    name: "VisionQA",
    tagline: "Camera-based inspection that catches the defect on the line.",
    summary:
      "VisionQA puts trained detection models beside the conveyor, flags defects in milliseconds, and keeps a photographic record of every unit that passed. It runs on an edge box on the shop floor, so inspection continues when the internet does not. Operators correct the model from the same screen they already work on, and each correction feeds the next training round.",
    icon: "ml",
    category: "Applied ML",
    capabilities: [
      "Defect detection, classification, and segmentation on live camera feeds",
      "Edge inference on an industrial GPU box with offline-first buffering",
      "PLC and MES integration for automatic reject, alarm, and batch stop",
      "Operator review screen with one-tap correction and active learning",
      "Traceability — per-unit images, verdicts, and model version retained",
      "Yield, defect-mix, and drift dashboards for the quality team",
    ],
    deliverables: [
      "Trained models for your defect classes with a validated accuracy report",
      "Commissioned edge hardware, camera rig, and lighting specification",
      "PLC/MES integration and operator training on site",
      "Retraining pipeline with a documented handover to your quality team",
    ],
    stack: [
      "PyTorch",
      "OpenCV",
      "YOLO",
      "ONNX Runtime",
      "TensorRT",
      "NVIDIA Jetson",
      "FastAPI",
      "TimescaleDB",
    ],
    tiers: [
      {
        name: "Line",
        price: "₹5,40,000",
        period: "one-time",
        summary: "One line, one camera, one family of defects.",
        features: [
          "Up to 3 defect classes on a single station",
          "1 edge inference box with camera and lighting",
          "Operator review screen and daily yield report",
          "90 days of accuracy tuning after commissioning",
        ],
      },
      {
        name: "Plant",
        price: "₹9,80,000",
        period: "one-time",
        summary: "Several stations, PLC control, and retraining you own.",
        features: [
          "Up to 12 defect classes across 4 stations",
          "PLC/MES integration with automatic reject",
          "Active-learning loop with in-house retraining",
          "Plant-wide quality dashboard and drift alerts",
          "Operator and engineer training on site",
        ],
        highlight: true,
      },
      {
        name: "Multi-Plant",
        price: "₹22,00,000",
        period: "one-time",
        summary: "A fleet of inspection stations under one model registry.",
        features: [
          "Unlimited stations across multiple sites",
          "Central model registry with staged rollout and rollback",
          "Cross-plant benchmarking and defect-mix analytics",
          "24×7 support with an on-site response commitment",
        ],
      },
    ],
  },
  {
    slug: "opsflow",
    name: "OpsFlow",
    tagline: "The back-office work nobody should still be doing by hand.",
    summary:
      "OpsFlow reads the invoices, reconciles the statements, chases the approvals, and files the report — on a schedule, with an exception queue for the cases that genuinely need a person. It connects to the tools your operations team already lives in rather than asking them to move. Every run leaves an audit trail your finance and compliance teams can inspect.",
    icon: "util",
    category: "Enterprise Automation",
    capabilities: [
      "Document intelligence for invoices, POs, statements, and remittance advices",
      "Rule and model reconciliation with a reviewable exception queue",
      "Approval routing over email, WhatsApp, and Slack with reminders",
      "Scheduled ETL between your ERP, accounting, and spreadsheet sources",
      "Report generation and distribution on a calendar you control",
      "Full audit trail — inputs, decisions, overrides, and outputs",
    ],
    deliverables: [
      "Four automated workflows built against your live processes",
      "Exception console with role-based review and override",
      "Connector setup for every system in scope",
      "Time-saved baseline measured before and after go-live",
    ],
    stack: ["Python", "Airflow", "Playwright", "PostgreSQL", "Tesseract", "FastAPI", "Next.js"],
    tiers: [
      {
        name: "Team",
        price: "₹55,000",
        period: "per month",
        summary: "Automate the two processes that hurt most.",
        features: [
          "2 workflows and 2 connectors",
          "5,000 documents processed per month",
          "Exception console for up to 5 reviewers",
          "Business-hours support",
        ],
      },
      {
        name: "Department",
        price: "₹1,20,000",
        period: "per month",
        summary: "A department's routine work, running unattended.",
        features: [
          "10 workflows and 8 connectors",
          "50,000 documents processed per month",
          "Approval routing with reminders and escalation",
          "SSO, role-based access, and 12-month audit retention",
          "Monthly process review with our delivery team",
        ],
        highlight: true,
      },
      {
        name: "Group",
        price: "₹2,90,000",
        period: "per month",
        summary: "Multi-entity operations with private processing.",
        features: [
          "Unlimited workflows across entities and subsidiaries",
          "On-premise deployment for regulated data",
          "Custom extractors and reconciliation rules",
          "24×7 support with an agreed response SLA",
        ],
      },
    ],
  },
  {
    slug: "domainlm",
    name: "DomainLM",
    tagline: "A small language model that only has to be expert at your work.",
    summary:
      "DomainLM adapts an open-weight model to your vocabulary, formats, and house style, then quantizes it to run on hardware you already own. For narrow, repetitive work it matches far larger APIs at a fraction of the cost, with none of your data leaving the building. You receive the weights, the evaluation harness, and the pipeline to tune it again next quarter.",
    icon: "llm",
    category: "Applied ML",
    capabilities: [
      "Dataset curation, cleaning, and de-duplication from your existing records",
      "LoRA and QLoRA adaptation, plus preference tuning where quality demands it",
      "Quantization and distillation for CPU, edge, or single-GPU inference",
      "Task evaluation harness scored against outputs your experts accept",
      "Private serving on vLLM behind an OpenAI-compatible endpoint",
      "Retraining pipeline so your team can refresh the model in-house",
    ],
    deliverables: [
      "Model weights and adapters, licensed for your own use",
      "Evaluation report comparing the tuned model against your current baseline",
      "Serving deployment on your infrastructure with autoscaling",
      "Documented training pipeline and a handover workshop",
    ],
    stack: ["PyTorch", "Hugging Face", "PEFT", "vLLM", "Llama", "Qwen", "GGUF", "MLflow"],
    tiers: [
      {
        name: "Adapter",
        price: "₹6,50,000",
        period: "one-time",
        summary: "One task, one adapter, measured against your baseline.",
        features: [
          "Single-task LoRA adaptation on curated data",
          "Evaluation report on a held-out set you approve",
          "Quantized weights for single-GPU inference",
          "30 days of post-delivery tuning",
        ],
      },
      {
        name: "Domain",
        price: "₹13,00,000",
        period: "one-time",
        summary: "Several tasks, your house style, served privately.",
        features: [
          "Multi-task tuning with preference alignment",
          "Private vLLM deployment with an OpenAI-compatible API",
          "Retraining pipeline handed to your team",
          "Guardrail and refusal policy tuned to your domain",
          "Quarterly refresh for one year",
        ],
        highlight: true,
      },
      {
        name: "Sovereign",
        price: "₹28,00,000",
        period: "one-time",
        summary: "Your model, your GPUs, your compliance boundary.",
        features: [
          "Air-gapped training and serving on dedicated hardware",
          "Continued pre-training on your proprietary corpus",
          "Model card, bias review, and audit documentation",
          "24×7 support with an agreed response SLA",
        ],
      },
    ],
  },
];

/** Filter chips for the catalogue, in first-appearance order. */
export const productCategories: string[] = Array.from(new Set(products.map((p) => p.category)));
