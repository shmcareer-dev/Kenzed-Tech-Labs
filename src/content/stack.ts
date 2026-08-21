/** Technology stack shown on / and /technology. */

export type StackCategory = { category: string; tools: string[] };

export const stackCategories: StackCategory[] = [
  {
    category: "Languages",
    tools: ["Python", "TypeScript", "Go", "Java", "C++", "SQL", "Rust"],
  },
  {
    category: "AI / ML",
    tools: ["PyTorch", "TensorFlow", "scikit-learn", "Hugging Face", "XGBoost", "OpenCV", "ONNX"],
  },
  {
    category: "LLM & Agents",
    tools: ["LangChain", "LangGraph", "LlamaIndex", "CrewAI", "MCP", "vLLM", "Ollama"],
  },
  {
    category: "Vector & Data",
    tools: ["Pinecone", "Weaviate", "Milvus", "pgvector", "Spark", "Airflow"],
  },
  {
    category: "Frontend & 3D",
    tools: ["React", "Next.js", "Three.js", "R3F", "WebGL", "GSAP", "Tailwind"],
  },
  {
    category: "Backend",
    tools: ["Node.js", "NestJS", "FastAPI", "Django", "GraphQL", "gRPC"],
  },
  {
    category: "Mobile",
    tools: ["React Native", "Flutter", "Progressive Web Apps"],
  },
  {
    category: "Databases",
    tools: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch"],
  },
  {
    category: "Cloud & DevOps",
    tools: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD"],
  },
  {
    category: "MLOps",
    tools: ["MLflow", "Kubeflow", "Model registry", "Monitoring", "Drift detection"],
  },
  {
    category: "Security",
    tools: ["OAuth/SSO", "RBAC", "Encryption", "OWASP", "Secrets management"],
  },
];
