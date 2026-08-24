/**
 * Live projects and training records for /live-projects.
 *
 * THE PROJECT AND PERFORMER RECORDS BELOW ARE DEMONSTRATION DATA. This page is presented
 * publicly as a credential record, so replace every entry with real, verifiable records
 * before launch — publishing invented trainee credentials would mislead visitors.
 */

export type TrainingProgram = {
  slug: string;
  title: string;
  duration: string;
  mode: string;
  level: string;
  seats: string;
  summary: string;
  outcomes: string[];
  tools: string[];
};

export type LiveProject = {
  id: string;
  title: string;
  domain: string;
  period: string;
  status: "Delivered" | "In progress";
  summary: string;
  stack: string[];
};

export type Performer = {
  name: string;
  role: string;
  program: string;
  /** Matches a LiveProject.id. */
  projectId: string;
  certificateId: string;
  period: string;
  highlight: string;
};

export const trainingPrograms: TrainingProgram[] = [
  {
    slug: "agentic-ai-engineering",
    title: "Agentic AI Engineering",
    duration: "12 weeks",
    mode: "On-site · Durgapur",
    level: "Intermediate — Python fluency required",
    seats: "18 per cohort",
    summary:
      "Build agents that act, not chatbots that answer. Trainees work through tool use, retrieval, memory, and guardrails, then join a live client workflow where every action they ship is traced and reviewed.",
    outcomes: [
      "Design a multi-agent workflow with clear task decomposition and handoffs",
      "Wire agents to real systems through MCP servers and function calling",
      "Ground answers in a private corpus with retrieval and citation checks",
      "Instrument tracing, evaluations, and human approval gates before release",
      "Ship one reviewed contribution to a live client agent workflow",
    ],
    tools: ["Python", "LangGraph", "Model Context Protocol", "pgvector", "FastAPI", "Docker", "LangSmith"],
  },
  {
    slug: "applied-ml-computer-vision",
    title: "Applied Machine Learning & Computer Vision",
    duration: "10 weeks",
    mode: "On-site · Durgapur",
    level: "Beginner to intermediate",
    seats: "24 per cohort",
    summary:
      "From dataset to deployed model. Trainees label, train, and evaluate on real industrial imagery, then take a model through quantization and onto an edge device running on our shop-floor test rig.",
    outcomes: [
      "Assemble and label a defensible dataset, including the hard negatives",
      "Train and tune detection and classification models on GPU workstations",
      "Read a confusion matrix well enough to argue about a threshold",
      "Export, quantize, and benchmark a model for edge inference",
      "Deploy an inspection model to a camera rig and measure it live",
    ],
    tools: ["Python", "PyTorch", "OpenCV", "YOLO", "ONNX Runtime", "NVIDIA Jetson", "MLflow"],
  },
  {
    slug: "llm-fine-tuning-llmops",
    title: "LLM Fine-Tuning & LLMOps",
    duration: "8 weeks",
    mode: "Hybrid · Durgapur and remote",
    level: "Advanced — prior ML experience expected",
    seats: "12 per cohort",
    summary:
      "Adapt open-weight models on our in-house GPUs. Trainees curate a domain dataset, run LoRA and preference tuning, and defend the result against an evaluation set they did not write.",
    outcomes: [
      "Curate, clean, and de-duplicate a domain dataset fit for tuning",
      "Run LoRA and QLoRA training runs and read the loss curves honestly",
      "Build an evaluation harness that catches regressions before users do",
      "Quantize and serve a tuned model on vLLM with an OpenAI-compatible API",
    ],
    tools: ["PyTorch", "Hugging Face", "PEFT", "vLLM", "GGUF", "Weights & Biases", "Linux", "CUDA"],
  },
  {
    slug: "voice-ai-systems",
    title: "Voice AI & Conversational Systems",
    duration: "6 weeks",
    mode: "On-site · Durgapur",
    level: "Intermediate",
    seats: "16 per cohort",
    summary:
      "Latency is the whole discipline. Trainees build a streaming speech pipeline in English, Hindi, and Bengali, then tune it in our voice studio until the turn-taking stops feeling like a machine.",
    outcomes: [
      "Build a streaming ASR to LLM to TTS loop with barge-in support",
      "Cut end-to-end response latency below a target the client sets",
      "Handle code-mixed Indian speech and accent variation without falling over",
      "Integrate a call flow with telephony and hand off cleanly to a human",
    ],
    tools: ["Python", "Whisper", "WebRTC", "Twilio", "SIP", "Neural TTS", "Redis"],
  },
  {
    slug: "product-engineering",
    title: "Full-Stack Product Engineering",
    duration: "16 weeks",
    mode: "On-site · Durgapur",
    level: "Beginner — open to final-year students",
    seats: "30 per cohort",
    summary:
      "The craft around the model: interfaces, APIs, tests, and releases. Trainees join a delivery squad, pick up real tickets, and learn to get work through code review and into production.",
    outcomes: [
      "Build accessible, mobile-first interfaces that hold up on a 360px screen",
      "Design and document REST APIs against a real database schema",
      "Write tests that make a refactor safe rather than merely green",
      "Take a ticket from estimate to code review to deployed release",
      "Work an agile sprint with demos your client actually attends",
    ],
    tools: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Playwright", "Git", "GitHub Actions"],
  },
];

