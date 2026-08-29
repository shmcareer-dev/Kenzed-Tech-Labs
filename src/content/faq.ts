/**
 * Questions people actually ask, per section of the site.
 *
 * These exist for two audiences at once and the shape is a compromise between
 * them:
 *
 *  - A visitor scanning for the one thing the page did not tell them.
 *  - An answer engine. Google, and every LLM that cites a source, lift a
 *    question-and-answer pair OUT of its page and show it alone. So each
 *    answer here has to stand up with no surrounding context: it names the
 *    company rather than saying "we" where that would be ambiguous, it does
 *    not say "as described above", and it never depends on the heading it
 *    sits under.
 *
 * Every fact below is already stated somewhere on this site — services.ts,
 * kz.ts, company.ts, products.ts, site.ts or the legal shelf. Nothing here
 * invents a price, a client, a certification, an SLA or a headcount. If a
 * claim cannot be traced to one of those files it does not belong in an FAQ,
 * because this is the content most likely to be quoted back at us out of
 * context.
 */

export type FaqItem = {
  q: string;
  a: string;
};

export type FaqGroup = {
  /** Route the set belongs to, canonical form, no trailing slash. */
  path: string;
  /** Section heading on the /faq hub. */
  label: string;
  /** Sits under the heading on the hub page. */
  blurb: string;
  items: FaqItem[];
};

