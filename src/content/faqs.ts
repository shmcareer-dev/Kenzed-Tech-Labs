/**
 * Homepage FAQ. Rendered visibly and emitted as FAQPage structured data,
 * which is what wins the expandable rich result in search.
 */

export type Faq = { question: string; answer: string };

export const homeFaqs: Faq[] = [
  {
    question: "What does an agentic AI development company actually build?",
    answer:
      "We build software that acts, not just answers. That means autonomous AI agents that reason about a goal, break it into steps, call your systems through tools or MCP integrations, and complete real workflows — with memory, guardrails, human approval checkpoints, and full tracing so you can audit every decision.",
  },
  {
    question: "Do you work with clients outside India?",
    answer:
      "Yes. Our engineering centre is in Durgapur with a liaison office in Kolkata, and we deliver to clients across India and worldwide. Our 24×7 operations mean we can overlap with any time zone.",
  },
  {
    question: "Can you run AI models on our own infrastructure?",
    answer:
      "Yes. We operate on-premise GPU workstations and servers, and we regularly deploy private, on-premise, and sovereign AI so sensitive data never leaves your compliance boundary. We can also deploy into your cloud account instead of ours.",
  },
  {
    question: "Should we fine-tune a model or use RAG?",
    answer:
      "RAG is usually right when the model needs current, factual grounding in your documents. Fine-tuning is right when you need a specific format, tone, or domain reasoning the base model lacks. Often the answer is both, and we scope that in discovery before any training budget is spent.",
  },
  {
    question: "How do projects typically start?",
    answer:
      "With a free consultation, followed by a discovery and strategy phase where we define goals, success metrics, feasibility, and scope. You get a clear plan and estimate before development begins.",
  },
  {
    question: "Do you support the software after launch?",
    answer:
      "Yes. We are production-first, not prototype-first. After deployment we monitor performance, cost, and model drift, and keep improving the system on an agreed cadence.",
  },
];