export const liveProjects: LiveProject[] = [
  {
    id: "KTL-LP-009",
    title: "Admissions Voice Desk",
    domain: "Education",
    period: "Aug – Oct 2025",
    status: "Delivered",
    summary:
      "A bilingual voice line that answered admission enquiries through peak season, checked application status against the college database, and escalated fee disputes to the front office.",
    stack: ["Whisper", "Neural TTS", "Twilio", "Python", "PostgreSQL"],
  },
  {
    id: "KTL-LP-012",
    title: "Campus Knowledge Copilot",
    domain: "Education",
    period: "Oct 2025 – Jan 2026",
    status: "Delivered",
    summary:
      "A retrieval assistant over eleven years of circulars, syllabi, and examination notices, answering staff questions with a citation to the exact page of the source notice.",
    stack: ["LlamaIndex", "pgvector", "FastAPI", "Next.js", "PyTorch"],
  },
  {
    id: "KTL-LP-014",
    title: "Foundry Weld Inspection",
    domain: "Manufacturing",
    period: "Nov 2025 – Feb 2026",
    status: "Delivered",
    summary:
      "Edge vision inspection on a weld line, flagging porosity and undercut in under 40 ms per frame and holding a photographic record of every unit that passed.",
    stack: ["PyTorch", "YOLO", "TensorRT", "NVIDIA Jetson", "OpenCV"],
  },
  {
    id: "KTL-LP-018",
    title: "Clinic Note Assistant",
    domain: "Healthcare",
    period: "Jan – Apr 2026",
    status: "Delivered",
    summary:
      "An on-premise assistant that turned consultation dictation into structured notes, kept every recording inside the clinic network, and left the final edit with the physician.",
    stack: ["Whisper", "Llama", "vLLM", "FastAPI", "PostgreSQL"],
  },
  {
    id: "KTL-LP-021",
    title: "Retail Demand Forecast Engine",
    domain: "Retail",
    period: "Mar – Jun 2026",
    status: "Delivered",
    summary:
      "Store-level weekly forecasting across 46 outlets, feeding replenishment with festival and weather signals and a dashboard the category team could argue with.",
    stack: ["Python", "XGBoost", "Airflow", "PostgreSQL", "Next.js"],
  },
  {
    id: "KTL-LP-024",
    title: "Municipal Grievance Triage Agent",
    domain: "Public sector",
    period: "Jun 2026 – present",
    status: "In progress",
    summary:
      "An agent that reads citizen grievances in Bengali and English, routes them to the responsible ward department, and keeps an audit trail of every routing decision.",
    stack: ["LangGraph", "Model Context Protocol", "Qdrant", "Python", "Docker"],
  },
];

export const performers: Performer[] = [
  {
    name: "Ananya Chatterjee",
    role: "Retrieval Engineer — Trainee",
    program: "Agentic AI Engineering",
    projectId: "KTL-LP-012",
    certificateId: "KTL-CERT-2026-0118",
    period: "Oct 2025 – Jan 2026",
    highlight:
      "Rebuilt the chunking strategy for scanned circulars, lifting citation accuracy from 71% to 94% on the client's own question set.",
  },
  {
    name: "Sourav Pramanik",
    role: "Voice Pipeline Trainee",
    program: "Voice AI & Conversational Systems",
    projectId: "KTL-LP-009",
    certificateId: "KTL-CERT-2025-0087",
    period: "Aug – Oct 2025",
    highlight:
      "Tuned barge-in and endpointing until average response latency fell under 900 ms on the college's existing phone lines.",
  },
  {
    name: "Rupsa Banerjee",
    role: "Computer Vision Trainee",
    program: "Applied Machine Learning & Computer Vision",
    projectId: "KTL-LP-014",
    certificateId: "KTL-CERT-2026-0131",
    period: "Nov 2025 – Feb 2026",
    highlight:
      "Built the hard-negative sampling pass that cut false rejects on clean welds by more than half without missing a real defect.",
  },
  {
    name: "Arnab Dutta",
    role: "Edge Deployment Trainee",
    program: "Applied Machine Learning & Computer Vision",
    projectId: "KTL-LP-014",
    certificateId: "KTL-CERT-2026-0132",
    period: "Nov 2025 – Feb 2026",
    highlight:
      "Ported the detection model to TensorRT on Jetson and held 40 ms per frame through a full production shift.",
  },
  {
    name: "Md. Imran Ali",
    role: "NLP Trainee",
    program: "LLM Fine-Tuning & LLMOps",
    projectId: "KTL-LP-018",
    certificateId: "KTL-CERT-2026-0140",
    period: "Jan – Apr 2026",
    highlight:
      "Curated the clinical instruction set and ran the LoRA sweep that let a 7B model match the clinic's earlier API baseline.",
  },
  {
    name: "Priyanka Ghosh",
    role: "Agent Engineer — Trainee",
    program: "Agentic AI Engineering",
    projectId: "KTL-LP-012",
    certificateId: "KTL-CERT-2026-0119",
    period: "Oct 2025 – Jan 2026",
    highlight:
      "Wrote the evaluation harness that blocked three regressions from reaching staff during the January notice season.",
  },
  {
    name: "Debjani Roy",
    role: "ML Trainee",
    program: "Applied Machine Learning & Computer Vision",
    projectId: "KTL-LP-021",
    certificateId: "KTL-CERT-2026-0154",
    period: "Mar – Jun 2026",
    highlight:
      "Added festival and weather features to the forecast model, cutting weekly error across the 46 outlets by 12%.",
  },
  {
    name: "Nilanjan Sarkar",
    role: "Data Engineering Trainee",
    program: "Full-Stack Product Engineering",
    projectId: "KTL-LP-021",
    certificateId: "KTL-CERT-2026-0155",
    period: "Mar – Jun 2026",
    highlight:
      "Rewrote the nightly ingestion as idempotent Airflow tasks, ending the manual reruns the category team had lived with.",
  },
];