export const faqGroups: FaqGroup[] = [
  {
    path: "/",
    label: "Working with Kenzed",
    blurb: "The questions that come up before a first conversation.",
    items: [
      {
        q: "What does Kenzed Tech Lab do?",
        a: "Kenzed Tech Lab is an AI and software engineering company that builds agentic AI systems, machine learning software, voice AI, and enterprise web and mobile applications. The team designs, builds and runs the systems in production rather than handing over a prototype.",
      },
      {
        q: "Where is Kenzed Tech Lab based?",
        a: "The engineering centre is in Rajbandh, Durgapur, West Bengal (713212), with a liaison office in Kolkata at Action Area 1, Tower 10, Sankalpa Newton (700156). Kenzed Tech Lab works with clients across India and internationally.",
      },
      {
        q: "How large is the team?",
        a: "Kenzed Tech Lab is a 25-member team of AI/ML engineers, designers, testers and creators. Engagements are staffed from that team rather than subcontracted out.",
      },
      {
        q: "What does an engagement with Kenzed Tech Lab cost?",
        a: "There is no published price list, because scope, integrations, data volume and hosting move the number too far for a printed tier to mean anything. Kenzed Tech Lab scopes each engagement and quotes against it after an initial conversation.",
      },
      {
        q: "How do I start a project with Kenzed Tech Lab?",
        a: "Send the workflow or problem that is costing the most time to kenzedTechlab@gmail.com, or call +91 76990 01138. The first step is a scoping conversation, not a proposal document.",
      },
      {
        q: "Does Kenzed Tech Lab only build AI systems?",
        a: "No. Alongside agentic AI, machine learning and voice AI, Kenzed Tech Lab builds conventional web applications, mobile apps, enterprise software and internal automation tools. Not every problem needs a model, and the engagement starts by establishing whether this one does.",
      },
    ],
  },

  {
    path: "/services",
    label: "Services",
    blurb: "What Kenzed builds, and how the work is scoped.",
    items: [
      {
        q: "What services does Kenzed Tech Lab offer?",
        a: "Eight: custom AI agents and agentic AI, machine learning and data science, LLM fine-tuning and LLMOps, voice AI and conversational assistants, web and application development, adaptive UI/UX design, enterprise-grade software engineering, and utility software and automation.",
      },
      {
        q: "What is the difference between an AI agent and a chatbot?",
        a: "A chatbot answers questions. An agent reasons, plans, calls tools and completes a task end to end. Kenzed Tech Lab builds agentic systems with memory, guardrails, human-in-the-loop approval and observability, which is what separates something that acts from something that only replies.",
      },
      {
        q: "Can Kenzed Tech Lab work with an existing codebase?",
        a: "Yes. Engagements include extending and integrating with systems already in production, and the architecture stage explicitly covers where new work runs relative to what already exists.",
      },
      {
        q: "Which AI models does Kenzed Tech Lab build on?",
        a: "OpenAI, Anthropic Claude, Google Gemini, Llama, Mistral and Qwen, plus privately hosted and self-hosted models. Model choice is an architecture decision made per project, and self-hosting on in-house compute is available where data cannot leave the organisation.",
      },
      {
        q: "Does Kenzed Tech Lab offer support after launch?",
        a: "Yes. Kenzed Tech Lab runs 24×7 operations and in-house AI compute, and targets 99.98% uptime on the production systems it operates.",
      },
    ],
  },

  {
    path: "/technology",
    label: "Technology",
    blurb: "The stack, and why it is the stack.",
    items: [
      {
        q: "What technology stack does Kenzed Tech Lab use?",
        a: "Eleven layers covering languages, AI/ML, LLM and agent frameworks, vector and data stores, backend, frontend and 3D, mobile, databases, cloud and DevOps, MLOps, and security. Python, TypeScript, Next.js, PostgreSQL, LangChain, LangGraph, Docker and Kubernetes are among the tools in regular use.",
      },
      {
        q: "Which vector databases does Kenzed Tech Lab work with?",
        a: "Pinecone, Weaviate, Milvus, pgvector and FAISS, with hybrid and semantic search. The choice depends on data volume, latency targets and whether the index has to stay inside the client's own infrastructure.",
      },
      {
        q: "Is retrieval-augmented generation (RAG) part of what Kenzed builds?",
        a: "Yes. RAG grounded in a private knowledge base is a standard part of the agent work, alongside tool use, function calling and Model Context Protocol (MCP) integrations.",
      },
      {
        q: "Can Kenzed Tech Lab deploy models on-premise?",
        a: "Yes. Kenzed Tech Lab operates in-house AI compute and builds on privately hosted and self-hosted models, which is the route taken when data cannot be sent to a third-party API.",
      },
    ],
  },

  {
    path: "/infrastructure",
    label: "Infrastructure",
    blurb: "Where the systems run, and who keeps them running.",
    items: [
      {
        q: "Does Kenzed Tech Lab have its own compute?",
        a: "Yes. Kenzed Tech Lab operates in-house AI compute at its Durgapur facility, which is what makes on-premise model hosting and private fine-tuning possible rather than theoretical.",
      },
      {
        q: "What uptime does Kenzed Tech Lab target?",
        a: "99.98% on the production systems it operates, with 24×7 operations coverage.",
      },
      {
        q: "Can systems be hosted in the client's own cloud?",
        a: "Yes. Deployment target is an architecture decision taken per project, and Kenzed Tech Lab works across AWS, Azure and Google Cloud as well as its own infrastructure.",
      },
      {
        q: "How is security handled?",
        a: "Security is one of the eleven stack layers, covering OAuth and SSO, role-based access control, encryption, OWASP practices and secrets management. Agent systems additionally use bounded permissions, decision logging and sandboxing.",
      },
    ],
  },

  {
    path: "/industries",
    label: "Industries",
    blurb: "Where this work has already been applied.",
    items: [
      {
        q: "Which industries does Kenzed Tech Lab serve?",
        a: "Kenzed Tech Lab has delivered systems end to end across more than eight industries. Education and healthcare training are the deepest, with live platforms running for nursing and hospitality management institutions.",
      },
      {
        q: "Does Kenzed Tech Lab build for education institutions specifically?",
        a: "Yes. Kenzed LMS, Kenzed ERP and two college websites with speech-activated assistants are live in production for institutions today, and the ERP is multi-tenant across campuses in a group.",
      },
      {
        q: "Can Kenzed Tech Lab work in an industry it has not served before?",
        a: "Yes. The engagement opens by following the real process end to end and marking where it breaks, which is deliberately domain-agnostic — the sector knowledge comes from the client and the systems engineering comes from Kenzed.",
      },
    ],
  },

  {
    path: "/process",
    label: "Process",
    blurb: "How an idea becomes a system in production.",
    items: [
      {
        q: "How does a Kenzed Tech Lab project run?",
        a: "It moves through scoping the real problem, architecting the system and deciding where it runs, building in shippable increments each sprint, and evaluating against a baseline before anyone depends on it.",
      },
      {
        q: "How long does a project take?",
        a: "It depends on scope, and Kenzed Tech Lab scopes before quoting rather than the other way round. The first stage produces a throwaway prototype on the client's own data, which is what makes the timeline for the real build a estimate rather than a guess.",
      },
      {
        q: "How does Kenzed Tech Lab prove a system works?",
        a: "By baselining one number the business already trusts before the build starts, then measuring against it. Evaluation harnesses, tracing and observability are built into agent systems rather than added afterwards.",
      },
      {
        q: "Will there be working software before the end of the project?",
        a: "Yes. The build stage ships working software every sprint, and a throwaway prototype on real data comes before that during scoping.",
      },
    ],
  },

  {
    path: "/product-studio",
    label: "Products",
    blurb: "The platforms Kenzed built and runs.",
    items: [
      {
        q: "What products has Kenzed Tech Lab built?",
        a: "Six live systems: Kenzed LMS, Kenzed ERP, Kenzed CRM, CareerKing, and the websites for Annapurna Nursing Institute and the School of Hospitality & Management. Every one is reachable in production, and the product page shows real screenshots rather than mockups.",
      },
      {
        q: "Can Kenzed LMS or Kenzed ERP be licensed?",
        a: "Yes. Kenzed LMS, Kenzed ERP and Kenzed CRM are platforms Kenzed Tech Lab licenses to institutions and businesses. Pricing is scoped per institution because seats, campuses, integrations and hosting all move the number.",
      },
      {
        q: "What is Kenzed ERP?",
        a: "A multi-tenant SaaS ERP for institution groups covering admissions, fees, attendance, examinations, academics and compliance. Each campus keeps its own rules while management sees the whole group in real time, and an AI assistant answers questions against live data.",
      },
      {
        q: "Do the college websites really have a voice assistant?",
        a: "Yes. Both anidgp.in and shmedu.in ship a speech-activated assistant that answers questions about eligibility, fees and admissions out loud, built with the Web Speech API.",
      },
      {
        q: "How do I get a quote for one of these products?",
        a: "Every product on the Kenzed Tech Lab product page has an Enquire now button that opens a short lead form. Alternatively, email kenzedTechlab@gmail.com or call +91 76990 01138.",
      },
    ],
  },

  {
    path: "/live-projects",
    label: "Live projects & training",
    blurb: "The training programme and how it works.",
    items: [
      {
        q: "Does Kenzed Tech Lab train students?",
        a: "Yes. Trainees join a delivery team and work on systems that go to real users, rather than building throwaway practice projects.",
      },
      {
        q: "Do trainees work on real client systems?",
        a: "Yes. The programme places trainees inside live delivery work, which is the difference between the certificate meaning something and it meaning attendance.",
      },
      {
        q: "How do I apply for the Kenzed Tech Lab training programme?",
        a: "Apply through the form on the Live Projects page, or email kenzedTechlab@gmail.com. Seats are confirmed after a short screening call.",
      },
    ],
  },

  {
    path: "/about",
    label: "About",
    blurb: "Who Kenzed is and why it is in Durgapur.",
    items: [
      {
        q: "When and why was Kenzed Tech Lab founded?",
        a: "Kenzed Tech Lab was founded on the conviction that world-class AI and software engineering should not be confined to a handful of metros. The company built a premium technology practice in Durgapur — its own facility, compute and people — with a corporate presence in Kolkata.",
      },
      {
        q: "What is Kenzed Tech Lab's mission?",
        a: "To engineer intelligent, reliable and ethical software that helps organizations do their best work, making advanced AI practical, accessible and production-ready.",
      },
      {
        q: "Why is Kenzed Tech Lab based in Durgapur rather than a metro?",
        a: "It is a deliberate bet that premium, enterprise-grade technology can be built from Durgapur for the world. The company invested in its own facility, compute and people there, and keeps a Kolkata office to stay close to clients and talent.",
      },
    ],
  },

  {
    path: "/team",
    label: "Team",
    blurb: "Who does the work.",
    items: [
      {
        q: "Who works at Kenzed Tech Lab?",
        a: "A 25-member team of AI/ML engineers, designers, testers and creators. Engagements are delivered by that team directly.",
      },
      {
        q: "Is Kenzed Tech Lab hiring?",
        a: "Roles and openings are handled through kenzedTechlab@gmail.com. Kenzed Tech Lab also runs a live-projects training programme that places people inside real delivery work.",
      },
    ],
  },

  {
    path: "/contact",
    label: "Contact",
    blurb: "How to reach the team, and what happens next.",
    items: [
      {
        q: "How do I contact Kenzed Tech Lab?",
        a: "Email kenzedTechlab@gmail.com or call +91 76990 01138. The contact form on kenzed.in reaches the same inbox, and WhatsApp is available on the same number.",
      },
      {
        q: "How quickly does Kenzed Tech Lab reply?",
        a: "Within one business day.",
      },
      {
        q: "What happens after I send an enquiry?",
        a: "Kenzed Tech Lab replies to the enquiry, scopes the work with you, and sends a proposal. Enquiry details are used for that purpose and are covered by the privacy policy on kenzed.in.",
      },
      {
        q: "Does Kenzed Tech Lab work with clients outside India?",
        a: "Yes. The team is based in West Bengal and delivers to clients across India and internationally.",
      },
    ],
  },
];

