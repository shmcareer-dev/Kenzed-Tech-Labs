/**
 * The product shelf for /product-studio.
 *
 * Six systems Kenzed built and runs. Every one of them is LIVE, and the page
 * shows a real screenshot of it rather than a mockup — `shot` is a capture of
 * `liveUrl` taken at 1280x800, and `phoneShot`, where present, the same page at
 * 390x844 because two of these are mobile-first builds and that is the point
 * worth showing.
 *
 * There is deliberately no pricing here and no category filter. Every one of
 * these is scoped per institution — seats, campuses, integrations and hosting
 * all move the number — so a printed tier would be fiction. One "Enquire now"
 * per product opens the lead form instead.
 *
 * If a screenshot goes stale, re-capture it; a marketing page showing a
 * version of the product that no longer exists is worse than showing nothing.
 */

export type ProductProof = {
  /** The one-word claim. */
  label: string;
  /** What backs it up, read straight off the live product. */
  detail: string;
};

export type Product = {
  slug: string;
  name: string;
  /** Whose product it is — ours to license, or a client build we run. */
  kind: "Platform" | "Live build";
  tagline: string;
  /** Two or three sentences. This is the paragraph a buyer actually reads. */
  summary: string;
  liveUrl: string;
  displayUrl: string;
  /** public/products/<file>. A 1280x800 capture of the live site. */
  shot: string;
  /** Optional 390x844 capture, for the builds whose mobile work is the story. */
  phoneShot?: string;
  /** Sits on the device frame as a live-status chip. */
  badge?: string;
  /** Called out with its own marker when the product ships voice. */
  voice?: string;
  highlights: string[];
  proof: ProductProof[];
  stack: string[];
};

export const products: Product[] = [
  {
    slug: "kenzed-lms",
    name: "Kenzed LMS",
    kind: "Platform",
    tagline: "A classroom that can prove what was actually learned.",
    summary:
      "Structured programmes, live classes and certificates that mean something. Progress is earned by real study time rather than by clicking through, so an exam unlocks only once the hours behind it are genuinely done — and every certificate carries a serial anyone can verify without asking us. Runs in English, Bengali and Hindi.",
    liveUrl: "https://lms.shmedu.in",
    displayUrl: "lms.shmedu.in",
    shot: "/products/kenzed-lms.jpg",
    badge: "Live · in production",
    highlights: [
      "Hours-gated assessment",
      "Live, on-demand and self-paced",
      "Serial-verifiable certificates",
      "Trilingual delivery",
    ],
    proof: [
      { label: "Honest progress", detail: "Exams unlock on accumulated study time, not on a completion checkbox." },
      { label: "Verifiable", detail: "Every certificate carries a serial that a third party can check independently." },
      { label: "Three languages", detail: "English, Bengali and Hindi across the whole interface, not just the content." },
      { label: "Academic + skill", detail: "Full programmes and short courses run side by side in one enrolment model." },
    ],
    stack: ["Next.js", "PostgreSQL", "WebRTC", "Redis", "S3", "OAuth / SSO"],
  },
  {
    slug: "kenzed-erp",
    name: "Kenzed ERP",
    kind: "Platform",
    tagline: "Run every college in the group from a single source of truth.",
    summary:
      "A multi-tenant SaaS ERP for institution groups. Admissions, fees, attendance, examinations, academics and compliance run in one system, and each campus keeps its own rules while management sees the whole group in real time. The interface adapts to the role signing in, and an AI assistant answers questions against live data instead of making the user learn a reporting screen.",
    liveUrl: "https://erp.kenzed.in",
    displayUrl: "erp.kenzed.in",
    shot: "/products/kenzed-erp.jpg",
    badge: "Live · multi-campus",
    highlights: [
      "Multi-campus, one ledger",
      "Adaptive role-based UI",
      "AI assistant on live data",
      "Open REST API",
    ],
    proof: [
      { label: "Group-wide", detail: "Every campus keeps local rules; management reads the consolidated position live." },
      { label: "Adaptive UI", detail: "The screen composes itself around the role — nine of them, one system." },
      { label: "Ask, don't hunt", detail: "The assistant answers against real records rather than a canned dashboard." },
      { label: "Integrable", detail: "An open REST API, so the ERP is never the thing blocking another system." },
    ],
    stack: ["Next.js", "PostgreSQL", "Redis", "FastAPI", "LangGraph", "Docker"],
  },
  {
    slug: "kenzed-crm",
    name: "Kenzed CRM",
    kind: "Platform",
    tagline: "Lead management without the clutter tax.",
    summary:
      "A CRM for businesses, colleges and anyone who has given up on the enterprise ones. Nine roles share one system and each sees a genuinely different product — that is the permission matrix doing real work, not a demo trick. The interface is deliberately quiet: no feature graveyard, no forty-column grid, nothing that needs a training session before the first lead is logged.",
    liveUrl: "https://crm.kenzed.in",
    displayUrl: "crm.kenzed.in",
    shot: "/products/kenzed-crm.jpg",
    badge: "Live · sign-in required",
    highlights: [
      "Nine roles, one system",
      "Clean by default",
      "Lead-to-close in one view",
      "No training required",
    ],
    proof: [
      { label: "Real permissions", detail: "Each role sees a different product, enforced server-side rather than hidden in CSS." },
      { label: "Uncluttered", detail: "The default view shows what the role acts on today and nothing else." },
      { label: "Anyone can run it", detail: "Built for a college office and a sales floor alike, with no admin specialism." },
      { label: "Fast to adopt", detail: "First lead logged inside a minute, without a manual." },
    ],
    stack: ["Next.js", "PostgreSQL", "Redis", "Node.js", "RBAC", "REST API"],
  },
  {
    slug: "anidgp",
    name: "Annapurna Nursing Institute",
    kind: "Live build",
    tagline: "A mobile-first college site that talks back.",
    summary:
      "The public site for a WBNC- and INC-recognised GNM nursing institute in Durgapur. It was designed on the phone first and only then widened, which is why the mobile experience is the good one rather than the compromise. A speech-activated assistant lets a prospective student ask about eligibility, fees or the campus and get a spoken answer — most of them arrive on a phone, at night, with one question.",
    liveUrl: "https://anidgp.in",
    displayUrl: "anidgp.in",
    shot: "/products/anidgp.jpg",
    phoneShot: "/products/anidgp-phone.jpg",
    badge: "Live · WBNC & INC recognised",
    voice: "Speech-activated guide — ask it a question out loud and it answers",
    highlights: [
      "Mobile-first, not mobile-tolerated",
      "Speech-activated assistant",
      "Admissions and student zone",
      "Motion-led, still fast",
    ],
    proof: [
      { label: "Phone first", detail: "Laid out for a 390px screen and widened from there, not cut down to fit one." },
      { label: "Talk to it", detail: "A visitor asks out loud and hears the answer — no form, no waiting for a callback." },
      { label: "Built to convert", detail: "Apply, campus tour and student zone are reachable from any point on the page." },
      { label: "Motion with restraint", detail: "Animation that survives a mid-range Android, because that is what visitors carry." },
    ],
    stack: ["Next.js", "Web Speech API", "Tailwind", "GSAP", "PostgreSQL", "WhatsApp API"],
  },
  {
    slug: "shmedu",
    name: "School of Hospitality & Management",
    kind: "Live build",
    tagline: "A hospitality college site built to answer, not just to inform.",
    summary:
      "The public site for a UGC-recognised, NAAC A+ accredited hotel management college in Durgapur. Degree and diploma programmes, admissions, campus tour and gallery, with a speech-activated assistant that guides a visitor through eligibility and applications by voice. Enquiries hand off straight to WhatsApp, because that is the channel prospective students actually reply on.",
    liveUrl: "https://shmedu.in",
    displayUrl: "shmedu.in",
    shot: "/products/shmedu.jpg",
    phoneShot: "/products/shmedu-phone.jpg",
    badge: "Live · UGC · NAAC A+",
    voice: "Speech-activated guide — it walks a visitor through admissions",
    highlights: [
      "Speech-activated assistant",
      "Programmes and admissions",
      "WhatsApp-first enquiries",
      "Campus tour and gallery",
    ],
    proof: [
      { label: "Ask by voice", detail: "Eligibility, fees and programme questions answered in speech, on the page." },
      { label: "Where they reply", detail: "Enquiries open WhatsApp prefilled rather than dropping into an inbox nobody watches." },
      { label: "Full prospectus", detail: "Programmes, admissions, gallery and blog run from one editable content model." },
      { label: "Credentials up front", detail: "Recognition and accreditation stated where a parent looks for them first." },
    ],
    stack: ["Next.js", "Web Speech API", "Tailwind", "PostgreSQL", "WhatsApp API", "S3"],
  },
  {
    slug: "careerking",
    name: "CareerKing",
    kind: "Platform",
    tagline: "The right talent and the right opportunity, intelligently connected.",
    summary:
      "A jobs and academic portal in one. On the jobs side: verified listings, an AI-assisted CV and mock interviews that are actually conducted rather than described. On the academic side: industry training and interactive modules that build the skills those listings ask for — so the portal closes the loop instead of just advertising the gap.",
    liveUrl: "https://careerking.in",
    displayUrl: "careerking.in",
    shot: "/products/careerking.jpg",
    badge: "Live · jobs + academic",
    highlights: [
      "Verified job listings",
      "AI-built CV",
      "Real mock interviews",
      "Industry training modules",
    ],
    proof: [
      { label: "Verified", detail: "Listings are checked before they publish, which is the whole difference from an aggregator." },
      { label: "CV that lands", detail: "Built against the listing a candidate is actually applying to, not a generic template." },
      { label: "Practice, not theory", detail: "Mock interviews are conducted and scored, so the first real one is not the first one." },
      { label: "Closes the loop", detail: "Training modules map to the skills the verified listings are asking for." },
    ],
    stack: ["Next.js", "PostgreSQL", "LangChain", "Redis", "S3", "REST API"],
  },
];

export function productBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