/** The set for one route, or an empty array if that route has none. */
export function faqFor(path: string): FaqItem[] {
  const clean = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return faqGroups.find((group) => group.path === clean)?.items ?? [];
}

export const faqGroupFor = (path: string): FaqGroup | undefined => {
  const clean = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return faqGroups.find((group) => group.path === clean);
};

/**
 * Service pages get their questions generated from the service's own record
 * rather than hand-written eight times over. Everything below is read straight
 * out of services.ts, so a service that gains a deliverable gains the answer
 * too and the two can never drift apart.
 */
export function serviceFaq(service: {
  title: string;
  summary: string;
  deliverables: readonly string[];
  stack: readonly { label: string; items: string }[];
}): FaqItem[] {
  const items: FaqItem[] = [
    {
      q: `What does ${service.title} include at Kenzed Tech Lab?`,
      a: `${service.summary}`,
    },
  ];

  if (service.deliverables.length) {
    items.push({
      q: `What does Kenzed Tech Lab deliver for ${service.title}?`,
      /* Lower-cased first character so the list reads as one sentence rather
         than a run of headline-cased fragments. */
      a: `Engagements typically deliver ${service.deliverables
        .map((d) => d.charAt(0).toLowerCase() + d.slice(1))
        .join("; ")}.`,
    });
  }

  const tooling = service.stack.find((entry) => /framework|stack|model|tech/i.test(entry.label)) ?? service.stack[0];
  if (tooling) {
    items.push({
      q: `Which tools does Kenzed Tech Lab use for ${service.title}?`,
      a: `${tooling.label}: ${tooling.items}. Tool choice is an architecture decision taken per project rather than a fixed template.`,
    });
  }

  items.push(
    {
      q: `How much does ${service.title} cost?`,
      a: "Kenzed Tech Lab does not publish a price list for this work, because scope, integrations, data volume and hosting move the number too far for a printed tier to be honest. Scope is agreed first, then quoted.",
    },
    {
      q: `How do I start a ${service.title} project?`,
      a: "Email kenzedTechlab@gmail.com or call +91 76990 01138. The first step is a scoping conversation.",
    }
  );

  return items;
}

/** Everything, in page order — the /faq hub and llms.txt both read this. */
export const allFaqItems: FaqItem[] = faqGroups.flatMap((group) => group.items);
